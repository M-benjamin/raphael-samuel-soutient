import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');
    const agentId = searchParams.get('agentId');

    if (!businessId) {
      return NextResponse.json({ error: 'businessId required' }, { status: 400 });
    }

    const supabase = createAdminSupabase();

    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, name, phone, city, state')
      .eq('id', businessId)
      .single();

    if (bizError) {
      console.error('[widget/config] business lookup error:', bizError.message, 'businessId:', businessId);
    }

    if (!business) {
      console.error('[widget/config] Business not found for id:', businessId);
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const { data: widget } = await supabase
      .from('embedded_widgets')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .limit(1)
      .single();

    let agentQuery = supabase
      .from('agents')
      .select('id, name, voice, greeting_message')
      .eq('business_id', businessId)
      .eq('is_active', true);

    if (agentId) {
      agentQuery = agentQuery.eq('id', agentId);
    }

    const { data: agent } = await agentQuery.limit(1).single();

    // Fetch services linked to this specific agent via agent_services junction table.
    // Fall back to all active business services only if the agent has no services assigned.
    let services = null;
    let svcError = null;

    if (agent?.id) {
      const { data: agentSvcLinks } = await supabase
        .from('agent_services')
        .select('service_id')
        .eq('agent_id', agent.id);

      const serviceIds = (agentSvcLinks || []).map((r: { service_id: string }) => r.service_id);

      if (serviceIds.length > 0) {
        const { data, error } = await supabase
          .from('services')
          .select('id, name, duration_minutes, price_min, price_max, price_type')
          .in('id', serviceIds)
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        services = data;
        svcError = error;
      } else {
        // Agent exists but has no specific services assigned — show all business services
        const { data, error } = await supabase
          .from('services')
          .select('id, name, duration_minutes, price_min, price_max, price_type')
          .eq('business_id', businessId)
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        services = data;
        svcError = error;
      }
    } else {
      // No agent resolved — show all active business services
      const { data, error } = await supabase
        .from('services')
        .select('id, name, duration_minutes, price_min, price_max, price_type')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      services = data;
      svcError = error;
    }

    if (svcError) {
      console.error('[widget/config] services lookup error:', (svcError as { message: string }).message);
    }
    console.log('[widget/config] services found:', services?.length ?? 0, 'for agent:', agent?.id ?? 'none');

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        city: business.city,
        state: business.state,
      },
      widget: widget ? {
        position: widget.position,
        primary_color: widget.primary_color,
        greeting: widget.greeting,
        theme: widget.theme || 'dark',
      } : { position: 'bottom-right', primary_color: '#22c55e', theme: 'dark' },
      agent: agent ? {
        id: agent.id,
        name: agent.name,
        greeting: agent.greeting_message,
      } : null,
      services: (services || []).map(s => ({
        id: s.id,
        name: s.name,
        duration_minutes: s.duration_minutes,
        price_type: s.price_type,
        price_min: s.price_min,
        price_max: s.price_max,
      })),
    }, { headers });
  } catch {
    return NextResponse.json({ error: 'Failed to load config' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
