'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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

export default function AdminPronosticosPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [partidos, setPartidos] = useState([]);
  const [valores, setValores] = useState({}); // partidoId -> {local, visita}
  const [saving, setSaving] = useState({});
  const [msgs, setMsgs] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPron, setLoadingPron] = useState(false);

  // Cargar lista de jugadores
  useEffect(() => {
    fetch('/api/participantes')
      .then(r => {
        if (r.status === 403 || r.status === 401) { window.location.href = '/dashboard'; return null; }
        return r.json();
      })
      .then(data => {
        if (data) setUsers(data);
        setLoadingUsers(false);
      });
  }, []);

  // Cargar pronosticos del jugador seleccionado
  useEffect(() => {
    if (!selectedUser) { setPartidos([]); return; }
    setLoadingPron(true);
    fetch(`/api/admin/pronosticos?userId=${selectedUser}`)
      .then(r => r.json())
      .then(data => {
        setPartidos(data);
        const v = {};
        data.forEach(p => {
          const pr = p.pronosticos?.[0];
          v[p.id] = {
            local: pr ? String(pr.golesLocal) : '',
            visita: pr ? String(pr.golesVisita) : '',
          };
        });
        setValores(v);
        setLoadingPron(false);
      });
  }, [selectedUser]);

  async function guardar(partidoId) {
    const v = valores[partidoId];
    if (!v || v.local === '' || v.visita === '') return;
    setSaving(s => ({ ...s, [partidoId]: true }));

    const res = await fetch('/api/admin/pronosticos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: parseInt(selectedUser),
        partidoId,
        golesLocal: parseInt(v.local),
        golesVisita: parseInt(v.visita),
      }),
    });
    const data = await res.json();
    setMsgs(m => ({ ...m, [partidoId]: res.ok ? 'ok' : (data.error || 'error') }));
    setSaving(s => ({ ...s, [partidoId]: false }));
    setTimeout(() => setMsgs(m => ({ ...m, [partidoId]: null })), 3000);
  }

  const userName = users.find(u => String(u.id) === String(selectedUser))?.nombre;
  const byGrupo = groupBy(partidos, 'grupo');

  return (
    <>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">⚙️ Admin — Editar Pronosticos</h1>
          <p className="page-subtitle">Modifica los marcadores pronosticados de cualquier jugador</p>
        </div>
        <Link href="/admin" className="btn btn-ghost btn-sm">← Resultados</Link>
      </div>

      <div className="alert alert-info">
        Al editar un pronostico de un partido ya jugado, los puntos se recalculan automaticamente.
      </div>

      <div className="card">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Selecciona un jugador</label>
          <select
            value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}
            disabled={loadingUsers}
          >
            <option value="">{loadingUsers ? 'Cargando...' : '-- Elegir jugador --'}</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.nombre} ({u._count?.pronosticos ?? 0} pronosticos)
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingPron && (
        <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>Cargando pronosticos...</p>
      )}

      {selectedUser && !loadingPron && Object.keys(byGrupo).sort().map(grupo => (
        <div key={grupo} className="card">
          <div className="card-header">Grupo {grupo} — {userName}</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha (COT)</th>
                  <th>Local</th>
                  <th style={{ textAlign: 'center' }}>Resultado Real</th>
                  <th>Visita</th>
                  <th style={{ textAlign: 'center' }}>Pronostico del jugador</th>
                  <th style={{ textAlign: 'center' }}>Pts</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {byGrupo[grupo].map(p => {
                  const v = valores[p.id] || { local: '', visita: '' };
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
                        {p.jugado
                          ? <span className="score-display">{p.golesLocal} - {p.golesVisita}</span>
                          : <span className="text-muted text-sm">vs</span>}
                      </td>
                      <td>
                        <span style={{ marginRight: '0.35rem' }}>{p.equipoVisita.bandera}</span>
                        {p.equipoVisita.nombre}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
                          <input
                            type="number" min="0" max="20" className="score-input"
                            value={v.local}
                            onChange={e => setValores(s => ({ ...s, [p.id]: { ...s[p.id], local: e.target.value } }))}
                          />
                          <span>-</span>
                          <input
                            type="number" min="0" max="20" className="score-input"
                            value={v.visita}
                            onChange={e => setValores(s => ({ ...s, [p.id]: { ...s[p.id], visita: e.target.value } }))}
                          />
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {pron && p.jugado ? <span className={`pts-${pron.puntos}`}>{pron.puntos}</span> : '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button className="btn btn-primary btn-sm" onClick={() => guardar(p.id)} disabled={saving[p.id]}>
                            {saving[p.id] ? '...' : 'Guardar'}
                          </button>
                          {msg === 'ok' && <span style={{ color: 'var(--success)' }}>✓</span>}
                          {msg && msg !== 'ok' && <span style={{ color: 'var(--danger)', fontSize: '0.7rem' }}>{msg}</span>}
                        </div>
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
