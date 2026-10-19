import './globals.css';
import type { Metadata } from 'next';
import { readData } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const data = await readData();
  return {
    title: data.profile.name || 'Site',
    description: data.profile.tagline || '',
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const data = await readData();
  const defaultTheme = data.settings.defaultTheme || 'dark';
  return (
    <html lang="fr" data-theme={defaultTheme} data-style="glass" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme');
                if (t) document.documentElement.setAttribute('data-theme', t);
                var s = localStorage.getItem('style');
                if (s) document.documentElement.setAttribute('data-style', s);
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
