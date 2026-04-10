"""
Archivo principal de URLs del proyecto Hemática.
Aquí se registran todas las rutas de la API agrupadas por módulo.
Todas las rutas tienen el prefijo /api/v1/ siguiendo el contrato de API.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Panel de administración de Django
    path('admin/', admin.site.urls),

    # Módulo de pacientes: especies, razas, clientes, pacientes
    path('api/v1/', include('pacientes.urls')),

    # Módulo de estudios: catálogo de estudios disponibles
    path('api/v1/', include('estudios.urls')),

    # Módulo de empleados: tipos de empleado, empleados, veterinarios
    path('api/v1/', include('empleados.urls')),
]