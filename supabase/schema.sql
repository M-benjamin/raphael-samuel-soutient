-- MediCall AI - Healthcare Voice Receptionist - Complete Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- BUSINESSES TABLE
-- =============================================
create table if not exists businesses (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  phone text,
  email text,
  address text,
  city text,
  state text,
  zip text,
  website text,
  logo_url text,
  timezone text not null default 'America/New_York',
  currency text not null default 'USD',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_businesses_owner_id on businesses(owner_id);
create index if not exists idx_businesses_slug on businesses(slug);

-- =============================================
-- AGENTS TABLE
-- =============================================
create table if not exists agents (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  voice text not null default 'alloy',
  language text not null default 'en',
  personality text not null default 'professional',
  greeting_message text,
  system_prompt text,
  is_active boolean not null default true,
  max_call_duration integer not null default 600,
  interrupt_sensitivity text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_agents_business_id on agents(business_id);

-- =============================================
-- SERVICES TABLE
-- =============================================
create table if not exists services (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null default 60,
  price_min numeric(10,2),
  price_max numeric(10,2),
  price_type text not null default 'fixed' check (price_type in ('fixed', 'range', 'starting_at', 'call_for_price')),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists services_variants (
  id uuid primary key default uuid_generate_v4(),
  service_id uuid not null references services(id) on delete cascade,
  name text not null,
  description text,
  number_of_sessions integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);



create index if not exists idx_services_business_id on services(business_id);

-- =============================================
-- AGENT SERVICES junction table (agents + services must exist first)
-- =============================================
create table if not exists agent_services (
  agent_id uuid not null references agents(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  primary key (agent_id, service_id)
);

create index if not exists idx_agent_services_agent_id on agent_services(agent_id);
create index if not exists idx_agent_services_service_id on agent_services(service_id);

-- =============================================
-- BUSINESS HOURS TABLE
-- =============================================
create table if not exists business_hours (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  open_time time,
  close_time time,
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(business_id, day_of_week)
);

create index if not exists idx_business_hours_business_id on business_hours(business_id);

-- =============================================
-- APPOINTMENTS TABLE
-- =============================================
create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  conversation_id uuid,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  date_of_birth text,
  insurance_provider text,
  insurance_member_id text,
  notes text,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'partial', 'paid', 'cash', 'refunded')),
  payment_tx_hash text,
  payment_amount numeric(18,6),
  payment_method text check (payment_method in ('usdc', 'stripe',  'cash', 'partial')),
  amount_paid numeric(18,6) default 0,
  amount_remaining numeric(18,6) default 0,
  email_sent_at timestamptz,
  customer_email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_appointments_business_id on appointments(business_id);
create index if not exists idx_appointments_scheduled_at on appointments(scheduled_at);
create index if not exists idx_appointments_status on appointments(status);
create index if not exists idx_appointments_conversation_id on appointments(conversation_id);
create index if not exists idx_appointments_customer_email on appointments(customer_email);
-- Prevents double-booking the same slot at the same business
create unique index if not exists idx_appointments_no_double_book
  on appointments(business_id, scheduled_at)
  where status in ('pending', 'confirmed');

-- =============================================
-- CONVERSATIONS TABLE
-- =============================================
create table if not exists conversations (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  agent_id uuid references agents(id) on delete set null,
  caller_name text,
  caller_phone text,
  caller_email text,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  duration_seconds integer,
  appointment_booked boolean not null default false,
  callback_requested boolean not null default false,
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  summary text,
  source text not null default 'widget' check (source in ('widget', 'embed', 'direct')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_conversations_business_id on conversations(business_id);
create index if not exists idx_conversations_created_at on conversations(created_at);
create index if not exists idx_conversations_status on conversations(status);
create index if not exists idx_conversations_caller_email on conversations(caller_email);

-- =============================================
-- CONVERSATION MESSAGES TABLE
-- =============================================
create table if not exists conversation_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null,
  tool_name text,
  tool_result jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_conversation_messages_conversation_id on conversation_messages(conversation_id);
create index if not exists idx_conversation_messages_created_at on conversation_messages(created_at);

-- =============================================
-- FAQS TABLE
-- =============================================
create table if not exists faqs (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  question text not null,
  answer text not null,
  category text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_faqs_business_id on faqs(business_id);

-- =============================================
-- LEADS TABLE
-- =============================================
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  name text not null,
  phone text,
  email text,
  date_of_birth text,
  insurance_provider text,
  insurance_member_id text,
  service_interest text,
  notes text,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'lost')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_business_id on leads(business_id);
create index if not exists idx_leads_status on leads(status);
create index if not exists idx_leads_email on leads(email);

-- =============================================
-- EMBEDDED WIDGETS TABLE
-- =============================================
create table if not exists embedded_widgets (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  agent_id uuid references agents(id) on delete set null,
  name text not null default 'Main Widget',
  position text not null default 'bottom-right' check (position in ('bottom-right', 'bottom-left')),
  primary_color text not null default '#0ea5e9',
  greeting text,
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  is_active boolean not null default true,
  allowed_domains text[],
  total_impressions integer not null default 0,
  total_interactions integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_embedded_widgets_business_id on embedded_widgets(business_id);

-- =============================================
-- ANALYTICS EVENTS TABLE
-- =============================================
create table if not exists analytics_events (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  event_type text not null,
  event_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_events_business_id on analytics_events(business_id);
create index if not exists idx_analytics_events_event_type on analytics_events(event_type);
create index if not exists idx_analytics_events_created_at on analytics_events(created_at);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  type text not null check (type in (
    'new_appointment', 'appointment_cancelled', 'new_conversation',
    'new_lead', 'agent_error', 'system', 'callback_requested', 'missed_call'
  )),
  title text not null,
  body text not null,
  is_read boolean not null default false,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_business_id on notifications(business_id);
create index if not exists idx_notifications_is_read on notifications(is_read);
create index if not exists idx_notifications_created_at on notifications(created_at desc);

-- =============================================
-- PAYMENT CONFIG TABLE
-- =============================================
create table if not exists payment_config (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  stripe_publishable_key text not null,
  stripe_secret_key text not null,
  -- network_name text not null default 'Polygon',
  -- chain_id integer not null default 137,
  -- rpc_url text not null default 'https://polygon-rpc.com',
  -- usdc_contract_address text not null,
  -- receiver_wallet text not null,
  -- usdc_decimals integer not null default 6,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id)
);

create index if not exists idx_payment_config_business_id on payment_config(business_id);

-- =============================================
-- PATIENT PORTAL PROFILES TABLE
-- =============================================
create table if not exists patient_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- SUPPORT TICKETS TABLE
-- =============================================
create table if not exists support_tickets (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  patient_id uuid not null references patient_profiles(id) on delete cascade,
  subject text not null default 'Support Request',
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_support_tickets_business_id on support_tickets(business_id);
create index if not exists idx_support_tickets_patient_id on support_tickets(patient_id);

-- =============================================
-- SUPPORT MESSAGES TABLE
-- =============================================
create table if not exists support_messages (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  sender_role text not null check (sender_role in ('patient', 'staff')),
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null default '',
  file_url text,
  file_name text,
  file_type text,
  file_size integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_support_messages_ticket_id on support_messages(ticket_id);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_businesses_updated_at before update on businesses for each row execute function update_updated_at_column();
create trigger update_agents_updated_at before update on agents for each row execute function update_updated_at_column();
create trigger update_services_updated_at before update on services for each row execute function update_updated_at_column();
create trigger update_business_hours_updated_at before update on business_hours for each row execute function update_updated_at_column();
create trigger update_appointments_updated_at before update on appointments for each row execute function update_updated_at_column();
create trigger update_conversations_updated_at before update on conversations for each row execute function update_updated_at_column();
create trigger update_faqs_updated_at before update on faqs for each row execute function update_updated_at_column();
create trigger update_leads_updated_at before update on leads for each row execute function update_updated_at_column();
create trigger update_embedded_widgets_updated_at before update on embedded_widgets for each row execute function update_updated_at_column();
create trigger update_payment_config_updated_at before update on payment_config for each row execute function update_updated_at_column();
create trigger update_patient_profiles_updated_at before update on patient_profiles for each row execute function update_updated_at_column();
create trigger update_support_tickets_updated_at before update on support_tickets for each row execute function update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY — enable on all tables
-- =============================================
alter table businesses enable row level security;
alter table agents enable row level security;
alter table services enable row level security;
alter table agent_services enable row level security;
alter table business_hours enable row level security;
alter table appointments enable row level security;
alter table conversations enable row level security;
alter table conversation_messages enable row level security;
alter table faqs enable row level security;
alter table leads enable row level security;
alter table embedded_widgets enable row level security;
alter table analytics_events enable row level security;
alter table notifications enable row level security;
alter table payment_config enable row level security;
alter table patient_profiles enable row level security;
alter table support_tickets enable row level security;
alter table support_messages enable row level security;

-- =============================================
-- HELPER FUNCTION (must exist before policies that call it)
-- =============================================
create or replace function is_business_owner(business_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from businesses
    where id = business_id and owner_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Businesses
create policy "Users can view their own businesses"
  on businesses for select using (auth.uid() = owner_id);
create policy "Users can insert their own businesses"
  on businesses for insert with check (auth.uid() = owner_id);
create policy "Users can update their own businesses"
  on businesses for update using (auth.uid() = owner_id);
create policy "Users can delete their own businesses"
  on businesses for delete using (auth.uid() = owner_id);

-- Agents
create policy "Business owners can manage agents"
  on agents for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));
create policy "Public can view active agents"
  on agents for select using (is_active = true);

-- Services
create policy "Business owners can manage services"
  on services for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));
create policy "Public can view active services"
  on services for select using (is_active = true);

-- Agent Services
create policy "Business owners can manage agent_services"
  on agent_services for all
  using (
    exists (
      select 1 from agents a
      where a.id = agent_services.agent_id
        and is_business_owner(a.business_id)
    )
  );

-- Business Hours
create policy "Business owners can manage hours"
  on business_hours for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));
create policy "Public can view business hours"
  on business_hours for select using (true);

-- Appointments
create policy "Business owners can manage appointments"
  on appointments for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));
