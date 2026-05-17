"""
Rutas del modulo de estudios.

Expone el catalogo de estudios bajo el prefijo /api/v1/.
"""
from rest_framework.routers import DefaultRouter
from .views import CatalogoEstudioViewSet

router = DefaultRouter()
router.register(r'estudios', CatalogoEstudioViewSet, basename='estudio')

urlpatterns = router.urls
