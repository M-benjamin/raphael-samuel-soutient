interface StatusEmailData {
  patientName: string;
  scheduledAt: string;
  serviceName?: string;
  businessName: string;
  businessPhone?: string;
  businessEmail?: string;
  appointmentId: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes?: string;
}

const STATUS_CONFIG = {
  confirmed: { label: 'Appointment Approved', color: '#059669', icon: '✓', bg: '#064e3b' },
  cancelled: { label: 'Appointment Cancelled', color: '#dc2626', icon: '✕', bg: '#7f1d1d' },
  completed: { label: 'Appointment Completed', color: '#0d7377', icon: '★', bg: '#0a3d40' },
  no_show:   { label: 'Missed Appointment', color: '#d97706', icon: '!', bg: '#78350f' },
};

export function appointmentStatusHtml(d: StatusEmailData): string {
  const cfg = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.confirmed;
  const dateStr = new Date(d.scheduledAt).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: 'numeric', minute: '2-digit',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${cfg.label}</title></head>
<body style="margin:0;padding:0;background:#f2f8f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f8f9;padding:40px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr>
    <td style="background:linear-gradient(135deg,${cfg.bg},${cfg.color});padding:32px 40px;text-align:center;">
      <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;">${cfg.icon} ${cfg.label}</p>
      <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.65);">${d.businessName}</p>
    </td>
  </tr>
  <tr>
    <td style="padding:36px 40px;">
      <p style="margin:0 0 20px;font-size:15px;color:#334155;">Hi <strong>${d.patientName}</strong>,</p>
      <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.7;">
        ${d.status === 'confirmed' ? 'Your appointment has been <strong>approved</strong> by the clinic. See you soon!' : ''}
        ${d.status === 'cancelled' ? 'We\'re sorry, your appointment has been <strong>cancelled</strong>. Please contact us to reschedule.' : ''}
        ${d.status === 'completed' ? 'Thank you for your visit! Your appointment has been marked as <strong>completed</strong>.' : ''}
        ${d.status === 'no_show' ? 'We missed you today. Please call us to reschedule your appointment.' : ''}
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f8f9;border-radius:12px;border:1px solid rgba(13,115,119,0.12);margin-bottom:24px;">
        <tr><td style="padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:8px 0;border-bottom:1px solid rgba(13,115,119,0.08);">
              <span style="font-size:11px;font-weight:600;color:#0d7377;text-transform:uppercase;letter-spacing:0.5px;">Date &amp; Time</span><br/>
              <span style="font-size:14px;font-weight:600;color:#0a2e30;margin-top:4px;display:block;">${dateStr}</span>
            </td></tr>
            ${d.serviceName ? `<tr><td style="padding:8px 0;border-bottom:1px solid rgba(13,115,119,0.08);">
              <span style="font-size:11px;font-weight:600;color:#0d7377;text-transform:uppercase;letter-spacing:0.5px;">Service</span><br/>
              <span style="font-size:14px;color:#0a2e30;margin-top:4px;display:block;">${d.serviceName}</span>
            </td></tr>` : ''}
            <tr><td style="padding:8px 0;">
              <span style="font-size:11px;font-weight:600;color:#0d7377;text-transform:uppercase;letter-spacing:0.5px;">Status</span><br/>
              <span style="font-size:14px;font-weight:700;margin-top:4px;display:block;color:${cfg.color};">${cfg.label}</span>
            </td></tr>
          </table>
        </td></tr>
      </table>
      ${d.notes ? `<p style="margin:0 0 20px;font-size:13px;color:#64748b;font-style:italic;">"${d.notes}"</p>` : ''}
      ${d.businessPhone ? `<p style="margin:0;font-size:13px;color:#94a3b8;">Questions? Call us: <strong style="color:#0d7377;">${d.businessPhone}</strong>${d.businessEmail ? ` or email <strong style="color:#0d7377;">${d.businessEmail}</strong>` : ''}</p>` : ''}
    </td>
  </tr>
  <tr>
    <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:11px;color:#94a3b8;">
        Sent by <strong>${d.businessName}</strong> via MediCall AI · Appointment ID: <code style="font-size:10px;">${d.appointmentId}</code>
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function appointmentStatusText(d: StatusEmailData): string {
  const cfg = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.confirmed;
  const dateStr = new Date(d.scheduledAt).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
  return [
    `${cfg.label} — ${d.businessName}`,
    '',
    `Hi ${d.patientName},`,
    '',
    `Appointment: ${dateStr}`,
    d.serviceName ? `Service: ${d.serviceName}` : '',
    `Status: ${cfg.label}`,
    d.notes ? `Notes: ${d.notes}` : '',
    '',
    d.businessPhone ? `Contact: ${d.businessPhone}` : '',
    `Appointment ID: ${d.appointmentId}`,
  ].filter((l) => l !== undefined && l !== null).join('\n');
}

// Owner notification email (sent to the business owner)
interface OwnerNotifData {
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  scheduledAt: string;
  serviceName?: string;
  newStatus: string;
  appointmentId: string;
  businessName: string;
  changedByLabel?: string;
}

export function ownerNotifHtml(d: OwnerNotifData): string {
  const dateStr = new Date(d.scheduledAt).toLocaleString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
  const statusColors: Record<string, string> = {
    confirmed: '#059669', cancelled: '#dc2626', completed: '#0d7377',
    no_show: '#d97706', pending: '#6366f1', paid: '#0d7377',
  };
  const color = statusColors[d.newStatus] ?? '#0d7377';

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>Appointment Update</title></head>
<body style="margin:0;padding:0;background:#f2f8f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f8f9;padding:32px 16px;"><tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.07);">
  <tr><td style="background:linear-gradient(135deg,#0a3d40,#0d7377);padding:24px 32px;">
    <p style="margin:0;font-size:18px;font-weight:800;color:#fff;">Appointment Update</p>
    <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.6);">${d.businessName} — MediCall AI</p>
  </td></tr>
  <tr><td style="padding:28px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafa;border-radius:10px;border:1px solid rgba(13,115,119,0.10);margin-bottom:20px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#0d7377;text-transform:uppercase;letter-spacing:0.5px;">Patient</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#0a2e30;">${d.patientName}</p>
        ${d.patientPhone ? `<p style="margin:2px 0 0;font-size:12px;color:#64748b;">${d.patientPhone}${d.patientEmail ? ` · ${d.patientEmail}` : ''}</p>` : ''}
        <p style="margin:12px 0 4px;font-size:12px;font-weight:700;color:#0d7377;text-transform:uppercase;letter-spacing:0.5px;">Appointment</p>
        <p style="margin:0;font-size:13px;color:#334155;">${dateStr}${d.serviceName ? ` — ${d.serviceName}` : ''}</p>
        <p style="margin:10px 0 0;font-size:13px;">Status changed to: <strong style="color:${color};font-size:14px;">${d.newStatus.toUpperCase()}</strong></p>
      </td></tr>
    </table>
    <p style="margin:0;font-size:11px;color:#94a3b8;">Appointment ID: ${d.appointmentId}${d.changedByLabel ? ` · Changed by: ${d.changedByLabel}` : ''}</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}
