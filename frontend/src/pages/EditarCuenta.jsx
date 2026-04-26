import React, { useState } from 'react';
import './Login.css';

const EditarCuenta = ({ usuario, onActualizar }) => {
  const [form, setForm] = useState({
    nombre: usuario?.nombre || '',
    num_tel: usuario?.num_tel || '',
    password: '',
    confirmar_password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value.replace(/<[^>]*>?/gm, '') }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validar = () => {
    let errores = {};
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,}(\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,})+$/;
    if (!form.nombre || !nombreRegex.test(form.nombre.trim()))
      errores.nombre = 'Ingresa tu nombre completo (nombre y apellido, solo letras)';
    const telRegex = /^[0-9]{10}$/;
    if (form.num_tel && !telRegex.test(form.num_tel))
      errores.num_tel = 'El teléfono debe tener exactamente 10 dígitos';
    if (form.password && form.password.length < 8)
      errores.password = 'La contraseña debe tener al menos 8 caracteres';
    if (form.password && form.password !== form.confirmar_password)
      errores.confirmar_password = 'Las contraseñas no coinciden';
    setErrors(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setLoading(true);
    try {
      const body = { nombre: form.nombre.trim() };
      if (form.num_tel) body.num_tel = form.num_tel;
      if (form.password) body.password = form.password;

      const res = await fetch(`http://localhost:8000/api/v1/auth/actualizar/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const data = await res.json();
        setErrors({ general: data.detail || 'Error al actualizar los datos.' });
        return;
      }

      const data = await res.json();
      // Actualizar datos en localStorage y estado global
      localStorage.setItem('userData', JSON.stringify({ ...usuario, ...data }));
      if (onActualizar) onActualizar({ ...usuario, ...data });
      setSuccess(true);
      setForm(prev => ({ ...prev, password: '', confirmar_password: '' }));
    } catch {
      setErrors({ general: 'No se pudo conectar al servidor.' });
    } finally {
      setLoading(false);
    }
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

        <h2>EDITAR CUENTA</h2>
        <p>Actualiza tu información personal</p>

        {success ? (
          <div className="success-inline">
            <div className="success-inline-icon">🐾</div>
            <h3>¡Datos actualizados!</h3>
            <p>Tu información se guardó correctamente.</p>
            <button type="button" className="btn-login" onClick={() => setSuccess(false)}>
              CONTINUAR
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form-container">

            <div className="input-group">
              <label>NOMBRE COMPLETO</label>
              <input type="text" name="nombre" value={form.nombre}
                onChange={handleChange} placeholder="Tu nombre completo"
                className={errors.nombre ? 'input-error' : ''} />
              {errors.nombre && <span className="error-message">{errors.nombre}</span>}
            </div>

            <div className="input-group">
              <label>TELÉFONO</label>
              <input type="tel" name="num_tel" value={form.num_tel}
                onChange={handleChange} placeholder="10 dígitos"
                className={errors.num_tel ? 'input-error' : ''} />
              {errors.num_tel && <span className="error-message">{errors.num_tel}</span>}
            </div>

            <div className="input-group">
              <label>NUEVA CONTRASEÑA <span style={{ color: '#94a3b8', fontWeight: 'normal', fontSize: '11px' }}>(opcional)</span></label>
              <input type="password" name="password" value={form.password}
                onChange={handleChange} placeholder="Mínimo 8 caracteres"
                className={errors.password ? 'input-error' : ''} />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {form.password && (
              <div className="input-group">
                <label>CONFIRMAR CONTRASEÑA</label>
                <input type="password" name="confirmar_password" value={form.confirmar_password}
                  onChange={handleChange} placeholder="Repite la contraseña"
                  className={errors.confirmar_password ? 'input-error' : ''} />
                {errors.confirmar_password && <span className="error-message">{errors.confirmar_password}</span>}
              </div>
            )}

            {errors.general && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>{errors.general}</p>
            )}

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
            </button>

            {loading && (
              <div className="success-overlay">
                <div className="success-box">
                  <h2>Guardando...</h2>
                  <div className="paw-container">
                    <img src="/gatito.png" className="paw-img" alt="huella" />
                    <img src="/gatito.png" className="paw-img" alt="huella" />
                    <img src="/gatito.png" className="paw-img" alt="huella" />
                    <img src="/gatito.png" className="paw-img" alt="huella" />
                  </div>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default EditarCuenta;