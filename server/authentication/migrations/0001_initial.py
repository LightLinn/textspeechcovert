# Generated by Django 5.0 on 2023-12-11 09:56

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='PLF_FunctionRole',
            fields=[
                ('id', models.AutoField(db_column='function_role_id', editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.CharField(blank=True, max_length=200, null=True)),
                ('permissions', models.JSONField()),
                ('is_active', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('file', models.FileField(upload_to='function_role/create/')),
            ],
            options={
                'verbose_name_plural': 'PLF_FunctionRole',
                'db_table': 'PLF_FunctionRole',
            },
        ),
    ]
