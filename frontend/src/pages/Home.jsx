import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div 
      className="home-container" 
      style={{ backgroundImage: "url('/huellas.jpg')" }} // La ruta se queda aquí, React la entiende mejor
    >
      <div className="home-overlay"></div>
      
      <div className="center-card">
        <div className="logo-square">
          <img src="/hematica.jpeg" alt="Logo" className="main-logo" />
        </div>

        <div className="text-content">
          <h1 className="main-title">HEMÁTICA</h1>
          <h2 className="subtitle">Laboratorio de Alta Especialidad Veterinaria</h2>
        </div>
      </div>
    </div>
  );
};

export default Home;