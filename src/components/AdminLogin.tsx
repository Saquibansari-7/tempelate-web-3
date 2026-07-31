import { useState, useEffect } from 'react';

interface AdminLoginProps {
  onLogin: () => void;
  onClose: () => void;
}

export default function AdminLogin({ onLogin, onClose }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 300));

    if (password === (import.meta.env.VITE_ADMIN_PASSWORD || 'password')) {
      sessionStorage.setItem('adminAuth', 'true');
      onLogin();
    } else {
      setError('Invalid password');
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold font-serif text-crimson">Admin Login</h2>
          <p className="text-gray-600 text-sm mt-2">Enter admin password to continue</p>
        </div>

        {error && (
          <div className="p-4 rounded-lg mb-6 bg-red-100 text-red-700 border border-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-serif font-bold text-dark mb-2 text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-crimson"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-crimson hover:bg-burgundy text-white font-bold py-3 rounded-lg transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-transparent border-2 border-gray-300 hover:border-crimson text-dark font-bold py-3 rounded-lg transition duration-300"
        >
          Close
        </button>
      </div>
    </div>
  );
}
