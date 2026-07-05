export const APP_NAME = "Raphaël Samuel Soutien | Therapist";
export const APP_DESCRIPTION =
  "Therapist website for Raphael Samuel Soutien, a licensed therapist providing counseling and support services.";

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const AGENT_VOICES = [
  { value: "alloy", label: "Alloy - Neutral" },
  { value: "echo", label: "Echo - Male" },
  { value: "fable", label: "Fable - British" },
  { value: "onyx", label: "Onyx - Deep Male" },
  { value: "nova", label: "Nova - Female" },
  { value: "shimmer", label: "Shimmer - Soft Female" },
] as const;

export const AGENT_PERSONALITIES = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
] as const;

export const AGENT_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "af", label: "Afrikaans" },
  { value: "sq", label: "Albanian" },
  { value: "am", label: "Amharic" },
  { value: "ar", label: "Arabic" },
  { value: "hy", label: "Armenian" },
  { value: "az", label: "Azerbaijani" },
  { value: "eu", label: "Basque" },
  { value: "be", label: "Belarusian" },
  { value: "bn", label: "Bengali" },
  { value: "bs", label: "Bosnian" },
  { value: "bg", label: "Bulgarian" },
  { value: "ca", label: "Catalan" },
  { value: "zh", label: "Chinese (Mandarin)" },
  { value: "hr", label: "Croatian" },
  { value: "cs", label: "Czech" },
  { value: "da", label: "Danish" },
  { value: "nl", label: "Dutch" },
  { value: "et", label: "Estonian" },
  { value: "fi", label: "Finnish" },
  { value: "fr", label: "French" },
  { value: "gl", label: "Galician" },
  { value: "ka", label: "Georgian" },
  { value: "de", label: "German" },
  { value: "el", label: "Greek" },
  { value: "gu", label: "Gujarati" },
  { value: "he", label: "Hebrew" },
  { value: "hi", label: "Hindi" },
  { value: "hu", label: "Hungarian" },
  { value: "is", label: "Icelandic" },
  { value: "id", label: "Indonesian" },
  { value: "ga", label: "Irish" },
  { value: "it", label: "Italian" },
  { value: "ja", label: "Japanese" },
  { value: "kk", label: "Kazakh" },
  { value: "ko", label: "Korean" },
  { value: "lv", label: "Latvian" },
  { value: "lt", label: "Lithuanian" },
  { value: "mk", label: "Macedonian" },
  { value: "ms", label: "Malay" },
  { value: "mt", label: "Maltese" },
  { value: "mr", label: "Marathi" },
  { value: "ne", label: "Nepali" },
  { value: "no", label: "Norwegian" },
  { value: "pl", label: "Polish" },
  { value: "pt", label: "Portuguese" },
  { value: "pa", label: "Punjabi" },
  { value: "ro", label: "Romanian" },
  { value: "ru", label: "Russian" },
  { value: "sr", label: "Serbian" },
  { value: "si", label: "Sinhala" },
  { value: "sk", label: "Slovak" },
  { value: "sl", label: "Slovenian" },
  { value: "so", label: "Somali" },
  { value: "es", label: "Spanish" },
  { value: "sw", label: "Swahili" },
  { value: "sv", label: "Swedish" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "th", label: "Thai" },
  { value: "tr", label: "Turkish" },
  { value: "uk", label: "Ukrainian" },
  { value: "ur", label: "Urdu" },
  { value: "uz", label: "Uzbek" },
  { value: "vi", label: "Vietnamese" },
  { value: "cy", label: "Welsh" },
  { value: "zu", label: "Zulu" },
] as const;

export const INTERRUPT_SENSITIVITIES = [
  { value: "low", label: "Low - Let AI finish speaking" },
  { value: "medium", label: "Medium - Balanced" },
  { value: "high", label: "High - Interrupt immediately" },
] as const;

export const PRICE_TYPES = [
  { value: "fixed", label: "Fixed Price" },
  { value: "range", label: "Price Range" },
  { value: "starting_at", label: "Starting At" },
  { value: "call_for_price", label: "Call for Price" },
] as const;

export const APPOINTMENT_STATUSES = [
  { value: "pending", label: "Pending", color: "yellow" },
  { value: "confirmed", label: "Confirmed", color: "blue" },
  { value: "completed", label: "Completed", color: "green" },
  { value: "cancelled", label: "Cancelled", color: "red" },
  { value: "no_show", label: "No Show", color: "gray" },
] as const;

export const LEAD_STATUSES = [
  { value: "new", label: "New", color: "blue" },
  { value: "contacted", label: "Contacted", color: "yellow" },
  { value: "qualified", label: "Qualified", color: "purple" },
  { value: "converted", label: "Converted", color: "green" },
  { value: "lost", label: "Lost", color: "red" },
] as const;

export const TIMEZONES = [
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "America/Puerto_Rico",
];

export const DEFAULT_GREETING =
  "Hello! Thank you for calling. I'm an AI assistant here to help you with appointments, health service questions, and more. How can I assist you today?";

export const DEFAULT_SYSTEM_PROMPT = `You are a professional AI receptionist for a healthcare practice. Your job is to:
1. Greet patients warmly and professionally
2. Answer questions about medical services and procedures
3. Check available appointment slots and book appointments
4. Collect patient information for scheduling
5. Handle callback requests
6. Provide clinic hours and location information

Always be helpful, empathetic, concise, and professional. When booking appointments, collect:
- Patient name
- Phone number
- Date of birth (optional)
- Reason for visit / service needed
- Preferred date and time
- Insurance provider (if applicable)

Use the available tools to check schedules and create bookings. Never make up information about services or pricing — use the provided tools to get accurate data.`;

export const WIDGET_POSITIONS = [
  { value: "bottom-right", label: "Bottom Right" },
  { value: "bottom-left", label: "Bottom Left" },
] as const;

export const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

