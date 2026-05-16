# Hematica

Sistema web para la gestion de solicitudes, pacientes, estudios clinicos, resultados y expedientes de un laboratorio veterinario.

El proyecto esta dividido en dos aplicaciones principales:

- **Backend:** API REST construida con Django, Django REST Framework y MySQL.
- **Frontend:** aplicacion web construida con React y Create React App.

La documentacion esta pensada para que una persona nueva pueda entender el proposito del sistema, levantarlo en local, navegar el codigo y extenderlo con seguridad.

## Tabla de contenido

- [Que problema resuelve](#que-problema-resuelve)
- [Usuarios del sistema](#usuarios-del-sistema)
- [Funcionalidades principales](#funcionalidades-principales)
- [Arquitectura general](#arquitectura-general)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Inicio rapido](#inicio-rapido)
- [Documentacion del proyecto](#documentacion-del-proyecto)
- [Contrato de API](#contrato-de-api)
- [Variables de entorno](#variables-de-entorno)
- [Scripts utiles](#scripts-utiles)
- [Estado de calidad](#estado-de-calidad)

## Que problema resuelve

Hematica digitaliza el flujo de trabajo de un laboratorio clinico veterinario. Permite registrar tutores, mascotas, veterinarios, catalogos de estudios, solicitudes de analisis, resultados, archivos PDF y notificaciones, evitando depender de registros manuales en hojas de calculo o documentos sueltos.

El flujo central del sistema es:

1. Un usuario inicia sesion o se registra.
2. Se registran pacientes veterinarios, es decir, mascotas asociadas a un tutor.
3. El tutor o personal autorizado crea solicitudes de estudio.
4. El laboratorio cambia el estado de la solicitud durante su atencion.
5. Un veterinario o administrador carga el resultado y, opcionalmente, un PDF.
6. El tutor recibe notificacion y puede consultar el resultado.
7. El historial clinico conserva registros asociados al paciente.

## Usuarios del sistema

El sistema maneja roles desde la tabla `tipo_usuario`.

| Rol | Proposito |
| --- | --- |
| Cliente | Tutor de mascotas. Puede gestionar sus pacientes, solicitudes y consultar resultados propios. |
| Veterinario | Atiende pacientes asignados, consulta solicitudes relacionadas y carga resultados. |
| Administrador | Gestiona catalogos, usuarios, empleados, veterinarios, asignaciones, solicitudes, resultados y auditoria. |

La logica de permisos vive principalmente en `backend-django/apps/security.py`.

## Funcionalidades principales

- Autenticacion con JWT.
- Registro, inicio de sesion, recuperacion de contrasena y perfil de usuario.
- Gestion de especies, razas, clientes y pacientes.
- Carga y eliminacion de cartillas PDF para pacientes.
- Gestion de empleados, tipos de empleado y veterinarios.
- Asignacion de clientes a veterinarios.
- Catalogo de estudios clinicos con precios.
- Solicitudes de estudio con estados de seguimiento.
- Resultados de estudio con reporte clinico y PDF.
- Historial clinico por paciente.
- Notificaciones internas para usuarios.
- Auditoria de acciones relevantes.
- Dashboard administrativo con datos de operacion.

## Arquitectura general

```text
Frontend React
    |
    | HTTP/JSON + Bearer Token
    v
Backend Django REST Framework
    |
    | ORM Django
    v
MySQL 8
```

En desarrollo local, Docker Compose levanta el backend Django y la base de datos MySQL. El frontend se ejecuta aparte con `npm start` dentro de `frontend/`.

## Estructura del repositorio

```text
Hematica/
+-- backend-django/
|   +-- apps/
|   |   +-- usuarios/       # Auth, roles, auditoria, notificaciones
|   |   +-- pacientes/      # Especies, razas, clientes y mascotas
|   |   +-- empleados/      # Empleados, veterinarios y asignaciones
|   |   +-- estudios/       # Catalogo de estudios disponibles
|   |   +-- solicitudes/    # Solicitudes, resultados e historial clinico
|   +-- hematica_project/   # Configuracion global de Django
|   +-- manage.py
|   +-- requirements.txt
|   +-- Dockerfile
+-- frontend/
|   +-- public/             # HTML base e imagenes publicas
|   +-- scripts/            # Servidor simple para previsualizar build
|   +-- src/
|       +-- components/     # Componentes reutilizables
|       +-- pages/          # Pantallas de la aplicacion
+-- docs/                   # Documentacion tecnica y funcional
+-- API_CONTRACT.md         # Contrato completo de endpoints
+-- docker-compose.yml      # Backend + MySQL
+-- .env.example            # Variables de entorno del backend
+-- package.json            # Dependencias auxiliares de generacion PDF
```

## Inicio rapido

### Requisitos

- Docker Desktop.
- Node.js y npm.
- Git.

### Backend y base de datos

```bash
cp .env.example .env
docker compose up --build
```

En otra terminal, aplica migraciones:

```bash
docker compose exec django python manage.py migrate
```

El backend queda disponible en:

- API: `http://localhost:8000/api/v1/`
- Admin Django: `http://localhost:8000/admin/`
- Archivos media: `http://localhost:8000/media/`

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

La aplicacion queda disponible en `http://localhost:3000`.

## Documentacion del proyecto

| Documento | Contenido |
| --- | --- |
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Vision tecnica, capas, modulos y flujo de datos. |
| [docs/GUIA_CODIGO.md](docs/GUIA_CODIGO.md) | Mapa archivo por archivo para entender donde vive cada parte de la logica. |
| [docs/INSTALACION.md](docs/INSTALACION.md) | Guia paso a paso para levantar el proyecto. |
| [docs/BACKEND.md](docs/BACKEND.md) | Modulos Django, modelos, permisos y convenciones. |
| [docs/FRONTEND.md](docs/FRONTEND.md) | Rutas, pantallas, estado de sesion y estructura React. |
| [docs/BASE_DE_DATOS.md](docs/BASE_DE_DATOS.md) | Entidades principales y relaciones. |
| [docs/ROLES_Y_SEGURIDAD.md](docs/ROLES_Y_SEGURIDAD.md) | Autenticacion, permisos, auditoria y archivos PDF. |
| [docs/OPERACION.md](docs/OPERACION.md) | Comandos diarios, despliegue local, mantenimiento y problemas comunes. |
| [docs/CONTRIBUCION.md](docs/CONTRIBUCION.md) | Reglas para modificar el proyecto sin romper convenciones. |
| [API_CONTRACT.md](API_CONTRACT.md) | Endpoints, metodos, permisos, filtros y acciones especiales. |

## Contrato de API

Todos los endpoints principales usan el prefijo:

```text
/api/v1/
```

Los endpoints de autenticacion usan:

```text
/api/v1/auth/
```

Las rutas protegidas requieren el header:

```http
Authorization: Bearer <access_token>
```

Consulta [API_CONTRACT.md](API_CONTRACT.md) para el detalle completo.

## Variables de entorno

El backend lee variables desde `.env` en la raiz del repositorio o dentro de `backend-django/`.

| Variable | Uso |
| --- | --- |
| `SECRET_KEY` | Clave secreta de Django. Obligatoria en produccion. |
| `DEBUG` | Activa o desactiva modo desarrollo. |
| `ALLOWED_HOSTS` | Hosts permitidos por Django. |
| `CORS_ALLOW_ALL_ORIGINS` | Permite CORS abierto en desarrollo. |
| `CORS_ALLOWED_ORIGINS` | Origenes permitidos para el frontend. |
| `FRONTEND_URL` | URL usada para enlaces de recuperacion de contrasena. |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | Conexion a MySQL. |
| `EMAIL_*` | Configuracion de correo para recuperacion de contrasena. |

El frontend usa:

| Variable | Uso |
| --- | --- |
| `REACT_APP_API_URL` | URL base del backend. Por defecto `http://localhost:8000/api/v1`. |

## Scripts utiles

Backend:

```bash
docker compose up --build
docker compose exec django python manage.py migrate
docker compose exec django python manage.py createsuperuser
docker compose exec django python manage.py test
```

Frontend:

```bash
cd frontend
npm start
npm test
npm run build
npm run preview
```

## Estado de calidad

El proyecto incluye archivos de prueba por aplicacion Django y pruebas base de React, pero la cobertura funcional todavia es limitada. Antes de una entrega formal o despliegue real conviene reforzar pruebas para:

- permisos por rol;
- flujo completo de solicitudes;
- carga y validacion de PDFs;
- recuperacion de contrasena;
- rutas protegidas del frontend.

## Notas de produccion

Antes de desplegar:

- Usar `DEBUG=False`.
- Definir `SECRET_KEY` fuerte y privada.
- Restringir `ALLOWED_HOSTS` y CORS.
- Configurar un servidor SMTP real.
- Servir archivos estaticos y media con infraestructura adecuada.
- Usar HTTPS.
- Revisar permisos y respaldos de base de datos.
