"""
URLs para el modulo de solicitudes.
"""
from rest_framework.routers import DefaultRouter
from .views import SolicitudViewSet, SolicitudEstudioViewSet
from .views_resultados import ResultadoEstudioViewSet, HistorialClinicoViewSet

router = DefaultRouter()
router.register(r'solicitudes', SolicitudViewSet, basename='solicitud')
router.register(r'solicitud-estudios', SolicitudEstudioViewSet, basename='solicitud-estudio')
router.register(r'resultados', ResultadoEstudioViewSet, basename='resultado')
router.register(r'historial', HistorialClinicoViewSet, basename='historial')

urlpatterns = router.urls