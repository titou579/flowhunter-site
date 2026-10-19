'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { SiteData } from '@/lib/types';
import { Icon } from './Icons';
import { Sun, Moon, Play, Pause, VolumeX, Volume2, Sparkles, Layers } from 'lucide-react';

type Props = { data: SiteData };

export default function PublicPage({ data }: Props) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [style, setStyle] = useState<'glass' | 'opaque'>('glass');
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const t = (localStorage.getItem('theme') as 'dark' | 'light') || data.settings.defaultTheme || 'dark';
    const s = (localStorage.getItem('style') as 'glass' | 'opaque') || 'glass';
    const v = parseFloat(localStorage.getItem('volume') || '0.5');
    const m = localStorage.getItem('muted') === '1';
    setTheme(t);
    setStyle(s);
    setVolume(v);
    setMuted(m);
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.setAttribute('data-style', s);
    if (audioRef.current) {
      audioRef.current.volume = v;
      audioRef.current.muted = m;
    }
  }, [data.settings.defaultTheme]);

  const updateTheme = (t: 'dark' | 'light') => {
    setTheme(t);
    localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
  };
  const updateStyle = (s: 'glass' | 'opaque') => {
    setStyle(s);
    localStorage.setItem('style', s);
    document.documentElement.setAttribute('data-style', s);
  };
  const updateVolume = (v: number) => {
    setVolume(v);
    localStorage.setItem('volume', String(v));
    if (audioRef.current) audioRef.current.volume = v;
  };
  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      try { await a.play(); setPlaying(true); } catch {}
    } else {
      a.pause();
      setPlaying(false);
    }
  };
  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    const next = !muted;
    a.muted = next;
    setMuted(next);
    localStorage.setItem('muted', next ? '1' : '0');
  };

  const grouped = useMemo(() => {
    const cats = [...data.categories].sort((a, b) => a.order - b.order);
    return cats.map((c) => ({
      ...c,
      links: data.links.filter((l) => l.categoryId === c.id).sort((a, b) => a.order - b.order),
    }));
  }, [data]);

  const adminUrl = `/${process.env.NEXT_PUBLIC_ADMIN_PATH || 'admin.flowhunter'}`;

  return (
    <div className="relative min-h-screen">
      {data.settings.bgImage && (
        <div
          className="fixed inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${data.settings.bgImage})` }}
        />
      )}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: data.settings.bgImage
            ? 'linear-gradient(180deg, rgb(0 0 0 / 0.35) 0%, rgb(0 0 0 / 0.6) 100%)'
            : 'radial-gradient(ellipse at top, rgb(var(--fg) / 0.06), transparent 60%)',
        }}
      />

      {/* barre de contrôles flottante */}
      <div className="fixed top-4 right-4 z-30 flex items-center gap-2 glass-card rounded-full px-2 py-2">
        {data.settings.bgMusic && (
          <>
            <button
              onClick={togglePlay}
              className="rounded-full p-2 hover:bg-white/10 transition"
              aria-label={playing ? 'Pause' : 'Lecture'}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              onClick={toggleMute}
              className="rounded-full p-2 hover:bg-white/10 transition"
              aria-label={muted ? 'Activer son' : 'Couper son'}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => updateVolume(parseFloat(e.target.value))}
              className="clean w-20"
              aria-label="Volume"
            />
            <div className="w-px h-5 bg-white/15 mx-1" />
          </>
        )}
        <button
          onClick={() => updateStyle(style === 'glass' ? 'opaque' : 'glass')}
          className="rounded-full p-2 hover:bg-white/10 transition"
          aria-label="Changer style"
          title={style === 'glass' ? 'Passer en opaque' : 'Passer en liquid glass'}
        >
          {style === 'glass' ? <Sparkles size={16} /> : <Layers size={16} />}
        </button>
        <button
          onClick={() => updateTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full p-2 hover:bg-white/10 transition"
          aria-label="Changer thème"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* contenu principal */}
      <main className="relative z-0 mx-auto max-w-2xl px-4 pt-20 pb-32">
        {/* profil */}
        <header className="glass-card rounded-3xl overflow-hidden mb-8">
          {data.profile.banner && (
            <div
              className="h-40 bg-cover bg-center"
              style={{ backgroundImage: `url(${data.profile.banner})` }}
            />
          )}
          <div className={`p-6 text-center ${data.profile.banner ? '-mt-12' : ''}`}>
            {data.profile.avatar && (
              <img
                src={data.profile.avatar}
                alt={data.profile.name}
                className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-white/15"
              />
            )}
            <h1 className="mt-4 text-2xl font-bold">{data.profile.name}</h1>
            {data.profile.tagline && (
              <p className="text-sm opacity-80 mt-1">{data.profile.tagline}</p>
            )}
            {data.profile.bio && (
              <p className="text-sm opacity-70 mt-3 max-w-md mx-auto">{data.profile.bio}</p>
            )}
          </div>
        </header>

        {/* catégories + liens */}
        {grouped.map((cat) => (
          <section key={cat.id} className="mb-6">
            <h2
              className="text-xs uppercase tracking-widest font-semibold mb-3 px-2 opacity-80"
              style={{ color: cat.color }}
            >
              {cat.name}
            </h2>
            <div className="flex flex-col gap-3">
              {cat.links.map((l) => (
                <a
                  key={l.id}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-card glass-card rounded-2xl flex items-center gap-4 px-5 py-4"
                >
                  <span
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: l.color + '22', color: l.color }}
                  >
                    <Icon name={l.icon} className="w-5 h-5" />
                  </span>
                  <span className="font-medium flex-1">{l.label}</span>
                  <span className="opacity-40">→</span>
                </a>
              ))}
              {cat.links.length === 0 && (
                <p className="text-xs opacity-40 px-2">Aucun lien dans cette catégorie.</p>
              )}
            </div>
          </section>
        ))}

        <footer className="text-center mt-12 opacity-30 text-xs">
          <a href={adminUrl} className="hover:opacity-100 transition-opacity">
            •
          </a>
        </footer>
      </main>

      {data.settings.bgMusic && (
        <audio ref={audioRef} src={data.settings.bgMusic} loop preload="auto" />
      )}
    </div>
  );
}
