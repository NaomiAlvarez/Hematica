"""
Views para el módulo de pacientes.
Maneja los endpoints de especies, razas, clientes y pacientes.
Cada ViewSet genera automáticamente los endpoints GET, POST, PUT y DELETE.
"""
from rest_framework import viewsets, filters
from rest_framework.response import Response
from .models import Especie, Raza, Cliente, Paciente
from .serializers import (
    EspecieSerializer, RazaSerializer,
    ClienteSerializer, PacienteSerializer
)


class EspecieViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Especie.
    Genera automáticamente:
      GET    /api/v1/especies/        -> lista todas las especies
      POST   /api/v1/especies/        -> crea una especie nueva
      GET    /api/v1/especies/{id}/   -> detalle de una especie
      PUT    /api/v1/especies/{id}/   -> edita una especie
      DELETE /api/v1/especies/{id}/   -> elimina una especie
    """
    queryset = Especie.objects.all()
    serializer_class = EspecieSerializer


class RazaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Raza.
    Permite filtrar por especie usando ?id_especie=1 en la URL.
    Genera los mismos endpoints que EspecieViewSet pero para razas.
    """
    serializer_class = RazaSerializer

    def get_queryset(self):
        """
        Retorna todas las razas.
        Si se pasa ?id_especie=X en la URL, filtra por esa especie.
        Ejemplo: GET /api/v1/razas/?id_especie=1
        """
        queryset = Raza.objects.all()
        id_especie = self.request.query_params.get('id_especie')
        if id_especie:
            queryset = queryset.filter(id_especie=id_especie)
        return queryset


class ClienteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Cliente (tutor de mascotas).
    Genera los endpoints CRUD completos para clientes.
    """
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer


class PacienteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Paciente (mascota).
    Permite filtrar por cliente usando ?id_cliente=1 en la URL.
    Ejemplo: GET /api/v1/pacientes/?id_cliente=1
    retorna todas las mascotas de ese cliente.
    """
    serializer_class = PacienteSerializer

    def get_queryset(self):
        """
        Retorna todos los pacientes.
        Si se pasa ?id_cliente=X filtra las mascotas de ese cliente.
        Si se pasa ?nombre=X filtra por nombre de mascota.
        """
        queryset = Paciente.objects.all()
        id_cliente = self.request.query_params.get('id_cliente')
        nombre = self.request.query_params.get('nombre')
        if id_cliente:
            queryset = queryset.filter(id_cliente=id_cliente)
        if nombre:
            queryset = queryset.filter(nombre__icontains=nombre)
        return queryset