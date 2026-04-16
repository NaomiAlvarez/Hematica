"""
URLs para el módulo de empleados.
El router de DRF genera automáticamente todas las rutas
CRUD para tipos de empleado, empleados y veterinarios.
Rutas generadas:
  /api/v1/tipos-empleado/    -> TipoEmpleadoViewSet
  /api/v1/empleados/         -> EmpleadoViewSet
  /api/v1/veterinarios/      -> VeterinarioViewSet
Cada ruta genera automáticamente los endpoints
GET (lista), POST, GET (detalle), PUT y DELETE.
"""
from rest_framework.routers import DefaultRouter
from .views import TipoEmpleadoViewSet, EmpleadoViewSet, VeterinarioViewSet

# El router genera automáticamente las URLs para cada ViewSet
router = DefaultRouter()
router.register(r'tipos-empleado', TipoEmpleadoViewSet, basename='tipo-empleado')
router.register(r'empleados', EmpleadoViewSet, basename='empleado')
router.register(r'veterinarios', VeterinarioViewSet, basename='veterinario')

urlpatterns = router.urls