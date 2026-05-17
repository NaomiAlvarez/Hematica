# Guia de contribucion

Esta guia define criterios para modificar Hematica de forma ordenada.

## Antes de cambiar codigo

1. Identificar si el cambio pertenece al frontend, backend o ambos.
2. Revisar el modelo de permisos en `apps/security.py`.
3. Confirmar si requiere migracion de base de datos.
4. Revisar el contrato de API si se agrega o cambia un endpoint.
5. Probar el flujo con al menos un rol afectado.

## Convenciones backend

- Crear modelos en `models.py`.
- Crear serializers en `serializers.py`.
- Exponer recursos con ViewSets cuando sean CRUD.
- Usar `APIView` para acciones puntuales de autenticacion o administracion.
- Registrar rutas en `urls.py` del modulo.
- Agregar auditoria en operaciones relevantes.
- Crear notificaciones cuando el usuario deba enterarse de un cambio.
- Reutilizar helpers de `apps/security.py` para permisos.

## Convenciones frontend

- Colocar pantallas completas en `src/pages/`.
- Colocar piezas reutilizables en `src/components/`.
- Mantener la proteccion de rutas en `App.js`.
- Usar `REACT_APP_API_URL` para nuevas llamadas.
- Evitar nuevas URLs hardcodeadas a `localhost`.
- Mantener mensajes de error claros para el usuario.

## Cambios de API

Cuando se agregue o cambie un endpoint:

1. Actualizar `API_CONTRACT.md`.
2. Documentar metodo, ruta, permisos, body y respuesta.
3. Probar con token valido.
4. Probar un caso sin permisos.
5. Revisar si el frontend necesita manejar nuevos errores.

## Cambios de base de datos

Crear migracion:

```bash
docker compose exec django python manage.py makemigrations
```

Aplicar:

```bash
docker compose exec django python manage.py migrate
```

Verificar que la migracion quede en la carpeta correcta.

## Pruebas recomendadas

Backend:

- login valido e invalido;
- permisos por rol;
- filtros por alcance;
- cambios de estado;
- carga de PDF;
- recuperacion de contrasena.

Frontend:

- rutas protegidas;
- formularios principales;
- manejo de sesion expirada;
- flujos por rol;
- mensajes de error.

## Checklist para pull requests o entregas

- La aplicacion levanta localmente.
- Las migraciones corren desde cero.
- El frontend compila.
- No se suben secretos reales.
- `README.md` y `API_CONTRACT.md` estan actualizados.
- Los cambios no rompen rutas existentes.
- Los permisos se validan en backend, no solo en frontend.
