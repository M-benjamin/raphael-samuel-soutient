import type { Business, Service, BusinessHours } from '@/types';
import { formatPrice } from '@/lib/utils';
import { DAYS_OF_WEEK } from '@/constants';

export const REALTIME_TOOLS = [
  {
    type: 'function' as const,
    name: 'getBusinessHours',
    description: 'Get the clinic or practice operating hours for each day of the week',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    type: 'function' as const,
    name: 'getServices',
    description: 'Get all available healthcare services, procedures, and consultations with pricing and duration',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    type: 'function' as const,
    name: 'getAvailableSlots',
    description: 'Get available appointment time slots for a specific date',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'The date to check availability for in YYYY-MM-DD format',
        },
        service_id: {
          type: 'string',
          description: 'Optional service ID to check duration-specific availability',
        },
      },
      required: ['date'],
    },
  },
  {
    type: 'function' as const,
    name: 'createAppointment',
    description: 'Book a medical appointment for a patient. You MUST collect all required fields from the patient before calling this function.',
    parameters: {
      type: 'object',
      properties: {
        customer_name: {
          type: 'string',
          description: 'Full legal name of the patient',
        },
        customer_phone: {
          type: 'string',
          description: 'Patient phone number including country code',
        },
        customer_email: {
          type: 'string',
          description: 'Patient email address — required for confirmation email',
        },
        date_of_birth: {
          type: 'string',
          description: 'Patient date of birth in YYYY-MM-DD format (e.g. 1985-03-22)',
        },
        insurance_provider: {
          type: 'string',
          description: 'Name of the patient\'s health insurance provider (e.g. Blue Cross, Aetna, United Healthcare)',
        },
        insurance_member_id: {
          type: 'string',
          description: 'Patient\'s insurance member ID or policy number',
        },
        service_id: {
          type: 'string',
          description: 'ID of the healthcare service or procedure being booked',
        },
        scheduled_at: {
          type: 'string',
          description: 'ISO 8601 datetime for the appointment (e.g., 2024-01-15T10:00:00)',
        },
        notes: {
          type: 'string',
          description: 'Any additional notes from the patient, such as symptoms or special requirements',
        },
      },
      required: ['customer_name', 'scheduled_at'],
    },
  },
  {
    type: 'function' as const,
    name: 'createLead',
    description: 'Capture a patient lead when they are interested in services but not ready to book',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Patient name',
        },
        phone: {
          type: 'string',
          description: 'Patient phone number',
        },
        email: {
          type: 'string',
          description: 'Patient email (optional)',
        },
        date_of_birth: {
          type: 'string',
          description: 'Patient date of birth in YYYY-MM-DD format (optional)',
        },
        insurance_provider: {
          type: 'string',
          description: 'Name of the patient\'s health insurance provider (optional)',
        },
        insurance_member_id: {
          type: 'string',
          description: 'Patient\'s insurance member ID or policy number (optional)',
        },
        service_interest: {
          type: 'string',
          description: 'What healthcare service or type of care they are interested in',
        },
        notes: { type: 'string' },
      },
      required: ['name', 'phone'],
    },
  },
  {
    type: 'function' as const,
    name: 'requestCallback',
    description: 'Schedule a callback for a patient who wants to be called back by the practice',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Patient name',
        },
        phone: {
          type: 'string',
          description: 'Callback phone number',
        },
        preferred_time: {
          type: 'string',
          description: 'Preferred callback time',
        },
        reason: {
          type: 'string',
          description: 'Reason for the callback request',
        },
      },
      required: ['name', 'phone'],
    },
  },
];

