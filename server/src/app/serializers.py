from rest_framework import serializers
from app.models import UserCustom


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCustom
        fields = "__all__"

    # TODO: Aca existe el bug de que acepta un integer o float como un string sin problemas.
