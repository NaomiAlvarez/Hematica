# Roles y seguridad

Este documento resume como Hematica maneja autenticacion, autorizacion, auditoria y archivos.

## Autenticacion

El backend usa JWT con `djangorestframework-simplejwt`.

Flujo:

1. El usuario envia correo y contrasena a `/api/v1/auth/login/`.
2. El backend valida la contrasena con `check_password`.
3. Se emite `access` y `refresh`.
4. El frontend guarda ambos tokens en `localStorage`.
5. Las peticiones protegidas agregan `Authorization: Bearer <access>`.
6. El backend lee el token y obtiene el usuario con `get_usuario_from_request`.

Duracion configurada:

- Access token: 8 horas.
- Refresh token: 1 dia.

## Roles

La funcion `role_slug(usuario)` normaliza los roles.

| Resultado | Condicion |
| --- | --- |
| `admin` | `id_tipo_usuario` igual a 4 o descripcion `admin`/`administrador`. |
| `veterinario` | `id_tipo_usuario` igual a 2 o descripcion `veterinario`. |
| `cliente` | Cualquier otro caso. |

## Alcance de datos

La funcion `accessible_cliente_ids(usuario)` define el alcance:

| Rol | Alcance |
| --- | --- |
| Admin | Todos los clientes. |
| Cliente | Solo su propio `Cliente`. |
| Veterinario | Clientes asignados en `veterinario_cliente`. |

Este alcance se usa para filtrar pacientes, clientes, solicitudes, resultados e historial.

## Reglas principales por modulo

### Catalogos

Especies, razas, tipos de empleado y estudios:

- lectura para usuarios autenticados;
- escritura restringida a administradores.

### Pacientes

- Admin puede ver y administrar todos.
- Cliente puede ver y modificar pacientes propios.
- Veterinario puede ver pacientes de clientes asignados.
- Eliminar pacientes esta restringido a admin.

### Empleados

- Gestion de empleados restringida a admin.
- Veterinarios pueden consultar su propio registro.

### Solicitudes

- Cliente puede crear solicitudes para sus pacientes.
- Veterinario puede trabajar con solicitudes de pacientes asignados.
- Admin puede gestionar todas.
- Cambiar estado requiere admin o veterinario.

### Resultados

- Crear/editar resultados requiere admin o veterinario.
- Eliminar resultados requiere admin.
- Subir PDF requiere admin o veterinario.
- Eliminar PDF requiere admin.

### Historial clinico

- Lectura filtrada por alcance.
- Edicion restringida a admin o veterinario.
- Eliminacion restringida a admin.

## Auditoria

La funcion `audit()` crea registros en la tabla `auditoria`.

Se auditan acciones como:

- crear, editar y eliminar registros;
- cambio de estado de solicitudes;
- asignar o desasignar clientes;
- actualizar cuenta;
- recuperar contrasena;
- cargar o eliminar PDFs;
- cambiar roles.

Los administradores pueden consultar:

```text
GET /api/v1/auth/auditoria/
```

## Notificaciones

Las funciones `notify_usuario()` y `notify_admins()` crean notificaciones internas.

Eventos notificados:

- nueva solicitud pendiente para administradores;
- cambio de estado de solicitud para el tutor;
- resultado disponible;
- PDF de resultado listo.

El frontend consulta:

```text
GET /api/v1/auth/notificaciones/
```

Y marca como leida:

```text
PATCH /api/v1/auth/notificaciones/{id}/leer/
```

## Validacion de PDFs

`validate_pdf_upload()` valida:

- que exista archivo;
- extension `.pdf`;
- tamano maximo de 10 MB;
- `content_type` compatible con PDF si viene informado;
- cabecera real `%PDF-`.

Se usa para:

- cartilla PDF de pacientes;
- PDF de resultados.

## Recomendaciones de seguridad para produccion

- `DEBUG=False`.
- `SECRET_KEY` fuerte y privada.
- `ALLOWED_HOSTS` limitado al dominio real.
- CORS restringido al frontend real.
- HTTPS obligatorio.
- SMTP real para recuperacion de contrasena.
- No guardar tokens de larga duracion en entornos compartidos.
- Respaldos periodicos de MySQL.
- Controlar permisos de archivos media.
- Revisar auditoria ante operaciones sensibles.
