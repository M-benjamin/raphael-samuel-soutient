import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';
import type { Business } from '@/types';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const { toolName, toolArgs, businessId, agentId, conversationId } = await req.json();

    if (!businessId || !toolName) {
      return NextResponse.json({ error: 'businessId and toolName are required' }, { status: 400, headers: CORS });
    }

    // Validate businessId is a UUID to prevent injection / enumeration
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(businessId)) {
      return NextResponse.json({ error: 'Invalid businessId' }, { status: 400, headers: CORS });
    }

    const supabase = createAdminSupabase();

    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .eq('is_active', true)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404, headers: CORS });
    }

    const biz = business as Business;
    let result: unknown;

    switch (toolName) {
      case 'getBusinessHours': {
        const { data: hours } = await supabase
          .from('business_hours')
          .select('*')
          .eq('business_id', businessId)
          .order('day_of_week');

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        result = {
          hours: (hours || []).map((h) => ({
            day: days[h.day_of_week],
            is_open: h.is_open,
            open_time: h.open_time,
            close_time: h.close_time,
          })),
          timezone: biz.timezone,
        };
        break;
      }

      case 'getServices': {
        let services = null;

        if (agentId) {
          const { data: agentServiceRows } = await supabase
            .from('agent_services')
            .select('service_id')
            .eq('agent_id', agentId);

          const assignedIds = (agentServiceRows || []).map((r) => r.service_id);

          if (assignedIds.length > 0) {
            const { data: assigned } = await supabase
              .from('services')
              .select('*')
              .in('id', assignedIds)
              .eq('is_active', true)
              .order('sort_order');
            services = assigned;
          }
        }

        // Fallback: no agent or agent has no assigned services
        if (!services) {
          const { data: all } = await supabase
            .from('services')
            .select('*')
            .eq('business_id', businessId)
            .eq('is_active', true)
            .order('sort_order');
          services = all;
        }

        result = {
          services: (services || []).map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            duration_minutes: s.duration_minutes,
            price_type: s.price_type,
            price_min: s.price_min,
            price_max: s.price_max,
          })),
        };
        break;
      }

      case 'getAvailableSlots': {
        const { date, service_id } = toolArgs as { date: string; service_id?: string };
        if (!date) {
          result = { error: 'Date is required' };
          break;
        }

        // Always look up duration from the service in DB — never trust a hardcoded default
        let duration = 30; // minimum slot size; overridden by service lookup below
        if (service_id) {
          const { data: service } = await supabase
            .from('services')
            .select('duration_minutes')
            .eq('id', service_id)
            .eq('business_id', businessId)
            .single();
          if (service) duration = service.duration_minutes;
        } else {
          // No service selected yet — use the shortest active service duration so we show the most slots
          const { data: shortestService } = await supabase
            .from('services')
            .select('duration_minutes')
            .eq('business_id', businessId)
            .eq('is_active', true)
            .order('duration_minutes', { ascending: true })
            .limit(1)
            .single();
          if (shortestService) duration = shortestService.duration_minutes;
        }

        // Use admin client directly (avoids browser client / RLS issues in server context)
        const dayOfWeek = new Date(date + 'T12:00:00').getDay();
        const { data: hours } = await supabase
          .from('business_hours')
          .select('open_time, close_time, is_open')
          .eq('business_id', businessId)
          .eq('day_of_week', dayOfWeek)
          .single();

        let slots: string[] = [];
        if (hours?.is_open && hours.open_time && hours.close_time) {
          const [openH, openM] = hours.open_time.split(':').map(Number);
          const [closeH, closeM] = hours.close_time.split(':').map(Number);
          const openMins = openH * 60 + openM;
          const closeMins = closeH * 60 + closeM;

          const { data: existing } = await supabase
            .from('appointments')
            .select('scheduled_at, duration_minutes')
            .eq('business_id', businessId)
            .gte('scheduled_at', `${date}T00:00:00`)
            .lte('scheduled_at', `${date}T23:59:59`)
            .not('status', 'in', '("cancelled","completed")');

          // Build a set of all minutes that are occupied by existing appointments
          const occupiedMins = new Set<number>();
          (existing || []).forEach((a) => {
            const apptStart = new Date(a.scheduled_at);
            const apptStartMins = apptStart.getHours() * 60 + apptStart.getMinutes();
            const apptDuration = a.duration_minutes || 60;
            for (let i = 0; i < apptDuration; i++) {
              occupiedMins.add(apptStartMins + i);
            }
          });

          // A slot is only available if the entire duration fits without hitting any occupied minute
          for (let m = openMins; m + duration <= closeMins; m += 30) {
            let conflict = false;
            for (let i = 0; i < duration; i++) {
              if (occupiedMins.has(m + i)) { conflict = true; break; }
            }
            if (!conflict) {
              const hh = String(Math.floor(m / 60)).padStart(2, '0');
              const mm = String(m % 60).padStart(2, '0');
              slots.push(`${hh}:${mm}`);
            }
          }
        }

        result = {
          date,
          available_slots: slots,
          message: slots.length === 0 ? 'No available slots for this date' : `${slots.length} slots available`,
        };
        break;
      }

      case 'createAppointment': {
        const args = toolArgs as {
          customer_name: string;
          customer_phone?: string;
          customer_email?: string;
          date_of_birth?: string;
          insurance_provider?: string;
          insurance_member_id?: string;
          service_id?: string;
          scheduled_at: string;
          notes?: string;
        };

        if (!args.customer_name || !args.scheduled_at) {
          result = { error: 'Customer name and scheduled time are required' };
          break;
        }

        // Always look up duration from DB — never use a hardcoded fallback
        let apptDuration = 30;
        const UUID_RE_SVC = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (args.service_id && UUID_RE_SVC.test(args.service_id)) {
          const { data: svc } = await supabase
            .from('services')
            .select('duration_minutes')
            .eq('id', args.service_id)
            .eq('business_id', businessId)
            .single();
          if (svc) apptDuration = svc.duration_minutes;
        } else {
          // No valid service id — use shortest service duration as a safe fallback
          const { data: shortestSvc } = await supabase
            .from('services')
            .select('duration_minutes')
            .eq('business_id', businessId)
            .eq('is_active', true)
            .order('duration_minutes', { ascending: true })
            .limit(1)
            .single();
          if (shortestSvc) apptDuration = shortestSvc.duration_minutes;
        }

        // Slot conflict check using actual service duration
        {
          const slotStart = new Date(args.scheduled_at);
          const slotEnd = new Date(slotStart.getTime() + apptDuration * 60000);
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
            result = { error: 'That time slot is already booked. Please ask the patient for a different date or time.' };
            break;
          }
        }

        // Build display label showing start → end time based on actual duration
        const apptStart = new Date(args.scheduled_at);
        const apptEnd = new Date(apptStart.getTime() + apptDuration * 60000);
        const dateLabel = apptStart.toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric',
        });
        const startTime = apptStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const endTime = apptEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const fullLabel = `${dateLabel} from ${startTime} to ${endTime} (${apptDuration} mins)`;

        result = {
          pending_confirmation: true,
          prefill: {
            customer_name: args.customer_name,
            customer_phone: args.customer_phone || '',
            customer_email: args.customer_email || '',
            date_of_birth: args.date_of_birth || '',
            service_id: args.service_id || '',
            scheduled_at: args.scheduled_at,
            duration_minutes: apptDuration,
            notes: args.notes || '',
          },
          conversationId,
          message: `I've collected all your details. Please review the booking form and tap "Request Appointment" to confirm. Your appointment will be on ${fullLabel}.`,
        };
        break;
      }

      case 'createLead': {
        const args = toolArgs as {
          name: string;
          phone: string;
          email?: string;
          date_of_birth?: string;
          insurance_provider?: string;
          insurance_member_id?: string;
          service_interest?: string;
          notes?: string;
        };

        if (!args.name || !args.phone) {
          result = { error: 'Name and phone are required' };
          break;
        }

        const { data: lead, error } = await supabase
          .from('leads')
          .insert({
            business_id: businessId,
            conversation_id: conversationId || null,
            name: args.name,
            phone: args.phone || null,
            email: args.email || null,
            date_of_birth: args.date_of_birth || null,
            insurance_provider: args.insurance_provider || null,
            insurance_member_id: args.insurance_member_id || null,
            service_interest: args.service_interest || null,
            notes: args.notes || null,
            status: 'new' as const,
          })
          .select()
          .single();

        if (error) {
          result = { error: 'Failed to create lead' };
          break;
        }

        if (conversationId && lead) {
          await supabase
            .from('conversations')
            .update({ caller_name: args.name || null, caller_phone: args.phone || null })
            .eq('id', conversationId);
        }

        result = {
          success: true,
          lead_id: lead?.id,
          message: `Lead captured for ${args.name}. The team will follow up with you soon.`,
        };
        break;
      }

      case 'requestCallback': {
        const args = toolArgs as { name: string; phone: string; preferred_time?: string; reason?: string };

        if (!args.name || !args.phone) {
          result = { error: 'Name and phone are required' };
          break;
        }

        await supabase.from('leads').insert({
          business_id: businessId,
          conversation_id: conversationId || null,
          name: args.name,
          phone: args.phone,
          notes: `Callback requested. Preferred time: ${args.preferred_time || 'Any time'}. Reason: ${args.reason || 'Not specified'}`,
          status: 'new' as const,
        });

        if (conversationId) {
          await supabase
            .from('conversations')
            .update({
              callback_requested: true,
              caller_name: args.name || null,
              caller_phone: args.phone || null,
            })
            .eq('id', conversationId);

          await supabase.from('analytics_events').insert({
            business_id: businessId,
            conversation_id: conversationId,
            event_type: 'callback_requested',
            event_data: { name: args.name, phone: args.phone, preferred_time: args.preferred_time },
          });
        }

        result = {
          success: true,
          message: `Callback scheduled for ${args.name} at ${args.phone}. ${args.preferred_time ? `Preferred time: ${args.preferred_time}.` : ''} The team will call you back shortly.`,
        };
        break;
      }

      default:
        result = { error: `Unknown tool: ${toolName}` };
    }

    if (conversationId) {
      await supabase.from('conversation_messages').insert({
        conversation_id: conversationId,
        role: 'tool' as const,
        content: JSON.stringify(result),
        tool_name: toolName,
        tool_result: result as Record<string, unknown>,
      });
    }

    return NextResponse.json({ result }, { headers: CORS });
  } catch (err) {
    console.error('Tool execution error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: CORS });
  }
}
