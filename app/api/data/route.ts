import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/store';
import { isAuthed } from '@/lib/auth';
import type { SiteData } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const body = (await req.json()) as SiteData;
  await writeData(body);
  return NextResponse.json({ ok: true });
}
