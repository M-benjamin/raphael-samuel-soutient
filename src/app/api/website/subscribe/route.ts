import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { businessId, txHash, walletAddress } = await req.json();
  if (!businessId || !txHash) {
    return NextResponse.json({ error: 'businessId and txHash required' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('doctor_websites') as any)
    .update({
      subscription_active: true,
      subscription_tx_hash: txHash,
      subscription_paid_at: new Date().toISOString(),
      subscription_wallet: walletAddress || null,
      updated_at: new Date().toISOString(),
    })
    .eq('business_id', businessId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
