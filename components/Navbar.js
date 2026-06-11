'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar({ user }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const links = [
    { href: '/dashboard',      label: 'Inicio' },
    { href: '/pronosticos',    label: 'Mis Pronosticos' },
    { href: '/partidos',       label: 'Partidos' },
    { href: '/standings',      label: 'Tabla' },
    { href: '/participantes',  label: 'Participantes' },
    { href: '/equipos',        label: 'Equipos' },
    ...(user.isAdmin ? [{ href: '/admin', label: '⚙️ Admin' }] : []),
  ];

  return (
    <nav className="navbar">
      <Link href="/dashboard" className="navbar-brand">
        <span className="trophy">🏆</span>
        <span>Polla Mundialista 2026</span>
      </Link>

      <ul className="navbar-links">
        {links.map(l => (
          <li key={l.href}>
            <Link
              href={l.href}
              className={pathname.startsWith(l.href) && l.href !== '/dashboard'
                ? 'active'
                : pathname === l.href ? 'active' : ''}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="navbar-user">
        <span>{user.nombre}</span>
        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm"
          style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }}
        >
          Salir
        </button>
      </div>
    </nav>
  );
}
