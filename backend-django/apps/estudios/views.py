"""
Vistas del catalogo de estudios.

La lectura esta disponible para usuarios autenticados. La escritura se limita a
administradores.
"""
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from apps.security import AdminWriteMixin, audit, is_admin
from .models import CatalogoEstudio
from .serializers import CatalogoEstudioSerializer


class CatalogoEstudioViewSet(AdminWriteMixin, viewsets.ModelViewSet):
    """
    CRUD del catalogo de estudios disponibles para solicitudes.
    """
    queryset = CatalogoEstudio.objects.all()
    serializer_class = CatalogoEstudioSerializer

    def check_permissions(self, request):
        super().check_permissions(request)
        if request.method not in {'GET', 'HEAD', 'OPTIONS'} and not is_admin(self.usuario_actual):
            raise PermissionDenied('Solo un administrador puede modificar estudios')

    def perform_create(self, serializer):
        instance = serializer.save()
        audit(self.request, 'crear', instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        audit(self.request, 'editar', instance)

    def perform_destroy(self, instance):
        audit(self.request, 'eliminar', instance)
        instance.delete()
