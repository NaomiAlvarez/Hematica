# Backend Django - Hematica

API REST del sistema Hematica. Gestiona autenticacion, usuarios, pacientes, empleados, estudios, solicitudes, resultados, historial clinico, auditoria y notificaciones.

## Stack

- Python 3.12.
- Django 6.
- Django REST Framework.
- Simple JWT.
- MySQL 8.
- PyMySQL.
- django-cors-headers.

## Ejecutar con Docker

Desde la raiz del repositorio:

```bash
docker compose up --build
docker compose exec django python manage.py migrate
```

API:

```text
http://localhost:8000/api/v1/
```

Admin:

```text
http://localhost:8000/admin/
```

## Modulos

| Modulo | Responsabilidad |
| --- | --- |
| `apps/usuarios` | Registro, login, roles, notificaciones, auditoria y recuperacion de contrasena. |
| `apps/pacientes` | Especies, razas, clientes y pacientes. |
| `apps/empleados` | Empleados, veterinarios y asignaciones cliente-veterinario. |
| `apps/estudios` | Catalogo de estudios clinicos. |
| `apps/solicitudes` | Solicitudes, estudios solicitados, resultados e historial clinico. |
| `apps/security.py` | Permisos, alcance de datos, auditoria, notificaciones y validacion PDF. |

## Comandos utiles

```bash
docker compose exec django python manage.py makemigrations
docker compose exec django python manage.py migrate
docker compose exec django python manage.py createsuperuser
docker compose exec django python manage.py test
```

## Documentacion relacionada

- `../docs/BACKEND.md`
- `../docs/ROLES_Y_SEGURIDAD.md`
- `../docs/BASE_DE_DATOS.md`
- `../API_CONTRACT.md`
