import logging
from datetime import date
from background_task.models import CompletedTask
from background_task.tasks import Task
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import authentication, permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.request import Request
from django.views.decorators.cache import cache_page
from rest_framework.response import Response

from app.models import (
    Escultor,
    EscultorEvento,
    Escultura,
    Evento,
    Imagen,
    Lugar,
    Pais,
    Tematica,
    Votante,
)
from app.serializers import (
    AdminSisSerializer,
    EscultorEventoReadSerializer,
    EscultorEventoWriteSerializer,
    EscultorReadSerializer,
    EscultorWriteSerializer,
    EsculturaSerializer,
    EventoReadSerializer,
    EventoWriteSerializer,
    ImagenSerializer,
    LugarSerializer,
    PaisSerializer,
    TematicaSerializer,
    VotanteSerializer,
)


@extend_schema(
    summary="Start Background Task",
    description="Comienza una tarea de fondo usando la librería 'django-background-tasks' para demostrar la integración.",
    responses={200: {"description": "Task started!"}},
)
@api_view(["GET"])
def background_task_ejemplo(request: Request) -> JsonResponse:
    """
    Comienza una tarea de fondo usando la librería "django-background-tasks>" para demostrar la integración.
    """

    from ..tasks import count_votantes

    count_votantes(verbose_name="Notify user")

    return JsonResponse({"status": "Task started!"})


@extend_schema(
    summary="Check Task Status",
    description="Devuelve el status de tareas pendientes o completadas.",
    responses={
        200: {
            "description": "Task statuses",
            "content": {
                "application/json": {
                    "example": {
                        "pending_tasks": [
                            {"task_name": "Task1", "run_at": "2024-11-28T12:00:00Z"}
                        ],
                        "completed_tasks": [
                            {
                                "task_name": "Task2",
                                "completed_at": "2024-11-28T13:00:00Z",
                            }
                        ],
                    }
                }
            },
        }
    },
)
@api_view(["GET"])
def check_django_task_status(_request):
    """Devuelve el status de tareas pendientes o completadas."""
    pending_tasks = Task.objects.all()

    completed_tasks = CompletedTask.objects.all()

    pending = [
        {"task_name": task.task_name, "run_at": task.run_at} for task in pending_tasks
    ]
    completed = [
        {"task_name": task.task_name, "completed_at": task.run_at}
        for task in completed_tasks
    ]

    return JsonResponse({"pending_tasks": pending, "completed_tasks": completed})


@extend_schema(
    summary="Obtener Token de Administrador",
    description="Genera o recupera un token de autenticación para un usuario administrador.",
    request={
        "application/json": {
            "example": {"username": "admin", "password": "contraseñaSegura"}
        }
    },
    responses={
        200: {
            "description": "Token generado exitosamente",
            "content": {
                "application/json": {"example": {"token": "abc123xyz", "created": True}}
            },
        },
        400: {
            "description": "Credenciales inválidas",
            "content": {
                "application/json": {"example": {"error": "contraseña incorrecta"}}
            },
        },
        404: {
            "description": "Usuario no encontrado",
            "content": {"application/json": {"example": {"detail": "No encontrado."}}},
        },
    },
)
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def get_token(request):
    """
    Obtiene un token de autenticación para un usuario administrador.
    """
    userAdmin = get_object_or_404(User, username=request.data.get("username"))

    if not userAdmin.check_password(request.data.get("password")):
        return Response(
            {"error": "contraseña incorrecta"}, status=status.HTTP_400_BAD_REQUEST
        )

    token, created = Token.objects.get_or_create(user=userAdmin)

    if created:
        logging.info(f"Token creado: {token.key} para el usuario: {userAdmin.username}")
    else:
        logging.info(
            f"Token recuperado: {token.key} para el usuario: {userAdmin.username}"
        )

    return Response(
        {"token": token.key, "created": created},
        status=status.HTTP_200_OK,
    )


@extend_schema(
    summary="recuperar eventos filtrando por año",
    description="Recupera eventos que ocurren en un año específico (basado en fecha_inicio).",
    responses={200: None},
)
@api_view(["GET"])
def eventos_por_anio(request: Request) -> Response:
    anio_actual = date.today().year
    anios = [anio_actual, anio_actual + 1]

    # Filtra eventos que tengan el año en la lista de años
    eventos = Evento.objects.filter(fecha_inicio__year__in=anios)

    if not eventos.exists():
        return Response(
            {"detail": f"No se encontraron eventos para el año {anio_actual}."},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = EventoReadSerializer(eventos, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    summary="Escultores por evento",
    description="Recuperar los escultores de un evento.",
    responses={200: None},
)
@api_view(["GET"])
@cache_page(60 * 15)
def escultores_por_evento(request: Request) -> Response:
    evento_id = request.query_params.get("evento_id")

    escultores_evento = EscultorEvento.objects.filter(evento_id=evento_id)

    if not escultores_evento.exists():
        return Response(
            {
                "detail": f"No se encontraron escultores para el evento con id {evento_id}."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    escultores = Escultor.objects.filter(
        id__in=escultores_evento.values_list("escultor_id", flat=True)
    )

    serializer = EscultorReadSerializer(escultores, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)


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
    filterset_fields = ["id", "correo"]

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
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["nombre", "lugar_id", "tematica_id", "fecha_inicio"]

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return EventoReadSerializer
        return EventoWriteSerializer


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
    filterset_fields = ["id", "nombre", "escultor_id"]

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
    filterset_fields = ["id", "nombre", "pais_id"]

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return EscultorReadSerializer

        return EscultorWriteSerializer


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
    filterset_fields = ["id", "escultura_id"]

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]


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
    filterset_fields = ["id"]

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]


class EscultorEventoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar objetos EscultorEvento.

    Provee operaciones CRUD para la relación entre Escultores y Eventos.

    Implementa capacidades de filtrado y búsqueda.

    API Endpoints:
      - list: GET /api/escultoreseventos/
      - create: POST /api/escultoreseventos/
      - retrieve: GET /api/escultoreseventos/{id}/
      - update: PUT /api/escultoreseventos/{id}/
      - partial_update: PATCH /api/escultoreseventos/{id}/
      - destroy: DELETE /api/escultoreseventos/{id}/

    Campos de búsqueda:
        - id
        - escultor_id
        - evento_id

    Permissions:
        - List: Cualquier usuario autenticado.
        - Create: Cualquier usuario autenticado.
        - Retrieve: Cualquier usuario autenticado.
        - Update/Delete: Solamente el dueño o un admin.
    """

    queryset = EscultorEvento.objects.all()
    filterset_fields = ["id", "escultor_id", "evento_id"]

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return EscultorEventoReadSerializer
        return EscultorEventoWriteSerializer


class AdminSisViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = AdminSisSerializer
    filterset_fields = ["id", "username", "email"]

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        response = {"message": "No se puede hacer post a este endpoint"}
        return Response(response, status=status.HTTP_403_FORBIDDEN)


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
    filterset_fields = ["id", "nombre"]

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
    filterset_fields = ["id", "nombre"]

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]
