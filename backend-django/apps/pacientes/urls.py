"""
URLs para el módulo de pacientes.
El router de DRF genera automáticamente todas las rutas
CRUD para cada ViewSet registrado.
Rutas generadas:
  /api/v1/especies/          -> EspecieViewSet
  /api/v1/razas/             -> RazaViewSet
  /api/v1/clientes/          -> ClienteViewSet
  /api/v1/pacientes/         -> PacienteViewSet
Cada ruta genera automáticamente los endpoints
GET (lista), POST, GET (detalle), PUT y DELETE.
"""
from rest_framework.routers import DefaultRouter
from .views import EspecieViewSet, RazaViewSet, ClienteViewSet, PacienteViewSet

# El router genera automáticamente las URLs para cada ViewSet
# basename define el nombre base para las URLs generadas internamente por Django
router = DefaultRouter()
router.register(r'especies', EspecieViewSet, basename='especie')
router.register(r'razas', RazaViewSet, basename='raza')
router.register(r'clientes', ClienteViewSet, basename='cliente')
router.register(r'pacientes', PacienteViewSet, basename='paciente')

urlpatterns = router.urls