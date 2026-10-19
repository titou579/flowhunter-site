import { NextResponse } from 'next/server';
import { readData } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (req.headers.get('x-sync-token') !== process.env.SYNC_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const data = await readData();
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}
