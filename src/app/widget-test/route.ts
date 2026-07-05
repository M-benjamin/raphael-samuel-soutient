import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  let businessId = '';
  let businessName = '';

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: business } = await (supabase.from('businesses') as any)
        .select('id, name')
        .eq('owner_id', user.id)
        .limit(1)
        .single() as { data: { id: string; name: string } | null };

      if (business) {
        businessId = business.id;
        businessName = business.name;
      }
    }
  } catch {
    // fall through
  }

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Widget Test — MediCall</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 700px; margin: 60px auto; padding: 0 24px; color: #1e293b; }
      h1  { font-size: 24px; margin-bottom: 8px; }
      p   { color: #64748b; line-height: 1.6; }
      .banner { border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 14px; }
      .info   { background: #f0f9ff; border: 1px solid #bae6fd; }
      .warn   { background: #fffbeb; border: 1px solid #fde68a; }
      code    { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
      a       { color: #0d7377; }
    </style>
  </head>
  <body>
    <h1>MediCall Widget Test</h1>
    <p>The AI receptionist widget appears in the bottom-right corner.</p>
    <p>Click it to start a voice call, or switch to the <strong>Book</strong> tab to test appointment booking.</p>

    ${businessId
      ? `<div class="banner info">
           Testing business: <strong>${businessName}</strong> &nbsp;·&nbsp; <code>${businessId}</code>
         </div>
         <script
           src="/api/widget-script"
           data-business-id="${businessId}"
           data-position="bottom-right"
           data-color="#0d7377"
         ></script>`
      : `<div class="banner warn">
           <strong>Not logged in or no business set up.</strong><br/>
           <a href="/login">Log in</a> first, then revisit this page — your business ID will be picked up automatically.
         </div>`
    }
  </body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
