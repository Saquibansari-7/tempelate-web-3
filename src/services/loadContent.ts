import { supabase } from '../lib/supabase';
import { WebsiteContent } from '../types';
import { normalizeImage } from '../utils/imageUrl';

export async function loadContent(siteId: string) {
  if (!supabase || typeof supabase.from !== 'function') {
    const err = new Error('Supabase not configured - check your .env file');
    if (import.meta.env.DEV) console.error('[loadContent]', err.message);
    throw err;
  }

  const { data, error } = await supabase
    .from('site_content')
    .select('data')
    .eq('site_id', siteId)
    .single();

  if (error) {
    if (import.meta.env.DEV) console.error('[loadContent] Supabase error:', error);
    throw error;
  }

  const raw = data?.data as Partial<WebsiteContent> | undefined;
  if (!raw) return null;

  const sanitized = {
    ...raw,
    hero: { ...raw.hero, image: normalizeImage(raw.hero.image) },
    story: { ...raw.story, image: normalizeImage(raw.story.image) },
    invitationCard: { ...raw.invitationCard, image: normalizeImage(raw.invitationCard.image) },
    gallery: { ...raw.gallery, images: raw.gallery.images.map(normalizeImage) },
  } as WebsiteContent;

  if (import.meta.env.DEV) {
    console.log('[loadContent] FINAL heroImage:', sanitized.hero.image);
    console.log('[loadContent] FINAL storyImage:', sanitized.story.image);
    console.log('[loadContent] FINAL invitationImage:', sanitized.invitationCard.image);
  }
  return sanitized;
}
