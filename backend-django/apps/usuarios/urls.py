from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, MeView

# Definición de las rutas de la API para la gestión de usuarios y autenticación
urlpatterns = [
    # Ruta para el registro de nuevos usuarios
    # POST: Recibe datos de usuario y crea una nueva cuenta
    path('register/', RegisterView.as_view(), name='register'),

    # Ruta para el inicio de sesión
    # POST: Recibe credenciales y devuelve tokens de acceso (Access) y actualización (Refresh)
    path('login/', LoginView.as_view(), name='login'),

    # Ruta para renovar el token de acceso
    # POST: Recibe un 'refresh' token válido y entrega un nuevo 'access' token
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Ruta para obtener la información del perfil del usuario autenticado
    # GET: Requiere el token de acceso en las cabeceras (Authorization: Bearer <token>)
    path('me/', MeView.as_view(), name='user_profile'),
]