"""
Views para el módulo de empleados.
Maneja los endpoints del personal del laboratorio:
tipos de empleado, empleados y veterinarios.
Solo los administradores pueden crear, editar o eliminar empleados.
"""
from rest_framework import viewsets
from .models import TipoEmpleado, Empleado, Veterinario
from .serializers import (
    TipoEmpleadoSerializer,
    EmpleadoSerializer,
    VeterinarioSerializer
)


class TipoEmpleadoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para TipoEmpleado (puestos del laboratorio).
    Genera automáticamente los siguientes endpoints:
      GET    /api/v1/tipos-empleado/        -> lista todos los puestos
      POST   /api/v1/tipos-empleado/        -> crea un puesto nuevo
      GET    /api/v1/tipos-empleado/{id}/   -> detalle de un puesto
      PUT    /api/v1/tipos-empleado/{id}/   -> edita un puesto
      DELETE /api/v1/tipos-empleado/{id}/   -> elimina un puesto
    """
    queryset = TipoEmpleado.objects.all()
    serializer_class = TipoEmpleadoSerializer


class EmpleadoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Empleado.
    Maneja el personal general del laboratorio.
    Genera automáticamente los endpoints CRUD completos.
    Solo los administradores pueden gestionar empleados.
    Endpoints generados:
      GET    /api/v1/empleados/        -> lista todos los empleados
      POST   /api/v1/empleados/        -> registra un empleado nuevo
      GET    /api/v1/empleados/{id}/   -> detalle de un empleado
      PUT    /api/v1/empleados/{id}/   -> edita datos de un empleado
      DELETE /api/v1/empleados/{id}/   -> elimina un empleado
    """
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer


class VeterinarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Veterinario.
    Los veterinarios son empleados con datos profesionales adicionales.
    Se usan para asignarlos a solicitudes de estudio
    y que procesen las muestras y registren resultados clínicos.
    Endpoints generados:
      GET    /api/v1/veterinarios/        -> lista todos los veterinarios
      POST   /api/v1/veterinarios/        -> registra un veterinario nuevo
      GET    /api/v1/veterinarios/{id}/   -> detalle de un veterinario
      PUT    /api/v1/veterinarios/{id}/   -> edita datos de un veterinario
      DELETE /api/v1/veterinarios/{id}/   -> elimina un veterinario
    """
    queryset = Veterinario.objects.all()
    serializer_class = VeterinarioSerializer