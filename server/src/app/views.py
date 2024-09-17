from django.http import JsonResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response
from app.models import (
    Visitante,
    Escultor,
    Escultura,
    Pais,
    Lugar,
    Imagen,
    Tematica,
)
from app.serializers import (
    VisitanteSerializer,
    EscultorSerializer,
    PaisSerializer,
    LugarSerializer,
    ImagenSerializer,
    TematicaSerializer,
    EsculturaSerializer,
    AdminSisSerializer,
)
from rest_framework import status, viewsets, permissions
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action 


# Esto solo lo incluyo para tener un ejemplo.
@api_view(["GET"])
def celery_task_ejemplo(request: Request) -> JsonResponse:
    from .tasks import count_visitantes

    result = count_visitantes.delay()

    return JsonResponse({"task_id": result.id, "status": "Task started!"})


@api_view(["GET"])
def check_task_status(request, task_id) -> JsonResponse:
    from celery.result import AsyncResult

    task_result = AsyncResult(task_id)

    return JsonResponse(
        {"task_id": task_id, "status": task_result.status, "result": task_result.result}
    )


@api_view(["GET"])
def health_check(request: Request) -> Response:
    return Response(status=status.HTTP_204_NO_CONTENT)


class VisitanteViewSet(viewsets.ModelViewSet):
    queryset = Visitante.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = VisitanteSerializer


class EsculturaViewSet(viewsets.ModelViewSet):
    queryset = Escultura.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = EsculturaSerializer


class EscultorViewSet(viewsets.ModelViewSet):
    queryset = Escultor.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = EscultorSerializer


class ImagenViewSet(viewsets.ModelViewSet):
    queryset = Imagen.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = ImagenSerializer


class PaisViewSet(viewsets.ModelViewSet):
    queryset = Pais.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = PaisSerializer


class AdminSisViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = AdminSisSerializer

    #basicamente es el metodo post
    #pero a este lo sobreescribo para que genere el token de cada nuevo admin
    def create(self, request, *args, **kwargs):
        serializer = AdminSisSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            userAdmin = User.objects.get(username=serializer.data['username']) 
            userAdmin.set_password(serializer.data['password'])
            userAdmin.save()

            token = Token.objects.create(user=userAdmin)

            return Response({'token': token.key}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    #esta es la forma de obtener el token de un admin
    #se obtiene haciendo un post con los datos pedidos a la rutaBase/get_token/
    #es decir api/adminsis/get_token/
    @action(detail=False, methods=['post'])
    def get_token(self, request):
        userAdmin = get_object_or_404(User, email=request.data['email'])

        if not userAdmin.check_password(request.data['password']):
            return Response({"error": "contra incorrecta"}, status=status.HTTP_400_BAD_REQUEST)

        token, created = Token.objects.get_or_create(user=userAdmin)

        return Response({"token": token.key}, status=status.HTTP_200_OK)


class TematicaViewSet(viewsets.ModelViewSet):
    queryset = Tematica.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = TematicaSerializer


class LugarViewSet(viewsets.ModelViewSet):
    queryset = Lugar.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = LugarSerializer


"""
@api_view(["GET"])
def getVisitantesData(request: Request) -> Response:
    users = Visitante.objects.all()
    serializer = VisitanteSerializer(users, many=True)
    return Response(status=status.HTTP_200_OK, data=serializer.data)

@api_view(["GET"])
def getEscultor(request: Request)-> Response:
    escultores = Escultor.objects.all()
    serializer = EscultorSerializer(escultores, many=True)
    return Response(status=status.HTTP_200_OK, data=serializer.data)

@api_view(["GET"])
def getEsculturas(request: Request)-> Response:
    esculturas = Escultura.objects.all()
    serializer = EsculturaSerializer(esculturas, many=True)
    return Response(status=status.HTTP_200_OK, data=serializer.data)

@api_view(["GET"])
def getEventos(request: Request)-> Response:
    evento = Evento.objects.all()
    serializer = EventoSerializer(evento, many=True)
    return Response(status=status.HTTP_200_OK, data=serializer.data)

@api_view(["GET"])
def getImg(request: Request)-> Response:
    img = Imagen.objects.all()
    serializer = ImagenSerializer(img, many=True)
    return Response(status=status.HTTP_200_OK, data=serializer.data)

#POST

@api_view(["POST"])
def addVisitante(request: Request) -> Response:
    serializer = VisitanteSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(status=status.HTTP_201_CREATED, data=serializer.data)

    return Response(status=status.HTTP_400_BAD_REQUEST, data=serializer.data)
"""