export const SUGGESTED_SERVICES = [
  /* ── Primary & Preventive Care ── */
  {
    category: "Primary & Preventive Care",
    icon: "stethoscope",
    color: "#0d7377",
    name: "General Consultation",
    description:
      "Comprehensive consultation with a general practitioner for diagnosis, treatment planning, and referrals",
    duration_minutes: 30,
    price_type: "fixed" as const,
    price_min: 120,
    price_max: null,
  },
  // {
  //   category: "Primary & Preventive Care",
  //   icon: "stethoscope",
  //   color: "#0d7377",
  //   name: "Annual Physical Exam",
  //   description:
  //     "Full-body preventive health checkup including vitals, bloodwork review, and wellness assessment",
  //   duration_minutes: 60,
  //   price_type: "fixed" as const,
  //   price_min: 200,
  //   price_max: null,
  // },
  // {
  //   category: "Primary & Preventive Care",
  //   icon: "stethoscope",
  //   color: "#0d7377",
  //   name: "Follow-Up Visit",
  //   description:
  //     "Short revisit to review test results, adjust treatments, or check on a previously evaluated condition",
  //   duration_minutes: 20,
  //   price_type: "fixed" as const,
  //   price_min: 80,
  //   price_max: null,
  // },
  // {
  //   category: "Primary & Preventive Care",
  //   icon: "stethoscope",
  //   color: "#0d7377",
  //   name: "Chronic Disease Management",
  //   description:
  //     "Ongoing follow-up for diabetes, hypertension, asthma, COPD, thyroid disorders, and similar conditions",
  //   duration_minutes: 30,
  //   price_type: "fixed" as const,
  //   price_min: 130,
  //   price_max: null,
  // },
  // {
  //   category: "Primary & Preventive Care",
  //   icon: "stethoscope",
  //   color: "#0d7377",
  //   name: "Preventive Wellness Screening",
  //   description:
  //     "Risk assessment and screening for cardiovascular disease, cancer markers, and metabolic disorders",
  //   duration_minutes: 45,
  //   price_type: "starting_at" as const,
  //   price_min: 150,
  //   price_max: null,
  // },
  // {
  //   category: "Primary & Preventive Care",
  //   icon: "stethoscope",
  //   color: "#0d7377",
  //   name: "Sick Visit / Acute Care",
  //   description:
  //     "Same-day evaluation for fever, cold, flu, infections, rashes, minor injuries, and acute illnesses",
  //   duration_minutes: 20,
  //   price_type: "fixed" as const,
  //   price_min: 100,
  //   price_max: null,
  // },
  // {
  //   category: "Primary & Preventive Care",
  //   icon: "stethoscope",
  //   color: "#0d7377",
  //   name: "Medication Management",
  //   description:
  //     "Review and adjustment of prescription medications, dosages, and potential drug interactions",
  //   duration_minutes: 20,
  //   price_type: "fixed" as const,
  //   price_min: 90,
  //   price_max: null,
  // },
  // {
  //   category: "Primary & Preventive Care",
  //   icon: "stethoscope",
  //   color: "#0d7377",
  //   name: "Vaccination / Immunization",
  //   description:
  //     "Flu shots, COVID boosters, hepatitis, travel vaccines, shingles, pneumonia, and routine immunizations",
  //   duration_minutes: 15,
  //   price_type: "range" as const,
  //   price_min: 30,
  //   price_max: 120,
  // },

  // /* ── Urgent & Emergency Care ── */
  // {
  //   category: "Urgent & Emergency Care",
  //   icon: "zap",
  //   color: "#dc2626",
  //   name: "Urgent Care Visit",
  //   description:
  //     "Walk-in or same-day care for non-life-threatening injuries and acute illnesses requiring prompt attention",
  //   duration_minutes: 30,
  //   price_type: "starting_at" as const,
  //   price_min: 150,
  //   price_max: null,
  // },
  // {
  //   category: "Urgent & Emergency Care",
  //   icon: "zap",
  //   color: "#dc2626",
  //   name: "Wound Care & Laceration Repair",
  //   description:
  //     "Cleaning, suturing, stapling, and dressing of cuts, lacerations, and abrasions",
  //   duration_minutes: 30,
  //   price_type: "starting_at" as const,
  //   price_min: 200,
  //   price_max: null,
  // },
  // {
  //   category: "Urgent & Emergency Care",
  //   icon: "zap",
  //   color: "#dc2626",
  //   name: "Fracture & Sprain Assessment",
  //   description:
  //     "X-ray, assessment, splinting, and casting for suspected fractures and sprains",
  //   duration_minutes: 45,
  //   price_type: "starting_at" as const,
  //   price_min: 250,
  //   price_max: null,
  // },
  // {
  //   category: "Urgent & Emergency Care",
  //   icon: "zap",
  //   color: "#dc2626",
  //   name: "IV Fluids & Infusion Therapy",
  //   description:
  //     "Intravenous fluid hydration, electrolyte replacement, and outpatient infusion services",
  //   duration_minutes: 60,
  //   price_type: "starting_at" as const,
  //   price_min: 300,
  //   price_max: null,
  // },
  // {
  //   category: "Urgent & Emergency Care",
  //   icon: "zap",
  //   color: "#dc2626",
  //   name: "Rapid Diagnostic Testing",
  //   description:
  //     "On-site rapid strep, flu, COVID, mono, and urinalysis tests with immediate results",
  //   duration_minutes: 20,
  //   price_type: "range" as const,
  //   price_min: 40,
  //   price_max: 120,
  // },

  // /* ── Telehealth & Virtual Care ── */
  // {
  //   category: "Telehealth & Virtual Care",
  //   icon: "monitor",
  //   color: "#059669",
  //   name: "Telehealth Consultation",
  //   description:
  //     "Secure video or phone appointment with a licensed provider from anywhere — no travel needed",
  //   duration_minutes: 20,
  //   price_type: "fixed" as const,
  //   price_min: 75,
  //   price_max: null,
  // },
  // {
  //   category: "Telehealth & Virtual Care",
  //   icon: "monitor",
  //   color: "#059669",
  //   name: "Virtual Follow-Up",
  //   description:
  //     "Video follow-up to review labs, imaging results, or ongoing treatment plans remotely",
  //   duration_minutes: 15,
  //   price_type: "fixed" as const,
  //   price_min: 55,
  //   price_max: null,
  // },
  // {
  //   category: "Telehealth & Virtual Care",
  //   icon: "monitor",
  //   color: "#059669",
  //   name: "Prescription Refill Request",
  //   description:
  //     "Remote review and renewal of maintenance medications without an in-office visit",
  //   duration_minutes: 10,
  //   price_type: "fixed" as const,
  //   price_min: 40,
  //   price_max: null,
  // },
  // {
  //   category: "Telehealth & Virtual Care",
  //   icon: "monitor",
  //   color: "#059669",
  //   name: "Online Mental Health Session",
  //   description:
  //     "Secure video therapy or psychiatric consultation from the comfort and privacy of home",
  //   duration_minutes: 50,
  //   price_type: "starting_at" as const,
  //   price_min: 120,
  //   price_max: null,
  // },
  // {
  //   category: "Telehealth & Virtual Care",
  //   icon: "monitor",
  //   color: "#059669",
  //   name: "Chronic Condition Check-In",
  //   description:
  //     "Virtual monitoring visit for patients managing long-term conditions like diabetes or hypertension",
  //   duration_minutes: 20,
  //   price_type: "fixed" as const,
  //   price_min: 65,
  //   price_max: null,
  // },

  // /* ── Diagnostics & Lab ── */
  // {
  //   category: "Diagnostics & Lab",
  //   icon: "flask",
  //   color: "#7c3aed",
  //   name: "Comprehensive Blood Panel",
  //   description:
  //     "Full CBC, metabolic panel, lipid profile, thyroid, HbA1c, and other blood tests with provider review",
  //   duration_minutes: 20,
  //   price_type: "starting_at" as const,
  //   price_min: 80,
  //   price_max: null,
  // },
  // {
  //   category: "Diagnostics & Lab",
  //   icon: "flask",
  //   color: "#7c3aed",
  //   name: "Urinalysis",
  //   description:
  //     "Complete urine analysis to detect infections, kidney issues, diabetes markers, and other conditions",
  //   duration_minutes: 15,
  //   price_type: "fixed" as const,
  //   price_min: 45,
  //   price_max: null,
  // },
  // {
  //   category: "Diagnostics & Lab",
  //   icon: "flask",
  //   color: "#7c3aed",
  //   name: "STI / STD Panel",
  //   description:
  //     "Confidential testing for HIV, chlamydia, gonorrhea, syphilis, herpes, and hepatitis",
  //   duration_minutes: 20,
  //   price_type: "starting_at" as const,
  //   price_min: 95,
  //   price_max: null,
  // },
  // {
  //   category: "Diagnostics & Lab",
  //   icon: "flask",
  //   color: "#7c3aed",
  //   name: "X-Ray Imaging",
  //   description:
  //     "Digital X-ray for chest, extremities, spine, and other areas with same-day results",
  //   duration_minutes: 20,
  //   price_type: "starting_at" as const,
  //   price_min: 150,
  //   price_max: null,
  // },
  // {
  //   category: "Diagnostics & Lab",
  //   icon: "flask",
  //   color: "#7c3aed",
  //   name: "Ultrasound",
  //   description:
  //     "Diagnostic ultrasound imaging for abdomen, pelvis, thyroid, vascular, and musculoskeletal conditions",
  //   duration_minutes: 30,
  //   price_type: "range" as const,
  //   price_min: 200,
  //   price_max: 500,
  // },
  // {
  //   category: "Diagnostics & Lab",
  //   icon: "flask",
  //   color: "#7c3aed",
  //   name: "ECG / EKG",
  //   description:
  //     "Electrocardiogram to evaluate heart rhythm, detect arrhythmias, and assess cardiac health",
  //   duration_minutes: 20,
  //   price_type: "fixed" as const,
  //   price_min: 120,
  //   price_max: null,
  // },
  // {
  //   category: "Diagnostics & Lab",
  //   icon: "flask",
  //   color: "#7c3aed",
  //   name: "Allergy Testing",
  //   description:
  //     "Skin prick or blood tests to identify allergies to foods, environmental triggers, and medications",
  //   duration_minutes: 45,
  //   price_type: "starting_at" as const,
  //   price_min: 200,
  //   price_max: null,
  // },

  // /* ── Mental Health ── */
  // {
  //   category: "Mental Health",
  //   icon: "brain",
  //   color: "#6366f1",
  //   name: "Psychiatric Evaluation",
  //   description:
  //     "Comprehensive mental health assessment for diagnosis and treatment planning by a psychiatrist",
  //   duration_minutes: 60,
  //   price_type: "starting_at" as const,
  //   price_min: 250,
  //   price_max: null,
  // },
  // {
  //   category: "Mental Health",
  //   icon: "brain",
  //   color: "#6366f1",
  //   name: "Individual Therapy Session",
  //   description:
  //     "One-on-one psychotherapy session with a licensed therapist — CBT, DBT, or other modalities",
  //   duration_minutes: 50,
  //   price_type: "range" as const,
  //   price_min: 120,
  //   price_max: 200,
  // },
  // {
  //   category: "Mental Health",
  //   icon: "brain",
  //   color: "#6366f1",
  //   name: "Couples Therapy",
  //   description:
  //     "Joint therapy sessions to improve communication, resolve conflicts, and strengthen relationships",
  //   duration_minutes: 60,
  //   price_type: "range" as const,
  //   price_min: 150,
  //   price_max: 250,
  // },
  // {
  //   category: "Mental Health",
  //   icon: "brain",
  //   color: "#6366f1",
  //   name: "Group Therapy Session",
  //   description:
  //     "Facilitated group support for anxiety, depression, grief, addiction recovery, and more",
  //   duration_minutes: 90,
  //   price_type: "range" as const,
  //   price_min: 40,
  //   price_max: 80,
  // },
  // {
  //   category: "Mental Health",
  //   icon: "brain",
  //   color: "#6366f1",
  //   name: "Medication-Assisted Therapy",
  //   description:
  //     "Psychiatric medication management combined with ongoing therapeutic support and monitoring",
  //   duration_minutes: 30,
  //   price_type: "starting_at" as const,
  //   price_min: 150,
  //   price_max: null,
  // },
  // {
  //   category: "Mental Health",
  //   icon: "brain",
  //   color: "#6366f1",
  //   name: "Psychological Assessment",
  //   description:
  //     "Comprehensive psychometric testing for ADHD, learning disabilities, autism, and cognitive function",
  //   duration_minutes: 120,
  //   price_type: "starting_at" as const,
  //   price_min: 400,
  //   price_max: null,
  // },

  // /* ── Women's Health ── */
  // {
  //   category: "Women's Health",
  //   icon: "heart",
  //   color: "#e11d75",
  //   name: "Annual GYN Exam",
  //   description:
  //     "Pelvic exam, Pap smear, breast exam, STI screening, and women's preventive health assessment",
  //   duration_minutes: 30,
  //   price_type: "fixed" as const,
  //   price_min: 175,
  //   price_max: null,
  // },
  // {
  //   category: "Women's Health",
  //   icon: "heart",
  //   color: "#e11d75",
  //   name: "Prenatal Visit",
  //   description:
  //     "Routine obstetric visit for expectant mothers including weight, blood pressure, fetal monitoring",
  //   duration_minutes: 30,
  //   price_type: "fixed" as const,
  //   price_min: 175,
  //   price_max: null,
  // },
  // {
  //   category: "Women's Health",
  //   icon: "heart",
  //   color: "#e11d75",
  //   name: "Family Planning Consultation",
  //   description:
  //     "Contraception counseling, IUD insertion, implant placement, and reproductive health guidance",
  //   duration_minutes: 30,
  //   price_type: "range" as const,
  //   price_min: 100,
  //   price_max: 600,
  // },
  // {
  //   category: "Women's Health",
  //   icon: "heart",
  //   color: "#e11d75",
  //   name: "Mammography Screening",
  //   description:
  //     "Digital mammogram for early detection of breast cancer — annual recommended over 40",
  //   duration_minutes: 30,
  //   price_type: "starting_at" as const,
  //   price_min: 150,
  //   price_max: null,
  // },
  // {
  //   category: "Women's Health",
  //   icon: "heart",
  //   color: "#e11d75",
  //   name: "Menopause Management",
  //   description:
  //     "Hormonal evaluation and treatment planning for perimenopause and menopause symptoms",
  //   duration_minutes: 45,
  //   price_type: "fixed" as const,
  //   price_min: 200,
  //   price_max: null,
  // },
  // {
  //   category: "Women's Health",
  //   icon: "heart",
  //   color: "#e11d75",
  //   name: "Postpartum Visit",
  //   description:
  //     "Post-delivery checkup for physical recovery, lactation support, and mood screening",
  //   duration_minutes: 30,
  //   price_type: "fixed" as const,
  //   price_min: 150,
  //   price_max: null,
  // },

  // /* ── Pediatrics ── */
  // {
  //   category: "Pediatrics",
  //   icon: "baby",
  //   color: "#f59e0b",
  //   name: "Well-Child Visit",
  //   description:
  //     "Developmental milestone assessment, growth monitoring, vaccinations, and parent guidance by age",
  //   duration_minutes: 45,
  //   price_type: "fixed" as const,
  //   price_min: 160,
  //   price_max: null,
  // },
  // {
  //   category: "Pediatrics",
  //   icon: "baby",
  //   color: "#f59e0b",
  //   name: "Sick Child Visit",
  //   description:
  //     "Same-day evaluation for fever, ear infections, coughs, rashes, and acute childhood illnesses",
  //   duration_minutes: 20,
  //   price_type: "fixed" as const,
  //   price_min: 110,
  //   price_max: null,
  // },
  // {
  //   category: "Pediatrics",
  //   icon: "baby",
  //   color: "#f59e0b",
  //   name: "School / Sports Physical",
  //   description:
  //     "Annual clearance physical for school enrollment, sports participation, and camp requirements",
  //   duration_minutes: 30,
  //   price_type: "fixed" as const,
  //   price_min: 90,
  //   price_max: null,
  // },
  // {
  //   category: "Pediatrics",
  //   icon: "baby",
  //   color: "#f59e0b",
  //   name: "Newborn Exam",
  //   description:
  //     "Comprehensive newborn assessment for weight, reflexes, feeding, jaundice, and overall health",
  //   duration_minutes: 30,
  //   price_type: "fixed" as const,
  //   price_min: 150,
  //   price_max: null,
  // },
  // {
  //   category: "Pediatrics",
  //   icon: "baby",
  //   color: "#f59e0b",
  //   name: "Childhood Vaccine Package",
  //   description:
  //     "DTaP, MMR, varicella, polio, hepatitis, and HPV vaccinations per CDC immunization schedule",
  //   duration_minutes: 20,
  //   price_type: "range" as const,
  //   price_min: 30,
  //   price_max: 100,
  // },
  // {
  //   category: "Pediatrics",
  //   icon: "baby",
  //   color: "#f59e0b",
  //   name: "ADHD Evaluation & Management",
  //   description:
  //     "Behavioral assessment, parent/teacher input forms, and medication management for ADHD",
  //   duration_minutes: 60,
  //   price_type: "starting_at" as const,
  //   price_min: 200,
  //   price_max: null,
  // },

  // /* ── Dental ── */
  // {
  //   category: "Dental",
  //   icon: "smile",
  //   color: "#0891b2",
  //   name: "Dental Cleaning & Checkup",
  //   description:
  //     "Professional teeth cleaning, plaque removal, oral exam, and X-rays to prevent decay and disease",
  //   duration_minutes: 60,
  //   price_type: "range" as const,
  //   price_min: 100,
  //   price_max: 200,
  // },
  // {
  //   category: "Dental",
  //   icon: "smile",
  //   color: "#0891b2",
  //   name: "Tooth Filling",
  //   description:
  //     "Composite or amalgam filling to restore cavities and prevent further decay",
  //   duration_minutes: 45,
  //   price_type: "range" as const,
  //   price_min: 150,
  //   price_max: 350,
  // },
  // {
  //   category: "Dental",
  //   icon: "smile",
  //   color: "#0891b2",
  //   name: "Root Canal Treatment",
  //   description:
  //     "Endodontic treatment to remove infected pulp, relieve pain, and save the natural tooth",
  //   duration_minutes: 90,
  //   price_type: "range" as const,
  //   price_min: 700,
  //   price_max: 1500,
  // },
  // {
  //   category: "Dental",
  //   icon: "smile",
  //   color: "#0891b2",
  //   name: "Tooth Extraction",
  //   description:
  //     "Simple or surgical extraction of damaged, impacted, or wisdom teeth under local anesthesia",
  //   duration_minutes: 45,
  //   price_type: "range" as const,
  //   price_min: 150,
  //   price_max: 600,
  // },
  // {
  //   category: "Dental",
  //   icon: "smile",
  //   color: "#0891b2",
  //   name: "Teeth Whitening",
  //   description:
  //     "Professional in-office bleaching treatment for noticeably whiter teeth in one visit",
  //   duration_minutes: 60,
  //   price_type: "range" as const,
  //   price_min: 300,
  //   price_max: 600,
  // },
  // {
  //   category: "Dental",
  //   icon: "smile",
  //   color: "#0891b2",
  //   name: "Orthodontic Consultation",
  //   description:
  //     "Initial evaluation for braces, clear aligners (Invisalign), and other orthodontic treatment options",
  //   duration_minutes: 45,
  //   price_type: "fixed" as const,
  //   price_min: 150,
  //   price_max: null,
  // },
  // {
  //   category: "Dental",
  //   icon: "smile",
  //   color: "#0891b2",
  //   name: "Dental Emergency Visit",
  //   description:
  //     "Urgent same-day care for severe toothache, knocked-out tooth, broken crown, or dental abscess",
  //   duration_minutes: 45,
  //   price_type: "starting_at" as const,
  //   price_min: 200,
  //   price_max: null,
  // },

  // /* ── Dermatology ── */
  // {
  //   category: "Dermatology",
  //   icon: "shield",
  //   color: "#ea580c",
  //   name: "Skin Examination",
  //   description:
  //     "Full-body mole and lesion check for early detection of melanoma and other skin cancers",
  //   duration_minutes: 30,
  //   price_type: "fixed" as const,
  //   price_min: 180,
  //   price_max: null,
  // },
  // {
  //   category: "Dermatology",
  //   icon: "shield",
  //   color: "#ea580c",
  //   name: "Acne Treatment Consultation",
  //   description:
  //     "Evaluation and personalized treatment plan for acne — topical, oral, or procedural options",
  //   duration_minutes: 30,
  //   price_type: "fixed" as const,
  //   price_min: 160,
  //   price_max: null,
  // },
  // {
  //   category: "Dermatology",
  //   icon: "shield",
  //   color: "#ea580c",
  //   name: "Skin Biopsy",
  //   description:
  //     "Minor procedure to remove and analyze suspicious skin lesions, moles, or growths",
  //   duration_minutes: 30,
  //   price_type: "starting_at" as const,
  //   price_min: 200,
  //   price_max: null,
  // },
  // {
  //   category: "Dermatology",
  //   icon: "shield",
  //   color: "#ea580c",
  //   name: "Botox / Cosmetic Injection",
  //   description:
  //     "Injectable neurotoxin treatment to reduce wrinkles and fine lines — lasts 3–6 months",
  //   duration_minutes: 30,
  //   price_type: "starting_at" as const,
  //   price_min: 300,
  //   price_max: null,
  // },
  // {
  //   category: "Dermatology",
  //   icon: "shield",
  //   color: "#ea580c",
  //   name: "Eczema / Psoriasis Management",
  //   description:
  //     "Diagnosis and treatment plan for chronic skin conditions including topical and biologic therapies",
  //   duration_minutes: 30,
  //   price_type: "fixed" as const,
  //   price_min: 180,
  //   price_max: null,
  // },

  // /* ── Orthopedics & Physical Therapy ── */
  // {
  //   category: "Orthopedics & PT",
  //   icon: "activity",
  //   color: "#0284c7",
  //   name: "Orthopedic Consultation",
  //   description:
  //     "Specialist evaluation for joint pain, sports injuries, bone conditions, and musculoskeletal issues",
  //   duration_minutes: 45,
  //   price_type: "range" as const,
  //   price_min: 200,
  //   price_max: 400,
  // },
  // {
  //   category: "Orthopedics & PT",
  //   icon: "activity",
  //   color: "#0284c7",
  //   name: "Physical Therapy Session",
  //   description:
  //     "One-on-one therapeutic exercise and manual therapy for injury recovery, pain, and mobility",
  //   duration_minutes: 60,
  //   price_type: "range" as const,
  //   price_min: 100,
  //   price_max: 200,
  // },
  // {
  //   category: "Orthopedics & PT",
  //   icon: "activity",
  //   color: "#0284c7",
  //   name: "Physical Therapy Evaluation",
  //   description:
  //     "Initial assessment of movement, strength, and function to create a personalized PT treatment plan",
  //   duration_minutes: 60,
  //   price_type: "fixed" as const,
  //   price_min: 175,
  //   price_max: null,
  // },
  // {
  //   category: "Orthopedics & PT",
  //   icon: "activity",
  //   color: "#0284c7",
  //   name: "Joint Injection",
  //   description:
  //     "Corticosteroid, hyaluronic acid, or PRP injection into joints for pain relief and reduced inflammation",
  //   duration_minutes: 20,
  //   price_type: "starting_at" as const,
  //   price_min: 250,
  //   price_max: null,
  // },
  // {
  //   category: "Orthopedics & PT",
  //   icon: "activity",
  //   color: "#0284c7",
  //   name: "Sports Medicine Consultation",
  //   description:
  //     "Evaluation and treatment of athletic injuries, return-to-play protocols, and performance optimization",
  //   duration_minutes: 45,
  //   price_type: "fixed" as const,
  //   price_min: 200,
  //   price_max: null,
  // },

  // /* ── Nutrition & Wellness ── */
  // {
  //   category: "Nutrition & Wellness",
  //   icon: "leaf",
  //   color: "#16a34a",
  //   name: "Nutritional Consultation",
  //   description:
  //     "Personalized dietary assessment and meal planning with a registered dietitian",
  //   duration_minutes: 60,
  //   price_type: "fixed" as const,
  //   price_min: 120,
  //   price_max: null,
  // },
  // {
  //   category: "Nutrition & Wellness",
  //   icon: "leaf",
  //   color: "#16a34a",
  //   name: "Weight Management Program",
  //   description:
  //     "Structured weight loss or gain program with medical oversight, labs, and dietary coaching",
  //   duration_minutes: 45,
  //   price_type: "starting_at" as const,
  //   price_min: 150,
  //   price_max: null,
  // },
  // {
  //   category: "Nutrition & Wellness",
  //   icon: "leaf",
  //   color: "#16a34a",
  //   name: "IV Vitamin Therapy",
  //   description:
  //     "Customized intravenous infusion of vitamins, minerals, and antioxidants for energy and wellness",
  //   duration_minutes: 45,
  //   price_type: "range" as const,
  //   price_min: 100,
  //   price_max: 300,
  // },
  // {
  //   category: "Nutrition & Wellness",
  //   icon: "leaf",
  //   color: "#16a34a",
  //   name: "Hormone Replacement Therapy",
  //   description:
  //     "Evaluation and management of hormone deficiencies with bioidentical or synthetic hormone therapy",
  //   duration_minutes: 45,
  //   price_type: "starting_at" as const,
  //   price_min: 200,
  //   price_max: null,
  // },
  // {
  //   category: "Nutrition & Wellness",
  //   icon: "leaf",
  //   color: "#16a34a",
  //   name: "Smoking Cessation Program",
  //   description:
  //     "Medical and behavioral support including nicotine replacement therapy and counseling",
  //   duration_minutes: 30,
  //   price_type: "starting_at" as const,
  //   price_min: 80,
  //   price_max: null,
  // },

  // /* ── Eye Care ── */
  // {
  //   category: "Eye Care",
  //   icon: "eye",
  //   color: "#0e7490",
  //   name: "Comprehensive Eye Exam",
  //   description:
  //     "Full vision and eye health assessment including refraction, pressure testing, and retinal evaluation",
  //   duration_minutes: 45,
  //   price_type: "fixed" as const,
  //   price_min: 120,
  //   price_max: null,
  // },
  // {
  //   category: "Eye Care",
  //   icon: "eye",
  //   color: "#0e7490",
  //   name: "Contact Lens Fitting",
  //   description:
  //     "Evaluation and prescription for soft, rigid, or specialty contact lenses with fitting instructions",
  //   duration_minutes: 30,
  //   price_type: "fixed" as const,
  //   price_min: 80,
  //   price_max: null,
  // },
  // {
  //   category: "Eye Care",
  //   icon: "eye",
  //   color: "#0e7490",
  //   name: "Glaucoma Screening",
  //   description:
  //     "Intraocular pressure testing and optic nerve evaluation for glaucoma detection",
  //   duration_minutes: 30,
  //   price_type: "fixed" as const,
  //   price_min: 100,
  //   price_max: null,
  // },
  // {
  //   category: "Eye Care",
  //   icon: "eye",
  //   color: "#0e7490",
  //   name: "Diabetic Eye Exam",
  //   description:
  //     "Dilated retinal exam to detect and monitor diabetic retinopathy and macular changes",
  //   duration_minutes: 45,
  //   price_type: "fixed" as const,
  //   price_min: 140,
  //   price_max: null,
  // },

  // /* ── Cardiology ── */
  // {
  //   category: "Cardiology",
  //   icon: "heartpulse",
  //   color: "#be123c",
  //   name: "Cardiology Consultation",
  //   description:
  //     "Specialist evaluation for chest pain, palpitations, hypertension, and heart disease risk",
  //   duration_minutes: 45,
  //   price_type: "range" as const,
  //   price_min: 250,
  //   price_max: 450,
  // },
  // {
  //   category: "Cardiology",
  //   icon: "heartpulse",
  //   color: "#be123c",
  //   name: "Stress Test (Exercise ECG)",
  //   description:
  //     "Monitored exercise treadmill test to evaluate heart function under physical stress",
  //   duration_minutes: 60,
  //   price_type: "starting_at" as const,
  //   price_min: 300,
  //   price_max: null,
  // },
  // {
  //   category: "Cardiology",
  //   icon: "heartpulse",
  //   color: "#be123c",
  //   name: "Echocardiogram",
  //   description:
  //     "Ultrasound imaging of the heart to assess valves, chambers, and overall cardiac function",
  //   duration_minutes: 45,
  //   price_type: "starting_at" as const,
  //   price_min: 400,
  //   price_max: null,
  // },
  // {
  //   category: "Cardiology",
  //   icon: "heartpulse",
  //   color: "#be123c",
  //   name: "Holter Monitor Setup",
  //   description:
  //     "24–48 hour continuous ECG recording to detect intermittent arrhythmias and palpitations",
  //   duration_minutes: 20,
  //   price_type: "starting_at" as const,
  //   price_min: 200,
  //   price_max: null,
  // },
];

