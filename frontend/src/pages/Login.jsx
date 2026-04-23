import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    role: 'usuario',
    petName: '' 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegistering) {
      alert("Solicitud enviada. El laboratorio se pondrá en contacto para activar su cuenta.");
      setIsRegistering(false);
    } else {
      onLogin(formData.role);
    }
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
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>TELÉFONO</label>
            <input
              type="tel"
              name="phone"
              placeholder="Tu número de contacto"
              value={formData.phone}
              onChange={handleChange}
              required
            />
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
                required
              />
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
              required
            />
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
            {isRegistering ? 'SOLICITAR ALTA' : 'ACCEDER'}
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
        </form>
      </div>
    </div>
  );
};

export default Login;