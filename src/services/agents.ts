import { createClient } from '@/lib/supabase/client';
import type { Agent } from '@/types';
import type { AgentFormData } from '@/validations';
import { DEFAULT_GREETING, DEFAULT_SYSTEM_PROMPT } from '@/constants';

async function saveAgentServices(agentId: string, serviceIds: string[]): Promise<void> {
  const supabase = createClient();
  await supabase.from('agent_services').delete().eq('agent_id', agentId);
  if (serviceIds.length === 0) return;
  const { error } = await supabase.from('agent_services').insert(
    serviceIds.map((service_id) => ({ agent_id: agentId, service_id }))
  );
  if (error) throw error;
}

async function loadAgentServiceIds(agentId: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('agent_services')
    .select('service_id')
    .eq('agent_id', agentId);
  return (data ?? []).map((r) => r.service_id);
}

export async function getAgents(businessId: string): Promise<Agent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const agents = data ?? [];

  // Attach service_ids to each agent
  const withServices = await Promise.all(
    agents.map(async (agent) => ({
      ...agent,
      service_ids: await loadAgentServiceIds(agent.id),
    }))
  );
  return withServices;
}

export async function getAgent(agentId: string): Promise<Agent | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single();
  if (error) return null;
  return { ...data, service_ids: await loadAgentServiceIds(agentId) };
}

export async function createAgent(
  businessId: string,
  data: AgentFormData
): Promise<Agent> {
  const supabase = createClient();
  const { data: agent, error } = await supabase
    .from('agents')
    .insert({
      business_id: businessId,
      name: data.name,
      voice: data.voice,
      language: data.language,
      personality: data.personality,
      greeting_message: data.greeting_message || DEFAULT_GREETING,
      system_prompt: data.system_prompt || DEFAULT_SYSTEM_PROMPT,
      max_call_duration: data.max_call_duration,
      interrupt_sensitivity: data.interrupt_sensitivity,
      is_active: data.is_active,
    })
    .select()
    .single();
  if (error) throw error;

  const serviceIds = data.service_ids ?? [];
  await saveAgentServices(agent.id, serviceIds);
  return { ...agent, service_ids: serviceIds };
}

export async function updateAgent(
  agentId: string,
  data: Partial<AgentFormData>
): Promise<Agent> {
  const supabase = createClient();
  const { data: agent, error } = await supabase
    .from('agents')
    .update({
      name: data.name,
      voice: data.voice,
      language: data.language,
      personality: data.personality,
      greeting_message: data.greeting_message || null,
      system_prompt: data.system_prompt || null,
      max_call_duration: data.max_call_duration,
      interrupt_sensitivity: data.interrupt_sensitivity,
      is_active: data.is_active,
    })
    .eq('id', agentId)
    .select()
    .single();
  if (error) throw error;

  const serviceIds = data.service_ids ?? [];
  await saveAgentServices(agentId, serviceIds);
  return { ...agent, service_ids: serviceIds };
}

export async function deleteAgent(agentId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('agents').delete().eq('id', agentId);
  if (error) throw error;
}

export async function toggleAgentStatus(agentId: string, isActive: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('agents')
    .update({ is_active: isActive })
    .eq('id', agentId);
  if (error) throw error;
}
