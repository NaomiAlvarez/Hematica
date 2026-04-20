"""
URLs para el modulo de solicitudes.
Endpoints disponibles:
  GET/POST /api/v1/solicitudes/                         -> lista y crea solicitudes
  GET/PUT  /api/v1/solicitudes/{id}/                    -> detalle y edicion
  PATCH    /api/v1/solicitudes/{id}/cambiar_estado/     -> cambia el estado
  GET      /api/v1/solicitudes/reporte_por_estado/      -> reporte agrupado por estado
  GET/POST /api/v1/solicitud-estudios/                  -> estudios por solicitud
  GET/POST /api/v1/resultados/                          -> resultados de estudios
  GET/POST /api/v1/historial/                           -> historial clinico
  GET      /api/v1/historial/reporte_por_paciente/      -> reporte por paciente
"""
from rest_framework.routers import DefaultRouter
from .views import SolicitudViewSet, SolicitudEstudioViewSet
from .views_resultados import ResultadoEstudioViewSet, HistorialClinicoViewSet

router = DefaultRouter()
router.register(r'solicitudes', SolicitudViewSet, basename = 'solicitud')
router.register(r'solicitud-estudios', SolicitudEstudioViewSet, basename = 'solicitud-estudio')
router.register(r'resultados', ResultadoEstudioViewSet, basename = 'resultado')
router.register(r'historial', HistorialClinicoViewSet, basename = 'historial')

urlpatterns = router.urls