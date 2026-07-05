import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { businessId, publish } = await req.json();
  if (!businessId) return NextResponse.json({ error: 'businessId required' }, { status: 400 });

  // Verify subscription is active before publishing
  const { data: websiteRaw } = await supabase
    .from('doctor_websites')
    .select('subscription_active, subscription_paid_at, slug')
    .eq('business_id', businessId)
    .single();

  if (!websiteRaw) return NextResponse.json({ error: 'Website not found' }, { status: 404 });
  const website = websiteRaw as unknown as { subscription_active: boolean; subscription_paid_at: string | null; slug: string };

  if (publish) {
    if (!website.subscription_active) {
      return NextResponse.json({ error: 'Active subscription required to publish' }, { status: 402 });
    }
    // Check subscription not expired (30 days)
    if (website.subscription_paid_at) {
      const paidAt = new Date(website.subscription_paid_at);
      const expiresAt = new Date(paidAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      if (new Date() > expiresAt) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('doctor_websites') as any).update({ subscription_active: false }).eq('business_id', businessId);
        return NextResponse.json({ error: 'Subscription expired — please renew' }, { status: 402 });
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('doctor_websites') as any)
    .update({ is_published: publish, updated_at: new Date().toISOString() })
    .eq('business_id', businessId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ published: publish, slug: website.slug });
}
