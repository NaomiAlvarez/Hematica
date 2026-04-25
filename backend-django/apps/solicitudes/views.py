"""
Views para el modulo de solicitudes.
Maneja el flujo completo de atencion de muestras.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Solicitud, SolicitudEstudio
from .serializers import SolicitudSerializer, SolicitudEstudioSerializer


class SolicitudViewSet(viewsets.ModelViewSet):
    queryset = Solicitud.objects.all()
    serializer_class = SolicitudSerializer

    def get_queryset(self):
        queryset = Solicitud.objects.all()
        estado = self.request.query_params.get('estado')
        id_paciente = self.request.query_params.get('id_paciente')
        if estado:
            queryset = queryset.filter(estado=estado)
        if id_paciente:
            queryset = queryset.filter(id_paciente=id_paciente)
        return queryset

    @action(detail=True, methods=['patch'])
    def cambiar_estado(self, request, pk=None):
        solicitud = self.get_object()
        nuevo_estado = request.data.get('estado')
        estados_validos = ['pendiente', 'muestra_recibida', 'en_proceso', 'finalizado', 'cancelado']
        if nuevo_estado not in estados_validos:
            return Response({'error': 'Estado invalido'}, status=400)
        solicitud.estado = nuevo_estado

        # ← NUEVO: guardar motivo si viene en el request
        motivo = request.data.get('motivo_cancelacion')
        if motivo:
            solicitud.motivo_cancelacion = motivo

        solicitud.save()
        return Response(SolicitudSerializer(solicitud).data)

    @action(detail=False, methods=['get'])
    def reporte_por_estado(self, request):
        from django.db.models import Count
        reporte = Solicitud.objects.values('estado').annotate(total=Count('id_solicitud'))
        return Response(list(reporte))


class SolicitudEstudioViewSet(viewsets.ModelViewSet):
    serializer_class = SolicitudEstudioSerializer

    def get_queryset(self):
        queryset = SolicitudEstudio.objects.all()
        id_solicitud = self.request.query_params.get('id_solicitud')
        if id_solicitud:
            queryset = queryset.filter(id_solicitud=id_solicitud)
        return queryset