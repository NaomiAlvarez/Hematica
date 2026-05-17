"""
Rutas del modulo de pacientes.

El router de DRF publica los endpoints CRUD de especies, razas, clientes y
pacientes bajo el prefijo /api/v1/.
"""
from rest_framework.routers import DefaultRouter
from .views import EspecieViewSet, RazaViewSet, ClienteViewSet, PacienteViewSet

# basename define el nombre interno de cada recurso en el router.
router = DefaultRouter()
router.register(r'especies', EspecieViewSet, basename='especie')
router.register(r'razas', RazaViewSet, basename='raza')
router.register(r'clientes', ClienteViewSet, basename='cliente')
router.register(r'pacientes', PacienteViewSet, basename='paciente')

urlpatterns = router.urls
