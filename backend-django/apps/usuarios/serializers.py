from rest_framework import serializers
from .models import Usuario, TipoUsuario

class UsuarioSerializer(serializers.ModelSerializer):
    """
    Serializador para la lectura y visualización de datos del perfil de usuario.
    
    Se utiliza principalmente para retornar información al cliente (output)
    excluyendo datos sensibles como la contraseña.
    """
    class Meta:
        model = Usuario
        # Definimos los campos que se enviarán en el JSON de respuesta
        fields = ['id_usuario', 'nombre', 'correo', 'num_tel', 'id_tipo_usuario']
class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializador especializado en la creación (registro) de nuevos usuarios.
    
    Incluye el campo 'password' para la entrada de datos, pero asegura que
    este sea procesado correctamente antes de guardarlo en la base de datos.
    """
    class Meta:
        model = Usuario
        # Incluimos 'password' ya que es necesario para el registro inicial
        fields = ['nombre', 'correo', 'password', 'num_tel', 'id_tipo_usuario']

    def create(self, validated_data):
        """
        Sobrescribe el método de creación para aplicar hashing a la contraseña.
        
        Args:
            validated_data (dict): Datos ya validados por el serializador.
            
        Returns:
            Usuario: Instancia del nuevo usuario creado con la clave encriptada.
        """
        from django.contrib.auth.hashers import make_password
        
        # Reemplazamos la contraseña en texto plano por su versión hasheada (segura)
        validated_data['password'] = make_password(validated_data['password'])
        
        # Llamamos al método original de la clase padre para guardar el objeto
        return super().create(validated_data)