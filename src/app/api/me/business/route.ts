import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: business } = await (supabase.from('businesses') as any)
      .select('id, name, city, state')
      .eq('owner_id', user.id)
      .limit(1)
      .single() as { data: { id: string; name: string; city: string | null; state: string | null } | null };

    if (!business) {
      return NextResponse.json({ error: 'No business found' }, { status: 404 });
    }

    return NextResponse.json({ id: business.id, name: business.name, city: business.city, state: business.state });
  } catch {
    return NextResponse.json({ error: 'Failed to load business' }, { status: 500 });
  }
}
