'use client';
import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

function formatFecha(d) {
  return new Date(d).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminPage() {
  const [partidos, setPartidos] = useState([]);
  const [resultados, setResultados] = useState({});
  const [saving, setSaving] = useState({});
  const [msgs, setMsgs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin')
      .then(r => {
        if (r.status === 403) { window.location.href = '/dashboard'; return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setPartidos(data);
        const res = {};
        data.forEach(p => {
          res[p.id] = {
            local: p.golesLocal !== null ? String(p.golesLocal) : '',
            visita: p.golesVisita !== null ? String(p.golesVisita) : '',
          };
        });
        setResultados(res);
        setLoading(false);
      });
  }, []);

  async function guardarResultado(partidoId) {
    const r = resultados[partidoId];
    if (!r || r.local === '' || r.visita === '') return;

    setSaving(s => ({ ...s, [partidoId]: true }));
    const res = await fetch('/api/admin', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partidoId,
        golesLocal: parseInt(r.local),
        golesVisita: parseInt(r.visita),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsgs(m => ({ ...m, [partidoId]: `OK - ${data.updated} pronosticos actualizados` }));
      setPartidos(ps => ps.map(p => p.id === partidoId ? { ...p, jugado: true, golesLocal: parseInt(r.local), golesVisita: parseInt(r.visita) } : p));
    } else {
      setMsgs(m => ({ ...m, [partidoId]: data.error }));
    }
    setSaving(s => ({ ...s, [partidoId]: false }));
    setTimeout(() => setMsgs(m => ({ ...m, [partidoId]: null })), 4000);
  }

  if (loading) return <p style={{ padding: '2rem', color: 'var(--text-muted)' }}>Cargando...</p>;

  return (
    <>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">⚙️ Panel de Administracion</h1>
          <p className="page-subtitle">Ingrese los resultados de los partidos para calcular puntos</p>
        </div>
        <Link href="/admin/pronosticos" className="btn btn-navy btn-sm">
          ✏️ Editar pronosticos de jugadores
        </Link>
      </div>

      <div className="alert alert-info">
        Al guardar un resultado, los puntos de todos los participantes se recalculan automaticamente.
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha (COT)</th>
                <th>Gr.</th>
                <th>Local</th>
                <th style={{ textAlign: 'center' }}>Resultado Real</th>
                <th>Visita</th>
                <th style={{ textAlign: 'center' }}>Pronosticos</th>
                <th style={{ textAlign: 'center' }}>Estado</th>
                <th style={{ textAlign: 'center' }}>Accion</th>
              </tr>
            </thead>
            <tbody>
              {partidos.map(p => {
                const r = resultados[p.id] || { local: '', visita: '' };
                const msg = msgs[p.id];
                return (
                  <tr key={p.id}>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatFecha(p.fechaHora)}</td>
                    <td><span className="badge badge-info">{p.grupo}</span></td>
                    <td>
                      <span style={{ marginRight: '0.35rem' }}>{p.equipoLocal.bandera}</span>
                      <strong>{p.equipoLocal.nombre}</strong>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          className="score-input"
                          value={r.local}
                          onChange={e => setResultados(s => ({ ...s, [p.id]: { ...s[p.id], local: e.target.value } }))}
                        />
                        <span style={{ fontWeight: 700 }}>-</span>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          className="score-input"
                          value={r.visita}
                          onChange={e => setResultados(s => ({ ...s, [p.id]: { ...s[p.id], visita: e.target.value } }))}
                        />
                      </div>
                    </td>
                    <td>
                      <span style={{ marginRight: '0.35rem' }}>{p.equipoVisita.bandera}</span>
                      {p.equipoVisita.nombre}
                    </td>
                    <td style={{ textAlign: 'center' }}>{p._count.pronosticos}</td>
                    <td style={{ textAlign: 'center' }}>
                      {p.jugado
                        ? <span className="badge badge-success">Finalizado</span>
                        : <span className="badge badge-info">Pendiente</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => guardarResultado(p.id)}
                          disabled={saving[p.id]}
                        >
                          {saving[p.id] ? '...' : p.jugado ? 'Actualizar' : 'Guardar'}
                        </button>
                        {msg && (
                          <span style={{ fontSize: '0.75rem', color: msg.startsWith('OK') ? 'var(--success)' : 'var(--danger)' }}>
                            {msg}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
