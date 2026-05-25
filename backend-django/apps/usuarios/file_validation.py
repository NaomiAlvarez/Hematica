def is_pdf_upload(archivo):
    if not archivo or not archivo.name.lower().endswith('.pdf'):
        return False

    pos = archivo.tell() if hasattr(archivo, 'tell') else None
    try:
        encabezado = archivo.read(5)
        if isinstance(encabezado, str):
            encabezado = encabezado.encode('latin1')
        return encabezado == b'%PDF-'
    finally:
        if pos is not None and hasattr(archivo, 'seek'):
            archivo.seek(pos)