create policy "Service role can insert appointments"
  on appointments for insert with check (true);
create policy "Patients can view their own appointments"
  on appointments for select
  using (customer_email = auth.email());
create policy "Patients can update their own appointments"
  on appointments for update
  using (customer_email = auth.email());

-- Conversations
create policy "Business owners can manage conversations"
  on conversations for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));
create policy "Service role can insert conversations"
  on conversations for insert with check (true);
create policy "Service role can update conversations"
  on conversations for update using (true) with check (true);

-- Conversation Messages
create policy "Business owners can view messages"
  on conversation_messages for select
  using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id and is_business_owner(c.business_id)
    )
  );
create policy "Service role can insert messages"
  on conversation_messages for insert with check (true);

-- FAQs
create policy "Business owners can manage faqs"
  on faqs for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));
create policy "Public can view active faqs"
  on faqs for select using (is_active = true);

-- Leads
create policy "Business owners can manage leads"
  on leads for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));
create policy "Service role can insert leads"
  on leads for insert with check (true);
create policy "Service role can update leads"
  on leads for update using (true) with check (true);

-- Embedded Widgets
create policy "Business owners can manage widgets"
  on embedded_widgets for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));
create policy "Public can view active widgets"
  on embedded_widgets for select using (is_active = true);
create policy "Service role can update widgets"
  on embedded_widgets for update using (true) with check (true);

