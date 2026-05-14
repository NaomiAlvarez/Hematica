from django.db.models import Count
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from apps.security import (
    AuthenticatedViewSetMixin,
    audit,
    accessible_cliente_ids,
    is_admin,
    is_veterinario,
    notify_admins,
    notify_usuario,
    user_can_access_paciente,
)
from .models import Solicitud, SolicitudEstudio
from .serializers import SolicitudEstudioSerializer, SolicitudSerializer


ESTADOS_VALIDOS = [
    'pendiente',
    'en_proceso',
    'muestra_recibida',
    'resultado_cargado',
    'finalizado',
    'rechazado',
    'cancelado',
]


class SolicitudViewSet(AuthenticatedViewSetMixin, viewsets.ModelViewSet):
    serializer_class = SolicitudSerializer

    def get_queryset(self):
        queryset = Solicitud.objects.select_related(
            'id_paciente__id_cliente__id_usuario',
            'id_paciente__id_raza__id_especie',
        ).all()
        ids = accessible_cliente_ids(self.usuario_actual)
        if ids is not None:
            queryset = queryset.filter(id_paciente__id_cliente__in=ids)

        estado = self.request.query_params.get('estado')
        id_paciente = self.request.query_params.get('id_paciente')
        if estado:
            queryset = queryset.filter(estado=estado)
        if id_paciente:
            queryset = queryset.filter(id_paciente=id_paciente)
        return queryset

    def perform_create(self, serializer):
        paciente = serializer.validated_data.get('id_paciente')
        if not user_can_access_paciente(self.usuario_actual, paciente):
            raise PermissionDenied('No puedes crear solicitudes para este paciente')
        instance = serializer.save()
        audit(self.request, 'crear', instance, 'Solicitud creada')
        notify_admins(
            'Nueva solicitud pendiente',
            f'Se registro una solicitud para {instance.id_paciente.nombre}.',
            tipo='solicitud',
            url='/solicitudes',
        )

    def perform_update(self, serializer):
        instance = self.get_object()
        if not is_admin(self.usuario_actual) and not is_veterinario(self.usuario_actual):
            if instance.estado != 'pendiente':
                raise PermissionDenied('Solo puedes editar solicitudes pendientes')
        instance = serializer.save()
        audit(self.request, 'editar', instance, 'Solicitud actualizada')

    def perform_destroy(self, instance):
        if not is_admin(self.usuario_actual) and instance.estado != 'pendiente':
            raise PermissionDenied('Solo puedes eliminar solicitudes pendientes')
        audit(self.request, 'eliminar', instance)
        instance.delete()

    @action(detail=True, methods=['patch'])
    def cambiar_estado(self, request, pk=None):
        if not is_admin(self.usuario_actual) and not is_veterinario(self.usuario_actual):
            return Response({'error': 'No tienes permisos para cambiar estados'}, status=403)

        solicitud = self.get_object()
        nuevo_estado = request.data.get('estado')
        if nuevo_estado not in ESTADOS_VALIDOS:
            return Response({'error': 'Estado invalido'}, status=400)
        solicitud.estado = nuevo_estado

        motivo = request.data.get('motivo_cancelacion')
        if motivo:
            solicitud.motivo_cancelacion = motivo

        solicitud.save()
        audit(
            request,
            'cambiar_estado',
            solicitud,
            f'Estado cambiado a {nuevo_estado}',
            {'estado': nuevo_estado},
        )
        notify_usuario(
            solicitud.id_paciente.id_cliente.id_usuario,
            'Solicitud actualizada',
            f'La solicitud de {solicitud.id_paciente.nombre} cambio a {solicitud.get_estado_display()}.',
            tipo='solicitud',
            url='/solicitudes',
        )
        return Response(SolicitudSerializer(solicitud).data)

    @action(detail=False, methods=['get'])
    def reporte_por_estado(self, request):
        reporte = self.get_queryset().values('estado').annotate(total=Count('id_solicitud'))
        return Response(list(reporte))


class SolicitudEstudioViewSet(AuthenticatedViewSetMixin, viewsets.ModelViewSet):
    serializer_class = SolicitudEstudioSerializer

    def get_queryset(self):
        queryset = SolicitudEstudio.objects.select_related(
            'id_solicitud__id_paciente__id_cliente__id_usuario',
            'id_catalogo',
        )
        ids = accessible_cliente_ids(self.usuario_actual)
        if ids is not None:
            queryset = queryset.filter(id_solicitud__id_paciente__id_cliente__in=ids)

        id_solicitud = self.request.query_params.get('id_solicitud')
        if id_solicitud:
            queryset = queryset.filter(id_solicitud=id_solicitud)
        return queryset

    def perform_create(self, serializer):
        solicitud = serializer.validated_data.get('id_solicitud')
        if not user_can_access_paciente(self.usuario_actual, solicitud.id_paciente):
            raise PermissionDenied('No puedes modificar esta solicitud')
        instance = serializer.save()
        audit(self.request, 'crear', instance, 'Estudio agregado a solicitud')

    def perform_update(self, serializer):
        instance = self.get_object()
        if not user_can_access_paciente(self.usuario_actual, instance.id_solicitud.id_paciente):
            raise PermissionDenied('No puedes modificar esta solicitud')
        instance = serializer.save()
        audit(self.request, 'editar', instance)

    def perform_destroy(self, instance):
        if not user_can_access_paciente(self.usuario_actual, instance.id_solicitud.id_paciente):
            raise PermissionDenied('No puedes modificar esta solicitud')
        audit(self.request, 'eliminar', instance, 'Estudio eliminado de solicitud')
        instance.delete()
