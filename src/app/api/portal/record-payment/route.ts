import { createAdminSupabase } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { appointmentId, paymentIntentId, amount, method, totalAmount } =
      (await req.json()) as {
        appointmentId: string;
        paymentIntentId?: string;
        amount: number; // amount being paid now
        method: "stripe" | "cash" | "partial";
        totalAmount?: number; // service total (optional, for calculating remaining)
      };

    if (!appointmentId || !amount || !method) {
      return NextResponse.json(
        { error: "appointmentId, amount and method are required" },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabase();

    // Load current appointment to get existing paid amount
    const { data: appt } = await supabase
      .from("appointments")
      .select("payment_amount, amount_paid, amount_remaining")
      .eq("id", appointmentId)
      .single();

    const previouslyPaid = Number(appt?.amount_paid ?? 0);
    const newTotalPaid = previouslyPaid + amount;
    const total =
      totalAmount ??
      ((appt?.amount_paid ?? 0) + (appt?.amount_remaining ?? 0) || amount);
    const remaining = Math.max(0, total - newTotalPaid);

    const isFullyPaid = remaining <= 0.001; // tolerance for float math

    const paymentStatus = isFullyPaid
      ? method === "cash"
        ? "cash"
        : "paid"
      : "partial";

    await supabase
      .from("appointments")
      .update({
        payment_status: paymentStatus,
        payment_method: method,
        payment_amount: newTotalPaid,
        amount_paid: newTotalPaid,
        amount_remaining: remaining,
        // ...(txHash ? { payment_tx_hash: txHash } : {}),
      })
      .eq("id", appointmentId);

    return NextResponse.json({
      success: true,
      payment_status: paymentStatus,
      amount_paid: newTotalPaid,
      amount_remaining: remaining,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