-- Analytics Events
create policy "Business owners can view analytics"
  on analytics_events for select using (is_business_owner(business_id));
create policy "Service role can insert events"
  on analytics_events for insert with check (true);

-- Notifications
create policy "Business owners can manage their notifications"
  on notifications for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));

-- Payment Config
create policy "Business owners can manage payment_config"
  on payment_config for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));

-- Patient Profiles
create policy "Patients can view and update their own profile"
  on patient_profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Support Tickets
create policy "Patients can view their own tickets"
  on support_tickets for select
  using (auth.uid() = patient_id);
create policy "Patients can create tickets"
  on support_tickets for insert
  with check (auth.uid() = patient_id);
create policy "Business owners can manage all tickets"
  on support_tickets for all
  using (is_business_owner(business_id));

-- Support Messages
create policy "Ticket participants can view messages"
  on support_messages for select
  using (
    exists (
      select 1 from support_tickets t
      where t.id = ticket_id
        and (t.patient_id = auth.uid() or is_business_owner(t.business_id))
    )
  );
create policy "Ticket participants can send messages"
  on support_messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from support_tickets t
      where t.id = ticket_id
        and (t.patient_id = auth.uid() or is_business_owner(t.business_id))
    )
  );

-- =============================================
-- STORAGE BUCKET: support-files
-- =============================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'support-files',
  'support-files',
  false,
  10485760,
  array['image/jpeg','image/png','image/gif','image/webp','application/pdf','text/plain']
) on conflict (id) do nothing;

