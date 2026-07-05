import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { sendEmail, FROM_EMAIL } from '@/lib/resend';
import { appointmentConfirmationHtml, appointmentConfirmationText } from '@/lib/email/appointmentConfirmation';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer_name,
      customer_phone,
      customer_email,
      date_of_birth,
      insurance_provider,
      insurance_member_id,
      service_id,
      scheduled_at,
      notes,
      conversationId,
      businessId,
    } = body as {
      customer_name: string;
      customer_phone: string;
      customer_email: string;
      date_of_birth?: string;
      insurance_provider?: string;
      insurance_member_id?: string;
      service_id?: string;
      scheduled_at: string;
      notes?: string;
      conversationId: string;
      businessId: string;
    };

    if (!customer_name || !customer_email || !scheduled_at || !businessId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: CORS });
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(businessId)) {
      return NextResponse.json({ error: 'Invalid businessId' }, { status: 400, headers: CORS });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400, headers: CORS });
    }

    if (isNaN(new Date(scheduled_at).getTime())) {
      return NextResponse.json({ error: 'Invalid scheduled_at date' }, { status: 400, headers: CORS });
    }

    // Prevent excessively long strings
    if (customer_name.length > 200 || customer_email.length > 200) {
      return NextResponse.json({ error: 'Invalid input length' }, { status: 400, headers: CORS });
    }

    const supabase = createAdminSupabase();

    // Load business info — also validates businessId is real and active
    const { data: business } = await supabase
      .from('businesses')
      .select('name, phone, email, address, city, state, owner_id')
      .eq('id', businessId)
      .eq('is_active', true)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404, headers: CORS });
    }

    // Resolve service — service_id may be a UUID or a name string from the AI
    let resolvedServiceId: string | null = null;
    let serviceName: string | undefined;
    let durationMinutes: number | null = null; // resolved from DB — never hardcoded

    if (service_id) {
      if (UUID_RE.test(service_id)) {
        // Valid UUID — look up directly
        const { data: service } = await supabase
          .from('services')
          .select('id, name, duration_minutes')
          .eq('id', service_id)
          .eq('business_id', businessId)
          .maybeSingle();
        if (service) {
          resolvedServiceId = service.id;
          serviceName = service.name;
          durationMinutes = service.duration_minutes;
        }
      } else {
        // AI passed a name string — resolve by name
        const { data: service } = await supabase
          .from('services')
          .select('id, name, duration_minutes')
          .eq('business_id', businessId)
          .ilike('name', service_id.trim())
          .maybeSingle();
        if (service) {
          resolvedServiceId = service.id;
          serviceName = service.name;
          durationMinutes = service.duration_minutes;
        } else {
          // Store the name as a note fallback, don't set a service_id
          serviceName = service_id;
        }
      }
    }

    // If duration still not resolved from service, look up shortest active service for this business
    if (!durationMinutes) {
      const { data: fallbackSvc } = await supabase
        .from('services')
        .select('duration_minutes')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('duration_minutes', { ascending: true })
        .limit(1)
        .single();
      durationMinutes = fallbackSvc?.duration_minutes ?? 30;
    }

    const resolvedDuration = durationMinutes as number;

    // Slot conflict check — reject if the time is already taken
    const slotStart = new Date(scheduled_at);
    const slotEnd = new Date(slotStart.getTime() + resolvedDuration * 60000);
    const { data: conflicts } = await supabase
      .from('appointments')
      .select('id, scheduled_at, duration_minutes')
      .eq('business_id', businessId)
      .not('status', 'in', '("cancelled","completed")')
      .lt('scheduled_at', slotEnd.toISOString())
      .gt('scheduled_at', new Date(slotStart.getTime() - 8 * 60 * 60000).toISOString());

    const hasConflict = (conflicts || []).some((c) => {
      const cStart = new Date(c.scheduled_at).getTime();
      const cEnd = cStart + (c.duration_minutes || 60) * 60000;
      return cStart < slotEnd.getTime() && cEnd > slotStart.getTime();
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: 'That time slot is no longer available. Please choose a different time.' },
        { status: 409, headers: CORS }
      );
    }

    // Insert confirmed appointment with all patient details
    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert({
        business_id: businessId,
        conversation_id: conversationId || null,
        service_id: resolvedServiceId,
        customer_name,
        customer_phone: customer_phone || null,
        customer_email,
        date_of_birth: date_of_birth || null,
        insurance_provider: insurance_provider || null,
        insurance_member_id: insurance_member_id || null,
        notes: notes || null,
        scheduled_at,
        duration_minutes: resolvedDuration,
        status: 'confirmed',
        customer_email_verified: true,
      })
      .select()
      .single();

    if (insertError || !appointment) {
      // Unique constraint violation means slot was just taken by a concurrent booking
      if (insertError?.code === '23505') {
        return NextResponse.json(
          { error: 'That time slot was just booked by someone else. Please choose a different time.' },
          { status: 409, headers: CORS }
        );
      }
      console.error('[confirm] DB insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500, headers: CORS });
    }

    // Update or create conversation, then fire analytics event
    let analyticsConversationId: string | null = conversationId || null;

    if (conversationId) {
      // Agent booking — update existing conversation
      await supabase
        .from('conversations')
        .update({
          appointment_booked: true,
          caller_name: customer_name,
          caller_phone: customer_phone || null,
          caller_email: customer_email,
        })
        .eq('id', conversationId);
    } else {
      // Manual booking — create a synthetic conversation so it shows in analytics
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          business_id: businessId,
          caller_name: customer_name,
          caller_phone: customer_phone || null,
          caller_email: customer_email,
          status: 'completed',
          appointment_booked: true,
          source: 'widget',
        })
        .select('id')
        .single();
      if (newConv) {
        analyticsConversationId = newConv.id;
        // Link the appointment to this conversation
        await supabase
          .from('appointments')
          .update({ conversation_id: newConv.id })
          .eq('id', appointment.id);
      }
    }

    await supabase.from('analytics_events').insert({
      business_id: businessId,
      conversation_id: analyticsConversationId,
      event_type: 'appointment_booked',
      event_data: { appointment_id: appointment.id, service_id: resolvedServiceId, source: conversationId ? 'agent' : 'manual' },
    });

    // Notification for business owner
    const biz = business as { name: string; phone: string | null; email: string | null; address: string | null; city: string | null; state: string | null; owner_id: string } | null;
    await supabase.from('notifications').insert({
      business_id: businessId,
      type: 'new_appointment',
      title: 'New Appointment Booked',
      body: `${customer_name} booked ${serviceName || 'an appointment'} for ${new Date(scheduled_at).toLocaleDateString()}`,
      metadata: { appointment_id: appointment.id, customer_email },
    });

    // Send confirmation email
    const addressLine = [biz?.address, biz?.city, biz?.state].filter(Boolean).join(', ');
    const emailData = {
      patientName: customer_name,
      scheduledAt: scheduled_at,
      serviceName,
      dateOfBirth: date_of_birth,
      insuranceProvider: insurance_provider,
      insuranceMemberId: insurance_member_id,
      businessName: biz?.name || 'Healthcare Practice',
      businessAddress: addressLine || undefined,
      businessPhone: biz?.phone || undefined,
      businessEmail: biz?.email || undefined,
      appointmentId: appointment.id,
    };

    let emailSent = false;
    let emailError: string | undefined;

    console.log('[confirm] Sending email to:', customer_email, '| FROM:', FROM_EMAIL);

    try {
      const emailResult = await sendEmail({
        from: FROM_EMAIL,
        to: customer_email,
        subject: `Appointment Confirmed — ${biz?.name || 'Healthcare Practice'}`,
        html: appointmentConfirmationHtml(emailData),
        text: appointmentConfirmationText(emailData),
      });

      console.log('[confirm] Resend result:', JSON.stringify(emailResult));

      const resendError = (emailResult as { error?: unknown }).error;
      if (resendError) {
        throw new Error(typeof resendError === 'string' ? resendError : JSON.stringify(resendError));
      }

      await supabase
        .from('appointments')
        .update({ email_sent_at: new Date().toISOString() })
        .eq('id', appointment.id);

      emailSent = true;
    } catch (err) {
      emailError = err instanceof Error ? err.message : String(err);
      console.error('[confirm] Resend failed:', emailError);
    }

    // Send notification email to business owner
    if (biz?.email) {
      try {
        const apptDateStr = new Date(scheduled_at).toLocaleString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long',
          day: 'numeric', hour: 'numeric', minute: '2-digit',
        });
        const ownerHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>New Appointment</title></head>
