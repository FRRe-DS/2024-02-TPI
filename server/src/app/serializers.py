from rest_framework import serializers
from django.db.models import Sum
from django.db.models.base import Coalesce
from django.contrib.auth.models import User
from .models import (
    Votante,
    Evento,
    Escultura,
    Escultor,
    Imagen,
    Pais,
    Tematica,
    Lugar,
    VotoEscultor,
    EscultorEvento,
)


class VotanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Votante
        fields = "__all__"


class TematicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tematica
        fields = "__all__"


class LugarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lugar
        fields = "__all__"


class EventoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = "__all__"


class EventoReadSerializer(serializers.ModelSerializer):
    tematica = TematicaSerializer(source="tematica_id")
    lugar = LugarSerializer(source="lugar_id")

    class Meta:
        model = Evento
        fields = "__all__"


class EventosBienalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = ["id", "nombre", "fecha_inicio", "finalizado"]


class EscultorEventoReadSerializer(serializers.ModelSerializer):
    evento = EventoReadSerializer(source="evento_id")

    class Meta:
        model = EscultorEvento
        fields = "__all__"


class EscultorEventoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = EscultorEvento
        fields = "__all__"


class VotoEscultorSerializer(serializers.ModelSerializer):
    class Meta:
        model = VotoEscultor
        fields = "__all__"


class ImagenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Imagen
        fields = "__all__"


class EsculturaSerializer(serializers.ModelSerializer):
    imagenes = ImagenSerializer(many=True, read_only=True)

    class Meta:
        model = Escultura
        fields = "__all__"


class PaisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pais
        fields = "__all__"


class EscultorReadSerializer(serializers.ModelSerializer):
    pais = PaisSerializer(source="pais_id")
    esculturas = EsculturaSerializer(many=True, read_only=True)
    nombre_completo = serializers.CharField(source="__str__", read_only=True)
    eventos = EscultorEventoReadSerializer(source="escultorevento_set", many=True)
    total_puntaje = serializers.SerializerMethodField()

    class Meta:
        model = Escultor
        fields = "__all__"

    def get_total_puntaje(self, obj):
        # Calculamos el total del puntaje usando la relación con VotoEscultor
        return obj.votoescultor_set.aggregate(
            total_puntaje=Coalesce(Sum("puntaje"), 0)
        )["total_puntaje"]


class EscultorWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Escultor
        fields = "__all__"


# Aca usamos el modelo que brinda django para la autenticaciones
# Esta piola igual ya que encripta las password cuando las guarda y las desencripta cuando las trae
class AdminSisSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
