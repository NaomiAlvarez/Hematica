export async function abrirArchivoProtegido(url, nombre = 'archivo.pdf') {
  const res = await fetch(url);
  if (!res.ok) throw new Error('No se pudo abrir el archivo');

  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const opened = window.open(blobUrl, '_blank', 'noopener,noreferrer');

  if (!opened) {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = nombre;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
}
