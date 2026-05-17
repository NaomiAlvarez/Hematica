"""
Rutas del modulo de empleados.

Expone tipos de empleado, empleados y veterinarios bajo el prefijo /api/v1/.
"""
from rest_framework.routers import DefaultRouter
from .views import TipoEmpleadoViewSet, EmpleadoViewSet, VeterinarioViewSet

router = DefaultRouter()
router.register(r'tipos-empleado', TipoEmpleadoViewSet, basename='tipo-empleado')
router.register(r'empleados', EmpleadoViewSet, basename='empleado')
router.register(r'veterinarios', VeterinarioViewSet, basename='veterinario')

urlpatterns = router.urls
