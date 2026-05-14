from django.contrib import admin

from .models import Auditoria, Notificacion, PasswordResetToken, TipoUsuario, Usuario


admin.site.register(TipoUsuario)
admin.site.register(Usuario)
admin.site.register(Auditoria)
admin.site.register(Notificacion)
admin.site.register(PasswordResetToken)
