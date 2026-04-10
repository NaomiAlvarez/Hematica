"""
Views para el módulo de estudios.
Maneja el catálogo de estudios disponibles en el laboratorio.
Solo los administradores pueden crear, editar o eliminar estudios.
Los demás roles solo pueden consultarlos.
"""
from rest_framework import viewsets
from .models import CatalogoEstudio
from .serializers import CatalogoEstudioSerializer


class CatalogoEstudioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para el catálogo de estudios.
    Genera automáticamente:
      GET    /api/v1/estudios/        -> lista todos los estudios disponibles
      POST   /api/v1/estudios/        -> agrega un estudio nuevo al catálogo
      GET    /api/v1/estudios/{id}/   -> detalle de un estudio
      PUT    /api/v1/estudios/{id}/   -> edita nombre o precio de un estudio
      DELETE /api/v1/estudios/{id}/   -> elimina un estudio del catálogo
    """
    queryset = CatalogoEstudio.objects.all()
    serializer_class = CatalogoEstudioSerializer