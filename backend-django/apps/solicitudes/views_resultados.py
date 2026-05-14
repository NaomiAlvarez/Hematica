from django.db.models import Count
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from apps.security import (
    AuthenticatedViewSetMixin,
    audit,
    accessible_cliente_ids,
    is_admin,
    is_veterinario,
    notify_usuario,
    user_can_access_paciente,
    validate_pdf_upload,
)
from .models import HistorialClinico, ResultadoEstudio
from .serializers_resultados import HistorialClinicoSerializer, ResultadoEstudioSerializer


class ResultadoEstudioViewSet(AuthenticatedViewSetMixin, viewsets.ModelViewSet):
    serializer_class = ResultadoEstudioSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        queryset = ResultadoEstudio.objects.select_related(
            'id_solicitud__id_paciente__id_cliente__id_usuario',
            'id_vet__id_emp__id_usuario',
        ).all()
        ids = accessible_cliente_ids(self.usuario_actual)
        if ids is not None:
            queryset = queryset.filter(id_solicitud__id_paciente__id_cliente__in=ids)
        return queryset

    def perform_create(self, serializer):
        if not is_admin(self.usuario_actual) and not is_veterinario(self.usuario_actual):
            raise PermissionDenied('No tienes permisos para crear resultados')
        solicitud = serializer.validated_data.get('id_solicitud')
        if not user_can_access_paciente(self.usuario_actual, solicitud.id_paciente):
            raise PermissionDenied('No puedes crear resultados para esta solicitud')

        resultado = serializer.save()
        solicitud.estado = 'resultado_cargado'
        solicitud.save(update_fields=['estado'])
        HistorialClinico.objects.create(
            id_paciente=solicitud.id_paciente,
            diagnostico='Pendiente de revision por veterinario',
            notas='Resultado registrado automaticamente'
        )
        audit(self.request, 'crear', resultado, 'Resultado registrado')
        notify_usuario(
            solicitud.id_paciente.id_cliente.id_usuario,
            'Resultado disponible',
            f'Ya hay un resultado cargado para {solicitud.id_paciente.nombre}.',
            tipo='resultado',
            url='/resultados',
        )

    def perform_update(self, serializer):
        instance = self.get_object()
        if not is_admin(self.usuario_actual) and not is_veterinario(self.usuario_actual):
            raise PermissionDenied('No tienes permisos para editar resultados')
        instance = serializer.save()
        audit(self.request, 'editar', instance, 'Resultado actualizado')

    def perform_destroy(self, instance):
        if not is_admin(self.usuario_actual):
            raise PermissionDenied('Solo un administrador puede eliminar resultados')
        audit(self.request, 'eliminar', instance)
        instance.delete()

    @action(detail=True, methods=['patch'], parser_classes=[MultiPartParser, FormParser])
    def subir_pdf(self, request, pk=None):
        if not is_admin(self.usuario_actual) and not is_veterinario(self.usuario_actual):
            return Response({'error': 'No tienes permisos para subir resultados'}, status=403)
        resultado = self.get_object()
        archivo = request.FILES.get('archivo_pdf')
        error = validate_pdf_upload(archivo)
        if error:
            return Response({'error': error}, status=400)
        resultado.archivo_pdf = archivo
        resultado.save()
        audit(request, 'editar', resultado, 'PDF de resultado actualizado')
        notify_usuario(
            resultado.id_solicitud.id_paciente.id_cliente.id_usuario,
            'PDF de resultado listo',
            f'El PDF de {resultado.id_solicitud.id_paciente.nombre} esta disponible.',
            tipo='resultado',
            url='/resultados',
        )
        return Response(ResultadoEstudioSerializer(resultado).data)

    @action(detail=True, methods=['patch'])
    def eliminar_pdf(self, request, pk=None):
        if not is_admin(self.usuario_actual):
            return Response({'error': 'Solo un administrador puede eliminar PDFs'}, status=403)
        resultado = self.get_object()
        if resultado.archivo_pdf:
            resultado.archivo_pdf.delete(save=False)
            resultado.archivo_pdf = None
            resultado.save()
            audit(request, 'editar', resultado, 'PDF de resultado eliminado')
        return Response(ResultadoEstudioSerializer(resultado).data)


class HistorialClinicoViewSet(AuthenticatedViewSetMixin, viewsets.ModelViewSet):
    serializer_class = HistorialClinicoSerializer

    def get_queryset(self):
        queryset = HistorialClinico.objects.select_related(
            'id_paciente__id_cliente__id_usuario',
            'id_paciente__id_raza__id_especie',
        ).all()
        ids = accessible_cliente_ids(self.usuario_actual)
        if ids is not None:
            queryset = queryset.filter(id_paciente__id_cliente__in=ids)
        id_paciente = self.request.query_params.get('id_paciente')
        if id_paciente:
            queryset = queryset.filter(id_paciente=id_paciente)
        return queryset

    def perform_create(self, serializer):
        paciente = serializer.validated_data.get('id_paciente')
        if not user_can_access_paciente(self.usuario_actual, paciente):
            raise PermissionDenied('No puedes crear historial para este paciente')
        instance = serializer.save()
        audit(self.request, 'crear', instance)

    def perform_update(self, serializer):
        instance = self.get_object()
        if not is_admin(self.usuario_actual) and not is_veterinario(self.usuario_actual):
            raise PermissionDenied('No puedes editar este historial')
        instance = serializer.save()
        audit(self.request, 'editar', instance)

    def perform_destroy(self, instance):
        if not is_admin(self.usuario_actual):
            raise PermissionDenied('Solo un administrador puede eliminar historial')
        audit(self.request, 'eliminar', instance)
        instance.delete()

    @action(detail=False, methods=['get'])
    def reporte_por_paciente(self, request):
        reporte = self.get_queryset().values(
            'id_paciente__nombre'
        ).annotate(total_estudios=Count('id_exp'))
        return Response(list(reporte))
