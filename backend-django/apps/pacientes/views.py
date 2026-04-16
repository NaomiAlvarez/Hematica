"""
Views para el módulo de pacientes.
Cada ViewSet maneja las peticiones HTTP (GET, POST, PUT, DELETE)
para su modelo correspondiente.
DRF genera automáticamente todos los endpoints CRUD
a partir de la clase ModelViewSet.
"""
from rest_framework import viewsets
from .models import Especie, Raza, Cliente, Paciente
from .serializers import (
    EspecieSerializer, RazaSerializer,
    ClienteSerializer, PacienteSerializer
)


class EspecieViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Especie.
    Genera automáticamente los siguientes endpoints:
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
    Permite filtrar razas por especie usando ?id_especie=X en la URL.
    Genera los mismos endpoints CRUD que EspecieViewSet pero para razas.
    Ejemplo de filtro: GET /api/v1/razas/?id_especie=1
    retorna solo las razas de la especie Canino.
    """
    serializer_class = RazaSerializer

    def get_queryset(self):
        """
        Retorna el queryset de razas.
        Si se pasa el parámetro ?id_especie=X en la URL,
        filtra y retorna solo las razas de esa especie.
        Si no se pasa ningún parámetro, retorna todas las razas.
        """
        queryset = Raza.objects.all()
        id_especie = self.request.query_params.get('id_especie')
        if id_especie:
            queryset = queryset.filter(id_especie=id_especie)
        return queryset


class ClienteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Cliente (tutor de mascotas).
    Genera los endpoints CRUD completos para gestionar clientes.
    Solo el personal del laboratorio puede listar todos los clientes.
    Un cliente solo puede ver y editar su propio perfil.
    """
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer


class PacienteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Paciente (mascota).
    Permite filtrar mascotas por cliente usando ?id_cliente=X en la URL.
    También permite buscar por nombre usando ?nombre=X en la URL.
    Ejemplos:
      GET /api/v1/pacientes/?id_cliente=1  -> mascotas del cliente 1
      GET /api/v1/pacientes/?nombre=Luna   -> mascotas que se llamen Luna
    """
    serializer_class = PacienteSerializer

    def get_queryset(self):
        """
        Retorna el queryset de pacientes con filtros opcionales.
        Parámetros de filtro disponibles en la URL:
          ?id_cliente=X -> filtra las mascotas de ese cliente
          ?nombre=X     -> filtra por nombre de mascota (búsqueda parcial)
        Si no se pasa ningún parámetro, retorna todas las mascotas.
        """
        queryset = Paciente.objects.all()
        id_cliente = self.request.query_params.get('id_cliente')
        nombre = self.request.query_params.get('nombre')
        if id_cliente:
            queryset = queryset.filter(id_cliente=id_cliente)
        if nombre:
            queryset = queryset.filter(nombre__icontains=nombre)
        return queryset