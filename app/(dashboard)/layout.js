import { getSession } from '@/lib/auth';
import Navbar from '@/components/Navbar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }) {
  const session = await getSession();
  return (
    <>
      <Navbar user={session || { nombre: '', isAdmin: false }} />
      <div className="page-wrapper">{children}</div>
    </>
  );
}
