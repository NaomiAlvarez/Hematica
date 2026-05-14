import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const originalFetch = window.fetch.bind(window);
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

window.fetch = (input, init = {}) => {
  const url = typeof input === 'string' ? input : input?.url || '';
  const shouldAttachToken = url.startsWith(apiUrl) || url.startsWith('http://localhost:8000/api/v1');
  const token = localStorage.getItem('token');

  if (!shouldAttachToken || !token) {
    return originalFetch(input, init);
  }

  const headers = new Headers(init.headers || {});
  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return originalFetch(input, { ...init, headers });
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