export const SUGGESTED_AGENTS = [
  {
    name: "Clara – General Receptionist",
    role: "Front Desk Receptionist",
    specialty: "General Practice",
    icon: "stethoscope",
    color: "#0d7377",
    badge: "Most Popular",
    voice: "nova" as const,
    personality: "professional" as const,
    interrupt_sensitivity: "medium" as const,
    bestFor: ["General clinics", "Family medicine", "Multi-specialty"],
    capabilities: [
      "Appointment booking",
      "Insurance verification",
      "Service FAQs",
      "Callback requests",
    ],
    greeting_message:
      "Hello! Thank you for calling. I'm Clara, your AI medical receptionist. I can help you schedule an appointment, answer questions about our services, or provide any other information you need. How can I assist you today?",
    system_prompt: `You are Clara, a professional AI medical receptionist. Your primary goals are to help patients schedule appointments, answer questions about healthcare services, and capture patient information.

BOOKING FLOW:
1. Ask what type of visit or concern they have
2. Collect patient name and date of birth
3. Check available slots and confirm date/time
4. Collect phone number and email
5. Ask for insurance provider if applicable
6. Confirm all details before finalizing

Always be empathetic, concise, and professional. Never make up medical information — use the tools to fetch accurate data. If you can't help, offer a callback.`,
  },
  {
    name: "Grace – Care Coordinator",
    role: "Patient Care Coordinator",
    specialty: "Chronic Care & Wellness",
    icon: "heart",
    color: "#e11d75",
    badge: "Patient Favorite",
    voice: "shimmer" as const,
    personality: "friendly" as const,
    interrupt_sensitivity: "high" as const,
    bestFor: ["Wellness clinics", "Chronic disease management", "Primary care"],
    capabilities: [
      "Warm patient support",
      "Follow-up scheduling",
      "Wellness check-ins",
      "Care plan guidance",
    ],
    greeting_message:
      "Hi there! Thanks for calling! I'm Grace, your care coordinator. I'm here to make scheduling as easy as possible for you. Whether you need to book a visit or have questions about our services, I've got you covered! What can I help you with today?",
    system_prompt: `You are Grace, a warm and caring AI care coordinator for a healthcare practice. You make patients feel at ease and supported.

STYLE: Conversational, empathetic, and reassuring. Use phrases like "Of course!", "I completely understand.", "Let me help you with that right away.".

GOALS:
- Schedule appointments quickly and efficiently
- Answer service and pricing questions clearly
- Collect patient and insurance details
- Guide patients through follow-up care and wellness programs
- Offer callbacks when needed

Keep responses caring and clear. Always confirm appointment details with warmth.`,
  },
  {
    name: "Dr. Morgan – Premium Consultant",
    role: "Patient Services Consultant",
    specialty: "Specialist & Premium Care",
    icon: "clipboard",
    color: "#7c3aed",
    badge: "High-End Practices",
    voice: "onyx" as const,
    personality: "formal" as const,
    interrupt_sensitivity: "low" as const,
    bestFor: ["Specialist clinics", "Concierge medicine", "Private practices"],
    capabilities: [
      "Detailed service consultations",
      "Specialist referrals",
      "Insurance pre-auth",
      "Premium patient experience",
    ],
    greeting_message:
      "Good day. Thank you for contacting our practice. I am Morgan, your dedicated patient services consultant. I am here to assist you with scheduling, service inquiries, and any information regarding your healthcare needs. How may I be of service?",
    system_prompt: `You are Morgan, a formal and highly professional AI patient services consultant for a premium healthcare practice.

COMMUNICATION STYLE: Precise, respectful, and thorough. Use complete sentences. Address patients formally. Never use contractions.

PROCESS:
- Gather complete patient information before proceeding
- Provide detailed service descriptions and accurate information
- Confirm all appointment details thoroughly
- Always offer a summary of the booking before finalizing

Maintain the highest standard of professionalism and patient care at all times.`,
  },
  {
    name: "Luna – Mental Health Specialist",
    role: "Mental Health Intake Coordinator",
    specialty: "Mental Health & Therapy",
    icon: "brain",
    color: "#6366f1",
    badge: "Sensitive & Calm",
    voice: "shimmer" as const,
    personality: "friendly" as const,
    interrupt_sensitivity: "high" as const,
    bestFor: ["Therapy practices", "Psychiatry clinics", "Counseling centers"],
    capabilities: [
      "Compassionate intake",
      "Crisis awareness",
      "Therapy scheduling",
      "Insurance verification",
    ],
    greeting_message:
      "Hello, and thank you for reaching out. I'm Luna, here to support you in getting connected with the right care. I'm here to listen and help you schedule an appointment with one of our providers. There's no pressure — just let me know how I can help you today.",
    system_prompt: `You are Luna, a compassionate and trauma-informed AI intake coordinator for a mental health practice.

TONE: Calm, non-judgmental, patient, and supportive. Never rush the caller. Normalize seeking help.

PRIORITIES:
1. Make the caller feel safe and heard first
2. If they express crisis/emergency, immediately provide crisis hotline (988) and offer to connect with staff
3. Gently gather intake information: name, reason for seeking help, insurance, preferred provider gender if any
4. Schedule initial consultation or therapy intake

IMPORTANT: Never minimize mental health concerns. Do not provide clinical advice. Always escalate any mention of self-harm, suicidal ideation, or danger to a live staff member or crisis line immediately.

Keep a slow, warm pace. Silence is okay — give the caller time to respond.`,
  },
  {
    name: "Aria – Pediatric Specialist",
    role: "Pediatric Intake Coordinator",
    specialty: "Pediatrics & Child Health",
    icon: "baby",
    color: "#f59e0b",
    badge: "Family-Friendly",
    voice: "nova" as const,
    personality: "friendly" as const,
    interrupt_sensitivity: "high" as const,
    bestFor: ["Pediatric clinics", "Children's hospitals", "Family practices"],
    capabilities: [
      "Well-child visit booking",
      "Vaccination scheduling",
      "Parent FAQ handling",
      "School physicals",
    ],
    greeting_message:
      "Hi! Thank you for calling. I'm Aria, your pediatric scheduling assistant. Whether you're booking a well-child visit, a vaccination, or a sick visit for your little one, I'm here to help! What can I do for you today?",
    system_prompt: `You are Aria, a cheerful and family-friendly AI scheduling assistant for a pediatric practice.

AUDIENCE: You speak primarily with parents and guardians scheduling care for their children.

TONE: Warm, upbeat, and reassuring for concerned parents. Keep it simple and clear.

KEY TASKS:
- Schedule well-child visits, sick visits, vaccinations, physicals
- Collect child's name, date of birth, parent/guardian name, insurance
- Answer common pediatric FAQs (vaccines schedule, developmental milestones, school requirements)
- Triage urgency: if parent describes serious symptoms, advise them to go to ER or call 911

Always reference the child by name after collecting it. Be especially reassuring when a parent sounds worried.`,
  },
  {
    name: "Victor – Urgent Care Triage",
    role: "Urgent Care Triage Agent",
    specialty: "Urgent & Emergency Care",
    icon: "zap",
    color: "#dc2626",
    badge: "Fast & Decisive",
    voice: "echo" as const,
    personality: "professional" as const,
    interrupt_sensitivity: "high" as const,
    bestFor: ["Urgent care centers", "Walk-in clinics", "ER overflow triage"],
    capabilities: [
      "Symptom triage",
      "Wait time info",
      "Walk-in vs appointment guidance",
      "Emergency escalation",
    ],
    greeting_message:
      "Thank you for calling Urgent Care. I'm Victor, your triage assistant. I'll help determine the fastest way to get you seen. Can you briefly describe your symptoms or reason for calling?",
    system_prompt: `You are Victor, an efficient AI triage agent for an urgent care clinic.

PRIORITY: Speed and accuracy. Patients calling urgent care often have acute needs.

TRIAGE FLOW:
1. Quickly gather chief complaint / symptoms
2. Assess urgency level:
   - EMERGENCY (chest pain, difficulty breathing, stroke symptoms, severe bleeding): Direct to 911 immediately
   - HIGH (fever >103°F, fractures, severe pain, pediatric distress): Offer immediate walk-in slot
   - MODERATE (minor injuries, infections, rashes, mild fever): Standard same-day booking
   - LOW (prescription refills, test results, follow-ups): Schedule regular appointment

3. For non-emergency: collect name, DOB, insurance, and confirm slot
4. Provide estimated wait times if available

Be direct, clear, and efficient. Do not over-reassure. Speed matters.

CRITICAL: Any life-threatening symptom description → immediately say "Please call 911 or go to the nearest Emergency Room now." Do not proceed with booking.`,
  },
  {
    name: "Sage – Dental Receptionist",
    role: "Dental Office Receptionist",
    specialty: "Dental & Oral Health",
    icon: "smile",
    color: "#0891b2",
    badge: "Dental Practices",
    voice: "alloy" as const,
    personality: "friendly" as const,
    interrupt_sensitivity: "medium" as const,
    bestFor: ["Dental clinics", "Orthodontists", "Oral surgery practices"],
    capabilities: [
      "Cleaning & checkup booking",
      "Dental emergency triage",
      "Insurance & payment plans",
      "Procedure information",
    ],
    greeting_message:
      "Hello! Thank you for calling. I'm Sage, your dental scheduling assistant. Whether you need a routine cleaning, have a dental concern, or want to learn about our procedures, I'm here to help. What brings you in today?",
    system_prompt: `You are Sage, a professional AI receptionist for a dental practice.

SERVICES YOU SCHEDULE: Routine cleanings, X-rays, fillings, crowns, root canals, extractions, implants, orthodontic consultations, teeth whitening, and emergency dental visits.

DENTAL EMERGENCY TRIAGE:
- Severe toothache / abscess: Same-day emergency slot
- Knocked-out tooth: Advise to keep tooth moist, come in immediately
- Broken tooth: Same-day if in pain
- Routine: Standard scheduling

BOOKING PROCESS:
1. Determine type of visit needed
2. Check if new or existing patient
3. Collect name, DOB, insurance
4. Confirm preferred date/time
5. Remind patient to arrive 15 min early for new patient paperwork

Always mention our payment plan options if the patient seems cost-concerned.`,
  },
  {
    name: "Nova – Telehealth Coordinator",
    role: "Virtual Care Coordinator",
    specialty: "Telehealth & Remote Care",
    icon: "monitor",
    color: "#059669",
    badge: "Digital-First",
    voice: "fable" as const,
    personality: "casual" as const,
    interrupt_sensitivity: "medium" as const,
    bestFor: [
      "Telehealth platforms",
      "Remote-first practices",
      "Digital health clinics",
    ],
    capabilities: [
      "Virtual visit scheduling",
      "Platform setup guidance",
      "Prescription refill requests",
      "Follow-up coordination",
    ],
    greeting_message:
      "Hey there! Thanks for calling. I'm Nova, your virtual care coordinator. I can help you set up a telehealth visit, manage prescriptions, or connect you with the right provider online. What do you need today?",
    system_prompt: `You are Nova, a tech-savvy and approachable AI coordinator for a telehealth-first healthcare practice.

TONE: Conversational and modern. Use clear, jargon-free language. Make technology feel easy.

SERVICES:
- Schedule video or phone consultations
- Help patients with telehealth platform access (send link, verify tech setup)
- Process prescription refill requests (collect info, forward to provider)
- Coordinate lab order requests and result discussions
- Follow-up visit scheduling

TECH SUPPORT BASICS:
- If patient has trouble with video: "Try refreshing the browser, or we can switch to a phone call."
- Collect email for telehealth link delivery

BOOKING FLOW:
1. Determine visit type (new concern, follow-up, prescription, lab results)
2. Verify insurance covers telehealth
3. Collect name, DOB, email, phone
4. Book slot and confirm link delivery method

Be upbeat and make virtual care feel as personal as in-office care.`,
  },
];

