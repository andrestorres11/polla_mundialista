export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

function formatFecha(d) {
  return new Date(d).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key];
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

export default async function PartidosPage() {
  const partidos = await prisma.partido.findMany({
    include: {
      equipoLocal: true,
      equipoVisita: true,
      _count: { select: { pronosticos: true } },
    },
    orderBy: { fechaHora: 'asc' },
  });

  const byGrupo = groupBy(partidos, 'grupo');
  const jugados = partidos.filter(p => p.jugado).length;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">📅 Partidos — Fase de Grupos</h1>
        <p className="page-subtitle">{jugados} de {partidos.length} partidos jugados</p>
      </div>

      {Object.keys(byGrupo).sort().map(grupo => (
        <div key={grupo} className="card">
          <div className="card-header">Grupo {grupo}</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha (COT)</th>
                  <th>Local</th>
                  <th style={{ textAlign: 'center' }}>Resultado</th>
                  <th>Visita</th>
                  <th>Estadio</th>
                  <th style={{ textAlign: 'center' }}>Pronosticos</th>
                  <th style={{ textAlign: 'center' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {byGrupo[grupo].map(p => (
                  <tr key={p.id}>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatFecha(p.fechaHora)}</td>
                    <td>
                      <span style={{ marginRight: '0.35rem' }}>{p.equipoLocal.bandera}</span>
                      <strong>{p.equipoLocal.nombre}</strong>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {p.jugado ? (
                        <span className="score-display">{p.golesLocal} - {p.golesVisita}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <span style={{ marginRight: '0.35rem' }}>{p.equipoVisita.bandera}</span>
                      {p.equipoVisita.nombre}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.estadio || '-'}</td>
                    <td style={{ textAlign: 'center' }}>{p._count.pronosticos}</td>
                    <td style={{ textAlign: 'center' }}>
                      {p.jugado ? (
                        <span className="badge badge-success">Finalizado</span>
                      ) : new Date(p.fechaHora) <= new Date() ? (
                        <span className="badge badge-warning">En curso</span>
                      ) : (
                        <span className="badge badge-info">Pendiente</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}
