import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Navbar from '@/components/Navbar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <>
      <Navbar user={session} />
      <div className="page-wrapper">{children}</div>
    </>
  );
}