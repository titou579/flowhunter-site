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
