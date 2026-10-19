import { readData } from '@/lib/store';
import PublicPage from '@/components/PublicPage';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await readData();
  return <PublicPage data={data} />;
}
