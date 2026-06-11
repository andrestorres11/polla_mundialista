export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { COSTO_INSCRIPCION } from '@/lib/utils';

async function getStandings() {
  const users = await prisma.user.findMany({
    where: { isAdmin: false },
    include: {
      pronosticos: {
        include: { partido: true },
      },
    },
  });

  return users
    .map(u => {
      const all = u.pronosticos;
      const jugados = all.filter(p => p.partido.jugado);
      const total = jugados.reduce((s, p) => s + p.puntos, 0);
      const exactos = jugados.filter(p => p.puntos === 3).length;
      const parciales = jugados.filter(p => p.puntos === 1).length;
      const fallidos = jugados.filter(p => p.puntos === 0).length;
      const sinPron = 0;
      return { id: u.id, nombre: u.nombre, total, exactos, parciales, fallidos, pendientes: all.filter(p => !p.partido.jugado).length };
    })
    .sort((a, b) => b.total - a.total || b.exactos - a.exactos);
}

export default async function StandingsPage() {
  const standings = await getStandings();
  const bolsa = standings.length * COSTO_INSCRIPCION;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">🏅 Tabla de Posiciones</h1>
        <p className="page-subtitle">
          {standings.length} participantes · Bolsa: ${bolsa.toLocaleString('es-CO')} COP
        </p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-value">{standings.length}</div>
          <div className="stat-label">Jugadores</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--gold)', fontSize: '1.4rem' }}>
            ${bolsa.toLocaleString('es-CO')}
          </div>
          <div className="stat-label">Bolsa total COP</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{standings[0]?.total ?? 0}</div>
          <div className="stat-label">Lider actual (pts)</div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Jugador</th>
                <th style={{ textAlign: 'center' }}>Puntos</th>
                <th style={{ textAlign: 'center' }}>Exactos (3pts)</th>
                <th style={{ textAlign: 'center' }}>Parciales (1pt)</th>
                <th style={{ textAlign: 'center' }}>Fallidos</th>
                <th style={{ textAlign: 'center' }}>Pendientes</th>
              </tr>
            </thead>
            <tbody>
              {standings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted" style={{ padding: '2rem' }}>
                    No hay resultados aun. Los puntos aparecen cuando se ingresen resultados de partidos.
                  </td>
                </tr>
              ) : standings.map((u, i) => (
                <tr key={u.id}>
                  <td>
                    <span className={`ranking-pos ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="font-bold">{u.nombre}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-navy" style={{ fontSize: '0.9rem' }}>{u.total}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="pts-3">{u.exactos}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="pts-1">{u.parciales}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="pts-0">{u.fallidos}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="text-muted">{u.pendientes}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
