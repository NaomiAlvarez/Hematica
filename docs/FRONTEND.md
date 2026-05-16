# Frontend React

El frontend vive en `frontend/` y fue creado con Create React App. Usa React Router para navegacion y `fetch` para consumir la API.

## Estructura

```text
frontend/
+-- public/
|   +-- index.html
|   +-- imagenes y assets publicos
+-- scripts/
|   +-- serve-build.cjs
+-- src/
    +-- components/
    |   +-- Navbar.jsx
    |   +-- ListingControls.jsx
    +-- pages/
    |   +-- Dashboard.jsx
    |   +-- Login.jsx
    |   +-- Home.jsx
    |   +-- Pacientes.jsx
    |   +-- MisMascotas.jsx
    |   +-- MisPacientes.jsx
    |   +-- Solicitudes.jsx
    |   +-- ResultadoEstudio.jsx
    |   +-- Estudios.jsx
    |   +-- Empleados.jsx
    |   +-- Usuarios.jsx
    |   +-- EditarCuenta.jsx
    |   +-- ResetPassword.jsx
    +-- App.js
    +-- index.js
```

## Configuracion

Variable principal:

```text
REACT_APP_API_URL=http://localhost:8000/api/v1
```

El valor se define en `frontend/.env`.

## Sesion

El login guarda en `localStorage`:

- `token`: JWT de acceso.
- `refresh`: JWT de refresco.
- `userData`: datos del usuario autenticado.

`frontend/src/index.js` reemplaza `window.fetch` para agregar automaticamente:

```http
Authorization: Bearer <token>
```

Solo lo agrega cuando la URL apunta a la API configurada o a `http://localhost:8000/api/v1`.

## Rutas de la aplicacion

Archivo: `frontend/src/App.js`

| Ruta | Pantalla | Acceso |
| --- | --- | --- |
| `/login` | Login y registro | Publico si no hay sesion |
| `/reset-password` | Recuperacion de contrasena | Publico si no hay sesion |
| `/` | Home | Usuario autenticado |
| `/dashboard` | Dashboard | Admin |
| `/usuarios` | Gestion de usuarios | Admin |
| `/pacientes` | Gestion administrativa de pacientes | Admin |
| `/empleados` | Empleados y veterinarios | Admin |
| `/mascotas` | Mascotas propias o gestionadas | Admin o cliente |
| `/estudios` | Catalogo de estudios | Usuario autenticado |
| `/solicitudes` | Solicitudes de estudios | Usuario autenticado |
| `/resultados` | Resultados de estudios | Usuario autenticado |
| `/mis-pacientes` | Pacientes relacionados | Veterinario o cliente |
| `/editar-cuenta` | Perfil propio | Usuario autenticado |

Las rutas no autorizadas redirigen a `/` o `/login`.

## Roles en frontend

`App.js` traduce el rol recibido desde la API:

- `Administrador` o `Admin` => `admin`;
- `Veterinario` => `veterinario`;
- cualquier otro => `usuario`.

Estos valores controlan la visibilidad de rutas y componentes.

## Pantallas principales

### Login

Permite:

- iniciar sesion;
- registrar usuario;
- solicitar recuperacion de contrasena.

### Home

Pantalla inicial despues de autenticar. Presenta accesos segun rol.

### Dashboard

Vista administrativa con datos agregados de solicitudes, estudios, resultados y pacientes.

### Usuarios

Permite al administrador:

- listar usuarios;
- consultar tipos de usuario;
- cambiar roles.

### Empleados

Permite al administrador:

- crear empleados;
- crear veterinarios;
- asignar clientes a veterinarios;
- desasignar clientes.

### Estudios

Muestra el catalogo de estudios. El administrador puede crear, editar o eliminar estudios.

### Mascotas, Pacientes y Mis Pacientes

Pantallas orientadas a pacientes veterinarios. Permiten registrar mascotas, editar informacion y gestionar cartillas PDF.

### Solicitudes

Permite crear solicitudes, asociar estudios, cambiar estados y finalizar flujos segun rol.

### Resultados

Permite consultar resultados, cargar reporte clinico y administrar PDFs de resultados.

## Scripts

```bash
npm start
npm test
npm run build
npm run preview
```

`npm run preview` sirve el build de produccion con `frontend/scripts/serve-build.cjs`.

## Notas tecnicas

- La mayoria de llamadas usa `fetch`.
- Existen algunas URLs hardcodeadas a `http://localhost:8000/api/v1`; si se despliega en otro host conviene centralizar todas las llamadas en una utilidad.
- El estado de sesion se reconstruye al cargar la app llamando a `/auth/me/`.
- El frontend no debe decidir permisos finales; el backend siempre valida permisos de nuevo.
