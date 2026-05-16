# Operacion y mantenimiento

Esta guia contiene tareas comunes para operar Hematica en desarrollo local.

## Levantar servicios

```bash
docker compose up --build
```

## Detener servicios

```bash
docker compose down
```

## Ver estado

```bash
docker compose ps
```

## Ver logs

```bash
docker compose logs django
docker compose logs db
```

## Migraciones

Crear migraciones:

```bash
docker compose exec django python manage.py makemigrations
```

Aplicar migraciones:

```bash
docker compose exec django python manage.py migrate
```

Ver migraciones:

```bash
docker compose exec django python manage.py showmigrations
```

## Admin Django

Crear superusuario:

```bash
docker compose exec django python manage.py createsuperuser
```

Entrar a:

```text
http://localhost:8000/admin/
```

## Pruebas

Backend:

```bash
docker compose exec django python manage.py test
```

Frontend:

```bash
cd frontend
npm test
```

## Build del frontend

```bash
cd frontend
npm run build
npm run preview
```

`npm run preview` sirve el build desde `http://127.0.0.1:3000`.

## Archivos subidos

Los archivos PDF se guardan en `MEDIA_ROOT`, configurado como:

```text
backend-django/media/
```

En Docker Compose tambien existe un volumen `media_data` montado en `/app/media`.

Rutas publicas durante desarrollo:

```text
/media/cartillas/
/media/resultados/
```

## Correo

Por defecto el backend usa:

```text
django.core.mail.backends.console.EmailBackend
```

Esto imprime correos en consola durante desarrollo. Para SMTP real configurar:

```text
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
```

## Limpieza de entorno local

Detener y borrar volumenes:

```bash
docker compose down -v
```

Esto elimina datos de MySQL. Usarlo solo cuando se quiera reiniciar la base local.

## Respaldos

Para respaldar MySQL en desarrollo:

```bash
docker compose exec db mysqldump -uroot -proot hematica_db > backup.sql
```

Para restaurar:

```bash
docker compose exec -T db mysql -uroot -proot hematica_db < backup.sql
```

## Problemas comunes

### `Token requerido`

La peticion no incluyo header `Authorization`. Confirmar que el usuario inicio sesion y que `localStorage.token` existe.

### `Token invalido o expirado`

Iniciar sesion de nuevo o refrescar el token.

### `No tienes permisos`

El usuario autenticado no tiene rol o alcance suficiente. Revisar:

- `tipo_usuario`;
- relacion `cliente`;
- asignacion `veterinario_cliente`;
- estado de la solicitud.

### PDFs rechazados

Verificar:

- archivo no vacio;
- extension `.pdf`;
- tamano menor a 10 MB;
- archivo realmente PDF.

### Frontend no conecta con backend

Verificar:

- backend en `http://localhost:8000`;
- `.env` del frontend con `REACT_APP_API_URL`;
- CORS en `.env` del backend;
- consola del navegador.

## Lista antes de entregar

- Ejecutar migraciones desde cero.
- Probar login, registro y recuperacion de contrasena.
- Probar rutas por rol.
- Crear una solicitud completa hasta resultado.
- Subir y eliminar PDF de cartilla.
- Subir y eliminar PDF de resultado.
- Revisar auditoria.
- Ejecutar pruebas disponibles.
