import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const injectSupabaseEnv = {
  name: 'inject-supabase-env',
  transformIndexHtml(html) {
    const env = loadEnv('', process.cwd(), ['VITE_']);
    const url = typeof env.VITE_PUBLIC_SUPABASE_URL === 'string' ? env.VITE_PUBLIC_SUPABASE_URL.trim() : '';
    const key = typeof env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY === 'string' ? env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY.trim() : '';
    if (url || key) console.log('[vite] injecting supabase env into index.html');
    return html
      .replace(/%SUPABASE_URL%/g, url)
      .replace(/%SUPABASE_KEY%/g, key);
  },
};

export default defineConfig({
  plugins: [react(), injectSupabaseEnv],
  build: {
    outDir: 'dist',
  },
});
