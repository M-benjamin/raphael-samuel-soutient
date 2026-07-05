import { NextResponse } from "next/server";
// import { createAdminSupabase } from '@/lib/supabase/admin';

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const businessId = searchParams.get('businessId');
//   if (!businessId) return NextResponse.json({ error: 'businessId required' }, { status: 400 });

//   const supabase = createAdminSupabase();
//   const { data } = await supabase
//     .from('payment_config')
//     .select('network_name, chain_id, rpc_url, usdc_contract_address, receiver_wallet, usdc_decimals')
//     .eq('business_id', businessId)
//     .eq('is_active', true)
//     .maybeSingle();

//   if (!data) return NextResponse.json({ error: 'No payment config found' }, { status: 404 });
//   return NextResponse.json(data);
// }

export async function GET() {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return NextResponse.json({ error: "Not implemented" }, { status: 501 });
  }

  return NextResponse.json({ publishableKey });
}
