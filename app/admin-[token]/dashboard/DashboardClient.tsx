'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ICON_KEYS, ICON_COLORS, Icon } from '@/components/Icons';
import type { SiteData, Link, Category } from '@/lib/types';

const rid = () => Math.random().toString(36).slice(2, 10);

async function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

const TABS = ['profile', 'categories', 'links', 'appearance'] as const;
type Tab = (typeof TABS)[number];

export default function DashboardClient({ adminPath }: { adminPath: string }) {
  const router = useRouter();
  const [data, setData] = useState<SiteData | null>(null);
  const [tab, setTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/data')
      .then((r) => (r.status === 401 ? router.push(`/${adminPath}`) : r.json()))
      .then((d) => d && setData(d))
      .catch(() => {});
  }, [adminPath, router]);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    const r = await fetch('/api/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (r.status === 401) return router.push(`/${adminPath}`);
    setMsg(r.ok ? 'Enregistré ✓' : 'Erreur');
    setTimeout(() => setMsg(''), 2000);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push(`/${adminPath}`);
    router.refresh();
  };

  if (!data) {
    return <div className="min-h-screen grid place-items-center text-sm opacity-60">Chargement…</div>;
  }

  /* ---------- helpers de mutation ---------- */
  const setProfile = (k: keyof SiteData['profile'], v: string) =>
    setData({ ...data, profile: { ...data.profile, [k]: v } });
  const setSetting = (k: keyof SiteData['settings'], v: string) =>
    setData({ ...data, settings: { ...data.settings, [k]: v } } as SiteData);

  const addCategory = () =>
    setData({
      ...data,
      categories: [...data.categories, { id: rid(), name: 'Nouvelle catégorie', color: '#6366f1', order: data.categories.length }],
    });
  const updateCategory = (id: string, patch: Partial<Category>) =>
    setData({ ...data, categories: data.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const removeCategory = (id: string) =>
    setData({
      ...data,
      categories: data.categories.filter((c) => c.id !== id),
      links: data.links.filter((l) => l.categoryId !== id),
    });

  const addLink = () => {
    const cat = data.categories[0];
    if (!cat) return;
    setData({
      ...data,
      links: [
        ...data.links,
        {
          id: rid(),
          label: 'Nouveau lien',
          url: 'https://',
          icon: 'link',
          color: ICON_COLORS.link,
          categoryId: cat.id,
          order: data.links.length,
        },
      ],
    });
  };
  const updateLink = (id: string, patch: Partial<Link>) =>
    setData({ ...data, links: data.links.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  const removeLink = (id: string) => setData({ ...data, links: data.links.filter((l) => l.id !== id) });

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Admin — {data.profile.name}</h1>
        <div className="flex gap-2 items-center">
          {msg && <span className="text-xs opacity-70">{msg}</span>}
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-sm disabled:opacity-50"
          >
            {saving ? '…' : 'Enregistrer'}
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              tab === t ? 'bg-white/15' : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            {({ profile: 'Profil', categories: 'Catégories', links: 'Liens', appearance: 'Apparence' })[t]}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          {(['name', 'tagline', 'bio'] as const).map((k) => (
            <label key={k} className="block">
              <span className="text-xs uppercase tracking-wide opacity-60">{k}</span>
              <input
                type="text"
                value={data.profile[k]}
                onChange={(e) => setProfile(k, e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10"
              />
            </label>
          ))}
          <label className="block">
            <span className="text-xs uppercase tracking-wide opacity-60">Avatar (URL ou upload)</span>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={data.profile.avatar}
                onChange={(e) => setProfile('avatar', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                placeholder="https://…"
              />
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 4 * 1024 * 1024) return alert('Max 4 Mo');
                  setProfile('avatar', await fileToBase64(f));
                }}
                className="text-xs"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide opacity-60">Bannière</span>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={data.profile.banner}
                onChange={(e) => setProfile('banner', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                placeholder="https://…"
              />
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 4 * 1024 * 1024) return alert('Max 4 Mo');
                  setProfile('banner', await fileToBase64(f));
                }}
                className="text-xs"
              />
            </div>
          </label>
        </div>
      )}

      {tab === 'categories' && (
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <button
            onClick={addCategory}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
          >
            + Ajouter une catégorie
          </button>
          {data.categories
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((c) => (
              <div key={c.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) => updateCategory(c.id, { name: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                />
                <input
                  type="color"
                  value={c.color}
                  onChange={(e) => updateCategory(c.id, { color: e.target.value })}
                  className="w-10 h-10 rounded-lg bg-transparent"
                />
                <input
                  type="number"
                  value={c.order}
                  onChange={(e) => updateCategory(c.id, { order: parseInt(e.target.value) || 0 })}
                  className="w-16 px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                />
                <button
                  onClick={() => removeCategory(c.id)}
                  className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
        </div>
      )}

      {tab === 'links' && (
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <button
            onClick={addLink}
            disabled={data.categories.length === 0}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm disabled:opacity-50"
          >
            + Ajouter un lien
          </button>
          {data.links
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((l) => (
              <div key={l.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-2 items-center p-3 rounded-lg bg-white/5">
                <input
                  type="text"
                  value={l.label}
                  onChange={(e) => updateLink(l.id, { label: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-black/20 border border-white/10"
                  placeholder="Label"
                />
                <input
                  type="text"
                  value={l.url}
                  onChange={(e) => updateLink(l.id, { url: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-black/20 border border-white/10"
                  placeholder="https://…"
                />
                <select
                  value={l.icon}
                  onChange={(e) => {
                    const k = e.target.value;
                    updateLink(l.id, { icon: k, color: ICON_COLORS[k] || l.color });
                  }}
                  className="px-2 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                >
                  {ICON_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
                <input
                  type="color"
                  value={l.color}
                  onChange={(e) => updateLink(l.id, { color: e.target.value })}
                  className="w-10 h-10 rounded-lg bg-transparent"
                />
                <select
                  value={l.categoryId}
                  onChange={(e) => updateLink(l.id, { categoryId: e.target.value })}
                  className="px-2 py-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                >
                  {data.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeLink(l.id)}
                  className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
        </div>
      )}

      {tab === 'appearance' && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-wide opacity-60">Fond d'écran</span>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={data.settings.bgImage}
                onChange={(e) => setSetting('bgImage', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                placeholder="https://…"
              />
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 4 * 1024 * 1024) return alert('Max 4 Mo');
                  setSetting('bgImage', await fileToBase64(f));
                }}
                className="text-xs"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide opacity-60">Musique de fond</span>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={data.settings.bgMusic}
                onChange={(e) => setSetting('bgMusic', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                placeholder="https://…/music.mp3"
              />
              <input
                type="file"
                accept="audio/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 4 * 1024 * 1024) return alert('Max 4 Mo');
                  setSetting('bgMusic', await fileToBase64(f));
                }}
                className="text-xs"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide opacity-60">Thème par défaut</span>
            <select
              value={data.settings.defaultTheme}
              onChange={(e) => setSetting('defaultTheme', e.target.value)}
              className="mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
            >
              <option value="dark">Sombre</option>
              <option value="light">Clair</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
