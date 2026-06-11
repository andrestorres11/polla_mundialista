import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { COSTO_INSCRIPCION } from '@/lib/utils';

export default async function ParticipantesPage() {
  const session = await getSession();

  const users = await prisma.user.findMany({
    where: { isAdmin: false },
    include: {
      _count: { select: { pronosticos: true } },
    },
    orderBy: { nombre: 'asc' },
  });

  const bolsa = users.length * COSTO_INSCRIPCION;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">👥 Participantes</h1>
        <p className="page-subtitle">{users.length} inscritos · Bolsa: ${bolsa.toLocaleString('es-CO')} COP</p>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Empresa / Area</th>
                <th style={{ textAlign: 'center' }}>Pronosticos</th>
                <th>Registro</th>
                <th style={{ textAlign: 'center' }}>Inscripcion</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id}>
                  <td className="text-muted">{i + 1}</td>
                  <td className="font-bold">{u.nombre}</td>
                  <td className="text-sm text-muted">{u.email}</td>
                  <td>{u.empresa || '-'}</td>
                  <td style={{ textAlign: 'center' }}>{u._count.pronosticos}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString('es-CO', { timeZone: 'America/Bogota' })}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-success">${COSTO_INSCRIPCION.toLocaleString('es-CO')}</span>
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
