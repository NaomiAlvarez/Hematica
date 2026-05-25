from django.db import migrations


def seed_tipos_empleado(apps, schema_editor):
    TipoEmpleado = apps.get_model('empleados', 'TipoEmpleado')
    tipos = [
        (2, 'Veterinario', 'Medico veterinario que procesa muestras y atiende pacientes.'),
        (3, 'Recepcionista', 'Personal de recepcion y atencion del laboratorio.'),
        (4, 'Administrador', 'Usuario con permisos de administracion del sistema.'),
    ]

    for pk, puesto, descripcion in tipos:
        TipoEmpleado.objects.update_or_create(
            id_tipo_emp=pk,
            defaults={'puesto': puesto, 'descripcion': descripcion},
        )


class Migration(migrations.Migration):

    dependencies = [
        ('empleados', '0003_alter_empleado_direccion_alter_empleado_id_tipo_emp_and_more'),
    ]

    operations = [
        migrations.RunPython(seed_tipos_empleado, migrations.RunPython.noop),
    ]
