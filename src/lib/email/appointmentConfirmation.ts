interface AppointmentEmailData {
  patientName: string;
  scheduledAt: string;
  serviceName?: string;
  dateOfBirth?: string;
  insuranceProvider?: string;
  insuranceMemberId?: string;
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  appointmentId: string;
}

export function appointmentConfirmationHtml(d: AppointmentEmailData): string {
  const dateStr = new Date(d.scheduledAt).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Appointment Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f2f8f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f8f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,115,119,0.10);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0d7377,#0a3d40);padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
              ✓ Appointment Confirmed
            </p>
            <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.65);">
              ${d.businessName}
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 24px;font-size:15px;color:#334155;">
              Hi <strong>${d.patientName}</strong>,
            </p>
            <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.7;">
              Your appointment has been successfully booked. Here are your details:
            </p>

            <!-- Details card -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f2f8f9;border-radius:12px;border:1px solid rgba(13,115,119,0.12);margin-bottom:28px;">
              <tr>
                <td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid rgba(13,115,119,0.08);">
                        <span style="font-size:11px;font-weight:600;color:#0d7377;text-transform:uppercase;letter-spacing:0.5px;">Date &amp; Time</span><br/>
                        <span style="font-size:14px;font-weight:600;color:#0a2e30;margin-top:4px;display:block;">${dateStr}</span>
                      </td>
                    </tr>
                    ${
                      d.serviceName
                        ? `
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid rgba(13,115,119,0.08);">
                        <span style="font-size:11px;font-weight:600;color:#0d7377;text-transform:uppercase;letter-spacing:0.5px;">Service</span><br/>
                        <span style="font-size:14px;font-weight:600;color:#0a2e30;margin-top:4px;display:block;">${d.serviceName}</span>
                      </td>
                    </tr>`
                        : ""
                    }
                    ${
                      d.dateOfBirth
                        ? `
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid rgba(13,115,119,0.08);">
                        <span style="font-size:11px;font-weight:600;color:#0d7377;text-transform:uppercase;letter-spacing:0.5px;">Date of Birth</span><br/>
                        <span style="font-size:14px;color:#0a2e30;margin-top:4px;display:block;">${d.dateOfBirth}</span>
                      </td>
                    </tr>`
                        : ""
                    }
                    ${
                      d.insuranceProvider
                        ? `
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid rgba(13,115,119,0.08);">
                        <span style="font-size:11px;font-weight:600;color:#0d7377;text-transform:uppercase;letter-spacing:0.5px;">Insurance</span><br/>
                        <span style="font-size:14px;color:#0a2e30;margin-top:4px;display:block;">${d.insuranceProvider}${d.insuranceMemberId ? ` · ID: ${d.insuranceMemberId}` : ""}</span>
                      </td>
                    </tr>`
                        : ""
                    }
                    ${
                      d.businessAddress
                        ? `
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid rgba(13,115,119,0.08);">
                        <span style="font-size:11px;font-weight:600;color:#0d7377;text-transform:uppercase;letter-spacing:0.5px;">Location</span><br/>
                        <span style="font-size:14px;color:#0a2e30;margin-top:4px;display:block;">${d.businessAddress}</span>
                      </td>
                    </tr>`
                        : ""
                    }
                    ${
                      d.businessPhone
                        ? `
                    <tr>
                      <td style="padding:8px 0;">
                        <span style="font-size:11px;font-weight:600;color:#0d7377;text-transform:uppercase;letter-spacing:0.5px;">Contact</span><br/>
                        <span style="font-size:14px;color:#0a2e30;margin-top:4px;display:block;">${d.businessPhone}${d.businessEmail ? ` · ${d.businessEmail}` : ""}</span>
                      </td>
                    </tr>`
                        : ""
                    }
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 28px;font-size:13px;color:#94a3b8;line-height:1.6;">
              If you need to reschedule or cancel, please contact us at least 24 hours in advance.
              You can also manage your appointments through our patient portal.
            </p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
              <tr>
                <td style="background:linear-gradient(135deg,#14a8b5,#0d7377);border-radius:10px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://medicallai.com"}/portal/login"
                    style="display:inline-block;padding:12px 28px;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;">
                    View in Patient Portal →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:11px;color:#94a3b8;">
              This email was sent by <strong>${d.businessName}</strong> via MediCall AI.<br/>
              Appointment ID: <code style="font-size:10px;color:#64748b;">${d.appointmentId}</code>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function appointmentConfirmationText(d: AppointmentEmailData): string {
  const dateStr = new Date(d.scheduledAt).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return [
    `Appointment Confirmed — ${d.businessName}`,
    "",
    `Hi ${d.patientName},`,
    "",
    `Your appointment is confirmed for: ${dateStr}`,
    d.serviceName ? `Service: ${d.serviceName}` : "",
    d.dateOfBirth ? `Date of Birth: ${d.dateOfBirth}` : "",
    d.insuranceProvider
      ? `Insurance: ${d.insuranceProvider}${d.insuranceMemberId ? ` (ID: ${d.insuranceMemberId})` : ""}`
      : "",
    d.businessAddress ? `Location: ${d.businessAddress}` : "",
    d.businessPhone ? `Phone: ${d.businessPhone}` : "",
    "",
    `Appointment ID: ${d.appointmentId}`,
    "",
    `Manage your appointments: ${process.env.NEXT_PUBLIC_APP_URL || "https://medicallai.com"}/portal`,
  ]
    .filter(Boolean)
    .join("\n");
}
