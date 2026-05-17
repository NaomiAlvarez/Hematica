# Backend Django

El backend vive en `backend-django/`. Implementa una API REST con Django REST Framework y usa MySQL como base de datos.

## Estructura

```text
backend-django/
+-- apps/
|   +-- usuarios/
|   +-- pacientes/
|   +-- empleados/
|   +-- estudios/
|   +-- solicitudes/
|   +-- security.py
+-- hematica_project/
|   +-- settings.py
|   +-- urls.py
|   +-- asgi.py
|   +-- wsgi.py
+-- manage.py
+-- requirements.txt
+-- Dockerfile
```

## Configuracion principal

Archivo: `backend-django/hematica_project/settings.py`

Incluye:

- carga manual de `.env`;
- configuracion MySQL;
- aplicaciones instaladas;
- CORS;
- rutas de media;
- duracion de JWT;
- correo de recuperacion de contrasena.

El proyecto usa PyMySQL como reemplazo de `mysqlclient`.

## Rutas principales

Archivo: `backend-django/hematica_project/urls.py`

```text
/admin/
/api/v1/
/api/v1/auth/
/media/
```

Cada aplicacion registra sus rutas usando `include()`.

## Modulo usuarios

Carpeta: `backend-django/apps/usuarios/`

Responsabilidades:

- tipos de usuario;
- usuarios;
- registro;
- login;
- recuperacion de contrasena;
- perfil propio;
- administracion de usuarios;
- cambio de roles;
- notificaciones;
- auditoria.

Modelos:

- `TipoUsuario`;
- `Usuario`;
- `Auditoria`;
- `Notificacion`;
- `PasswordResetToken`.

Vistas importantes:

- `RegisterView`;
- `LoginView`;
- `MeView`;
- `ActualizarUsuarioView`;
- `AdminUsuariosView`;
- `AdminTiposUsuarioView`;
- `AdminAsignarRolView`;
- `PasswordResetRequestView`;
- `PasswordResetConfirmView`;
- `NotificacionesView`;
- `AdminAuditoriaView`.

## Modulo pacientes

Carpeta: `backend-django/apps/pacientes/`

Responsabilidades:

- especies;
- razas;
- clientes/tutores;
- pacientes/mascotas;
- carga de cartilla PDF.

Modelos:

- `Especie`;
- `Raza`;
- `Cliente`;
- `Paciente`.

Filtros:

- `GET /razas/?id_especie=1`;
- `GET /pacientes/?id_cliente=1`;
- `GET /pacientes/?nombre=luna`.

Acciones:

- `PATCH /pacientes/{id}/subir_cartilla/`;
- `PATCH /pacientes/{id}/eliminar_cartilla/`.

## Modulo empleados

Carpeta: `backend-django/apps/empleados/`

Responsabilidades:

- tipos de empleado;
- empleados;
- veterinarios;
- asignacion de clientes a veterinarios.

Modelos:

- `TipoEmpleado`;
- `Empleado`;
- `Veterinario`;
- `VeterinarioCliente`.

Acciones:

- `GET /veterinarios/{id}/clientes/`;
- `POST /veterinarios/{id}/asignar_cliente/`;
- `POST /veterinarios/{id}/desasignar_cliente/`;
- `GET /veterinarios/mis_clientes/`.

## Modulo estudios

Carpeta: `backend-django/apps/estudios/`

Responsabilidades:

- catalogo de estudios disponibles;
- nombre y precio de cada estudio.

Modelo:

- `CatalogoEstudio`.

Permisos:

- lectura para usuarios autenticados;
- escritura solo para administradores.

## Modulo solicitudes

Carpeta: `backend-django/apps/solicitudes/`

Responsabilidades:

- solicitudes de estudio;
- estudios asociados a cada solicitud;
- resultados;
- historial clinico;
- reportes simples;
- carga de PDF de resultados.

Modelos:

- `Solicitud`;
- `SolicitudEstudio`;
- `ResultadoEstudio`;
- `HistorialClinico`.

Estados de solicitud:

- `pendiente`;
- `en_proceso`;
- `muestra_recibida`;
- `resultado_cargado`;
- `finalizado`;
- `rechazado`;
- `cancelado`.

Acciones:

- `PATCH /solicitudes/{id}/cambiar_estado/`;
- `GET /solicitudes/reporte_por_estado/`;
- `PATCH /resultados/{id}/subir_pdf/`;
- `PATCH /resultados/{id}/eliminar_pdf/`;
- `GET /historial/reporte_por_paciente/`.

## Seguridad y permisos

Archivo: `backend-django/apps/security.py`

Funciones clave:

- `get_usuario_from_request`: lee el JWT y obtiene el usuario.
- `role_slug`: normaliza el rol a `admin`, `veterinario` o `cliente`.
- `accessible_cliente_ids`: determina que clientes puede consultar un usuario.
- `user_can_access_cliente`: valida acceso a un cliente.
- `user_can_access_paciente`: valida acceso a un paciente.
- `audit`: crea registros de auditoria.
- `notify_usuario` y `notify_admins`: crean notificaciones internas.
- `validate_pdf_upload`: valida archivos PDF.

Mixins:

- `AuthenticatedViewSetMixin`: exige token valido en ViewSets.
- `AdminWriteMixin`: permite lectura autenticada y restringe escritura a admin.

## Convenciones de desarrollo backend

- Mantener modelos en `models.py`.
- Exponer JSON mediante serializers.
- Agregar permisos cerca del ViewSet o en `security.py` si son reutilizables.
- Registrar cambios importantes con `audit`.
- Notificar al usuario cuando el evento sea visible en la interfaz.
- Crear migraciones despues de cambios de modelos:

```bash
docker compose exec django python manage.py makemigrations
docker compose exec django python manage.py migrate
```

## Pruebas

Cada app tiene archivo `tests.py`. Para ejecutar:

```bash
docker compose exec django python manage.py test
```

La cobertura actual es basica. Se recomienda ampliar pruebas de permisos, flujos y validacion de archivos.
