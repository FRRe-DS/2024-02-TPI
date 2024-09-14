from rest_framework import serializers
from .models import (
    Visitante,
    Evento,
    Escultura,
    Escultor,
    Imagen,
    Pais,
    Tematica,
    Lugar,
    AdminSistema,
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


class AdminSisSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminSistema
        fields = "__all__"


class TematicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tematica
        fields = "__all__"


class LugarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lugar
        fields = "__all__"
