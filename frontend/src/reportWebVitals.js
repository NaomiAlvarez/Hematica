// Hook opcional de Create React App para medir rendimiento en navegador.
// Si se pasa una funcion, recibe CLS, FID, FCP, LCP y TTFB.
const reportWebVitals = onPerfEntry => {
  // Verifica que se haya pasado una función válida para recibir los datos de rendimiento
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
