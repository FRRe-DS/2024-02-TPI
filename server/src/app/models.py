# Create your models here.

from django.db import models
# from pygments.lexers import get_all_lexers
# from pygments.styles import get_all_styles

# LEXERS = [item for item in get_all_lexers() if item[1]]
# LANGUAGE_CHOICES = sorted([(item[1][0], item[0]) for item in LEXERS])
# STYLE_CHOICES = sorted([(item, item) for item in get_all_styles()])


# class Snippet(models.Model):
#     created = models.DateTimeField(auto_now_add=True)
#     title = models.CharField(max_length=100, blank=True, default="")
#     code = models.TextField()
#     linenos = models.BooleanField(default=False)
#     language = models.CharField(
#         choices=LANGUAGE_CHOICES, default="python", max_length=100
#     )
#     style = models.CharField(choices=STYLE_CHOICES, default="friendly", max_length=100)

#     class Meta:
#         ordering = ["created"]


# class UserCustom(models.Model):
#     id = models.BigAutoField(primary_key=True)
#     username = models.CharField(max_length=200)
#     created = models.DateTimeField(auto_now_add=True)

#ready
class Escultura(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)
    descripcion = models.CharField(max_length=300, blank=True, null=True)
    fecha_creacion = models.DateField() 
    qr = models.FileField(upload_to='qr/', blank=True, null=True)

#ready
class Pais(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)

#ready
class Escultor(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)
    pais_id = models.ForeignKey(Pais, on_delete=models.CASCADE, db_column='pais_id')
    correo = models.EmailField(null=True, blank=True, unique=True)
    foto = models.FileField(upload_to='perfiles/', blank=True, null=True)
    bibliografia = models.CharField(max_length=400)

#ready
class Visitante(models.Model):
    id = models.AutoField(primary_key=True)
    correo = models.EmailField(null=True, blank=True, unique=True)

#ready
class Adm_sistemas(models.Model):
    id = models.AutoField(primary_key=True)
    correo = models.EmailField(null=True, blank=True, unique=True)
    password = models.CharField(max_length=32)

#ready
class Imagen(models.Model):
    id = models.AutoField(primary_key=True)
    fecha = models.DateField() 
    imagen = models.FileField(upload_to='imagenes/', blank=True, null=True)
    descripcion = models.CharField(max_length=255, blank=True, null=True)


#ready
class Tematica(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)
    descripcion = models.CharField(max_length=255, blank=True, null=True)

#ready
class Lugar(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)
    descripcion = models.CharField(max_length=255, blank=True, null=True)

#ready
class Evento(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)
    lugar_id = models.ForeignKey(Lugar, on_delete=models.CASCADE, db_column='lugar_id')
    fecha_inicio = models.DateField() 
    fecha_fin = models.DateField() 
    descripcion = models.CharField(max_length=255, blank=True, null=True)
    tematica_id = models.ForeignKey(Tematica, on_delete=models.CASCADE, db_column='tematica_id')
    
#ready
class EsculturaImagen(models.Model):
    id = models.AutoField(primary_key=True)
    escultura_id = models.ForeignKey(Escultura, on_delete=models.CASCADE, db_column='escultura_id')
    imagen_id = models.ForeignKey(Imagen, on_delete=models.CASCADE, db_column='imagen_id')

#ready
class EsculturaImagen(models.Model):
    id = models.AutoField(primary_key=True)
    escultura_id = models.ForeignKey(Escultura, on_delete=models.CASCADE, db_column='escultura_id')
    imagen_id = models.ForeignKey(Imagen, on_delete=models.CASCADE, db_column='imagen_id')

#ready
class Escultorevento(models.Model):
    id = models.AutoField(primary_key=True)
    escultor_id = models.ForeignKey(Escultor, on_delete=models.CASCADE, db_column='escultor_id')
    evento_id = models.ForeignKey(Evento, on_delete=models.CASCADE, db_column='evento_id')

#ready
class VotoEscultura(models.Model):
    id = models.AutoField(primary_key=True)
    escultura_id = models.ForeignKey(Escultura, on_delete=models.CASCADE, db_column='escultura_id')
    visitante_id = models.ForeignKey(Visitante, on_delete=models.CASCADE, db_column='visitante_id')
#ready
class VotoEscultor(models.Model):
    id = models.AutoField(primary_key=True)
    escultor_id = models.ForeignKey(Escultor, on_delete=models.CASCADE, db_column='escultor_id')
    visitante_id = models.ForeignKey(Visitante, on_delete=models.CASCADE, db_column='visitante_id')
