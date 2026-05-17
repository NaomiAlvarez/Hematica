# Guia de codigo

Esta guia explica donde vive la logica principal del proyecto y que archivo se
debe revisar cuando se quiera entender o modificar una funcionalidad.

## Como leer el proyecto

1. Empieza por `README.md` para entender el problema y el flujo general.
2. Revisa `docs/ARQUITECTURA.md` para ubicar frontend, backend y base de datos.
3. Usa este documento para navegar archivo por archivo.
4. Consulta `API_CONTRACT.md` antes de cambiar rutas o payloads.

## Backend Django

El backend esta en `backend-django/`. Cada app de Django sigue el mismo patron:

| Archivo | Que contiene |
| --- | --- |
| `models.py` | Tablas y relaciones de base de datos. |
| `serializers.py` | Conversion entre modelos Django y JSON de la API. |
| `views.py` | Endpoints, permisos, filtros, validaciones y efectos secundarios. |
| `urls.py` | Registro de rutas publicadas por Django REST Framework. |
| `admin.py` | Registro de modelos en el admin de Django. |
| `apps.py` | Configuracion tecnica de la app Django. |
| `migrations/` | Historial generado por Django para cambios de esquema. No se edita a mano salvo casos controlados. |

### Configuracion global

| Archivo | Responsabilidad |
| --- | --- |
| `backend-django/manage.py` | CLI de Django para migraciones, pruebas y comandos administrativos. |
| `backend-django/hematica_project/settings.py` | Variables de entorno, apps instaladas, base de datos, CORS, JWT, correo y archivos media. |
| `backend-django/hematica_project/urls.py` | Une todas las rutas bajo `/api/v1/` y habilita archivos `media` en desarrollo. |
| `backend-django/hematica_project/asgi.py` / `wsgi.py` | Entradas estandar para servidores ASGI/WSGI. |
| `backend-django/requirements.txt` | Dependencias Python del backend. |

### Seguridad transversal

| Archivo | Responsabilidad |
| --- | --- |
| `backend-django/apps/security.py` | Lee el JWT, normaliza roles, calcula que clientes puede ver cada usuario, valida PDFs, crea auditoria y notificaciones. |

Regla mental importante: si el cambio afecta permisos, alcance de datos,
auditoria, notificaciones o validacion de PDFs, probablemente empieza en
`apps/security.py` y despues se aplica en el ViewSet correspondiente.

### Usuarios

| Archivo | Responsabilidad |
| --- | --- |
| `apps/usuarios/models.py` | Roles (`TipoUsuario`), usuarios, auditoria, notificaciones y tokens de recuperacion. |
| `apps/usuarios/serializers.py` | Respuestas publicas de usuario, registro con password cifrado, auditoria y notificaciones. |
| `apps/usuarios/views.py` | Registro, login, `me`, actualizar cuenta, reset password, administracion de usuarios/roles, auditoria y notificaciones. |
| `apps/usuarios/urls.py` | Rutas bajo `/api/v1/auth/`. |

Flujos clave:

- Login: `LoginView` valida correo/password y genera JWT.
- Sesion actual: `MeView` permite que React reconstruya sesion al refrescar.
- Registro: `RegisterView` crea usuario y, si es tutor, crea `Cliente`.
- Roles: `AdminAsignarRolView` cambia rol y mantiene consistencia con Cliente.

### Pacientes

| Archivo | Responsabilidad |
| --- | --- |
| `apps/pacientes/models.py` | Especies, razas, clientes/tutores y pacientes/mascotas. |
| `apps/pacientes/serializers.py` | JSON de especies, razas, clientes y pacientes con nombres calculados. |
| `apps/pacientes/views.py` | CRUD con filtros por rol, registro de mascotas y carga/eliminacion de cartilla PDF. |
| `apps/pacientes/urls.py` | Rutas `especies`, `razas`, `clientes` y `pacientes`. |

Flujo clave: `PacienteViewSet.get_queryset()` limita lo visible por rol. Las
acciones `subir_cartilla` y `eliminar_cartilla` controlan el PDF de vacunacion.

### Empleados y veterinarios

| Archivo | Responsabilidad |
| --- | --- |
| `apps/empleados/models.py` | Tipos de empleado, empleados, veterinarios y relacion veterinario-cliente. |
| `apps/empleados/serializers.py` | Datos laborales y profesionales listos para tablas del frontend. |
| `apps/empleados/views.py` | CRUD de empleados/veterinarios y asignacion o desasignacion de clientes. |
| `apps/empleados/urls.py` | Rutas `tipos-empleado`, `empleados` y `veterinarios`. |

Flujo clave: `VeterinarioViewSet.mis_clientes()` permite que el frontend cargue
clientes asignados al veterinario autenticado.

### Estudios

| Archivo | Responsabilidad |
| --- | --- |
| `apps/estudios/models.py` | Catalogo de estudios disponibles y precio actual. |
| `apps/estudios/serializers.py` | JSON simple del catalogo. |
| `apps/estudios/views.py` | Lectura para usuarios autenticados y escritura solo para admin. |
| `apps/estudios/urls.py` | Ruta `estudios`. |

