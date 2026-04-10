"""
URLs para el módulo de estudios.
Registra el ViewSet del catálogo de estudios con el router de DRF.
"""
from rest_framework.routers import DefaultRouter
from .views import CatalogoEstudioViewSet

router = DefaultRouter()
router.register(r'estudios', CatalogoEstudioViewSet, basename='estudio')

urlpatterns = router.urls