# Dockerfile para el backend Django de Hemática
# Construye la imagen del servidor Django que corre dentro de Docker

# Imagen base: Python 3.12 en versión slim (más ligera, sin herramientas innecesarias)
FROM python:3.12-slim

# Directorio de trabajo dentro del contenedor
# Todo el código del proyecto se copia aquí
WORKDIR /app

# Copiar primero solo el requirements.txt para aprovechar el caché de Docker
# Si el requirements.txt no cambia, Docker no reinstala las dependencias
COPY requirements.txt .

# Instalar las dependencias de Python definidas en requirements.txt
RUN pip install -r requirements.txt

# Copiar el resto del código del proyecto al contenedor
COPY . .

# Comando que se ejecuta cuando el contenedor arranca
# Levanta el servidor Django en el puerto 8000 accesible desde cualquier IP
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]