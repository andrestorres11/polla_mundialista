import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { COSTO_INSCRIPCION } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getStats() {
  const [totalUsers, jugados, pendientes] = await Promise.all([
    prisma.user.count({ where: { isAdmin: false } }),
    prisma.partido.count({ where: { jugado: true } }),
    prisma.partido.count({ where: { jugado: false } }),
  ]);

  const standings = await prisma.user.findMany({
    where: { isAdmin: false },
    include: {
      pronosticos: {
        include: { partido: true },
        where: { partido: { jugado: true } },
      },
    },
  });

  const ranked = standings
    .map(u => {
      const total = u.pronosticos.reduce((s, p) => s + p.puntos, 0);
      const exactos = u.pronosticos.filter(p => p.puntos === 3).length;
      return { id: u.id, nombre: u.nombre, empresa: u.empresa, total, exactos };
    })
    .sort((a, b) => b.total - a.total || b.exactos - a.exactos);

  return {
    totalUsers,
    jugados,
    pendientes,
    bolsa: totalUsers * COSTO_INSCRIPCION,
    rankings: ranked.slice(0, 5),
  };
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const stats = await getStats();

  const proximos = await prisma.partido.findMany({
    where: { jugado: false },
    include: { equipoLocal: true, equipoVisita: true },
    orderBy: { fechaHora: 'asc' },
    take: 3,
  });

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">🏆 Dashboard — Mundial 2026</h1>
        <p className="page-subtitle">Bienvenido, {session.nombre}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Participantes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.jugados}</div>
          <div className="stat-label">Partidos jugados</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pendientes}</div>
          <div className="stat-label">Partidos pendientes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--gold)', fontSize: '1.5rem' }}>
            ${stats.bolsa.toLocaleString('es-CO')}
          </div>
          <div className="stat-label">Bolsa total (COP)</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <span>🥇 Top 5 Tabla de Posiciones</span>
            <Link href="/standings" className="btn btn-ghost btn-sm">Ver completo</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jugador</th>
                  <th>Empresa</th>
                  <th style={{ textAlign: 'center' }}>Pts</th>
                  <th style={{ textAlign: 'center' }}>Exactos</th>
                </tr>
              </thead>
              <tbody>
                {stats.rankings.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-muted" style={{ padding: '1.5rem' }}>Sin datos aun</td></tr>
                ) : stats.rankings.map((u, i) => (
                  <tr key={u.id}>
                    <td>
                      <span className={`ranking-pos ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="font-bold">{u.nombre}</td>
                    <td className="text-muted text-sm">{u.empresa || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-navy">{u.total}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>{u.exactos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header flex justify-between items-center">
            <span>⚽ Proximos Partidos</span>
            <Link href="/partidos" className="btn btn-ghost btn-sm">Ver todos</Link>
          </div>
          {proximos.length === 0 ? (
            <p className="text-muted text-sm" style={{ padding: '1rem 0' }}>No hay partidos pendientes</p>
          ) : proximos.map(p => (
            <div key={p.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--grey)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Grupo {p.grupo} · {new Date(p.fechaHora).toLocaleString('es-CO', {
                  timeZone: 'America/Bogota', weekday: 'short',
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy)' }}>
                {p.equipoLocal.bandera} {p.equipoLocal.nombre} vs {p.equipoVisita.nombre} {p.equipoVisita.bandera}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.estadio}</div>
            </div>
          ))}
          <div style={{ paddingTop: '0.75rem' }}>
            <Link href="/pronosticos" className="btn btn-primary btn-sm">
              Registrar Pronosticos
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