export const SUGGESTED_FAQS = [
  /* ── Appointments & Scheduling ── */
  {
    category: "Appointments",
    question: "How do I schedule an appointment?",
    answer:
      "You can schedule an appointment by calling our office, using our online booking portal, or speaking with our AI receptionist at any time. We offer same-day and next-day availability for most visit types.",
  },
  {
    category: "Appointments",
    question: "What is your cancellation policy?",
    answer:
      "We ask that you cancel or reschedule at least 24 hours before your appointment. Late cancellations or no-shows may be subject to a fee. You can cancel by calling us, using the patient portal, or replying to your appointment reminder.",
  },
  {
    category: "Appointments",
    question: "How early should I arrive for my appointment?",
    answer:
      "New patients should arrive 15–20 minutes early to complete intake paperwork. Returning patients should arrive 5–10 minutes before their scheduled time.",
  },
  {
    category: "Appointments",
    question: "Do you offer same-day appointments?",
    answer:
      "Yes, we reserve a number of same-day slots for urgent or acute care needs. Call us in the morning when our schedule opens, and we will do our best to accommodate you.",
  },
  {
    category: "Appointments",
    question: "Can I book an appointment online?",
    answer:
      "Yes, you can book appointments through our online patient portal 24/7. Simply visit our website, log in or create an account, and select an available time slot that works for you.",
  },
  {
    category: "Appointments",
    question: "How do I reschedule my appointment?",
    answer:
      "You can reschedule by calling our office during business hours, logging into the patient portal, or responding to your appointment reminder message. We ask for at least 24 hours notice when possible.",
  },
  {
    category: "Appointments",
    question: "Do you have appointments on weekends?",
    answer:
      "We offer limited weekend availability for urgent care and select services. Please call us or check our online scheduler to see available weekend slots.",
  },

  /* ── Insurance & Billing ── */
  {
    category: "Insurance & Billing",
    question: "What insurance plans do you accept?",
    answer:
      "We accept most major insurance plans including Medicare, Medicaid, Blue Cross Blue Shield, Aetna, UnitedHealthcare, Cigna, Humana, and many others. Please call our billing team to confirm your specific plan is in-network before your visit.",
  },
  {
    category: "Insurance & Billing",
    question: "What if I don't have insurance?",
    answer:
      "We welcome uninsured patients. We offer self-pay rates and transparent pricing for all services. We also work with patients on payment plans to make care affordable. Please ask about our self-pay discounts when scheduling.",
  },
  {
    category: "Insurance & Billing",
    question: "What is a copay and will I need to pay it at my visit?",
    answer:
      "A copay is a fixed amount you pay at the time of your visit as required by your insurance plan. Copay amounts vary by plan and visit type. We collect copays at check-in, so please bring your insurance card and a form of payment.",
  },
  {
    category: "Insurance & Billing",
    question: "How do I get an itemized bill?",
    answer:
      "You can request an itemized bill by contacting our billing department by phone or through the patient portal. We are happy to provide a detailed breakdown of all charges from your visit.",
  },
  {
    category: "Insurance & Billing",
    question: "Do you offer payment plans?",
    answer:
      "Yes, we offer flexible payment plans for patients with outstanding balances. Please contact our billing department to discuss your options and set up an arrangement that works for your budget.",
  },
  {
    category: "Insurance & Billing",
    question: "Why did I receive a bill after my insurance paid?",
    answer:
      "Any amount your insurance did not cover — such as your deductible, coinsurance, or non-covered services — becomes your patient responsibility. If you believe there is an error, please contact our billing team and we will review your claim.",
  },
  {
    category: "Insurance & Billing",
    question: "How do I update my insurance information?",
    answer:
      "Please bring your updated insurance card to your next visit or call our office to provide the new information. Keeping your insurance details current helps us file claims accurately and avoid billing delays.",
  },

  /* ── Office Hours & Location ── */
  {
    category: "Hours & Location",
    question: "What are your office hours?",
    answer:
      "Our office is open Monday through Friday from 8:00 AM to 5:00 PM. We offer extended hours on Tuesdays until 7:00 PM for working patients. Please call ahead or check our website for any holiday schedule changes.",
  },
  {
    category: "Hours & Location",
    question: "Where are you located and is there parking?",
    answer:
      "We are conveniently located in the heart of the city. Free parking is available in our dedicated lot. We are also accessible by public transit — please visit our website for full address and directions.",
  },
  {
    category: "Hours & Location",
    question: "Do you have an after-hours line?",
    answer:
      "Yes, for urgent medical concerns outside of office hours, please call our main number and you will be connected to our on-call provider. For life-threatening emergencies, always call 911 or go to the nearest emergency room.",
  },
  {
    category: "Hours & Location",
    question: "Are you open on holidays?",
    answer:
      "We are closed on major federal holidays including New Year's Day, Memorial Day, Independence Day, Labor Day, Thanksgiving, and Christmas. We post holiday hours on our website and send reminders to patients with upcoming appointments.",
  },

  /* ── New Patients ── */
  {
    category: "New Patients",
    question: "Are you accepting new patients?",
    answer:
      "Yes, we are currently welcoming new patients! We look forward to being your healthcare partner. You can schedule your first appointment online or by calling our office. New patient appointments are typically 45–60 minutes.",
  },
  {
    category: "New Patients",
    question: "What should I bring to my first appointment?",
    answer:
      "Please bring a valid photo ID, your insurance card, a list of your current medications and dosages, any relevant medical records or test results, and a form of payment for your copay or self-pay balance.",
  },
  {
    category: "New Patients",
    question: "Do I need to fill out paperwork before my visit?",
    answer:
      "New patients are asked to complete intake forms before their first visit. You can fill these out through our patient portal at home, or arrive 15–20 minutes early to complete them in the office.",
  },
  {
    category: "New Patients",
    question: "Can I transfer my medical records from another provider?",
    answer:
      "Yes, we can request your records from a previous provider with your written authorization. Please sign a release form at your visit or through the patient portal, and we will coordinate the transfer on your behalf.",
  },
  {
    category: "New Patients",
    question: "What is the patient portal and how do I sign up?",
    answer:
      "Our patient portal is a secure online platform where you can view test results, request appointments, send messages to your care team, and access your medical history. You will receive an invitation email after your first visit to create an account.",
  },

  /* ── Prescriptions & Medications ── */
  {
    category: "Prescriptions",
    question: "How do I request a prescription refill?",
    answer:
      "You can request a refill through the patient portal, by calling our office during business hours, or by asking your pharmacy to send an electronic refill request. Please allow 48–72 business hours for processing.",
  },
  {
    category: "Prescriptions",
    question: "Can I get a prescription without an appointment?",
    answer:
      "For most medications, a current patient-provider relationship and recent visit are required to issue a prescription. Some prescription renewals may be handled without a full visit — please call our office to discuss your specific situation.",
  },
  {
    category: "Prescriptions",
    question: "Do you prescribe controlled substances?",
    answer:
      "Our providers prescribe controlled substances only when clinically appropriate and in compliance with state and federal regulations. These prescriptions require an in-person evaluation and cannot be called in by phone or refilled via the portal.",
  },
  {
    category: "Prescriptions",
    question: "What should I do if I run out of medication?",
    answer:
      "Contact our office as soon as possible before you run out. Do not abruptly stop certain medications (like blood pressure or antidepressant drugs) without guidance. If it is after hours and urgent, use our on-call line.",
  },

  /* ── Test Results & Records ── */
  {
    category: "Test Results",
    question: "How will I receive my test results?",
    answer:
      "Lab results and imaging reports are typically available within 3–7 business days and will be posted to your patient portal. Your provider will also reach out if any results require immediate attention or discussion.",
  },
  {
    category: "Test Results",
    question: "How long does it take to get lab results back?",
    answer:
      "Routine lab results are generally available within 2–5 business days. Some specialized tests may take 7–14 days. Rapid in-office tests (such as strep or flu) provide results within 15–20 minutes.",
  },
  {
    category: "Test Results",
    question: "Can I access my medical records?",
    answer:
      "Yes, you have the right to access your medical records. You can view most records through the patient portal. To request a full copy or release records to another provider, complete an authorization form at the front desk or through the portal.",
  },
  {
    category: "Test Results",
    question: "Who do I contact if I have questions about my results?",
    answer:
      "Please message your care team through the patient portal or call our office. For urgent concerns about results, call us directly and a nurse will review your record and advise you on next steps.",
  },

  /* ── Telehealth ── */
  {
    category: "Telehealth",
    question: "Do you offer telehealth or virtual visits?",
    answer:
      "Yes, we offer secure video and phone appointments for many visit types including follow-ups, medication management, mental health, and minor illnesses. Virtual visits are available Monday through Friday and can be scheduled online.",
  },
  {
    category: "Telehealth",
    question: "What do I need for a telehealth appointment?",
    answer:
      "You need a smartphone, tablet, or computer with a camera and microphone, a stable internet connection, and a private, quiet location. We will send you a secure video link before your appointment time.",
  },
  {
    category: "Telehealth",
    question: "Is telehealth covered by my insurance?",
    answer:
      "Most major insurance plans now cover telehealth visits, especially since 2020. We recommend calling your insurer to confirm coverage and any applicable copays before your virtual appointment.",
  },
  {
    category: "Telehealth",
    question: "What conditions can be treated via telehealth?",
    answer:
      "Telehealth is suitable for many conditions including colds, sinus infections, UTIs, rashes, anxiety, depression, medication refills, and follow-up care. Conditions requiring a physical exam or lab work will need an in-person visit.",
  },

  /* ── Referrals & Specialists ── */
  {
    category: "Referrals",
    question: "Do I need a referral to see a specialist?",
    answer:
      "Whether you need a referral depends on your insurance plan. HMO plans typically require a referral from your primary care provider. PPO plans usually allow you to self-refer. Check your insurance card or call your insurer to confirm.",
  },
  {
    category: "Referrals",
    question: "How do I get a referral?",
    answer:
      "Ask your provider at your next visit, or contact our office by phone or portal message. Provide the specialist's name and the reason for referral. We will coordinate with your insurance and send the referral within 2–3 business days.",
  },
  {
    category: "Referrals",
    question: "How long does it take to get a referral approved?",
    answer:
      "Most referrals are processed within 2–5 business days. Urgent referrals can often be expedited. We will notify you once the referral has been sent and provide the specialist's contact information.",
  },

  /* ── Children & Pediatrics ── */
  {
    category: "Pediatrics",
    question: "Do you see children and infants?",
    answer:
      "Yes, we provide care for patients of all ages including newborns, infants, children, and adolescents. Our team is experienced in pediatric care, well-child visits, and childhood vaccinations.",
  },
  {
    category: "Pediatrics",
    question: "What vaccinations does my child need?",
    answer:
      "We follow the CDC childhood immunization schedule. At well-child visits, we review your child's vaccination history and administer any due vaccines. A complete vaccine schedule is available on the CDC website and through our patient portal.",
  },
  {
    category: "Pediatrics",
    question: "When should my baby have their first check-up?",
    answer:
      "Newborns should have their first well-baby visit within 3–5 days of leaving the hospital. Subsequent visits are recommended at 1, 2, 4, 6, 9, 12, 15, 18, and 24 months, then annually through childhood.",
  },
  {
    category: "Pediatrics",
    question: "Can both my children be seen on the same day?",
    answer:
      "Yes, we can often schedule siblings at the same time. Please mention this when booking so we can allocate the appropriate time and exam room for both children.",
  },

  /* ── Mental Health ── */
  {
    category: "Mental Health",
    question: "Do you offer mental health services?",
    answer:
      "Yes, we provide mental health evaluations, therapy, and psychiatric medication management. We treat anxiety, depression, ADHD, PTSD, and other conditions. Telehealth therapy options are also available for added privacy and convenience.",
  },
  {
    category: "Mental Health",
    question: "Is my mental health information kept confidential?",
    answer:
      "Absolutely. Mental health records are protected by HIPAA and additional privacy laws in most states. Your information will not be shared without your written consent, except in situations involving imminent risk of harm to yourself or others.",
  },
  {
    category: "Mental Health",
    question: "What should I do if I am in a mental health crisis?",
    answer:
      "If you are in immediate danger, call 911. For mental health crises, call or text 988 to reach the Suicide & Crisis Lifeline (available 24/7). You can also go to your nearest emergency room or call our after-hours line for guidance.",
  },
  {
    category: "Mental Health",
    question: "How long is a therapy session?",
    answer:
      "Individual therapy sessions are typically 45–50 minutes. Initial psychiatric evaluations are 60–90 minutes. Session frequency is determined collaboratively with your provider based on your treatment goals and needs.",
  },

  /* ── Urgent & Emergency ── */
  {
    category: "Urgent Care",
    question: "What conditions do you treat in urgent care?",
    answer:
      "We treat a wide range of non-life-threatening conditions including fevers, infections, minor cuts and wounds, sprains, rashes, UTIs, ear and sinus infections, and minor fractures. For chest pain, difficulty breathing, or stroke symptoms, please call 911.",
  },
  {
    category: "Urgent Care",
    question: "Do I need an appointment for urgent care?",
    answer:
      "No appointment is needed for urgent care — walk-ins are welcome. You can also check in online to join our virtual queue before arriving, which can reduce your wait time significantly.",
  },
  {
    category: "Urgent Care",
    question: "When should I go to the ER instead of urgent care?",
    answer:
      "Go to the emergency room for life-threatening situations: chest pain, difficulty breathing, signs of stroke (face drooping, arm weakness, speech difficulty), severe allergic reactions, heavy bleeding, or loss of consciousness. For everything else, urgent care can usually help faster and at lower cost.",
  },
  {
    category: "Urgent Care",
    question: "How long is the wait at urgent care?",
    answer:
      "Wait times vary by day and time. Early mornings and weekday afternoons are typically less busy. You can check current wait times on our website or app, and check in online to hold your place in line before you arrive.",
  },

  /* ── Privacy & HIPAA ── */
  {
    category: "Privacy & HIPAA",
    question: "How is my personal health information protected?",
    answer:
      "We are fully HIPAA compliant and take your privacy seriously. Your health records are stored securely and accessed only by authorized members of your care team. We use encrypted systems for electronic communication and data storage.",
  },
  {
    category: "Privacy & HIPAA",
    question: "Who can access my medical records?",
    answer:
      "Your medical records can only be accessed by members of your direct care team, and by others only with your written authorization. You may also authorize a family member or caregiver to access your records through the patient portal.",
  },
  {
    category: "Privacy & HIPAA",
    question: "Can I request that my information not be shared?",
    answer:
      "Yes, you have the right to request restrictions on how your information is used or shared. Please speak with our privacy officer or submit a written request. We will honor all reasonable requests in accordance with HIPAA regulations.",
  },
];

export const ANALYTICS_EVENT_TYPES = {
  CONVERSATION_STARTED: "conversation_started",
  CONVERSATION_ENDED: "conversation_ended",
  APPOINTMENT_BOOKED: "appointment_booked",
  CALLBACK_REQUESTED: "callback_requested",
  SERVICE_INQUIRY: "service_inquiry",
  WIDGET_IMPRESSION: "widget_impression",
  WIDGET_OPENED: "widget_opened",
} as const;
