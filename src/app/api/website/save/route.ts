import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { businessId, slug, template, primary_color, secondary_color, font_style, content, agent_id } = body;

  if (!businessId) return NextResponse.json({ error: 'businessId required' }, { status: 400 });
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = supabase.from('doctor_websites') as any;

  // Check if this slug is already taken by a different business
  const { data: slugConflict } = await table
    .select('id, business_id')
    .eq('slug', slug)
    .single();

  if (slugConflict && slugConflict.business_id !== businessId) {
    return NextResponse.json({ error: 'This site URL is already taken. Please choose a different one.' }, { status: 409 });
  }

  // Check if website already exists for this business
  const { data: existing } = await table
    .select('id')
    .eq('business_id', businessId)
    .single();

  const payload = {
    business_id: businessId,
    slug,
    template,
    primary_color,
    secondary_color,
    font_style,
    content,
    agent_id: agent_id || null,
    updated_at: new Date().toISOString(),
  };

  let result;
  if (existing) {
    result = await table.update(payload).eq('business_id', businessId).select().single();
  } else {
    result = await table.insert({ ...payload, subscription_active: false }).select().single();
  }

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ website: result.data });
}