create policy "Authenticated users can upload support files"
  on storage.objects for insert
  with check (bucket_id = 'support-files' and auth.uid() is not null);

create policy "Authenticated users can view support files"
  on storage.objects for select
  using (bucket_id = 'support-files' and auth.uid() is not null);

create policy "Senders can delete their own support files"
  on storage.objects for delete
  using (bucket_id = 'support-files' and owner = auth.uid());

-- =============================================
-- WEBSITE BUILDER
-- =============================================
create table if not exists doctor_websites (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  agent_id uuid references agents(id) on delete set null,
  slug text unique not null,
  template text not null default 'clarity' check (template in ('clarity', 'pulse', 'serenity')),
  is_published boolean not null default false,
  -- subscription
  subscription_active boolean not null default false,
  subscription_tx_hash text,
  subscription_paid_at timestamptz,
  subscription_wallet text,
  -- branding
  primary_color text not null default '#0d7377',
  secondary_color text not null default '#14a8b5',
  font_style text not null default 'inter' check (font_style in ('inter','playfair','poppins')),
  -- content sections (stored as jsonb)
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_doctor_websites_business_id on doctor_websites(business_id);
create index if not exists idx_doctor_websites_slug on doctor_websites(slug);

alter table doctor_websites enable row level security;

create policy "Business owners can manage their website"
  on doctor_websites for all
  using (is_business_owner(business_id))
  with check (is_business_owner(business_id));

create policy "Published websites are publicly readable"
  on doctor_websites for select
  using (is_published = true);

-- Storage bucket for website builder images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'website-images',
  'website-images',
  true,
  5242880,
  array['image/jpeg','image/png','image/gif','image/webp']
) on conflict (id) do nothing;

create policy "Authenticated users can upload website images"
  on storage.objects for insert
  with check (bucket_id = 'website-images' and auth.uid() is not null);

create policy "Website images are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'website-images');

create policy "Owners can delete their website images"
  on storage.objects for delete
  using (bucket_id = 'website-images' and owner = auth.uid());

-- =============================================
-- SEED DEFAULT CLINIC HOURS (called via function)
-- =============================================
create or replace function create_default_business_hours(p_business_id uuid)
returns void as $$
begin
  insert into business_hours (business_id, day_of_week, open_time, close_time, is_open)
  values
    (p_business_id, 0, null,    null,    false),
    (p_business_id, 1, '08:00', '17:00', true),
    (p_business_id, 2, '08:00', '17:00', true),
    (p_business_id, 3, '08:00', '17:00', true),
    (p_business_id, 4, '08:00', '17:00', true),
    (p_business_id, 5, '08:00', '17:00', true),
    (p_business_id, 6, '09:00', '13:00', true)
  on conflict (business_id, day_of_week) do nothing;
end;
$$ language plpgsql security definer;
