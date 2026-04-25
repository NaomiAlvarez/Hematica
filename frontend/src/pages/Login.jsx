import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {

  // Estado para errores por campo
  const [errors, setErrors] = useState({});

  // Estado para deshabilitar botón mientras carga
  const [loading, setLoading] = useState(false);

  // Estado para mostrar mensaje de éxito dentro de la card
  const [success, setSuccess] = useState(false);

  // Estado para alternar entre login y registro
  const [isRegistering, setIsRegistering] = useState(false);

  // Estado del formulario con todos los campos
  const [formData, setFormData] = useState({
    correo: '',
    password: '',
    nombre: '',
    num_tel: '',
  });

  // Sanitiza el input eliminando etiquetas HTML para prevenir XSS
  const handleChange = (e) => {
    const { name, value } = e.target;
    const limpio = value.replace(/<[^>]*>?/gm, '');
    setFormData({ ...formData, [name]: limpio });
    // Limpia el error del campo al corregirlo
    setErrors({ ...errors, [name]: '' });
  };

  // Función de validación de todos los campos
  const validar = () => {
    let nuevosErrores = {};

    // Validar correo con regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo || !emailRegex.test(formData.correo)) {
      nuevosErrores.correo = "Ingresa un correo electrónico válido";
    }

    // Validar contraseña mínimo 8 caracteres
    if (!formData.password || formData.password.length < 8) {
      nuevosErrores.password = "La contraseña debe tener al menos 8 caracteres";
    }

    // Validaciones adicionales solo al registrarse
    if (isRegistering) {
      // Validar nombre completo: al menos nombre y apellido, solo letras y espacios
      const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,}(\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,})+$/;
      if (!formData.nombre || !nombreRegex.test(formData.nombre.trim())) {
        nuevosErrores.nombre = "Ingresa tu nombre completo (nombre y al menos un apellido, solo letras)";
      }

      // Validar teléfono exactamente 10 dígitos
      const telRegex = /^[0-9]{10}$/;
      if (!formData.num_tel || !telRegex.test(formData.num_tel)) {
        nuevosErrores.num_tel = "El teléfono debe tener exactamente 10 dígitos";
      }
    }

    setErrors(nuevosErrores);
    // Retorna true si no hay errores
    return Object.keys(nuevosErrores).length === 0;
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Si hay errores de validación, no continúa
    if (!validar()) return;

    setLoading(true);

    try {
      if (isRegistering) {
        // REGISTRO — crea usuario tipo Cliente
        const res = await fetch('http://localhost:8000/api/v1/auth/register/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            correo: formData.correo,
            password: formData.password,
            nombre: formData.nombre,
            num_tel: formData.num_tel,
            id_tipo_usuario: 1, // Siempre Cliente en registro público
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrors({ correo: data.correo?.[0] || data.detail || 'Error al registrarse' });
          setLoading(false);
          return;
        }

        // Registro exitoso — muestra mensaje dentro de la card
        setSuccess(true);

      } else {
        // LOGIN — autentica al usuario
        const res = await fetch('http://localhost:8000/api/v1/auth/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            correo: formData.correo,
            password: formData.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrors({ correo: 'Correo o contraseña incorrectos' });
          setLoading(false);
          return;
        }

        // Guarda token en localStorage
        localStorage.setItem('token', data.access);
        localStorage.setItem('userData', JSON.stringify(data.usuario));

        // Determina el rol según id_tipo_usuario
        const tipo = data.usuario?.id_tipo_usuario;
        let rol = 'usuario';
        if ([4, 8, 11].includes(tipo)) rol = 'admin';
        else if ([2, 6, 10].includes(tipo)) rol = 'veterinario';

        // Llama a onLogin para actualizar el estado global
        onLogin(rol, data.usuario);
      }

    } catch (error) {
      // Error de red o servidor caído
      setErrors({ correo: 'No se pudo conectar al servidor' });
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
        <p>{isRegistering ? 'Crea tu cuenta' : 'Laboratorio Clínico Hemática'}</p>

        {/* Si el registro fue exitoso muestra mensaje dentro de la card */}
        {success && isRegistering ? (
          <div className="success-inline">
            <div className="success-inline-icon">🐾</div>
            <h3>¡Registro exitoso!</h3>
            <p>El laboratorio se pondrá en contacto contigo.</p>
            <button
              type="button"
              className="btn-login"
              onClick={() => {
                setSuccess(false);
                setIsRegistering(false);
                setFormData({ correo: '', password: '', nombre: '', num_tel: '' });
                setErrors({});
              }}
            >
              IR AL LOGIN
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form-container">

            {/* Campo nombre — solo visible al registrarse */}
            {isRegistering && (
              <div className="input-group">
                <label>NOMBRE COMPLETO</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Tu nombre completo"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={errors.nombre ? 'input-error' : ''}
                />
                {errors.nombre && <span className="error-message">{errors.nombre}</span>}
              </div>
            )}

            {/* Campo correo */}
            <div className="input-group">
              <label>CORREO ELECTRÓNICO</label>
              <input
                type="email"
                name="correo"
                placeholder="correo@ejemplo.com"
                value={formData.correo}
                onChange={handleChange}
                className={errors.correo ? 'input-error' : ''}
              />
              {errors.correo && <span className="error-message">{errors.correo}</span>}
            </div>

            {/* Campo teléfono — solo visible al registrarse */}
            {isRegistering && (
              <div className="input-group">
                <label>TELÉFONO</label>
                <input
                  type="tel"
                  name="num_tel"
                  placeholder="10 dígitos"
                  value={formData.num_tel}
                  onChange={handleChange}
                  className={errors.num_tel ? 'input-error' : ''}
                />
                {errors.num_tel && <span className="error-message">{errors.num_tel}</span>}
              </div>
            )}

            {/* Campo contraseña */}
            <div className="input-group">
              <label>CONTRASEÑA</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {/* Botón principal — deshabilitado mientras carga */}
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'CARGANDO...' : isRegistering ? 'REGISTRAR' : 'INICIAR SESIÓN'}
            </button>

            {/* Link para alternar entre login y registro */}
            <div className="login-footer-links">
              <p>{isRegistering ? '¿Ya tienes cuenta?' : '¿Cliente nuevo?'}</p>
              <button
                type="button"
                className="btn-register-link"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrors({});
                  setFormData({ correo: '', password: '', nombre: '', num_tel: '' });
                }}
              >
                {isRegistering ? 'REGRESAR AL LOGIN' : 'CREAR CUENTA'}
              </button>
            </div>

            {/* Overlay de carga con gatitos */}
            {loading && (
              <div className="success-overlay">
                <div className="success-box">
                  <h2>Cargando...</h2>
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

export default Login;