from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from apps.security import (
    AdminWriteMixin,
    audit,
    accessible_cliente_ids,
    cliente_for_usuario,
    is_admin,
    user_can_access_cliente,
    user_can_access_paciente,
    validate_pdf_upload,
)
from .models import Cliente, Especie, Paciente, Raza
from .serializers import ClienteSerializer, EspecieSerializer, PacienteSerializer, RazaSerializer


class EspecieViewSet(AdminWriteMixin, viewsets.ModelViewSet):
    queryset = Especie.objects.all()
    serializer_class = EspecieSerializer

    def check_permissions(self, request):
        super().check_permissions(request)
        self.check_admin_write()

    def perform_create(self, serializer):
        instance = serializer.save()
        audit(self.request, 'crear', instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        audit(self.request, 'editar', instance)

    def perform_destroy(self, instance):
        audit(self.request, 'eliminar', instance)
        instance.delete()


class RazaViewSet(AdminWriteMixin, viewsets.ModelViewSet):
    serializer_class = RazaSerializer

    def check_permissions(self, request):
        super().check_permissions(request)
        self.check_admin_write()

    def get_queryset(self):
        queryset = Raza.objects.select_related('id_especie').all()
        id_especie = self.request.query_params.get('id_especie')
        if id_especie:
            queryset = queryset.filter(id_especie=id_especie)
        return queryset

    def perform_create(self, serializer):
        instance = serializer.save()
        audit(self.request, 'crear', instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        audit(self.request, 'editar', instance)

    def perform_destroy(self, instance):
        audit(self.request, 'eliminar', instance)
        instance.delete()


class ClienteViewSet(AdminWriteMixin, viewsets.ModelViewSet):
    serializer_class = ClienteSerializer

    def check_permissions(self, request):
        super().check_permissions(request)
        self.check_admin_write()

    def get_queryset(self):
        queryset = Cliente.objects.select_related('id_usuario').all()
        ids = accessible_cliente_ids(self.usuario_actual)
        if ids is not None:
            queryset = queryset.filter(id_cliente__in=ids)
        return queryset

    def perform_create(self, serializer):
        instance = serializer.save()
        audit(self.request, 'crear', instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        audit(self.request, 'editar', instance)

    def perform_destroy(self, instance):
        audit(self.request, 'eliminar', instance)
        instance.delete()


class PacienteViewSet(AdminWriteMixin, viewsets.ModelViewSet):
    serializer_class = PacienteSerializer

    def check_permissions(self, request):
        super().check_permissions(request)
        if request.method == 'DELETE' and not is_admin(self.usuario_actual):
            raise PermissionDenied('Solo un administrador puede eliminar pacientes')

    def get_queryset(self):
        queryset = Paciente.objects.select_related(
            'id_cliente__id_usuario',
            'id_raza__id_especie',
        ).all()
        ids = accessible_cliente_ids(self.usuario_actual)
        if ids is not None:
            queryset = queryset.filter(id_cliente__in=ids)

        id_cliente = self.request.query_params.get('id_cliente')
        nombre = self.request.query_params.get('nombre')
        if id_cliente:
            queryset = queryset.filter(id_cliente=id_cliente)
        if nombre:
            queryset = queryset.filter(nombre__icontains=nombre)
        return queryset

    def perform_create(self, serializer):
        id_cliente = serializer.validated_data.get('id_cliente')
        if not is_admin(self.usuario_actual):
            cliente = cliente_for_usuario(self.usuario_actual)
            if cliente:
                instance = serializer.save(id_cliente=cliente)
                audit(self.request, 'crear', instance)
                return
            elif not id_cliente or not user_can_access_cliente(self.usuario_actual, id_cliente.id_cliente):
                raise PermissionDenied('No puedes registrar pacientes para este cliente')
        instance = serializer.save()
        audit(self.request, 'crear', instance)

    def perform_update(self, serializer):
        instance = self.get_object()
        if not user_can_access_paciente(self.usuario_actual, instance):
            raise PermissionDenied('No puedes modificar este paciente')
        nuevo_cliente = serializer.validated_data.get('id_cliente')
        if nuevo_cliente and not user_can_access_cliente(self.usuario_actual, nuevo_cliente.id_cliente):
            raise PermissionDenied('No puedes mover el paciente a este cliente')
        instance = serializer.save()
        audit(self.request, 'editar', instance)

    def perform_destroy(self, instance):
        audit(self.request, 'eliminar', instance)
        instance.delete()

    @action(detail=True, methods=['patch'])
    def subir_cartilla(self, request, pk=None):
        paciente = self.get_object()
        if not user_can_access_paciente(self.usuario_actual, paciente):
            return Response({'error': 'No puedes modificar este paciente'}, status=403)
        archivo = request.FILES.get('cartilla_pdf')
        error = validate_pdf_upload(archivo)
        if error:
            return Response({'error': error}, status=400)
        paciente.cartilla_pdf = archivo
        paciente.save()
        audit(request, 'editar', paciente, 'Cartilla PDF actualizada')
        return Response(PacienteSerializer(paciente).data)

    @action(detail=True, methods=['patch'])
    def eliminar_cartilla(self, request, pk=None):
        paciente = self.get_object()
        if not user_can_access_paciente(self.usuario_actual, paciente):
            return Response({'error': 'No puedes modificar este paciente'}, status=403)
        if paciente.cartilla_pdf:
            paciente.cartilla_pdf.delete(save=False)
            paciente.cartilla_pdf = None
            paciente.save()
            audit(request, 'editar', paciente, 'Cartilla PDF eliminada')
        return Response(PacienteSerializer(paciente).data)
