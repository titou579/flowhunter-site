import { notFound, redirect } from 'next/navigation';
import { adminPath, isAuthed } from '@/lib/auth';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { token: string } }) {
  if (params.token !== adminPath()) notFound();
  if (await isAuthed()) redirect(`/${adminPath()}/dashboard`);
  return <LoginForm />;
}
