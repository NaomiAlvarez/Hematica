"""
Views para el módulo de estudios.
Maneja los endpoints del catálogo de estudios disponibles
en el laboratorio.
Solo los administradores pueden crear, editar o eliminar estudios.
Todos los roles pueden consultar el catálogo.
"""
from rest_framework import viewsets
from .models import CatalogoEstudio
from .serializers import CatalogoEstudioSerializer


class CatalogoEstudioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para el catálogo de estudios disponibles.
    Genera automáticamente los siguientes endpoints:
      GET    /api/v1/estudios/        -> lista todos los estudios disponibles
      POST   /api/v1/estudios/        -> agrega un estudio nuevo al catálogo
      GET    /api/v1/estudios/{id}/   -> detalle de un estudio específico
      PUT    /api/v1/estudios/{id}/   -> edita nombre o precio de un estudio
      DELETE /api/v1/estudios/{id}/   -> elimina un estudio del catálogo
    El frontend usa este endpoint para mostrar al tutor
    los estudios disponibles al crear una solicitud.
    """
    queryset = CatalogoEstudio.objects.all()
    serializer_class = CatalogoEstudioSerializer