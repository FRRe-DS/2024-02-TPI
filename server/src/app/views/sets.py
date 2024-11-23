from background_task.models import CompletedTask
from background_task.tasks import Task
from django.http import JsonResponse
from rest_framework import authentication, permissions, status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.request import Request
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

from app.models import (
    Votante,
    Imagen,
    Lugar,
    Tematica,
    Escultor,
    Pais,
    Escultura,
    Evento,
)
from app.serializers import (
    VotanteSerializer,
    EventoSerializer,
    EsculturaSerializer,
    EscultorSerializer,
    ImagenSerializer,
    LugarSerializer,
    TematicaSerializer,
    AdminSisSerializer,
    PaisSerializer,
)


@api_view(["GET"])
def background_task_ejemplo(request: Request) -> JsonResponse:
    """
    Ejemplo temporal para chequear que la integración entre celery y Django funcione correctamente.
    """

    from ..tasks import count_votantes

    count_votantes(verbose_name="Notify user")

    return JsonResponse({"status": "Task started!"})


@api_view(["GET"])
def check_django_task_status(request):
    """
    Example view to check the status of tasks.
    """
    # Query pending tasks
    pending_tasks = Task.objects.all()

    # Query completed tasks (if necessary)
    completed_tasks = CompletedTask.objects.all()

    pending = [
        {"task_name": task.task_name, "run_at": task.run_at} for task in pending_tasks
    ]
    completed = [
        {"task_name": task.task_name, "completed_at": task.run_at}
        for task in completed_tasks
    ]

    return JsonResponse({"pending_tasks": pending, "completed_tasks": completed})


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
        elif self.request.method == "POST":
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]

    def create(self, request, *args, **kwargs):
        """
        Crear un nuevo Votante y devolverlo.
        """
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        - apellido
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
    filterset_fields = ["nombre"]

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
