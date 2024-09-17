from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Visitante,
    Evento,
    Escultura,
    Escultor,
    Imagen,
    Pais,
    Tematica,
    Lugar,
)


class VisitanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visitante
        fields = "__all__"


class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = "__all__"


class EsculturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Escultura
        fields = "__all__"


class EscultorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Escultor
        fields = "__all__"


class ImagenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Imagen
        fields = "__all__"


class PaisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pais
        fields = "__all__"

#Aca usamos el modelo que brinda django para la autenticaciones
#Esta piola igual ya que encripta las password cuando las guarda y las desencripta cuando las trae
class AdminSisSerializer(serializers.ModelSerializer):
    class Meta:
        model = User 
        fields = ['id', 'username', 'email', 'password'] 


class TematicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tematica
        fields = "__all__"


class LugarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lugar
        fields = "__all__"
