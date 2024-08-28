from rest_framework import serializers
from app.models import Snippet, LANGUAGE_CHOICES, STYLE_CHOICES, UserCustom


# class UserSerializer(serializers.HyperlinkedModelSerializer):
#     class Meta:
#         model = User
#         fields = ["url", "username", "email", "groups"]


# class GroupSerializer(serializers.HyperlinkedModelSerializer):
#     class Meta:
#         model = Group
#         fields = ["url", "name"]


class SnippetSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(required=False, allow_blank=True, max_length=100)
    code = serializers.CharField(style={"base_template": "textarea.html"})
    linenos = serializers.BooleanField(required=False)
    language = serializers.ChoiceField(choices=LANGUAGE_CHOICES, default="python")
    style = serializers.ChoiceField(choices=STYLE_CHOICES, default="friendly")

    def create(self, validated_data):
        """
        Crea y retorna una nueva instancia de `Snippet`, con los datos validados
        """
        return Snippet.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """
        Actuliza y retorno una instancia de `Snippet` existente, a partir de los datos validados.
        """
        instance.title = validated_data.get("title", instance.title)
        instance.code = validated_data.get("code", instance.code)
        instance.linenos = validated_data.get("linenos", instance.linenos)
        instance.language = validated_data.get("language", instance.language)
        instance.style = validated_data.get("style", instance.style)
        instance.save()
        return instance


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserCustom
        fields = "__all__"

    # TODO: Aca existe el bug de que acepta un integer o float como un string sin problemas.
