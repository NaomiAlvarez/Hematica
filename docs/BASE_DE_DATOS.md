# Base de datos

Hematica usa MySQL 8 y administra el esquema con migraciones de Django.

## Entidades principales

```text
TipoUsuario 1---N Usuario
Usuario 1---1 Cliente
Usuario 1---1 Empleado
TipoEmpleado 1---N Empleado
Empleado 1---1 Veterinario
Veterinario N---N Cliente
Cliente 1---N Paciente
Especie 1---N Raza
Raza 1---N Paciente
Paciente 1---N Solicitud
Solicitud 1---N SolicitudEstudio
CatalogoEstudio 1---N SolicitudEstudio
Solicitud 1---1 ResultadoEstudio
Veterinario 1---N ResultadoEstudio
Paciente 1---N HistorialClinico
Usuario 1---N Notificacion
Usuario 1---N Auditoria
Usuario 1---N PasswordResetToken
```

## Usuarios

### `tipo_usuario`

Define roles del sistema.

Campos:

- `id_tipo_usuario`;
- `descripcion`.

### `usuario`

Representa a cualquier persona que usa el sistema.

Campos:

- `id_usuario`;
- `nombre`;
- `correo`;
- `password`;
- `num_tel`;
- `id_tipo_usuario`.

Notas:

- `correo` es unico.
- `password` se guarda cifrada con `make_password`.

## Pacientes

### `especie`

Catalogo de especies.

Campos:

- `id_especie`;
- `nombre`.

### `raza`

Razas asociadas a especies.

Campos:

- `id_raza`;
- `id_especie`;
- `nombre`.

### `cliente`

Tutor o propietario de mascotas.

Campos:

- `id_cliente`;
- `id_usuario`;
- `genero`.

### `paciente`

Mascota registrada en el sistema.

Campos:

- `id_paciente`;
- `id_cliente`;
- `id_raza`;
- `nombre`;
- `sexo`;
- `edad`;
- `peso`;
- `anamnesis`;
- `cartilla_pdf`.

## Empleados

### `tipo_empleado`

Catalogo de puestos.

Campos:

- `id_tipo_emp`;
- `puesto`;
- `descripcion`.

### `empleado`

Datos laborales vinculados a un usuario.

Campos:

- `id_emp`;
- `id_usuario`;
- `id_tipo_emp`;
- `nombre_clinica`;
- `telefono`;
- `direccion`.

### `veterinario`

Datos profesionales de un empleado veterinario.

Campos:

- `id_vet`;
- `id_emp`;
- `curp`;
- `cedula`.

### `veterinario_cliente`

Tabla intermedia para asignar clientes a veterinarios.

Campos:

- `id_vet`;
- `id_cliente`.

Restriccion:

- `unique_together = (id_vet, id_cliente)`.

## Estudios y solicitudes

### `catalogo_estudio`

Estudios disponibles y precio actual.

Campos:

- `id_catalogo`;
- `nombre`;
- `precio`.

### `solicitud`

Solicitud de estudios para un paciente.

Campos:

- `id_solicitud`;
- `id_paciente`;
- `fecha_solicitud`;
- `estado`;
- `notas_cliente`;
- `motivo_cancelacion`.

Estados:

- `pendiente`;
- `en_proceso`;
- `muestra_recibida`;
- `resultado_cargado`;
- `finalizado`;
- `rechazado`;
- `cancelado`.

### `solicitud_estudio`

Relacion entre una solicitud y estudios solicitados.

Campos:

- `id`;
- `id_solicitud`;
- `id_catalogo`.

## Resultados e historial

### `resultado_estudio`

Resultado registrado para una solicitud.

Campos:

- `id_resultado`;
- `id_solicitud`;
- `id_vet`;
- `fecha_muestra`;
- `observaciones`;
- `reporte_clinico`;
- `archivo_pdf`.

Relacion:

- una solicitud tiene como maximo un resultado.

### `historial_clinico`

Expediente acumulado por paciente.

Campos:

- `id_exp`;
- `id_paciente`;
- `fecha_registro`;
- `diagnostico`;
- `tratamiento`;
- `notas`.

## Auditoria, notificaciones y recuperacion

### `auditoria`

Registra acciones importantes.

Campos:

- `id_auditoria`;
- `actor`;
- `accion`;
- `modelo`;
- `objeto_id`;
- `descripcion`;
- `metadata`;
- `fecha`.

### `notificacion`

Notificaciones internas del usuario.

Campos:

- `id_notificacion`;
- `usuario`;
- `titulo`;
- `mensaje`;
- `tipo`;
- `url`;
- `leida`;
- `fecha`.

### `password_reset_token`

Tokens de recuperacion de contrasena.

Campos:

- `id_reset`;
- `usuario`;
- `token`;
- `creado_en`;
- `expira_en`;
- `usado_en`.

## Migraciones

Crear migraciones:

```bash
docker compose exec django python manage.py makemigrations
```

Aplicar migraciones:

```bash
docker compose exec django python manage.py migrate
```

Ver estado:

```bash
docker compose exec django python manage.py showmigrations
```
