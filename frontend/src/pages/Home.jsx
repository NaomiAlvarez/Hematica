import React from 'react';
import './Home.css';
// Importamos las imágenes desde tu carpeta assets
import fondo from '../assets/HematicaFondo.png';
import logo from '../assets/HematicaLogo.png';

const Home = () => {
  return (
    <div className="home-container" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${fondo})` }}>
      <div className="hero-content">
        <div className="circle-container">
          <img src={logo} alt="Hematica Logo" className="main-logo" />
        </div>
        <h2 className="subtitle">Laboratorio de Alta Especialidad Veterinaria</h2>
      </div>
    </div>
  );
};

export default Home;