# Frontend React - Hematica

Interfaz web del sistema Hematica. Permite a administradores, veterinarios y clientes operar pacientes, estudios, solicitudes, resultados y datos de cuenta.

## Stack

- React 19.
- React Router DOM 7.
- Create React App.
- ECharts.
- Fetch API.

## Instalacion

Desde esta carpeta:

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

La aplicacion abre en:

```text
http://localhost:3000
```

## Configuracion

Variable principal:

```text
REACT_APP_API_URL=http://localhost:8000/api/v1
```

Debe apuntar al backend Django.

## Scripts

| Comando | Uso |
| --- | --- |
| `npm start` | Ejecuta el servidor de desarrollo. |
| `npm test` | Ejecuta pruebas en modo interactivo. |
| `npm run build` | Genera build de produccion. |
| `npm run preview` | Sirve localmente el build generado. |

## Estructura

```text
src/
+-- components/   # Componentes reutilizables
+-- pages/        # Pantallas principales
+-- App.js        # Rutas y proteccion por rol
+-- index.js      # Montaje React e interceptor global de fetch
```

## Rutas principales

| Ruta | Acceso |
| --- | --- |
| `/login` | Publico sin sesion |
| `/reset-password` | Publico sin sesion |
| `/` | Usuario autenticado |
| `/dashboard` | Admin |
| `/usuarios` | Admin |
| `/pacientes` | Admin |
| `/empleados` | Admin |
| `/mascotas` | Admin o cliente |
| `/estudios` | Usuario autenticado |
| `/solicitudes` | Usuario autenticado |
| `/resultados` | Usuario autenticado |
| `/mis-pacientes` | Veterinario o cliente |
| `/editar-cuenta` | Usuario autenticado |

## Sesion

El token se guarda en `localStorage` como `token`. El archivo `src/index.js` agrega automaticamente `Authorization: Bearer <token>` a las llamadas dirigidas a la API.

## Documentacion relacionada

- `../docs/FRONTEND.md`
- `../docs/ARQUITECTURA.md`
- `../API_CONTRACT.md`
