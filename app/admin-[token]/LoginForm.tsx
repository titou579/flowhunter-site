'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const pathname = usePathname();
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p }),
    });
    setBusy(false);
    if (r.ok) {
      router.push(pathname + '/dashboard');
      router.refresh();
    } else {
      setErr('Identifiants invalides');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="glass-card rounded-2xl p-8 w-full max-w-sm"
      >
        <h1 className="text-lg font-semibold mb-6">Admin</h1>
        <input
          type="text"
          placeholder="Utilisateur"
          value={u}
          onChange={(e) => setU(e.target.value)}
          className="w-full mb-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-white/30"
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={p}
          onChange={(e) => setP(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-white/30"
          autoComplete="current-password"
        />
        {err && <p className="text-red-400 text-sm mb-3">{err}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 transition disabled:opacity-50"
        >
          {busy ? '...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
