import {
  SiYoutube, SiTwitch, SiDiscord, SiX, SiInstagram, SiTiktok,
  SiGithub, SiKick, SiSteam, SiSpotify, SiFacebook,
  SiReddit, SiPatreon, SiPaypal, SiLinktree,
} from 'react-icons/si';
import { Globe, Link as LinkIcon } from 'lucide-react';
import type { ComponentType } from 'react';

export const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  youtube: SiYoutube,
  twitch: SiTwitch,
  discord: SiDiscord,
  twitter: SiX,
  x: SiX,
  instagram: SiInstagram,
  tiktok: SiTiktok,
  github: SiGithub,
  kick: SiKick,
  steam: SiSteam,
  spotify: SiSpotify,
  facebook: SiFacebook,
  reddit: SiReddit,
  patreon: SiPatreon,
  paypal: SiPaypal,
  linktree: SiLinktree,
  website: Globe,
  link: LinkIcon,
};

export const ICON_COLORS: Record<string, string> = {
  youtube: '#FF0000',
  twitch: '#9146FF',
  discord: '#5865F2',
  twitter: '#000000',
  x: '#000000',
  instagram: '#E4405F',
  tiktok: '#000000',
  github: '#181717',
  kick: '#53FC18',
  steam: '#0F1B2A',
  spotify: '#1DB954',
  facebook: '#1877F2',
  reddit: '#FF4500',
  patreon: '#F96854',
  paypal: '#00457C',
  linktree: '#43E55E',
  website: '#6366F1',
  link: '#6366F1',
};

export const ICON_KEYS = Object.keys(ICON_MAP);

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = ICON_MAP[name] || LinkIcon;
  return <C className={className} />;
}
