"""
URL raiz del backend de Hematica.

Agrupa el panel de administracion, los modulos de la API versionada y los
archivos media usados durante desarrollo.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('apps.pacientes.urls')),
    path('api/v1/', include('apps.estudios.urls')),
    path('api/v1/', include('apps.empleados.urls')),
    path('api/v1/auth/', include('apps.usuarios.urls')),
    path('api/v1/', include('apps.solicitudes.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
