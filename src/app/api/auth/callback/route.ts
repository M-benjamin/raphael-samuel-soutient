import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/portal/appointments';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // Code expired or already used — send to login with a message
      return NextResponse.redirect(`${origin}/portal/login?error=link_expired`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
