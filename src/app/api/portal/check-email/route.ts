import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email?: string };
    if (!email) return NextResponse.json({ exists: false });

    const supabase = createAdminSupabase();
    const { count } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('customer_email', email.toLowerCase().trim());

    return NextResponse.json({ exists: (count ?? 0) > 0 });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
