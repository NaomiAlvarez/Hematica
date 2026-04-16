import { useState } from 'react'

export default function Login() {
  const [form, setForm] = useState({ correo: '', password: '' })
  
  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value })
    
  const handleSubmit = e => {
    e.preventDefault()
    console.log('Login:', form) // conectar API después
  }

  return (
    <div className="container mt-5">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Correo</label>
          <input 
            name="correo" 
            type="email" 
            className="form-control" 
            onChange={handleChange} 
          />
        </div>
        <div className="mb-3">
          <label>Contraseña</label>
          <input 
            name="password" 
            type="password" 
            className="form-control" 
            onChange={handleChange} 
          />
        </div>
        <button className="btn btn-primary" type="submit">Entrar</button>
      </form>
    </div>
  )
}