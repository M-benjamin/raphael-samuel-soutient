import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';

export async function PATCH(req: NextRequest) {
  try {
    const { appointmentId, paymentStatus, amountPaid, totalAmount, method, notes } = await req.json() as {
      appointmentId: string;
      paymentStatus: 'unpaid' | 'partial' | 'paid' | 'cash' | 'refunded';
      amountPaid?: number;
      totalAmount?: number;
      method?: 'usdc' | 'cash' | 'partial';
      notes?: string;
    };

    if (!appointmentId || !paymentStatus) {
      return NextResponse.json({ error: 'appointmentId and paymentStatus are required' }, { status: 400 });
    }

    const supabase = createAdminSupabase();

    const { data: appt } = await supabase
      .from('appointments')
      .select('business_id')
      .eq('id', appointmentId)
      .single();

    if (!appt) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const total = totalAmount ?? amountPaid ?? 0;
    const paid = amountPaid ?? 0;
    const remaining = Math.max(0, total - paid);

    const update: Record<string, unknown> = { payment_status: paymentStatus };
    if (amountPaid !== undefined) {
      update.amount_paid = paid;
      update.payment_amount = paid;
      update.amount_remaining = remaining;
    }
    if (method) update.payment_method = method;
    if (notes !== undefined) update.notes = notes;

    if (paymentStatus === 'refunded') {
      update.amount_paid = 0;
      update.amount_remaining = 0;
    }

    await supabase.from('appointments').update(update).eq('id', appointmentId);

    await supabase.from('notifications').insert({
      business_id: appt.business_id,
      type: 'new_appointment',
      title: 'Payment Updated',
      body: `Payment status changed to ${paymentStatus}${amountPaid ? ` — $${amountPaid} received` : ''}`,
      metadata: { appointment_id: appointmentId, payment_status: paymentStatus },
    });

    return NextResponse.json({ success: true, payment_status: paymentStatus });
  } catch (err) {
    console.error('[/api/appointments/payment]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