<body style="margin:0;padding:0;background:#f2f8f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f8f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,115,119,0.10);">
        <tr>
          <td style="background:linear-gradient(135deg,#0d7377,#0a3d40);padding:28px 40px;text-align:center;">
            <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;">📅 New Appointment Booked</p>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.65);">${biz.name}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 20px;font-size:14px;color:#334155;">A new appointment has been booked. Here are the details:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f8f9;border-radius:12px;border:1px solid rgba(13,115,119,0.12);margin-bottom:24px;">
              <tr><td style="padding:20px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding:7px 0;border-bottom:1px solid rgba(13,115,119,0.08);">
                    <span style="font-size:11px;font-weight:600;color:#0d7377;text-transform:uppercase;">Patient</span><br/>
                    <span style="font-size:14px;font-weight:600;color:#0a2e30;">${customer_name}</span>
                  </td></tr>
                  <tr><td style="padding:7px 0;border-bottom:1px solid rgba(13,115,119,0.08);">
                    <span style="font-size:11px;font-weight:600;color:#0d7377;text-transform:uppercase;">Date &amp; Time</span><br/>
                    <span style="font-size:14px;font-weight:600;color:#0a2e30;">${apptDateStr}</span>
                  </td></tr>
                  ${serviceName ? `<tr><td style="padding:7px 0;border-bottom:1px solid rgba(13,115,119,0.08);">
                    <span style="font-size:11px;font-weight:600;color:#0d7377;text-transform:uppercase;">Service</span><br/>
                    <span style="font-size:14px;color:#0a2e30;">${serviceName}</span>
                  </td></tr>` : ''}
                  ${customer_phone ? `<tr><td style="padding:7px 0;border-bottom:1px solid rgba(13,115,119,0.08);">
                    <span style="font-size:11px;font-weight:600;color:#0d7377;text-transform:uppercase;">Phone</span><br/>
                    <span style="font-size:14px;color:#0a2e30;">${customer_phone}</span>
                  </td></tr>` : ''}
                  <tr><td style="padding:7px 0;">
                    <span style="font-size:11px;font-weight:600;color:#0d7377;text-transform:uppercase;">Email</span><br/>
                    <span style="font-size:14px;color:#0a2e30;">${customer_email}</span>
                  </td></tr>
                </table>
              </td></tr>
            </table>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#14a8b5,#0d7377);border-radius:10px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard/appointments"
                    style="display:inline-block;padding:11px 24px;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;">
                    View in Dashboard →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:16px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:11px;color:#94a3b8;">Appointment ID: <code style="font-size:10px;color:#64748b;">${appointment.id}</code></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

        await sendEmail({
          from: FROM_EMAIL,
          to: biz.email,
          subject: `New Appointment — ${customer_name} on ${new Date(scheduled_at).toLocaleDateString()}`,
          html: ownerHtml,
          text: `New appointment booked.\n\nPatient: ${customer_name}\nDate: ${apptDateStr}\nService: ${serviceName || 'N/A'}\nPhone: ${customer_phone || 'N/A'}\nEmail: ${customer_email}\n\nAppointment ID: ${appointment.id}`,
        });
      } catch (err) {
        console.error('[confirm] Owner notification email failed:', err instanceof Error ? err.message : err);
      }
    }

    const apptStart = new Date(scheduled_at);
    const apptEnd = new Date(apptStart.getTime() + resolvedDuration * 60000);
    const dateLabel = apptStart.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const startTime = apptStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const endTime = apptEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const fullLabel = `${dateLabel} from ${startTime} to ${endTime} (${resolvedDuration} mins)`;

    return NextResponse.json({
      result: {
        success: true,
        appointment_id: appointment.id,
        duration_minutes: resolvedDuration,
        email_sent: emailSent,
        email_error: emailError,
        message: `Appointment confirmed for ${customer_name} on ${fullLabel}.${emailSent ? ` A confirmation email has been sent to ${customer_email}.` : ' (Email delivery pending.)'}`,
      },
    }, { headers: CORS });
  } catch (err) {
    console.error('[/api/appointments/confirm] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: CORS });
  }
}
