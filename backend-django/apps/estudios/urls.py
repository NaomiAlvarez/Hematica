"""
URLs para el módulo de estudios.
El router de DRF genera automáticamente todas las rutas
CRUD para el catálogo de estudios.
Rutas generadas:
  /api/v1/estudios/          -> CatalogoEstudioViewSet
  /api/v1/estudios/{id}/     -> detalle de un estudio específico
Cada ruta genera automáticamente los endpoints
GET (lista), POST, GET (detalle), PUT y DELETE.
"""
from rest_framework.routers import DefaultRouter
from .views import CatalogoEstudioViewSet

# El router genera automáticamente las URLs para el ViewSet
router = DefaultRouter()
router.register(r'estudios', CatalogoEstudioViewSet, basename='estudio')

urlpatterns = router.urls