import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './Login.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!token) {
      setError('El enlace de recuperacion no es valido.');
      return;
    }
    if (password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmacion) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/password-reset/confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo actualizar la contrasena');
      setMensaje('Contrasena actualizada. Ya puedes iniciar sesion.');
      setPassword('');
      setConfirmacion('');
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen" style={{ backgroundImage: "url('/huellas.jpg')" }}>
      <div className="login-overlay"></div>
      <div className="login-card">
        <h2>RECUPERAR CONTRASENA</h2>
        <p>Define una nueva contrasena para tu cuenta</p>

        <form onSubmit={guardar} className="login-form-container">
          <div className="input-group">
            <label>NUEVA CONTRASENA</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 8 caracteres"
            />
          </div>
          <div className="input-group">
            <label>CONFIRMAR CONTRASENA</label>
            <input
              type="password"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              placeholder="Repite la contrasena"
            />
          </div>

          {error && <span className="error-message">{error}</span>}
          {mensaje && <div className="notice success">{mensaje}</div>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'GUARDANDO...' : 'ACTUALIZAR CONTRASENA'}
          </button>
          <div className="login-footer-links">
            <Link className="btn-register-link" to="/login">REGRESAR AL LOGIN</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
