import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store',
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');
    const dateStr = searchParams.get('date'); // YYYY-MM-DD

    if (!businessId || !dateStr) {
      return NextResponse.json({ error: 'businessId and date required' }, { status: 400, headers: CORS });
    }

    const supabase = createAdminSupabase();

    // Get business hours for the day of week
    const date = new Date(dateStr + 'T12:00:00'); // noon to avoid DST edge
    const dayOfWeek = date.getDay(); // 0=Sun ... 6=Sat

    const { data: hours } = await supabase
      .from('business_hours')
      .select('open_time, close_time, is_open')
      .eq('business_id', businessId)
      .eq('day_of_week', dayOfWeek)
      .single();

    if (!hours || !hours.is_open || !hours.open_time || !hours.close_time) {
      return NextResponse.json({ slots: [], closed: true }, { headers: CORS });
    }

    // Generate 30-min slots between open_time and close_time
    const slots = generateSlots(dateStr, hours.open_time, hours.close_time);

    // Find already-booked appointments on this date.
    // Use a wide UTC window (+/-1 day) to catch all appointments regardless of timezone,
    // then match by extracting the HH:MM from the stored timestamp.
    const dayStart = dateStr + 'T00:00:00.000Z';
    const dayEnd = new Date(new Date(dateStr + 'T00:00:00.000Z').getTime() + 48 * 60 * 60 * 1000).toISOString();

    const { data: booked } = await supabase
      .from('appointments')
      .select('scheduled_at, duration_minutes')
      .eq('business_id', businessId)
      .in('status', ['pending', 'confirmed'])
      .gte('scheduled_at', dayStart)
      .lte('scheduled_at', dayEnd);

    const bookedTimes = new Set<string>();
    (booked || []).forEach((appt) => {
      const start = new Date(appt.scheduled_at);
      const dur = appt.duration_minutes || 60;
      for (let offset = 0; offset < dur; offset += 30) {
        const slotTime = new Date(start.getTime() + offset * 60000);
        bookedTimes.add(toTimeKey(slotTime));
      }
    });

    // Match against slot keys which are plain HH:MM strings
    const available = slots.filter((s) => !bookedTimes.has(s.key.split('T')[1]));

    return NextResponse.json({ slots: available.map((s) => s.time) }, { headers: CORS });
  } catch {
    return NextResponse.json({ error: 'Failed to load slots' }, { status: 500, headers: CORS });
  }
}

function generateSlots(dateStr: string, openTime: string, closeTime: string) {
  const slots: { time: string; key: string }[] = [];
  const [openH, openM] = openTime.split(':').map(Number);
  const [closeH, closeM] = closeTime.split(':').map(Number);
  const openMins = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM;

  for (let m = openMins; m < closeMins; m += 30) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const hh = String(h).padStart(2, '0');
    const mm = String(min).padStart(2, '0');
    const ampm = h < 12 ? 'AM' : 'PM';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    slots.push({
      time: `${displayH}:${mm} ${ampm}`,
      key: `${dateStr}T${hh}:${mm}`,
    });
  }
  return slots;
}

// Returns "HH:MM" from a Date using local time (consistent with slot generation)
function toTimeKey(date: Date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
