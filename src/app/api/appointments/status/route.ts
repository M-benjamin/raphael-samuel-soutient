import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { sendEmail, FROM_EMAIL } from '@/lib/resend';
import { appointmentStatusHtml, appointmentStatusText, ownerNotifHtml } from '@/lib/email/appointmentStatus';

type AppStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

// Statuses where we email the patient
const NOTIFY_PATIENT: AppStatus[] = ['confirmed', 'cancelled', 'completed', 'no_show'];
// Statuses where we always notify the owner
const NOTIFY_OWNER: AppStatus[] = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];

export async function PATCH(req: NextRequest) {
  try {
    const { appointmentId, status, notes } = await req.json() as {
      appointmentId: string;
      status: AppStatus;
      notes?: string;
    };

    if (!appointmentId || !status) {
      return NextResponse.json({ error: 'appointmentId and status are required' }, { status: 400 });
    }

    const supabase = createAdminSupabase();

    // Load full appointment + business + service
    const { data: appt, error: fetchError } = await supabase
      .from('appointments')
      .select('*, service:services(name)')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !appt) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('name, email, phone, owner_id')
      .eq('id', appt.business_id)
      .single();

    // Update status
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status, notes: notes ?? appt.notes })
      .eq('id', appointmentId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    const biz = business as { name: string; email: string | null; phone: string | null; owner_id: string } | null;
    const serviceName = (appt.service as { name: string } | null)?.name;

    // Insert dashboard notification
    const notifMessages: Record<AppStatus, string> = {
      confirmed: `${appt.customer_name}'s appointment has been approved`,
      cancelled: `${appt.customer_name}'s appointment has been cancelled`,
      completed: `${appt.customer_name}'s appointment is marked complete`,
      no_show:   `${appt.customer_name} did not show for their appointment`,
      pending:   `${appt.customer_name}'s appointment is pending review`,
    };

    await supabase.from('notifications').insert({
      business_id: appt.business_id,
      type: status === 'cancelled' ? 'appointment_cancelled' : 'new_appointment',
      title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      body: notifMessages[status] ?? `Appointment status changed to ${status}`,
      metadata: { appointment_id: appointmentId, status, customer_email: appt.customer_email },
    });

    let patientEmailSent = false;
    let ownerEmailSent = false;

    // Email patient (only for non-pending statuses the template supports)
    type EmailableStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    const emailableStatuses: AppStatus[] = ['confirmed', 'cancelled', 'completed', 'no_show'];
    if (emailableStatuses.includes(status) && appt.customer_email) {
      try {
        const emailStatus = status as EmailableStatus;
        await sendEmail({
          from: FROM_EMAIL,
          to: appt.customer_email,
          subject: `Appointment ${status === 'confirmed' ? 'Approved' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')} — ${biz?.name || 'Healthcare Practice'}`,
          html: appointmentStatusHtml({
            patientName: appt.customer_name,
            scheduledAt: appt.scheduled_at,
            serviceName,
            businessName: biz?.name || 'Healthcare Practice',
            businessPhone: biz?.phone || undefined,
            businessEmail: biz?.email || undefined,
            appointmentId,
            status: emailStatus,
            notes: notes || appt.notes || undefined,
          }),
          text: appointmentStatusText({
            patientName: appt.customer_name,
            scheduledAt: appt.scheduled_at,
            serviceName,
            businessName: biz?.name || 'Healthcare Practice',
            businessPhone: biz?.phone || undefined,
            appointmentId,
            status: emailStatus,
          }),
        });
        patientEmailSent = true;
      } catch (e) {
        console.error('[status] Patient email failed:', e);
      }
    }

    // Email business owner
    if (NOTIFY_OWNER.includes(status) && biz?.email) {
      try {
        await sendEmail({
          from: FROM_EMAIL,
          to: biz.email,
          subject: `[MediCall] Appointment ${status} — ${appt.customer_name}`,
          html: ownerNotifHtml({
            patientName: appt.customer_name,
            patientPhone: appt.customer_phone || undefined,
            patientEmail: appt.customer_email || undefined,
            scheduledAt: appt.scheduled_at,
            serviceName,
            newStatus: status,
            appointmentId,
            businessName: biz.name,
          }),
          text: `Appointment ${status.toUpperCase()}\n\nPatient: ${appt.customer_name}\nDate: ${new Date(appt.scheduled_at).toLocaleString()}\nStatus: ${status}\nID: ${appointmentId}`,
        });
        ownerEmailSent = true;
      } catch (e) {
        console.error('[status] Owner email failed:', e);
      }
    }

    return NextResponse.json({
      success: true,
      status,
      patient_email_sent: patientEmailSent,
      owner_email_sent: ownerEmailSent,
    });
  } catch (err) {
    console.error('[/api/appointments/status]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
