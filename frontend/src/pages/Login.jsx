import React, { use, useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
const [errors,setErrors]=useState({});
const [loading, setLoading]=useState(false);
const [success, setSuccess] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    role: 'usuario',
    petName: '' 
  });
  if (success) {
    return (
      <div className="success-container">
        <h2>🐾 Solicitud enviada 🐾</h2>
        <p>El laboratorio se pondrá en contacto contigo</p>
        <div className="huellas">
          🐾 🐾 🐾 🐾 🐾
        </div>
      </div>
    );
  }


  const handleChange = (e) => {
   const {name, value} = e.target;
   const limpio = value.replace (/<[^>]*>?/gm, '');
   setFormData({...formData,[name]: limpio});
   setErrors({...errors,[name]: ''});
  };

  const validar =() => {
    let nuevosErrores={};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      nuevosErrores.email = "Correo electrónico no válido";
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      nuevosErrores.phone = "Número de teléfono debe tener 10 dígitos";
    }
    if (formData.password.length <8 ) {
      nuevosErrores.password = "La contraseña debe tener al menos 8 caracteres";
    }
    if (isRegistering && formData.petName.length<2) {
      nuevosErrores.petName = "El nombre de la mascota debe tener al menos 2 caracteres";
    }
    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

 const handleSubmit = (e) => {
  e.preventDefault();

  if (!validar()) return;

  setLoading(true);

  setTimeout(() => {
    setLoading(false);
    setSuccess(true);
  }, 2000);
};

  return (
    /* SOLUCIÓN AL ERROR: Aplicamos el fondo aquí directamente. 
       Esto evita que Webpack intente buscar el archivo en /src/pages/
    */
    <div 
      className="login-screen" 
      style={{ backgroundImage: "url('/huellas.jpg')" }}
    >
      <div className="login-overlay"></div>
      
      <div className="login-card">
        <div className="login-logo-circle">
          <div className="circle-content">
            <img src="/hematica.jpeg" alt="Logo" className="logo-img-login" />
          </div>
        </div>

        <h2>{isRegistering ? 'REGISTRO' : 'BIENVENIDO'}</h2>
        <p>{isRegistering ? 'Inicia el alta de tu cuenta clínica' : 'Laboratorio Clínico Hemática'}</p>

        <form onSubmit={handleSubmit} className="login-form-container">
          <div className="input-group">
            <label>CORREO ELECTRÓNICO</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label>TELÉFONO</label>
            <input
              type="tel"
              name="phone"
              placeholder="Tu número de contacto"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>} 
          </div>

          {isRegistering && (
            <div className="input-group">
              <label>NOMBRE DE LA MASCOTA</label>
              <input
                type="text"
                name="petName"
                placeholder="Nombre de tu paciente"
                value={formData.petName}
                onChange={handleChange}
                className={errors.petName ? 'input-error' : ''}
              />
              {errors.petName && <span className="error-message">{errors.petName}</span>} 
            </div>
          )}

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

          {!isRegistering && (
            <div className="input-group">
              <label>TIPO DE ACCESO</label>
              <select 
                name="role" 
                className="login-select"
                value={formData.role} 
                onChange={handleChange}
              >
                <option value="usuario">Usuario (Paciente)</option>
                <option value="admin">Personal (Administrativo)</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-login">
            {loading ? 'CARGANDO...' : isRegistering ? 'SOLICITAR ALTA' : 'INICIAR ACCEDER'}
          </button>

          <div className="login-footer-links">
            <p>{isRegistering ? '¿Ya tienes una cuenta?' : '¿Cliente nuevo?'}</p>
            <button 
              type="button" 
              className="btn-register-link"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? 'REGRESAR AL LOGIN' : 'CREAR CUENTA'}
            </button>
          </div>
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
{success && (
  <div className="success-overlay">
    <div className="success-box">
      <h2>Solicitud enviada 🐾</h2>
      <p>Nos pondremos en contacto contigo</p>
    </div>
  </div>
)}      
        </form>
      </div>
    </div>
  );
};

export default Login;