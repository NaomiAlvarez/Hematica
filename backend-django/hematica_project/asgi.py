"""Entrada ASGI del backend Hematica.

Se usa si el proyecto se despliega en un servidor compatible con ASGI. En el
desarrollo actual el contenedor suele ejecutar Django con el comando de manage.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hematica_project.settings')

# Objeto que importa el servidor ASGI para atender requests.
application = get_asgi_application()
