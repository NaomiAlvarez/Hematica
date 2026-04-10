"""
Views para el módulo de empleados.
Maneja el personal del laboratorio: empleados y veterinarios.
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
    ViewSet para TipoEmpleado.
    Maneja los puestos disponibles en el laboratorio.
    Genera automáticamente:
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
    """
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer


class VeterinarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Veterinario.
    Maneja los veterinarios del laboratorio.
    Los veterinarios se asignan a las solicitudes de estudio
    para procesar las muestras y registrar resultados.
    Genera automáticamente los endpoints CRUD completos.
    """
    queryset = Veterinario.objects.all()
    serializer_class = VeterinarioSerializer