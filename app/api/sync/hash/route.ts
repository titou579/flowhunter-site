import { NextResponse } from 'next/server';
import { readData } from '@/lib/store';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (req.headers.get('x-sync-token') !== process.env.SYNC_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const data = await readData();
  const hash = createHash('sha256').update(JSON.stringify(data)).digest('hex');
  return NextResponse.json({ hash });
}
