import { ownerNotifHtml } from "@/lib/email/appointmentStatus";
import { FROM_EMAIL, sendEmail } from "@/lib/resend";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const { appointmentId, newScheduledAt, requestedBy } =
      (await req.json()) as {
        appointmentId: string;
        newScheduledAt: string;
        requestedBy?: "patient" | "owner";
      };

    if (!appointmentId || !newScheduledAt) {
      return NextResponse.json(
        { error: "appointmentId and newScheduledAt are required" },
        { status: 400 },
      );
    }

    if (isNaN(new Date(newScheduledAt).getTime())) {
      return NextResponse.json(
        { error: "Invalid newScheduledAt date" },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabase();

    // Load the appointment
    const { data: appt, error: fetchErr } = await supabase
      .from("appointments")
      .select("*, service:services(name, duration_minutes)")
      .eq("id", appointmentId)
      .single();

    if (fetchErr || !appt) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    if (["completed", "cancelled"].includes(appt.status)) {
      return NextResponse.json(
        { error: "Cannot reschedule a completed or cancelled appointment" },
        { status: 409 },
      );
    }

    const durationMinutes: number =
      (appt.service as { duration_minutes?: number } | null)
        ?.duration_minutes ??
      appt.duration_minutes ??
      60;

    // Slot conflict check
    const slotStart = new Date(newScheduledAt);
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

    const { data: conflicts } = await supabase
      .from("appointments")
      .select("id, scheduled_at, duration_minutes")
      .eq("business_id", appt.business_id)
      .neq("id", appointmentId)
      .not("status", "in", '("cancelled","completed")')
      .lt("scheduled_at", slotEnd.toISOString())
      .gt(
        "scheduled_at",
        new Date(slotStart.getTime() - 8 * 60 * 60000).toISOString(),
      );

    const hasConflict = (conflicts || []).some((c) => {
      const cStart = new Date(c.scheduled_at).getTime();
      const cEnd = cStart + (c.duration_minutes || 60) * 60000;
      return cStart < slotEnd.getTime() && cEnd > slotStart.getTime();
    });

    if (hasConflict) {
      return NextResponse.json(
        {
          error:
            "That time slot is already booked. Please choose a different time.",
        },
        { status: 409 },
      );
    }

    // Update appointment
    const oldScheduledAt = appt.scheduled_at;
    const { error: updateErr } = await supabase
      .from("appointments")
      .update({ scheduled_at: newScheduledAt, status: "pending" })
      .eq("id", appointmentId);

    if (updateErr) {
      return NextResponse.json(
        { error: "Failed to reschedule appointment" },
        { status: 500 },
      );
    }

    // Load business info
    const { data: business } = await supabase
      .from("businesses")
      .select("name, email, phone")
      .eq("id", appt.business_id)
      .single();

    const biz = business as {
      name: string;
      email: string | null;
      phone: string | null;
    } | null;
    const serviceName = (appt.service as { name: string } | null)?.name;

    const oldDateStr = new Date(oldScheduledAt).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    const newDateStr = new Date(newScheduledAt).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    // Notification
    await supabase.from("notifications").insert({
      business_id: appt.business_id,
      type: "new_appointment",
      title: "Appointment Rescheduled",
      body: `${appt.customer_name} rescheduled from ${oldDateStr} to ${newDateStr}`,
      metadata: {
        appointment_id: appointmentId,
        requested_by: requestedBy ?? "owner",
      },
    });

    // Email patient
    if (appt.customer_email) {
      const patientHtml = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f2f8f9;padding:32px 16px;">
<table width="560" cellpadding="0" cellspacing="0" style="margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(13,115,119,0.10);">
  <tr><td style="background:linear-gradient(135deg,#0a3d40,#0d7377);padding:28px 36px;text-align:center;">
    <p style="margin:0;font-size:20px;font-weight:800;color:#fff;">📅 Appointment Rescheduled</p>
    <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.6);">${biz?.name || "Healthcare Practice"}</p>
  </td></tr>
  <tr><td style="padding:32px 36px;">
    <p style="font-size:15px;color:#334155;">Hi <strong>${appt.customer_name}</strong>,</p>
    <p style="font-size:14px;color:#64748b;line-height:1.7;">Your appointment has been rescheduled${requestedBy === "patient" ? " as requested" : " by the clinic"}. Here are your new details:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f8f9;border-radius:12px;border:1px solid rgba(13,115,119,0.12);margin:20px 0;">
      <tr><td style="padding:18px 22px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#0d7377;text-transform:uppercase;">Was</p>
        <p style="margin:0 0 14px;font-size:14px;color:#64748b;text-decoration:line-through;">${oldDateStr}</p>
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#0d7377;text-transform:uppercase;">New Date &amp; Time</p>
        <p style="margin:0;font-size:16px;font-weight:700;color:#0a2e30;">${newDateStr}</p>
        ${serviceName ? `<p style="margin:10px 0 0;font-size:13px;color:#64748b;">Service: ${serviceName}</p>` : ""}
      </td></tr>
    </table>
    <p style="font-size:13px;color:#94a3b8;">Status has been reset to <strong>Pending</strong> — you'll receive another email once the clinic approves the new time.</p>
    ${biz?.phone ? `<p style="font-size:13px;color:#94a3b8;margin-top:12px;">Questions? Call <strong style="color:#0d7377;">${biz.phone}</strong></p>` : ""}
  </td></tr>
  <tr><td style="background:#f8fafc;padding:16px 36px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:11px;color:#94a3b8;">Sent by <strong>${biz?.name}</strong> via Raphael Samuel Soutien · ID: ${appointmentId}</p>
  </td></tr>
</table></body></html>`;

      try {
        await sendEmail({
          from: FROM_EMAIL,
          to: appt.customer_email,
          subject: `Appointment Rescheduled — ${biz?.name || "Healthcare Practice"}`,
          html: patientHtml,
          text: `Appointment Rescheduled\n\nHi ${appt.customer_name},\n\nYour appointment has been rescheduled.\n\nWas: ${oldDateStr}\nNew: ${newDateStr}\n${serviceName ? `Service: ${serviceName}` : ""}\n\nStatus: Pending (awaiting clinic approval)\n\nID: ${appointmentId}`,
        });
      } catch (e) {
        console.error("[reschedule] Patient email failed:", e);
      }
    }

    // Email owner
    if (biz?.email) {
      try {
        await sendEmail({
          from: FROM_EMAIL,
          to: biz.email,
          subject: `[MediCall] Appointment Rescheduled — ${appt.customer_name}`,
          html: ownerNotifHtml({
            patientName: appt.customer_name,
            patientPhone: appt.customer_phone || undefined,
            patientEmail: appt.customer_email || undefined,
            scheduledAt: newScheduledAt,
            serviceName,
            newStatus: "rescheduled",
            appointmentId,
            businessName: biz.name,
            changedByLabel: requestedBy === "patient" ? "Patient" : "Staff",
          }),
          text: `Appointment Rescheduled\n\nPatient: ${appt.customer_name}\nOld time: ${oldDateStr}\nNew time: ${newDateStr}\nRequested by: ${requestedBy ?? "owner"}\nID: ${appointmentId}`,
        });
      } catch (e) {
        console.error("[reschedule] Owner email failed:", e);
      }
    }

    return NextResponse.json({
      success: true,
      newScheduledAt,
      message: `Appointment rescheduled to ${newDateStr}`,
    });
  } catch (err) {
    console.error("[/api/appointments/reschedule]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
