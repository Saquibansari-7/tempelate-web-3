import { supabase } from '../lib/supabase';
import { WebsiteContent, SectionSettings } from '../types';
import { normalizeImage } from '../utils/imageUrl';

export async function saveContent(siteId: string, content: WebsiteContent, sections: SectionSettings) {
  if (import.meta.env.DEV) console.log('saveContent - siteId:', siteId);

  if (!supabase || typeof supabase.from !== 'function') {
    const err = new Error('Supabase not configured - check your .env file');
    if (import.meta.env.DEV) console.error('saveContent - error:', err);
    throw err;
  }

  const normalizedContent: WebsiteContent = {
    ...content,
    hero: { ...content.hero, image: normalizeImage(content.hero.image) },
    story: { ...content.story, image: normalizeImage(content.story.image) },
    invitationCard: { ...content.invitationCard, image: normalizeImage(content.invitationCard.image) },
    gallery: { ...content.gallery, images: content.gallery.images.map(normalizeImage) },
  };

  const result = await supabase
    .from('site_content')
    .upsert({
      site_id: siteId,
      data: {
        ...normalizedContent,
        sections,
      },
      updated_at: new Date().toISOString(),
    });

  if (import.meta.env.DEV) console.log('saveContent - result:', result);

  if (result.error) {
    throw new Error(`Supabase save failed: ${result.error.message}`);
  }

  return result;
}

export async function syncToDataJson(siteId: string, content: WebsiteContent, sections: SectionSettings) {
  const apiSecret = typeof import.meta.env.VITE_API_SECRET === 'string' ? import.meta.env.VITE_API_SECRET.trim() : '';
  const res = await fetch('/api/update-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Secret': apiSecret,
    },
    body: JSON.stringify({ siteId, content, sections }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Data sync failed: ${res.status} ${res.statusText} ${body}`);
  }

  return res.json();
}
