"""
Views para ResultadosEstudio e HistorialClinico. 
Al crear un resultado, actualiza automaticamente la solicitud a finalizado y crea una entrada en el historial clinico del paciente.
"""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response 
from .models import ResultadoEstudio, HistorialClinico
from .serializers_resultados import ResultadoEstudioSerializer,HistorialClinicoSerializer

class ResultadoEstudioViewSet(viewsets.ModelViewSet):
    queryset = ResultadoEstudio.objects.all()
    serializer_class = ResultadoEstudioSerializer

    def perform_create(self, serializer):
        resultado = serializer.save()
        #Actualiza el estado de la solicitud a finalizado
        solicitud = resultado.id_solicitud
        solicitud.estado = 'finalizado'
        solicitud.save()

        #Crea automaticamente el historial clinico 

        HistorialClinico.objects.create(
            id_paciente=solicitud.id_paciente,
            diagnostico='Pendiente de revision por veterinario',
            notas='Resultado registrado automaticamente'
        )

class HistorialClinicoViewSet (viewsets.ModelViewSet):
    serializer_class = HistorialClinicoSerializer

    def get_queryset(self):
        queryset =  HistorialClinico.objects.all()
        id_paciente = self.request.query_params.get('id_paciente')
        if id_paciente :
            queryset = queryset.filter(id_paciente=id_paciente)
            return queryset
@action(detail=False, methods=['get'])
def reporte_por_paciente(self, request):
    from django.db.models import Count 
    reporte=HistorialClinico.objects.values('id_paciente_nombre').annotate(total_estudios=Count('id_exp'))
    return Response(list(reporte))