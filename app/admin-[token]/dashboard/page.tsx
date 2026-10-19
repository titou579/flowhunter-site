import { notFound, redirect } from 'next/navigation';
import { adminPath, isAuthed } from '@/lib/auth';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { token: string } }) {
  if (params.token !== adminPath()) notFound();
  if (!(await isAuthed())) redirect(`/${adminPath()}`);
  return <DashboardClient adminPath={adminPath()} />;
}
