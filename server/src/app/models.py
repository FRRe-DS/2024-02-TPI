# Create your models here.

from django.db import models
from pygments.lexers import get_all_lexers
from pygments.styles import get_all_styles

LEXERS = [item for item in get_all_lexers() if item[1]]
LANGUAGE_CHOICES = sorted([(item[1][0], item[0]) for item in LEXERS])
STYLE_CHOICES = sorted([(item, item) for item in get_all_styles()])


class Snippet(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=100, blank=True, default="")
    code = models.TextField()
    linenos = models.BooleanField(default=False)
    language = models.CharField(
        choices=LANGUAGE_CHOICES, default="python", max_length=100
    )
    style = models.CharField(choices=STYLE_CHOICES, default="friendly", max_length=100)

    class Meta:
        ordering = ["created"]


class UserCustom(models.Model):
    id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=200)
    created = models.DateTimeField(auto_now_add=True)

#falta el qr pero no se me ocurre como modelarlo
class Escultura(models.Model):
    ID_escultura = models.BigAutoField(primary_key=True) 
    nombre = models.CharField(max_length=100)
    descripcion = models.CharField(max_length=300)
    f_creacion = models.DateField() 

#falta foto de perfil pero ahora vemos eso
class Escultor(models.Model):
    nombre = models.CharField(max_length=100)
    nacionalidad = models.CharField(max_length=20)
    correo = models.CharField(max_length=100, primary_key=True)
    bibliografia = models.CharField(max_length=400)

class Visitante(models.Model):
    correo = models.CharField(max_length=100, primary_key=True)
    ID_escultura = models.BigAutoField() 

class Adm_sistemas(models.Model):
    correo = models.CharField(max_length=100, primary_key=True)
    password = models.CharField(max_length=32)

#falta el campo imagen
class Imagenes(models.Model):
    fecha = models.DateField() 

class Evento(models.Model):
    nombre = models.CharField(max_length=100, primary_key=True)
    lugar = models.CharField(max_length=100)
    fecha = models.DateField() 