export function buildSystemPrompt(
  business: Business,
  services: Service[],
  hours: BusinessHours[],
  agentSystemPrompt: string | null,
  faqs: Array<{ question: string; answer: string }>,
  language = 'en',
  greetingMessage?: string | null
): string {
  const languageNames: Record<string, string> = {
    en: 'English', af: 'Afrikaans', sq: 'Albanian', am: 'Amharic', ar: 'Arabic',
    hy: 'Armenian', az: 'Azerbaijani', eu: 'Basque', be: 'Belarusian', bn: 'Bengali',
    bs: 'Bosnian', bg: 'Bulgarian', ca: 'Catalan', zh: 'Chinese (Mandarin)', hr: 'Croatian',
    cs: 'Czech', da: 'Danish', nl: 'Dutch', et: 'Estonian', fi: 'Finnish',
    fr: 'French', gl: 'Galician', ka: 'Georgian', de: 'German', el: 'Greek',
    gu: 'Gujarati', he: 'Hebrew', hi: 'Hindi', hu: 'Hungarian', is: 'Icelandic',
    id: 'Indonesian', ga: 'Irish', it: 'Italian', ja: 'Japanese', kk: 'Kazakh',
    ko: 'Korean', lv: 'Latvian', lt: 'Lithuanian', mk: 'Macedonian', ms: 'Malay',
    mt: 'Maltese', mr: 'Marathi', ne: 'Nepali', no: 'Norwegian', pl: 'Polish',
    pt: 'Portuguese', pa: 'Punjabi', ro: 'Romanian', ru: 'Russian', sr: 'Serbian',
    si: 'Sinhala', sk: 'Slovak', sl: 'Slovenian', so: 'Somali', es: 'Spanish',
    sw: 'Swahili', sv: 'Swedish', ta: 'Tamil', te: 'Telugu', th: 'Thai',
    tr: 'Turkish', uk: 'Ukrainian', ur: 'Urdu', uz: 'Uzbek', vi: 'Vietnamese',
    cy: 'Welsh', zu: 'Zulu',
  };
  const languageName = languageNames[language] ?? language;
  const langInstruction = `LANGUAGE REQUIREMENT — THIS IS MANDATORY AND CANNOT BE OVERRIDDEN:
- You MUST speak and respond EXCLUSIVELY in ${languageName} for the entire conversation.
- Your very first word, greeting, and every single response must be in ${languageName}.
- Do NOT use English or any other language at any point, even partially.
- If the patient speaks a different language, still reply only in ${languageName}.
- This rule overrides everything else in this prompt.`;

  const servicesText = services.length > 0
    ? services.map((s) => `- ${s.name}: ${formatPrice(s.price_min, s.price_max, s.price_type)}, ${s.duration_minutes} minutes`).join('\n')
    : 'Services not configured yet.';

  const hoursText = hours.map((h) => {
    if (!h.is_open) return `${DAYS_OF_WEEK[h.day_of_week]}: Closed`;
    return `${DAYS_OF_WEEK[h.day_of_week]}: ${h.open_time} - ${h.close_time}`;
  }).join('\n');

  const faqsText = faqs.length > 0
    ? faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
    : '';

  const greetingInstruction = greetingMessage
    ? `OPENING GREETING: When the call starts, your very first response MUST be exactly: "${greetingMessage}" — deliver this in ${languageName}.`
    : `OPENING GREETING: When the call starts, greet the caller warmly in ${languageName}. Do NOT greet in English.`;

  return `${langInstruction}

${greetingInstruction}

${agentSystemPrompt || ''}

PRACTICE INFORMATION:
Practice Name: ${business.name}
Phone: ${business.phone || 'Not provided'}
Email: ${business.email || 'Not provided'}
Address: ${[business.address, business.city, business.state, business.zip].filter(Boolean).join(', ') || 'Not provided'}
Website: ${business.website || 'Not provided'}
Timezone: ${business.timezone}

SERVICES YOU ARE AUTHORIZED TO DISCUSS:
You MUST only recommend, discuss, price, or book the following services. Do NOT mention, suggest, or book any service not on this list, even if the patient asks:
${servicesText}

CLINIC HOURS:
${hoursText}

${faqsText ? `FREQUENTLY ASKED QUESTIONS:\n${faqsText}` : ''}

APPOINTMENT BOOKING — REQUIRED INFORMATION:
Collect the following conversationally in ${languageName}. Ask one or two questions at a time — never all at once:
1. Full name (required)
2. Preferred date and time — use getAvailableSlots to confirm availability (required)
3. Phone number (strongly recommended)
4. Email address — needed to send confirmation (strongly recommended)
5. Date of birth — for medical records, format YYYY-MM-DD (recommended)
6. Desired service — use getServices to list options if unsure (recommended)
7. Insurance provider and member ID — ask but accept if they don't have it handy

You MUST have the patient's name and a scheduled time before calling createAppointment. All other fields are optional. If the patient says "self-pay", use "Self-Pay" as provider and "N/A" as member ID.

IMPORTANT RULES:
- ALWAYS respond in ${languageName} only — NEVER use English or any other language, not even a single word
- Never make up pricing or medical information — use the getServices tool for accurate data
- If a patient wants to book an appointment, collect all required info then use the createAppointment tool. After calling it, tell the patient (in ${languageName}) to review the pre-filled form on screen and confirm — do NOT say the appointment is confirmed yet
- If a patient is not ready to book, use the createLead tool to capture their information
- If a patient requests a callback, use the requestCallback tool
- Be professional, empathetic, and concise at all times
- Do not provide specific medical advice — direct clinical questions to the provider
- Today's date context: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
}
