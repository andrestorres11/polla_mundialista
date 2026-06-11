'use client';
import { useState, useEffect } from 'react';

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key];
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

function formatFecha(d) {
  return new Date(d).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function PronosticosPage() {
  const [partidos, setPartidos] = useState([]);
  const [local, setLocal] = useState({});  // partidoId -> goles
  const [visita, setVisita] = useState({});
  const [saving, setSaving] = useState({});
  const [msgs, setMsgs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pronosticos')
      .then(r => r.json())
      .then(data => {
        setPartidos(data);
        const loc = {}, vis = {};
        data.forEach(p => {
          const pr = p.pronosticos?.[0];
          loc[p.id] = pr ? String(pr.golesLocal) : '';
          vis[p.id] = pr ? String(pr.golesVisita) : '';
        });
        setLocal(loc);
        setVisita(vis);
        setLoading(false);
      });
  }, []);

  async function saveOne(partidoId) {
    const l = local[partidoId];
    const v = visita[partidoId];
    if (l === '' || v === '') return;
    setSaving(s => ({ ...s, [partidoId]: true }));

    const res = await fetch('/api/pronosticos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partidoId,
        golesLocal: parseInt(l),
        golesVisita: parseInt(v),
      }),
    });
    const data = await res.json();
    setMsgs(m => ({ ...m, [partidoId]: res.ok ? 'ok' : data.error }));
    setSaving(s => ({ ...s, [partidoId]: false }));
    setTimeout(() => setMsgs(m => ({ ...m, [partidoId]: null })), 3000);
  }

  async function saveAll() {
    const pendientes = partidos.filter(p => !p.jugado && new Date(p.fechaHora) > new Date());
    for (const p of pendientes) {
      if (local[p.id] !== '' && visita[p.id] !== '') {
        await saveOne(p.id);
      }
    }
  }

  if (loading) return <p style={{ padding: '2rem', color: 'var(--text-muted)' }}>Cargando partidos...</p>;

  const byGrupo = groupBy(partidos, 'grupo');
  const now = new Date();

  return (
    <>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">⚽ Mis Pronosticos</h1>
          <p className="page-subtitle">3 pts = resultado exacto | 1 pt = ganador/empate correcto</p>
        </div>
        <button onClick={saveAll} className="btn btn-primary">
          💾 Guardar todos
        </button>
      </div>

      {Object.keys(byGrupo).sort().map(grupo => (
        <div key={grupo} className="card">
          <div className="card-header">Grupo {grupo}</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha (COT)</th>
                  <th>Equipo Local</th>
                  <th style={{ textAlign: 'center' }}>Resultado</th>
                  <th>Equipo Visita</th>
                  <th style={{ textAlign: 'center' }}>Tu pronostico</th>
                  <th style={{ textAlign: 'center' }}>Pts</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {byGrupo[grupo].map(p => {
                  const started = new Date(p.fechaHora) <= now || p.jugado;
                  const pron = p.pronosticos?.[0];
                  const msg = msgs[p.id];

                  return (
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
                          <span className="text-muted text-sm">vs</span>
                        )}
                      </td>
                      <td>
                        <span style={{ marginRight: '0.35rem' }}>{p.equipoVisita.bandera}</span>
                        {p.equipoVisita.nombre}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {started ? (
                          pron ? (
                            <span style={{ fontWeight: 700 }}>{pron.golesLocal} - {pron.golesVisita}</span>
                          ) : (
                            <span className="text-muted text-sm">Sin pronostico</span>
                          )
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              className="score-input"
                              value={local[p.id] ?? ''}
                              onChange={e => setLocal(s => ({ ...s, [p.id]: e.target.value }))}
                            />
                            <span>-</span>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              className="score-input"
                              value={visita[p.id] ?? ''}
                              onChange={e => setVisita(s => ({ ...s, [p.id]: e.target.value }))}
                            />
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {pron && p.jugado ? (
                          <span className={`pts-${pron.puntos}`}>{pron.puntos} pts</span>
                        ) : '-'}
                      </td>
                      <td>
                        {!started && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => saveOne(p.id)}
                              disabled={saving[p.id]}
                            >
                              {saving[p.id] ? '...' : 'OK'}
                            </button>
                            {msg === 'ok' && <span style={{ color: 'var(--success)', fontSize: '1rem' }}>✓</span>}
                            {msg && msg !== 'ok' && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{msg}</span>}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}
