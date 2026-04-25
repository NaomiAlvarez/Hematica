"""
Views para el módulo de empleados.
Maneja los endpoints del personal del laboratorio:
tipos de empleado, empleados y veterinarios.
Solo los administradores pueden crear, editar o eliminar empleados.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import TipoEmpleado, Empleado, Veterinario, VeterinarioCliente
from .serializers import (
    TipoEmpleadoSerializer,
    EmpleadoSerializer,
    VeterinarioSerializer,
    ClienteSimpleSerializer,
    VeterinarioClienteSerializer
)
from apps.pacientes.models import Cliente


class TipoEmpleadoViewSet(viewsets.ModelViewSet):
    queryset = TipoEmpleado.objects.all()
    serializer_class = TipoEmpleadoSerializer


class EmpleadoViewSet(viewsets.ModelViewSet):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer


class VeterinarioViewSet(viewsets.ModelViewSet):
    queryset = Veterinario.objects.all()
    serializer_class = VeterinarioSerializer

    @action(detail=True, methods=['get'])
    def clientes(self, request, pk=None):
        """
        GET /api/v1/veterinarios/{id}/clientes/
        Retorna la lista de clientes asignados a este veterinario.
        """
        vet = self.get_object()
        clientes = vet.clientes.all()
        serializer = ClienteSimpleSerializer(clientes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def asignar_cliente(self, request, pk=None):
        """
        POST /api/v1/veterinarios/{id}/asignar_cliente/
        Body: { "id_cliente": 1 }
        Asigna un cliente a este veterinario.
        """
        vet = self.get_object()
        id_cliente = request.data.get('id_cliente')

        if not id_cliente:
            return Response({'error': 'id_cliente es requerido'}, status=400)

        try:
            cliente = Cliente.objects.get(id_cliente=id_cliente)
        except Cliente.DoesNotExist:
            return Response({'error': 'Cliente no encontrado'}, status=404)

        # Evitar duplicados
        if VeterinarioCliente.objects.filter(id_vet=vet, id_cliente=cliente).exists():
            return Response({'error': 'Este cliente ya está asignado al veterinario'}, status=400)

        VeterinarioCliente.objects.create(id_vet=vet, id_cliente=cliente)
        return Response({'mensaje': 'Cliente asignado correctamente'}, status=201)

    @action(detail=True, methods=['post'])
    def desasignar_cliente(self, request, pk=None):
        """
        POST /api/v1/veterinarios/{id}/desasignar_cliente/
        Body: { "id_cliente": 1 }
        Desasigna un cliente de este veterinario.
        """
        vet = self.get_object()
        id_cliente = request.data.get('id_cliente')

        if not id_cliente:
            return Response({'error': 'id_cliente es requerido'}, status=400)

        eliminados, _ = VeterinarioCliente.objects.filter(
            id_vet=vet, id_cliente_id=id_cliente
        ).delete()

        if eliminados == 0:
            return Response({'error': 'Este cliente no estaba asignado al veterinario'}, status=404)

        return Response({'mensaje': 'Cliente desasignado correctamente'}, status=200)

    @action(detail=False, methods=['get'])
    def mis_clientes(self, request):
        """
        GET /api/v1/veterinarios/mis_clientes/?id_usuario=10
        Retorna los clientes asignados al veterinario que está logueado.
        """
        id_usuario = request.query_params.get('id_usuario')
        if not id_usuario:
            return Response({'error': 'id_usuario es requerido'}, status=400)

        try:
            vet = Veterinario.objects.get(id_emp__id_usuario__id_usuario=id_usuario)
        except Veterinario.DoesNotExist:
            return Response({'error': 'Veterinario no encontrado'}, status=404)

        clientes = vet.clientes.all()
        serializer = ClienteSimpleSerializer(clientes, many=True)
        return Response(serializer.data)