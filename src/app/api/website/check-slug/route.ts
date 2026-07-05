import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const businessId = searchParams.get('businessId');

  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('doctor_websites') as any)
    .select('business_id')
    .eq('slug', slug)
    .single();

  // Available if no record exists, or the record belongs to this business
  const available = !data || data.business_id === businessId;

  return NextResponse.json({ available });
}
