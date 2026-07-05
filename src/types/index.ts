export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  website: string | null;
  logo_url: string | null;
  timezone: string;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  business_id: string;
  name: string;
  voice: AgentVoice;
  language: string;
  personality: AgentPersonality;
  greeting_message: string | null;
  system_prompt: string | null;
  is_active: boolean;
  max_call_duration: number;
  interrupt_sensitivity: InterruptSensitivity;
  created_at: string;
  updated_at: string;
  service_ids?: string[];
}

export interface AgentService {
  agent_id: string;
  service_id: string;
}

export type AgentVoice =
  | "alloy"
  | "echo"
  | "fable"
  | "onyx"
  | "nova"
  | "shimmer";
export type AgentPersonality =
  | "professional"
  | "friendly"
  | "formal"
  | "casual";
export type InterruptSensitivity = "low" | "medium" | "high";

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_min: number | null;
  price_max: number | null;
  price_type: PriceType;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type PriceType = "fixed" | "range" | "starting_at" | "call_for_price";

export interface BusinessHours {
  id: string;
  business_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_open: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  business_id: string;
  service_id: string | null;
  conversation_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  date_of_birth: string | null;
  insurance_provider: string | null;
  insurance_member_id: string | null;
  notes: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  payment_tx_hash: string | null;
  payment_amount: number | null;
  payment_method: "usdc" | "cash" | "partial" | null;
  amount_paid: number | null;
  amount_remaining: number | null;
  email_sent_at: string | null;
  customer_email_verified: boolean;
  created_at: string;
  updated_at: string;
  service?: Service;
}

export type PaymentStatus = "unpaid" | "partial" | "paid" | "cash" | "refunded";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Conversation {
  id: string;
  business_id: string;
  agent_id: string | null;
  caller_name: string | null;
  caller_phone: string | null;
  caller_email: string | null;
  status: ConversationStatus;
  duration_seconds: number | null;
  appointment_booked: boolean;
  callback_requested: boolean;
  sentiment: ConversationSentiment | null;
  summary: string | null;
  source: ConversationSource;
  created_at: string;
  updated_at: string;
  messages?: ConversationMessage[];
}

export type ConversationStatus = "active" | "completed" | "abandoned";
export type ConversationSentiment = "positive" | "neutral" | "negative";
export type ConversationSource = "widget" | "embed" | "direct";

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  tool_name: string | null;
  tool_result: Record<string, unknown> | null;
  created_at: string;
}

export type MessageRole = "user" | "assistant" | "system" | "tool";

export interface FAQ {
  id: string;
  business_id: string;
  question: string;
  answer: string;
  category: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | "new_appointment"
  | "appointment_cancelled"
  | "new_conversation"
  | "new_lead"
  | "agent_error"
  | "system"
  | "callback_requested"
  | "missed_call";

export interface Notification {
  id: string;
  business_id: string;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Lead {
  id: string;
  business_id: string;
  conversation_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  insurance_provider: string | null;
  insurance_member_id: string | null;
  service_interest: string | null;
  notes: string | null;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "lost";

export interface EmbeddedWidget {
  id: string;
  business_id: string;
  agent_id: string | null;
  name: string;
  position: WidgetPosition;
  primary_color: string;
  greeting: string | null;
  theme: WidgetTheme;
  is_active: boolean;
  allowed_domains: string[] | null;
  total_impressions: number;
  total_interactions: number;
  created_at: string;
  updated_at: string;
}

export type WidgetPosition = "bottom-right" | "bottom-left";
export type WidgetTheme = "dark" | "light";

export interface PaymentConfig {
  id: string;
  business_id: string;
  stripe_publishable_key: string;
  stripe_secret_key: string;
  // network_name: string;
  // chain_id: number;
  // rpc_url: string;
  // usdc_contract_address: string;
  // receiver_wallet: string;
  // usdc_decimals: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export type SupportTicketStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed";
export type SupportMessageSenderRole = "patient" | "staff";

export interface SupportTicket {
  id: string;
  business_id: string;
  patient_id: string;
  subject: string;
  status: SupportTicketStatus;
  created_at: string;
  updated_at: string;
  latest_message?: SupportMessage;
  message_count?: number;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_role: SupportMessageSenderRole;
  sender_id: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

export interface PendingAppointment {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  date_of_birth?: string;
  insurance_provider?: string;
  insurance_member_id?: string;
  service_id?: string;
  scheduled_at: string;
  notes?: string;
  conversationId: string;
  businessId: string;
  callId?: string;
}

export interface AnalyticsEvent {
  id: string;
  business_id: string;
  conversation_id: string | null;
  event_type: string;
  event_data: Record<string, unknown> | null;
  created_at: string;
}

export interface DashboardAnalytics {
  total_conversations: number;
  appointments_booked: number;
  conversion_rate: number;
  avg_call_duration: number;
  callback_requests: number;
  conversations_today: number;
  conversations_this_week: number;
  conversations_this_month: number;
  appointments_today: number;
  appointments_this_week: number;
}

export interface AvailableSlot {
  date: string;
  time: string;
  datetime: string;
}

export interface RealtimeSessionResponse {
  conversationId: string;
  agentName: string;
  voice: string;
  model: string;
  systemPrompt: string;
  tools: unknown[];
  turnDetection: {
    type: string;
    threshold: number;
    prefix_padding_ms: number;
    silence_duration_ms: number;
  };
}

export interface VoiceConnectionState {
  status:
    | "idle"
    | "connecting"
    | "connected"
    | "speaking"
    | "listening"
    | "error";
  error?: string;
}

export interface TranscriptEntry {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// ── Website Builder ────────────────────────────────────────────────────────────

export type WebsiteTemplate = "clarity" | "pulse" | "serenity";
export type WebsiteFontStyle = "inter" | "playfair" | "poppins";

export interface WebsiteHero {
  headline?: string;
  subheadline?: string;
  heroImage?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  yearsExperience?: string;
  patientsServed?: string;
  satisfactionRate?: string;
}

export interface WebsiteAbout {
  headline?: string;
  mission?: string;
  story?: string;
  image?: string;
  badges?: string[];
}

export interface WebsiteService {
  name: string;
  description: string;
  icon?: string;
  duration?: string;
  price?: string;
}

export interface WebsiteTestimonial {
  name: string;
  quote: string;
  rating?: number;
  condition?: string;
}

export interface WebsiteTeamMember {
  name: string;
  role: string;
  bio?: string;
  image?: string;
}

export interface WebsiteInsurance {
  name: string;
}

export interface WebsiteBranding {
  logoUrl?: string;
  siteTitle?: string;
  siteDescription?: string;
}

export interface WebsiteContent {
  branding?: WebsiteBranding;
  hero?: WebsiteHero;
  about?: WebsiteAbout;
  services?: WebsiteService[];
  testimonials?: WebsiteTestimonial[];
  team?: WebsiteTeamMember[];
  insurances?: WebsiteInsurance[];
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    hours?: string;
    mapEmbed?: string;
  };
  faq?: { question: string; answer: string }[];
  footer?: {
    tagline?: string;
    copyright?: string;
  };
}

export interface DoctorWebsite {
  id: string;
  business_id: string;
  agent_id: string | null;
  slug: string;
  template: WebsiteTemplate;
  is_published: boolean;
  subscription_active: boolean;
  subscription_tx_hash: string | null;
  subscription_paid_at: string | null;
  subscription_wallet: string | null;
  primary_color: string;
  secondary_color: string;
  font_style: WebsiteFontStyle;
  content: WebsiteContent;
  created_at: string;
  updated_at: string;
}
