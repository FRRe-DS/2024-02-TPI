from rest_framework import serializers
from app.models import Visitante


class VisitanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visitante
        fields = "__all__"
