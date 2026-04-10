"""
URLs para el módulo de pacientes.
Registra los ViewSets con el router de DRF para generar
automáticamente todas las rutas CRUD de cada modelo.
"""
from rest_framework.routers import DefaultRouter
from .views import EspecieViewSet, RazaViewSet, ClienteViewSet, PacienteViewSet

# El router genera automáticamente las URLs para cada ViewSet
router = DefaultRouter()
router.register(r'especies', EspecieViewSet, basename='especie')
router.register(r'razas', RazaViewSet, basename='raza')
router.register(r'clientes', ClienteViewSet, basename='cliente')
router.register(r'pacientes', PacienteViewSet, basename='paciente')

urlpatterns = router.urls