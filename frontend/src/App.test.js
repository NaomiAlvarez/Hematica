// Prueba base generada por Create React App.
// Debe actualizarse cuando exista una prueba real de rutas o login.
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
