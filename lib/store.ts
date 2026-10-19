import fs from 'fs/promises';
import path from 'path';
import type { SiteData } from './types';

const DIR = process.env.STORAGE_DIR || './data';
const FILE = path.join(DIR, 'site.json');

const DEFAULT: SiteData = {
  profile: {
    name: 'FlowHunter',
    tagline: 'Bienvenue sur ma chaîne',
    bio: 'Streamer, gamer, créateur de contenu.',
    avatar: '',
    banner: '',
  },
  categories: [
    { id: 'social', name: 'Réseaux sociaux', color: '#6366f1', order: 0 },
  ],
  links: [],
  settings: {
    bgImage: '',
    bgMusic: '',
    defaultTheme: 'dark',
  },
};

export async function readData(): Promise<SiteData> {
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return structuredClone(DEFAULT);
  }
}

export async function writeData(data: SiteData): Promise<void> {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8');
}

export function getDefault(): SiteData {
  return structuredClone(DEFAULT);
}
