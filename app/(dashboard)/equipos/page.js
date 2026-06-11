import { prisma } from '@/lib/prisma';

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key];
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

export default async function EquiposPage() {
  const equipos = await prisma.equipo.findMany({
    orderBy: [{ grupo: 'asc' }, { nombre: 'asc' }],
  });

  const byGrupo = groupBy(equipos, 'grupo');

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">🌍 Equipos — Mundial 2026</h1>
        <p className="page-subtitle">{equipos.length} equipos en {Object.keys(byGrupo).length} grupos</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {Object.keys(byGrupo).sort().map(grupo => (
          <div key={grupo} className="card">
            <div className="card-header">Grupo {grupo}</div>
            {byGrupo[grupo].map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid var(--grey)' }}>
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{e.bandera}</span>
                <span style={{ fontWeight: 600 }}>{e.nombre}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
