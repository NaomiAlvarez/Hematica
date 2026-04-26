"""
Views para el módulo de pacientes.
Cada ViewSet maneja las peticiones HTTP (GET, POST, PUT, DELETE)
para su modelo correspondiente.
DRF genera automáticamente todos los endpoints CRUD
a partir de la clase ModelViewSet.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Especie, Raza, Cliente, Paciente
from .serializers import (
    EspecieSerializer, RazaSerializer,
    ClienteSerializer, PacienteSerializer
)


class EspecieViewSet(viewsets.ModelViewSet):
    queryset = Especie.objects.all()
    serializer_class = EspecieSerializer


class RazaViewSet(viewsets.ModelViewSet):
    serializer_class = RazaSerializer

    def get_queryset(self):
        queryset = Raza.objects.all()
        id_especie = self.request.query_params.get('id_especie')
        if id_especie:
            queryset = queryset.filter(id_especie=id_especie)
        return queryset


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer


class PacienteViewSet(viewsets.ModelViewSet):
    serializer_class = PacienteSerializer

    def get_queryset(self):
        queryset = Paciente.objects.all()
        id_cliente = self.request.query_params.get('id_cliente')
        nombre = self.request.query_params.get('nombre')
        if id_cliente:
            queryset = queryset.filter(id_cliente=id_cliente)
        if nombre:
            queryset = queryset.filter(nombre__icontains=nombre)
        return queryset

    @action(detail=True, methods=['patch'])
    def subir_cartilla(self, request, pk=None):
        paciente = self.get_object()
        archivo = request.FILES.get('cartilla_pdf')
        if not archivo:
            return Response({'error': 'No se envió ningún archivo'}, status=400)
        if not archivo.name.lower().endswith('.pdf'):
            return Response({'error': 'Solo se permiten archivos PDF'}, status=400)
        if archivo.size > 10 * 1024 * 1024:
            return Response({'error': 'El archivo no puede superar 10MB'}, status=400)
        paciente.cartilla_pdf = archivo
        paciente.save()
        return Response(PacienteSerializer(paciente).data)

    @action(detail=True, methods=['patch'])
    def eliminar_cartilla(self, request, pk=None):
        paciente = self.get_object()
        if paciente.cartilla_pdf:
            paciente.cartilla_pdf.delete(save=False)
            paciente.cartilla_pdf = None
            paciente.save()
        return Response(PacienteSerializer(paciente).data)