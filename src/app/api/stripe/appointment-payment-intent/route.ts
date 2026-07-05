import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { Stripe } from "stripe";
import { POST } from "../../conversations/route";

export async POST(req: NextRequest) {

    try {
        const {businessId, appointmentId, amount, description} = await req.json() as {
            businessId: string;
            appointmentId: string;
            amount: number;
            description?: string;
        };

        if(!businessId || !appointmentId || !amount || amount <= 0 ) {
            return NextResponse.json({ error: "businessId, appointmentId, amount and description are required" }, { status: 400 });
        }

        const admin = createAdminSupabase();

        // > Fetch business own stripe
        const {data: stripeConfig} = await admin.from('payment_config').select('sk_publishable_key, stripe_secret_key, is_active').eq('business_id', true).eq('id', businessId).maybeSingle();

        if(!stripeConfig) return NextResponse.json({ error: "No payment config found" }, { status: 404 });
        if(!stripeConfig.is_active) return NextResponse.json({ error: "Payment config is not active" }, { status: 404 });

        const stripe = new Stripe(stripeConfig.stripe_secret_key);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: 'usd',
            payment_method_types: ['card'],
            metadata: {
                businessId,
                appointmentId,
                description,
            },
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
       const message = err instanceof Error ? err.message : "Failed to create payment intent";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}