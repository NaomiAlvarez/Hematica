"""
Views para ResultadoEstudio e HistorialClinico.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import ResultadoEstudio, HistorialClinico
from .serializers_resultados import ResultadoEstudioSerializer, HistorialClinicoSerializer


class ResultadoEstudioViewSet(viewsets.ModelViewSet):
    queryset = ResultadoEstudio.objects.all()
    serializer_class = ResultadoEstudioSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        resultado = serializer.save()
        solicitud = resultado.id_solicitud
        solicitud.estado = 'finalizado'
        solicitud.save()
        HistorialClinico.objects.create(
            id_paciente=solicitud.id_paciente,
            diagnostico='Pendiente de revision por veterinario',
            notas='Resultado registrado automaticamente'
        )

    @action(detail=True, methods=['patch'], parser_classes=[MultiPartParser, FormParser])
    def subir_pdf(self, request, pk=None):
        resultado = self.get_object()
        archivo = request.FILES.get('archivo_pdf')
        if not archivo:
            return Response({'error': 'No se envio ningun archivo'}, status=400)
        if not archivo.name.endswith('.pdf'):
            return Response({'error': 'Solo se permiten archivos PDF'}, status=400)
        if archivo.size > 10 * 1024 * 1024:
            return Response({'error': 'El archivo no puede superar 10MB'}, status=400)
        resultado.archivo_pdf = archivo
        resultado.save()
        return Response(ResultadoEstudioSerializer(resultado).data)

    @action(detail=True, methods=['patch'])
    def eliminar_pdf(self, request, pk=None):
        resultado = self.get_object()
        if resultado.archivo_pdf:
            resultado.archivo_pdf.delete(save=False)
            resultado.archivo_pdf = None
            resultado.save()
        return Response(ResultadoEstudioSerializer(resultado).data)


class HistorialClinicoViewSet(viewsets.ModelViewSet):
    serializer_class = HistorialClinicoSerializer

    def get_queryset(self):
        queryset = HistorialClinico.objects.all()
        id_paciente = self.request.query_params.get('id_paciente')
        if id_paciente:
            queryset = queryset.filter(id_paciente=id_paciente)
        return queryset

    @action(detail=False, methods=['get'])
    def reporte_por_paciente(self, request):
        from django.db.models import Count
        reporte = HistorialClinico.objects.values(
            'id_paciente__nombre'
        ).annotate(total_estudios=Count('id_exp'))
        return Response(list(reporte))