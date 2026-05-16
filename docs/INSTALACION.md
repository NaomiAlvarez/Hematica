# Guia de instalacion

Esta guia explica como levantar Hematica en un entorno local de desarrollo.

## Requisitos

- Docker Desktop instalado y en ejecucion.
- Node.js con npm.
- Git.
- Puerto `8000` libre para Django.
- Puerto `3306` libre para MySQL, o ajustar el puerto en `docker-compose.yml`.
- Puerto `3000` libre para React.

## 1. Preparar variables de entorno

Desde la raiz del proyecto:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Para desarrollo local se pueden usar los valores por defecto. Para produccion deben cambiarse `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, CORS y configuracion de correo.

## 2. Levantar backend y base de datos

```bash
docker compose up --build
```

Servicios levantados:

- `db`: MySQL 8.
- `django`: servidor Django en `http://localhost:8000`.

## 3. Aplicar migraciones

En otra terminal:

```bash
docker compose exec django python manage.py migrate
```

## 4. Crear superusuario opcional

```bash
docker compose exec django python manage.py createsuperuser
```

El panel administrativo queda en:

```text
http://localhost:8000/admin/
```

## 5. Levantar frontend

Desde la carpeta `frontend/`:

```bash
cp .env.example .env
npm install
npm start
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
npm install
npm start
```

El frontend queda en:

```text
http://localhost:3000
```

## 6. Verificar integracion

1. Abrir `http://localhost:3000`.
2. Registrar o iniciar sesion con un usuario existente.
3. Confirmar que las llamadas al backend llegan a `http://localhost:8000/api/v1`.
4. Revisar la consola del navegador si hay errores CORS o de autenticacion.

## Comandos frecuentes

Backend:

```bash
docker compose ps
docker compose logs django
docker compose logs db
docker compose exec django python manage.py migrate
docker compose exec django python manage.py test
docker compose down
```

Frontend:

```bash
cd frontend
npm start
npm test
npm run build
npm run preview
```

## Reiniciar base de datos local

Este comando elimina el volumen de MySQL y borra datos locales:

```bash
docker compose down -v
```

Despues vuelve a levantar y migrar:

```bash
docker compose up --build
docker compose exec django python manage.py migrate
```

## Problemas comunes

### Error de conexion a MySQL

Verificar que el servicio `db` este sano:

```bash
docker compose ps
docker compose logs db
```

### Error CORS

Revisar `.env`:

```text
CORS_ALLOW_ALL_ORIGINS=True
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Token requerido

La ruta necesita autenticacion. Inicia sesion y confirma que el frontend guarde `token` en `localStorage`.

### Puerto ocupado

Cambiar el mapeo de puertos en `docker-compose.yml` o cerrar el proceso que use el puerto.
