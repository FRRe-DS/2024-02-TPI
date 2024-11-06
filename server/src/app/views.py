from io import BytesIO
from resend.exceptions import ValidationError
import resend
from django.conf import settings
import uuid
import qrcode
import logging
from app.utils import PositiveInt
from django.contrib.auth.models import User
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import authentication, permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
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


@api_view(["POST"])
def mandar_email(request: Request) -> Response:
    """
    Endpoint para enviar un mail usando la API REST de Resend.
    """
    try:
        destinatario = str(request.query_params.get("destinatario"))
        if destinatario is None:
            error = "Debe ingresar por query parameters el correo del destinatario"
            logging.error(error)
            return Response(
                {"error": error},
                status=status.HTTP_400_BAD_REQUEST,
            )
    except TypeError:
        error = "Debe ingresar por query parameters el correo del destinatario"
        logging.error(error)
        return Response(
            {"error": error},
            status=status.HTTP_400_BAD_REQUEST,
        )

    resend.api_key = settings.RESEND_API_KEY

    params: resend.Emails.SendParams = {
        "from": settings.DEFAULT_FROM_EMAIL,
        "to": [destinatario],
        "subject": "Confirmación de correo electrónico",
        "html": "<strong> Funciona! </strong>",
    }

    try:
        email = resend.Emails.send(params)
    except ValidationError as e:
        error = f"Los parametros son inválidos.err: {e}"
        logging.error(error)
        return Response(
            {"error": error},
            status=status.HTTP_400_BAD_REQUEST,
        )

    print(email)
    return Response(status=status.HTTP_200_OK)


# TODO: Medir si genera un cuello de botella al bloquear el hilo.
# TODO: Revisar los permisos.
@permission_classes([IsAuthenticated])
@api_view(["GET"])
def generarQR(request: Request) -> HttpResponse:
    escultor_id = request.query_params.get("escultor_id")
    if escultor_id is None:
        error = "Debe ingresar por query parameters el id del escultor"
        logging.error(error)
        return Response(
            {"error": error},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        escultor_id = PositiveInt(int(escultor_id))
    except (TypeError, ValueError):
        error = "El id del escultor debe ser un número válido, entero y positivo"
        logging.error(error)
        return Response(
            {"error": error},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not Escultor.objects.filter(id=escultor_id).exists():
        error = "El id del escultor no existe en la base de datos"
        logging.error(error)
        return Response(
            {"error": error},
            status=status.HTTP_404_NOT_FOUND,
        )

    logging.info(f"Generando QR para {escultor_id}...")

    random_val = uuid.uuid4().hex[:8]
    voto_url = f"https://enzovallejos.github.io/VotoEscultorprueba/?escultor_id={escultor_id}&randval={random_val}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(voto_url)
    qr.make(fit=True)

    img = qr.make_image(fill="black", back_color="white")

    buffer = BytesIO()
    img.save(buffer, format="PNG", optimize=True)
    buffer.seek(0)

    logging.info(f"Generando QR para escultor_id: {escultor_id}... listo!")
    return HttpResponse(buffer, content_type="image/png", status=status.HTTP_200_OK)


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
    """
    ViewSet para manejar objetos VotoEscultor.

    Provee operatciones CRUD para el control de VotoEscultor.

    Implementa capacidades de filtrado y búsqueda.

    API Endpoints:
      -  list:   GET /api/voto_escultor/
      -  create: POST /api/voto_escultor/
      -  retrieve: GET /api/voto_escultor/{id}/
      -  update: PUT /api/voto_escultor/{id}/
      -  partial_update: PATCH /api/voto_escultor/{id}/
      -  destroy: DELETE /api/voto_escultor/{id}/
      -  archive: POST /api/voto_escultor/{id}/archive/
      -  featured: GET /api/voto_escultor/featured/

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
            if not (1 <= puntaje <= 5):
                error = "Ingrese un puntaje entre 1 y 5 inclusivo"
                logging.error(error)
                return Response(
                    {"error": error},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except (ValueError, TypeError):
            error = "El puntaje debe ser un número entre 1 y 5 inclusivo"
            logging.error(error)
            return Response(
                {"error": error},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serialized_data = VotoEscultorSerializer(data=request.data)
        if serialized_data.is_valid():
            serialized_data.save()
            return Response(
                {"status": "voto registrado"}, status=status.HTTP_201_CREATED
            )
        else:
            errors = serialized_data.errors
            if isinstance(errors, dict) and "non_field_errors" in errors:
                error_message = errors["non_field_errors"][0]
                error = f"Usted ya ha votado a este escultor. err: {error_message}"
                logging.error(error)
                return Response(
                    {"error": error},
                    status=status.HTTP_403_FORBIDDEN,
                )

            error = f"Ocurrió un error al serializar los datos. err: {errors}"
            logging.error(error)
            return Response(
                {
                    "error": error,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
