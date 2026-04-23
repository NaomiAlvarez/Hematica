import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    correo: '',
    password: '',
    nombre: '',
    num_tel: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        const res = await fetch('http://localhost:8000/api/v1/auth/register/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre,
            correo: formData.correo,
            password: formData.password,
            num_tel: formData.num_tel,
            id_tipo_usuario: 1
          })
        });
        const data = await res.json();
        if (res.ok) {
          alert('Cuenta creada exitosamente. Ahora inicia sesion.');
          setIsRegistering(false);
        } else {
          setError(data.correo?.[0] || data.error || 'Error al registrar');
        }
      } else {
        const res = await fetch('http://localhost:8000/api/v1/auth/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            correo: formData.correo,
            password: formData.password
          })
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('token', data.access);
          localStorage.setItem('usuario', JSON.stringify(data.usuario));
          const tipoId = data.usuario.id_tipo_usuario;
          const role = (tipoId === 4 || tipoId === 8 || tipoId === 11) ? 'admin' 
           : (tipoId === 2 || tipoId === 6 || tipoId === 10) ? 'veterinario' 
           : 'usuario';
          onLogin(role, data.usuario);
        } else {
          setError(data.error || 'Credenciales incorrectas');
        }
      }
    } catch {
      setError('No se pudo conectar con el servidor');
    }
    setLoading(false);
  };

  return (
    <div className="login-screen" style={{ backgroundImage: "url('/huellas.jpg')" }}>
      <div className="login-overlay"></div>
      <div className="login-card">
        <div className="login-logo-circle">
          <div className="circle-content">
            <img src="/hematica.jpeg" alt="Logo" className="logo-img-login" />
          </div>
        </div>

        <h2>{isRegistering ? 'REGISTRO' : 'BIENVENIDO'}</h2>
        <p>{isRegistering ? 'Crea tu cuenta' : 'Laboratorio Clinico Hematica'}</p>

        <form onSubmit={handleSubmit} className="login-form-container">
          {isRegistering && (
            <>
              <div className="input-group">
                <label>NOMBRE COMPLETO</label>
                <input type="text" name="nombre" placeholder="Tu nombre" value={formData.nombre} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>TELEFONO</label>
                <input type="tel" name="num_tel" placeholder="3121234567" value={formData.num_tel} onChange={handleChange} required />
              </div>
            </>
          )}

          <div className="input-group">
            <label>CORREO ELECTRONICO</label>
            <input type="email" name="correo" placeholder="ejemplo@correo.com" value={formData.correo} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>CONTRASENA</label>
            <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Cargando...' : isRegistering ? 'CREAR CUENTA' : 'ACCEDER'}
          </button>

          <div className="login-footer-links">
            <p>{isRegistering ? '¿Ya tienes cuenta?' : '¿Cliente nuevo?'}</p>
            <button type="button" className="btn-register-link" onClick={() => { setIsRegistering(!isRegistering); setError(''); }}>
              {isRegistering ? 'REGRESAR AL LOGIN' : 'CREAR CUENTA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;