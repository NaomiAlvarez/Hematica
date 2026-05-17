# Imagen del backend Django de Hematica.
# Se usa para levantar la API dentro de Docker Compose.

# Imagen base ligera para desarrollo.
FROM python:3.12-slim

# Directorio donde vive el codigo dentro del contenedor.
WORKDIR /app

# Copiar dependencias primero permite reutilizar la cache de Docker.
COPY requirements.txt .

# Instala las dependencias del backend.
RUN pip install -r requirements.txt

# Copia el codigo de la aplicacion.
COPY . .

# Servidor de desarrollo expuesto para el servicio django.
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