### Solicitudes, resultados e historial

| Archivo | Responsabilidad |
| --- | --- |
| `apps/solicitudes/models.py` | Solicitudes, estudios dentro de una solicitud, resultados e historial clinico. |
| `apps/solicitudes/serializers.py` | JSON de solicitudes y estudios solicitados. |
| `apps/solicitudes/views.py` | Crear solicitudes, agregar estudios, cambiar estados y reportar por estado. |
| `apps/solicitudes/serializers_resultados.py` | JSON de resultados e historial clinico. |
| `apps/solicitudes/views_resultados.py` | Crear resultados, subir/eliminar PDF y consultar historial. |
| `apps/solicitudes/urls.py` | Rutas `solicitudes`, `solicitud-estudios`, `resultados` e `historial`. |

Flujo central:

1. `SolicitudViewSet.perform_create()` crea la solicitud y notifica a admins.
2. `SolicitudEstudioViewSet.perform_create()` agrega estudios seleccionados.
3. `SolicitudViewSet.cambiar_estado()` mueve la solicitud por el flujo.
4. `ResultadoEstudioViewSet.perform_create()` crea el resultado, actualiza la
   solicitud a `resultado_cargado`, crea historial inicial y notifica al tutor.
5. `ResultadoEstudioViewSet.subir_pdf()` valida y guarda el PDF final.

## Frontend React

El frontend esta en `frontend/src/`.

| Archivo | Responsabilidad |
| --- | --- |
| `index.js` | Monta React y agrega automaticamente el token Bearer a llamadas contra la API. |
| `App.js` | Reconstruye sesion, calcula rol y protege rutas por rol. |
| `App.css`, `index.css`, `pages/*.css`, `components/*.css` | Estilos globales, de paginas y componentes. |
| `reportWebVitals.js` | Punto opcional para metricas de rendimiento. |
| `setupTests.js`, `App.test.js` | Configuracion y prueba base de Create React App. |

### Componentes reutilizables

| Archivo | Responsabilidad |
| --- | --- |
| `components/Navbar.jsx` | Menu por rol, cierre de sesion y notificaciones. |
| `components/ListingControls.jsx` | Busqueda normalizada, paginacion y selector de tamano de pagina. |

### Paginas

| Archivo | Responsabilidad |
| --- | --- |
| `pages/Login.jsx` | Login, registro y solicitud de recuperacion de contrasena. |
| `pages/ResetPassword.jsx` | Confirmacion del token de recuperacion y nueva contrasena. |
| `pages/Home.jsx` | Pantalla inicial de usuario autenticado. |
| `pages/Dashboard.jsx` | KPIs, graficas y resumen administrativo. |
| `pages/Usuarios.jsx` | Administracion de usuarios y cambio de roles. |
| `pages/Pacientes.jsx` | Tabla administrativa de pacientes. |
| `pages/MisMascotas.jsx` | Mascotas del tutor/admin, historial y cartilla PDF. |
| `pages/MisPacientes.jsx` | Pacientes que puede gestionar veterinario o tutor. |
| `pages/Empleados.jsx` | Registro/edicion de empleados, veterinarios y asignaciones de clientes. |
| `pages/Estudios.jsx` | Catalogo de estudios y precios. |
| `pages/Solicitudes.jsx` | Creacion, modificacion, estados y cierre de solicitudes. |
| `pages/ResultadoEstudio.jsx` | Listado de resultados, formulario de bioquimica y PDFs. |
| `pages/EditarCuenta.jsx` | Edicion de datos propios del usuario autenticado. |

## Donde cambiar cosas comunes

| Cambio deseado | Archivos principales |
| --- | --- |
| Agregar un endpoint | `models.py` si hay datos nuevos, `serializers.py`, `views.py`, `urls.py`, `API_CONTRACT.md`. |
| Cambiar permisos por rol | `backend-django/apps/security.py` y el `ViewSet` afectado. |
| Agregar campo a una tabla | `models.py`, migracion de Django, serializer, frontend que muestra o envia el campo. |
| Cambiar una ruta de frontend | `frontend/src/App.js` y posiblemente `Navbar.jsx`. |
| Cambiar formularios de solicitudes | `frontend/src/pages/Solicitudes.jsx` y `apps/solicitudes/views.py`. |
| Cambiar PDFs de resultados | `frontend/src/pages/ResultadoEstudio.jsx` y `apps/solicitudes/views_resultados.py`. |
| Cambiar notificaciones | `apps/security.py`, vistas que llamen `notify_usuario` o `notify_admins`, y `Navbar.jsx`. |

## Reglas para documentar cambios futuros

- Explica el "por que" en comentarios, no solo el "que".
- Actualiza `API_CONTRACT.md` si cambian rutas, parametros o respuestas.
- Actualiza esta guia cuando agregues una pantalla, app Django o flujo nuevo.
- Evita documentar codigo obvio linea por linea; documenta decisiones, permisos,
  filtros y efectos secundarios.
