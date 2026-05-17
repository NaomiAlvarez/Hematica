# Arquitectura del proyecto

Hematica es una aplicacion full stack orientada a gestionar el flujo de atencion de estudios clinicos veterinarios. El sistema separa responsabilidades entre una API REST, una interfaz web y una base de datos relacional.

## Componentes principales

```text
Usuario en navegador
    |
    v
Frontend React
    |
    | fetch HTTP + JSON + JWT
    v
Backend Django REST Framework
    |
    | Django ORM
    v
MySQL 8
```

## Backend

El backend esta en `backend-django/` y expone una API versionada bajo `/api/v1/`.

Responsabilidades:

- validar credenciales;
- emitir y validar JWT;
- aplicar permisos por rol;
- validar datos de entrada;
- operar modelos de dominio;
- guardar auditoria;
- generar notificaciones internas;
- validar archivos PDF;
- exponer datos al frontend.

## Frontend

El frontend esta en `frontend/` y usa React con React Router. Consume la API mediante `fetch`.

Responsabilidades:

- manejar sesion en navegador;
- proteger rutas por rol;
- presentar pantallas para administradores, veterinarios y clientes;
- enviar formularios al backend;
- mostrar estados, resultados, notificaciones y reportes.

## Base de datos

La base de datos es MySQL 8. Django administra el esquema mediante migraciones por aplicacion.

Entidades centrales:

- `usuario` y `tipo_usuario`;
- `cliente`, `paciente`, `especie`, `raza`;
- `empleado`, `tipo_empleado`, `veterinario`, `veterinario_cliente`;
- `catalogo_estudio`;
- `solicitud`, `solicitud_estudio`;
- `resultado_estudio`, `historial_clinico`;
- `auditoria`, `notificacion`, `password_reset_token`.

## Flujo funcional principal

1. Un usuario se registra o inicia sesion.
2. El frontend recibe un JWT y lo guarda en `localStorage`.
3. Las peticiones protegidas incluyen `Authorization: Bearer <token>`.
4. El backend identifica al usuario desde el token.
5. `apps/security.py` calcula el rol y alcance de datos.
6. Los ViewSets filtran datos segun rol y relacion con clientes/pacientes.
7. Las acciones relevantes crean auditoria y notificaciones.
8. El frontend refresca listas, reportes o estados segun la pantalla.

## Principios de diseno observados

- API REST organizada por modulos del dominio.
- Prefijo comun `/api/v1/` para facilitar versionado.
- Separacion entre modelos, serializers, vistas y rutas.
- Permisos centralizados en utilidades de seguridad.
- Uso de migraciones para versionar estructura de base de datos.
- Frontend dividido por paginas y componentes reutilizables.

## Dependencias principales

Backend:

- Django 6.0.3.
- Django REST Framework 3.17.1.
- Simple JWT 5.4.0.
- PyMySQL.
- django-cors-headers.

Frontend:

- React 19.
- React DOM 19.
- React Router DOM 7.
- ECharts.
- Axios, aunque la mayor parte del codigo usa `fetch`.

## Comunicacion entre capas

La comunicacion entre frontend y backend ocurre con JSON. Los endpoints de carga de PDF usan `multipart/form-data`.

El frontend espera que la API este en:

```text
http://localhost:8000/api/v1
```

La URL se puede cambiar mediante:

```text
REACT_APP_API_URL
```

## Archivos de entrada importantes

| Archivo | Papel |
| --- | --- |
| `backend-django/manage.py` | CLI de Django. |
| `backend-django/hematica_project/settings.py` | Configuracion global. |
| `backend-django/hematica_project/urls.py` | Registro de rutas principales. |
| `backend-django/apps/security.py` | Roles, permisos, auditoria, notificaciones y validacion PDF. |
| `frontend/src/index.js` | Montaje React e interceptor global de `fetch`. |
| `frontend/src/App.js` | Rutas, sesion y proteccion por rol. |
| `docker-compose.yml` | Orquestacion local de Django y MySQL. |
