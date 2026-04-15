"""
Archivo principal de URLs del proyecto Hemática.
Aquí se registran todas las rutas de la API agrupadas por módulo.
Todas las rutas tienen el prefijo /api/v1/ siguiendo el contrato de API.

Rutas disponibles:
  /admin/                    -> Panel de administración de Django
  /api/v1/especies/          -> Listado y gestión de especies
  /api/v1/razas/             -> Listado y gestión de razas
  /api/v1/clientes/          -> Gestión de clientes (tutores)
  /api/v1/pacientes/         -> Gestión de pacientes (mascotas)
  /api/v1/estudios/          -> Catálogo de estudios disponibles
  /api/v1/tipos-empleado/    -> Gestión de tipos de empleado
  /api/v1/empleados/         -> Gestión de empleados
  /api/v1/veterinarios/      -> Gestión de veterinarios

Próximas rutas a agregar (Naomi):
  /api/v1/auth/              -> Autenticación JWT (login, register, me)
  /api/v1/solicitudes/       -> Gestión de solicitudes de estudio
  /api/v1/resultados/        -> Resultados de estudios
  /api/v1/historial/         -> Historial clínico de pacientes
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Panel de administración de Django
    path('admin/', admin.site.urls),

    path('api/v1/auth/', include('usuarios.urls')),  # Rutas de autenticación y gestión de usuarios

    # Módulo de pacientes: especies, razas, clientes, pacientes
    path('api/v1/', include('pacientes.urls')),

    # Módulo de estudios: catálogo de estudios disponibles
    path('api/v1/', include('estudios.urls')),

    # Módulo de empleados: tipos de empleado, empleados, veterinarios
    path('api/v1/', include('empleados.urls')),
]