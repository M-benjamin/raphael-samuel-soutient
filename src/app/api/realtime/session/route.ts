import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { buildSystemPrompt, REALTIME_TOOLS } from '@/ai/tools';
import type { Business, Agent, Service, BusinessHours } from '@/types';

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
    const contentType = req.headers.get('content-type') || '';

    // ── Phase 1: config request (JSON, no SDP yet) ──────────────────────────
    // Widget calls this first to get session config + conversationId.
    if (contentType.includes('application/json')) {
      const { businessId, agentId } = await req.json();

      if (!businessId) {
        return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
      }

      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!UUID_RE.test(businessId)) {
        return NextResponse.json({ error: 'Invalid businessId' }, { status: 400 });
      }

      const supabase = createAdminSupabase();

      const { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .eq('is_active', true)
        .single();

      if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
      }

      let agentQuery = supabase.from('agents').select('*').eq('business_id', businessId).eq('is_active', true);
      if (agentId) {
        agentQuery = agentQuery.eq('id', agentId);
      }
      const { data: agentRows } = await agentQuery.limit(1);
      const agent = agentRows?.[0] || null;

      // Fetch only services assigned to this agent (via agent_services junction table).
      // If the agent has no assigned services, fall back to all active business services.
      let services = null;
      if (agent?.id) {
        const { data: agentServiceRows } = await supabase
          .from('agent_services')
          .select('service_id')
          .eq('agent_id', agent.id);

        const assignedIds = (agentServiceRows || []).map((r: { service_id: string }) => r.service_id);

        if (assignedIds.length > 0) {
          const { data: assignedServices } = await supabase
            .from('services')
            .select('*')
            .in('id', assignedIds)
            .eq('is_active', true);
          services = assignedServices;
        } else {
          const { data: allServices } = await supabase
            .from('services')
            .select('*')
            .eq('business_id', businessId)
            .eq('is_active', true);
          services = allServices;
        }
      } else {
        const { data: allServices } = await supabase
          .from('services')
          .select('*')
          .eq('business_id', businessId)
          .eq('is_active', true);
        services = allServices;
      }

      const { data: hours } = await supabase
        .from('business_hours')
        .select('*')
        .eq('business_id', businessId)
        .order('day_of_week');

      const { data: faqs } = await supabase
        .from('faqs')
        .select('question, answer')
        .eq('business_id', businessId)
        .eq('is_active', true);

      const agentTyped = agent as Agent | null;

      const systemPrompt = buildSystemPrompt(
        business as Business,
        (services || []) as Service[],
        (hours || []) as BusinessHours[],
        agentTyped?.system_prompt || null,
        (faqs || []) as Array<{ question: string; answer: string }>,
        agentTyped?.language || 'en',
        agentTyped?.greeting_message || null
      );

      const { data: conversation } = await supabase
        .from('conversations')
        .insert({
          business_id: businessId,
          agent_id: agentTyped?.id || null,
          status: 'active' as const,
          source: 'widget' as const,
        })
        .select()
        .single();

      if (conversation) {
        await Promise.all([
          supabase.from('analytics_events').insert({
            business_id: businessId,
            conversation_id: conversation.id,
            event_type: 'conversation_started',
            event_data: { agent_id: agentTyped?.id, source: 'widget' },
          }),
          supabase
            .from('embedded_widgets')
            .select('id, total_impressions')
            .eq('business_id', businessId)
            .eq('is_active', true)
            .limit(1)
            .single()
            .then(({ data: w }) => {
              if (w) {
                return supabase
                  .from('embedded_widgets')
                  .update({ total_impressions: (w.total_impressions || 0) + 1 })
                  .eq('id', w.id);
              }
            }),
        ]);
      }

      const sensitivity = agentTyped?.interrupt_sensitivity || 'medium';

      return NextResponse.json({
        conversationId: conversation?.id,
        agentName: agentTyped?.name || 'AI Receptionist',
        voice: agentTyped?.voice || 'alloy',
        model: 'gpt-realtime',
        systemPrompt,
        tools: REALTIME_TOOLS,
        turnDetection: {
          type: 'server_vad',
          threshold: sensitivity === 'low' ? 0.9 : sensitivity === 'high' ? 0.5 : 0.7,
          prefix_padding_ms: 300,
          silence_duration_ms: sensitivity === 'low' ? 800 : sensitivity === 'high' ? 400 : 600,
        },
      }, { headers: CORS });
    }

    // SDP proxy moved to /api/realtime/connect
    return NextResponse.json({ error: 'Use /api/realtime/connect for SDP exchange' }, { status: 400 });

  } catch (err) {
    console.error('Session route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
