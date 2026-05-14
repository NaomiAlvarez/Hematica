from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    MeView,
    ActualizarUsuarioView,
    AdminAuditoriaView,
    AdminUsuariosView,
    AdminTiposUsuarioView,
    AdminAsignarRolView,
    NotificacionMarcarLeidaView,
    NotificacionesView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('refresh/', TokenRefreshView.as_view()),
    path('me/', MeView.as_view()),
    path('actualizar/', ActualizarUsuarioView.as_view()),
    path('password-reset/', PasswordResetRequestView.as_view()),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view()),
    path('notificaciones/', NotificacionesView.as_view()),
    path('notificaciones/<int:id_notificacion>/leer/', NotificacionMarcarLeidaView.as_view()),
    path('auditoria/', AdminAuditoriaView.as_view()),
    path('usuarios/', AdminUsuariosView.as_view()),
    path('tipos-usuario/', AdminTiposUsuarioView.as_view()),
    path('usuarios/<int:id_usuario>/rol/', AdminAsignarRolView.as_view()),
]
