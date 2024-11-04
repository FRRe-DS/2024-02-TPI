import random

import requests
from django.contrib.auth.models import User
from django.db.models import ObjectDoesNotExist
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import authentication, permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action, api_view
from rest_framework.request import Request
from rest_framework.response import Response

from app.models import (
    Escultor,
    Escultura,
    Evento,
    Imagen,
    Lugar,
    Pais,
    Tematica,
    Votante,
    VotoEscultor,
)
from app.serializers import (
    AdminSisSerializer,
    EscultorSerializer,
    EsculturaSerializer,
    EventoSerializer,
    ImagenSerializer,
    LugarSerializer,
    PaisSerializer,
    TematicaSerializer,
    VotanteSerializer,
    VotoEscultorSerializer,
)


@api_view(["GET"])
def celery_task_ejemplo(request: Request) -> JsonResponse:
    """
    Ejemplo temporal para chequear que la integración entre celery y Django funcione correctamente.
    """

    from .tasks import count_votantes

    result = count_votantes.delay()

    return JsonResponse({"task_id": result.id, "status": "Task started!"})


@api_view(["GET"])
def check_task_status(request, task_id) -> JsonResponse:
    """
    Ejemplo temporal para chequear que la integración entre celery y Django funcione correctamente.
    """
    from celery.result import AsyncResult

    task_result = AsyncResult(task_id)

    return JsonResponse(
        {"task_id": task_id, "status": task_result.status, "result": task_result.result}
    )


@api_view(["GET"])
def health_check(request: Request) -> Response:
    """
    Endpoint para consultar el estado del servidor.
    """
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
def generarQR(request):
    escultor_id = request.GET.get("escultor_id")
    # aqui debemos poner la url de la pagina de votacion, a la cual deberemos pasarle la id de la escultura
    url = "https://enzovallejos.github.io/VotoEscultorprueba/?id_escultura={id}".format(
        id=escultor_id
    )

    if escultor_id is None:
        return Response(
            {"error": "Debe ingresar por query parameters el id de la escultura"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # creo un hash random para el qr asi va a ser diferente cada vez
    hash_id = random.getrandbits(128)
    # acorto el link
    url_short = ("https://ulvis.net/api.php?url={url}&custom= %032x" % hash_id).format(
        url=url
    )

    r = requests.get(url_short)

    return Response(
        {
            "qr": "http://api.qrserver.com/v1/create-qr-code/?data={}&size=200x200".format(
                r.text
            )
        }
    )


class VotanteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar objetos Votantes.

    Provee operatciones CRUD para el control de Votantes.

    Implementa capacidades de filtrado y búsqueda.

    API Endpoints:
      -  list:   GET /api/votantes/
      -  create: POST /api/votantes/
      -  retrieve: GET /api/votantes/{id}/
      -  update: PUT /api/votantes/{id}/
      -  partial_update: PATCH /api/votantes/{id}/
      -  destroy: DELETE /api/votantes/{id}/
      -  archive: POST /api/votantes/{id}/archive/
      -  featured: GET /api/votantes/featured/

    Campos de busqueda:
        - id
        - correo

    Permissions:
        - List: Cualquier usuario autenticado.
        - Create: Cualquier usuario autenticado.
        - Retrieve: Cualquier usuario autenticado.
        - Update/Delete: Solamente el dueño o un admin.
        - Archive: Solamente el dueño o un admin.
    """

    queryset = Votante.objects.all()
    serializer_class = VotanteSerializer

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]


class EventoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar objetos Eventos.

    Provee operatciones CRUD para el control de Eventos.

    Implementa capacidades de filtrado y búsqueda.

    API Endpoints:
      -  list:   GET /api/eventos/
      -  create: POST /api/eventos/
      -  retrieve: GET /api/eventos/{id}/
      -  update: PUT /api/eventos/{id}/
      -  partial_update: PATCH /api/eventos/{id}/
      -  destroy: DELETE /api/eventos/{id}/
      -  archive: POST /api/eventos/{id}/archive/
      -  featured: GET /api/eventos/featured/

    Campos de filtrado:
        - id
        - nombre
        - lugar_id
        - fecha_inicio
        - fecha_fin
        - descripcion
        - tematica_id

    Permissions:
        - List: Cualquier usuario autenticado.
        - Create: Cualquier usuario autenticado.
        - Retrieve: Cualquier usuario autenticado.
        - Update/Delete: Solamente el dueño o un admin.
        - Archive: Solamente el dueño o un admin.
    """

    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    filterset_fields = ["tematica_id"]

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]


class EsculturaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar objetos Esculturas.

    Provee operatciones CRUD para el control de Esculturas.

    Implementa capacidades de filtrado y búsqueda.

    API Endpoints:
      -  list:   GET /api/esculturas/
      -  create: POST /api/esculturas/
      -  retrieve: GET /api/esculturas/{id}/
      -  update: PUT /api/esculturas/{id}/
      -  partial_update: PATCH /api/esculturas/{id}/
      -  destroy: DELETE /api/esculturas/{id}/
      -  archive: POST /api/esculturas/{id}/archive/
      -  featured: GET /api/esculturas/featured/

    Campos de busqueda:
        - id
        - nombre
        - descripcion
        - fecha_creacion
        - qr

    Permissions:
        - List: Cualquier usuario autenticado.
        - Create: Cualquier usuario autenticado.
        - Retrieve: Cualquier usuario autenticado.
        - Update/Delete: Solamente el dueño o un admin.
        - Archive: Solamente el dueño o un admin.
    """

    queryset = Escultura.objects.all()
    serializer_class = EsculturaSerializer

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]


class EscultorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar objetos Escultor.

    Provee operatciones CRUD para el control de Escultor.

    Implementa capacidades de filtrado y búsqueda.

    API Endpoints:
      -  list:   GET /api/escultores/
      -  create: POST /api/escultores/
      -  retrieve: GET /api/escultores/{id}/
      -  update: PUT /api/escultores/{id}/
      -  partial_update: PATCH /api/escultores/{id}/
      -  destroy: DELETE /api/escultores/{id}/
      -  archive: POST /api/escultores/{id}/archive/
      -  featured: GET /api/escultores/featured/

    Campos de busqueda:
        - id
        - nombre
        - correo
        - pais_id
        - foto
        - bibliografia

    Permissions:
        - List: Cualquier usuario autenticado.
        - Create: Cualquier usuario autenticado.
        - Retrieve: Cualquier usuario autenticado.
        - Update/Delete: Solamente el dueño o un admin.
        - Archive: Solamente el dueño o un admin.
    """

    queryset = Escultor.objects.all()
    serializer_class = EscultorSerializer

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]


class ImagenViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar objetos Imagen.

    Provee operatciones CRUD para el control de Imagen.

    Implementa capacidades de filtrado y búsqueda.

    API Endpoints:
      -  list:   GET /api/imagenes/
      -  create: POST /api/imagenes/
      -  retrieve: GET /api/imagenes/{id}/
      -  update: PUT /api/imagenes/{id}/
      -  partial_update: PATCH /api/imagenes/{id}/
      -  destroy: DELETE /api/imagenes/{id}/
      -  archive: POST /api/imagenes/{id}/archive/
      -  featured: GET /api/imagenes/featured/

    Campos de busqueda:
        - id
        - fecha
        - imagen
        - descripcion

    Permissions:
        - List: Cualquier usuario autenticado.
        - Create: Cualquier usuario autenticado.
        - Retrieve: Cualquier usuario autenticado.
        - Update/Delete: Solamente el dueño o un admin.
        - Archive: Solamente el dueño o un admin.
    """

    queryset = Imagen.objects.all()
    serializer_class = ImagenSerializer


class PaisViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar objetos Pais.

    Provee operatciones CRUD para el control de Pais.

    Implementa capacidades de filtrado y búsqueda.

    API Endpoints:
      -  list:   GET /api/paises/
      -  create: POST /api/paises/
      -  retrieve: GET /api/paises/{id}/
      -  update: PUT /api/paises/{id}/
      -  partial_update: PATCH /api/paises/{id}/
      -  destroy: DELETE /api/paises/{id}/
      -  archive: POST /api/paises/{id}/archive/
      -  featured: GET /api/paises/featured/

    Campos de busqueda:
        - id
        - nombre

    Permissions:
        - List: Cualquier usuario autenticado.
        - Create: Cualquier usuario autenticado.
        - Retrieve: Cualquier usuario autenticado.
        - Update/Delete: Solamente el dueño o un admin.
        - Archive: Solamente el dueño o un admin.
    """

    queryset = Pais.objects.all()
    serializer_class = PaisSerializer

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]


class AdminSisViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = AdminSisSerializer

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]

    # basicamente es el metodo post
    # pero a este lo sobreescribo para que genere el token de cada nuevo admin
    def create(self, request, *args, **kwargs):
        serializer = AdminSisSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            userAdmin = User.objects.get(username=serializer.data["username"])
            userAdmin.set_password(serializer.data["password"])
            userAdmin.save()

            token = Token.objects.create(user=userAdmin)

            return Response({"token": token.key}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # esta es la forma de obtener el token de un admin
    # se obtiene haciendo un post con el username y password del usuario a la rutaBase/get_token/
    # es decir api/adminsis/get_token/
    @action(detail=False, methods=["post"], permission_classes=[permissions.AllowAny])
    def get_token(self, request):
        userAdmin = get_object_or_404(User, username=request.data["username"])

        if not userAdmin.check_password(request.data["password"]):
            return Response(
                {"error": "contra incorrecta"}, status=status.HTTP_400_BAD_REQUEST
            )

        token, created = Token.objects.get_or_create(user=userAdmin)

        return Response({"token": token.key}, status=status.HTTP_200_OK)


class TematicaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar objetos Tematica.

    Provee operatciones CRUD para el control de Tematica.

    Implementa capacidades de filtrado y búsqueda.

    API Endpoints:
      -  list:   GET /api/tematica/
      -  create: POST /api/tematica/
      -  retrieve: GET /api/tematica/{id}/
      -  update: PUT /api/tematica/{id}/
      -  partial_update: PATCH /api/tematica/{id}/
      -  destroy: DELETE /api/tematica/{id}/
      -  archive: POST /api/tematica/{id}/archive/
      -  featured: GET /api/tematica/featured/

    Campos de busqueda:
        - id
        - nombre
        - descripcion

    Permissions:
        - List: Cualquier usuario autenticado.
        - Create: Cualquier usuario autenticado.
        - Retrieve: Cualquier usuario autenticado.
        - Update/Delete: Solamente el dueño o un admin.
        - Archive: Solamente el dueño o un admin.
    """

    queryset = Tematica.objects.all()
    serializer_class = TematicaSerializer

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]


class LugarViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar objetos Lugar.

    Provee operatciones CRUD para el control de Lugar.

    Implementa capacidades de filtrado y búsqueda.

    API Endpoints:
      -  list:   GET /api/lugar/
      -  create: POST /api/lugar/
      -  retrieve: GET /api/lugar/{id}/
      -  update: PUT /api/lugar/{id}/
      -  partial_update: PATCH /api/lugar/{id}/
      -  destroy: DELETE /api/lugar/{id}/
      -  archive: POST /api/lugar/{id}/archive/
      -  featured: GET /api/lugar/featured/

    Campos de busqueda:
        - id
        - nombre
        - descripcion

    Permissions:
        - List: Cualquier usuario autenticado.
        - Create: Cualquier usuario autenticado.
        - Retrieve: Cualquier usuario autenticado.
        - Update/Delete: Solamente el dueño o un admin.
        - Archive: Solamente el dueño o un admin.
    """

    queryset = Lugar.objects.all()
    serializer_class = LugarSerializer

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]


class VotoEscultorViewSet(viewsets.ModelViewSet):
    queryset = VotoEscultor.objects.all()
    serializer_class = VotoEscultorSerializer

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]

    def create(self, request, *args, **kwargs):
        try:
            puntaje = int(request.data["puntaje"])
        except (ValueError, TypeError):
            return Response(
                {"status": "El puntaje debe ser un número entre 1 y 5 inclusivo"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if puntaje < 1 or puntaje > 5:
            return Response(
                {"status": "Ingrese un puntaje entre 1 y 5 inclusivo"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            VotoEscultor.objects.get(
                escultor_id=request.data["escultor_id"],
                votante_id=request.data["votante_id"],
            )
            return Response(
                {"status": "Usted ya ha votado a este escultor"},
                status=status.HTTP_403_FORBIDDEN,
            )
        except ObjectDoesNotExist:
            serialized_data = VotoEscultorSerializer(data=request.data)

            if serialized_data.is_valid():
                serialized_data.save()
                return Response(
                    {"status": "voto registrado"}, status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {
                        "status": f"Ocurrió un error al serializar los datos. err: {serialized_data.errors}"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
