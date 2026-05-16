"""ViewSets del modulo de empleados y veterinarios.

El administrador puede operar empleados y asignaciones. Un veterinario solo ve
su propio registro y sus clientes asignados.
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from apps.pacientes.models import Cliente
from apps.security import AdminWriteMixin, audit, is_admin, veterinario_for_usuario
from .models import Empleado, TipoEmpleado, Veterinario, VeterinarioCliente
from .serializers import (
    ClienteSimpleSerializer,
    EmpleadoSerializer,
    TipoEmpleadoSerializer,
    VeterinarioClienteSerializer,
    VeterinarioSerializer,
)


class TipoEmpleadoViewSet(AdminWriteMixin, viewsets.ModelViewSet):
    """CRUD de puestos laborales; las escrituras son solo para admin."""
    queryset = TipoEmpleado.objects.all()
    serializer_class = TipoEmpleadoSerializer

    def check_permissions(self, request):
        super().check_permissions(request)
        self.check_admin_write()


class EmpleadoViewSet(AdminWriteMixin, viewsets.ModelViewSet):
    """CRUD de empleados con lectura y escritura restringidas a admin."""
    serializer_class = EmpleadoSerializer

    def check_permissions(self, request):
        super().check_permissions(request)
        if not is_admin(self.usuario_actual):
            raise PermissionDenied('Solo un administrador puede consultar empleados')

    def get_queryset(self):
        return Empleado.objects.select_related('id_usuario', 'id_tipo_emp').all()

    def perform_create(self, serializer):
        instance = serializer.save()
        audit(self.request, 'crear', instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        audit(self.request, 'editar', instance)

    def perform_destroy(self, instance):
        audit(self.request, 'eliminar', instance)
        instance.delete()


class VeterinarioViewSet(AdminWriteMixin, viewsets.ModelViewSet):
    """Gestiona perfiles veterinarios y sus asignaciones de clientes."""
    serializer_class = VeterinarioSerializer

    def get_queryset(self):
        """Admin ve todos; veterinario ve solo su propio perfil."""
        queryset = Veterinario.objects.select_related('id_emp__id_usuario', 'id_emp')
        if not is_admin(self.usuario_actual):
            vet = veterinario_for_usuario(self.usuario_actual)
            return queryset.filter(id_vet=vet.id_vet) if vet else queryset.none()
        return queryset.all()

    def perform_create(self, serializer):
        if not is_admin(self.usuario_actual):
            raise PermissionDenied('Solo un administrador puede crear veterinarios')
        instance = serializer.save()
        audit(self.request, 'crear', instance)

    def perform_update(self, serializer):
        if not is_admin(self.usuario_actual):
            raise PermissionDenied('Solo un administrador puede editar veterinarios')
        instance = serializer.save()
        audit(self.request, 'editar', instance)

    def perform_destroy(self, instance):
        if not is_admin(self.usuario_actual):
            raise PermissionDenied('Solo un administrador puede eliminar veterinarios')
        audit(self.request, 'eliminar', instance)
        instance.delete()

    @action(detail=True, methods=['get'])
    def clientes(self, request, pk=None):
        """Lista los clientes asignados a un veterinario concreto."""
        vet = self.get_object()
        clientes = vet.clientes.all()
        serializer = ClienteSimpleSerializer(clientes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def asignar_cliente(self, request, pk=None):
        """Crea la relacion veterinario-cliente, evitando duplicados."""
        if not is_admin(self.usuario_actual):
            return Response({'error': 'Solo un administrador puede asignar clientes'}, status=403)
        vet = self.get_object()
        id_cliente = request.data.get('id_cliente')

        if not id_cliente:
            return Response({'error': 'id_cliente es requerido'}, status=400)

        try:
            cliente = Cliente.objects.get(id_cliente=id_cliente)
        except Cliente.DoesNotExist:
            return Response({'error': 'Cliente no encontrado'}, status=404)

        if VeterinarioCliente.objects.filter(id_vet=vet, id_cliente=cliente).exists():
            return Response({'error': 'Este cliente ya esta asignado al veterinario'}, status=400)

        relacion = VeterinarioCliente.objects.create(id_vet=vet, id_cliente=cliente)
        audit(request, 'crear', relacion, 'Cliente asignado a veterinario')
        return Response({'mensaje': 'Cliente asignado correctamente'}, status=201)

    @action(detail=True, methods=['post'])
    def desasignar_cliente(self, request, pk=None):
        """Elimina la relacion veterinario-cliente si existe."""
        if not is_admin(self.usuario_actual):
            return Response({'error': 'Solo un administrador puede desasignar clientes'}, status=403)
        vet = self.get_object()
        id_cliente = request.data.get('id_cliente')

        if not id_cliente:
            return Response({'error': 'id_cliente es requerido'}, status=400)

        eliminados, _ = VeterinarioCliente.objects.filter(
            id_vet=vet, id_cliente_id=id_cliente
        ).delete()

        if eliminados == 0:
            return Response({'error': 'Este cliente no estaba asignado al veterinario'}, status=404)

        audit(request, 'eliminar', vet, f'Cliente {id_cliente} desasignado de veterinario')
        return Response({'mensaje': 'Cliente desasignado correctamente'}, status=200)

    @action(detail=False, methods=['get'])
    def mis_clientes(self, request):
        """Endpoint auxiliar para que un veterinario consulte sus clientes."""
        vet = veterinario_for_usuario(self.usuario_actual)
        if not vet:
            return Response({'error': 'Veterinario no encontrado'}, status=404)

        clientes = vet.clientes.all()
        serializer = ClienteSimpleSerializer(clientes, many=True)
        return Response(serializer.data)
