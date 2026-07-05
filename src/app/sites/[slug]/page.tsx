import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TemplateClarity } from '@/components/website/TemplateClarity';
import { TemplatePulse } from '@/components/website/TemplatePulse';
import { TemplateSerenity } from '@/components/website/TemplateSerenity';
import type { WebsiteContent, WebsiteTemplate } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

interface WebsiteRow {
  content: WebsiteContent;
  template: WebsiteTemplate;
  primary_color: string;
  secondary_color: string;
  font_style: string;
  agent_id: string | null;
  business_id: string;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('doctor_websites') as any)
    .select('content, slug')
    .eq('slug', slug)
    .eq('is_published', true)
    .single() as { data: { content: WebsiteContent } | null };

  if (!data) return { title: 'Not Found' };
  const content = data.content as WebsiteContent;
  return {
    title: content?.branding?.siteTitle || content?.hero?.headline || 'Healthcare Practice',
    description: content?.branding?.siteDescription || content?.hero?.subheadline || 'Quality healthcare services',
  };
}

export default async function PublicSitePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: website } = await (supabase.from('doctor_websites') as any)
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single() as { data: WebsiteRow | null };

  if (!website) notFound();

  const content = (website.content || {}) as WebsiteContent;
  const template = website.template as WebsiteTemplate;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  const props = {
    content,
    primaryColor: website.primary_color || '#0d7377',
    secondaryColor: website.secondary_color || '#14a8b5',
    fontStyle: website.font_style || 'inter',
    agentId: website.agent_id || null,
    businessId: website.business_id,
    appUrl,
    preview: false,
  };

  return (
    <>
      {template === 'clarity' && <TemplateClarity {...props} />}
      {template === 'pulse' && <TemplatePulse {...props} />}
      {template === 'serenity' && <TemplateSerenity {...props} />}
    </>
  );
}
