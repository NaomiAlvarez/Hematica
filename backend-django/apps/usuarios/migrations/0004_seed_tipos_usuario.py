from django.db import migrations


def seed_tipos_usuario(apps, schema_editor):
    TipoUsuario = apps.get_model('usuarios', 'TipoUsuario')
    roles = [
        (1, 'Cliente'),
        (2, 'Veterinario'),
        (3, 'Recepcionista'),
        (4, 'Administrador'),
    ]

    for pk, descripcion in roles:
        TipoUsuario.objects.update_or_create(
            id_tipo_usuario=pk,
            defaults={'descripcion': descripcion},
        )


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0003_alter_usuario_password'),
    ]

    operations = [
        migrations.RunPython(seed_tipos_usuario, migrations.RunPython.noop),
    ]
