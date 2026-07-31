import { useState, useEffect } from 'react';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import { WebsiteContent } from './types';
import { loadContent } from './services/loadContent';
import { syncContentToDOM, updateCountdown, initReveal } from './utils/contentSync';

export default function App() {
  const [adminOpen, setAdminOpen] = useState(() => {
    const path = window.location.pathname;
    return path === '/admin' || path.startsWith('/admin/');
  });
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem('adminAuth') === 'true');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!adminOpen) return;

    fetch('/api/auth-status')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.authenticated) {
          setAuthenticated(true);
          sessionStorage.setItem('adminAuth', 'true');
        }
      })
      .catch(() => {});

    loadContent('default')
      .then((result) => {
        if (!result) throw new Error('No site content found');
        setContent(result);
        syncContentToDOM(result, {});
        updateCountdown(result.countdown.targetDate);
        initReveal();
      })
      .catch(() => {
        if (import.meta.env.DEV) {
          console.error('Failed to initialize content sync');
        }
      })
      .finally(() => setReady(true));
  }, [adminOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setAdminOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (!adminOpen) return null;

  if (!authenticated) {
    return <AdminLogin onLogin={() => setAuthenticated(true)} onClose={() => setAdminOpen(false)} />;
  }

  if (!ready) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' }}>
        <div>Loading admin...</div>
      </div>
    );
  }

  return <AdminPanel initialContent={content} onClose={() => setAdminOpen(false)} onLogout={() => { sessionStorage.removeItem('adminAuth'); setAuthenticated(false); setAdminOpen(false); fetch('/logout', { method: 'POST' }).catch(() => {}); }} />;
}
