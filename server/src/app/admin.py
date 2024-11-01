# Register your models here.

from django.contrib import admin
from .models import Escultura, Escultor, Evento, Imagen, Votante

admin.site.register(Escultura)
admin.site.register(Escultor)
admin.site.register(Evento)
admin.site.register(Imagen)
admin.site.register(Votante)
