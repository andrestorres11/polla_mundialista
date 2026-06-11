'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nombre: '', email: '', empresa: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Las contrasenas no coinciden');
      return;
    }
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess('Registro exitoso! Redirigiendo...');
      setTimeout(() => router.push('/dashboard'), 1500);
      router.refresh();
    } else {
      setError(data.error || 'Error al registrarse');
    }
    setLoading(false);
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '3rem' }}>⚽</span>
        </div>
        <h1 className="auth-title">Crear Cuenta</h1>
        <p className="auth-subtitle">Inscripcion: $20.000 COP por participante</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre completo</label>
            <input
              required
              placeholder="Juan Perez"
              value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Correo electronico</label>
            <input
              type="email"
              required
              placeholder="tu@correo.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Empresa / Area</label>
            <input
              placeholder="Ej: OET, Desarrollo, RR.HH."
              value={form.empresa}
              onChange={e => setForm(p => ({ ...p, empresa: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Contrasena</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Minimo 6 caracteres"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Confirmar contrasena</label>
            <input
              type="password"
              required
              placeholder="Repetir contrasena"
              value={form.confirm}
              onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>

        <div className="auth-footer">
          Ya tienes cuenta?{' '}
          <Link href="/login">Ingresar</Link>
        </div>
      </div>
    </div>
  );
}
