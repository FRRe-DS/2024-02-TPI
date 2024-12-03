import datetime
import logging
from io import BytesIO

import urllib.parse

from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
import qrcode
import ulid
from django.db.models import Sum
from django.db.models.base import Coalesce
from django.http.response import HttpResponse
from rest_framework import authentication, permissions, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view
from rest_framework import serializers
from rest_framework.decorators import permission_classes
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response

from app.models import Escultor, Votante, VotoEscultor
from app.serializers import VotoEscultorSerializer
from app.utils import PositiveInt
from django.conf import settings


@extend_schema(
    summary="Generar QR",
    description="Genera un código QR para un escultor especificado por su `escultor_id`. El QR contiene una URL con parámetros relevantes.",
    parameters=[
        OpenApiParameter(
            name="escultor_id",
            description="ID del escultor para el cual generar el QR.",
            required=True,
            type=OpenApiTypes.INT,
        )
    ],
    responses={
        200: {
            "description": "QR Code image in PNG format",
            "content": {"image/png": {}},
        },
        400: {
            "description": "Error de validación",
            "content": {
                "application/json": {
                    "example": {
                        "error": "Debe ingresar por query parameters el id del escultor"
                    }
                }
            },
        },
        404: {
            "description": "Escultor no encontrado",
            "content": {
                "application/json": {
                    "example": {
                        "error": "El id del escultor no existe en la base de datos"
                    }
                }
            },
        },
    },
)
class generarQR(APIView):
    if settings.DJANGO_ENV != "testing":
        throttle_scope = "qr"

    def get(self, request):
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

        escultor = Escultor.objects.get(id=escultor_id)

        logging.info(f"Generando QR para {escultor_id}...")

        qrulid = ulid.from_timestamp(datetime.datetime.now())

        nombre_escultor = f"{escultor.nombre} {escultor.apellido}"
        encoded_nombre_escultor = urllib.parse.quote(nombre_escultor)
        query_params = (
            f"id={escultor_id}&key={id}&nombre-escultor={encoded_nombre_escultor}"
        )

        if settings.DJANGO_ENV == "prod":
            voto_url = f"https://elrincondelinge.org/validar?{query_params}"
        else:
            voto_url = f"http://localhost:5173/validar?{query_params}"

        logging.info(voto_url)

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
        _ = buffer.seek(0)

        logging.info(f"Generando QR para escultor_id: {escultor_id}... listo! ")
        return HttpResponse(buffer, content_type="image/png", status=status.HTTP_200_OK)


class VotoEscultorViewSet(viewsets.ModelViewSet):
    queryset = VotoEscultor.objects.all()
    serializer_class = VotoEscultorSerializer

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        # Esta linea la uso para poder ver si se efectua o no un voto
        # if self.request.method in ["GET", "POST"]:
        if self.request.method in "POST":
            return [AllowAny()]
        return [permission() for permission in self.permission_classes]

    def create(self, request):
        correo_votante = request.data.get("correo_votante")

        if not correo_votante:
            return Response(
                {"error": "El correo del votante es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            votante = Votante.objects.get(correo=correo_votante)
        except Votante.DoesNotExist:
            logging.error(f"Votante con correo {correo_votante} no encontrado.")
            return Response(
                {"error": "Votante no encontrado en la base de datos."},
                status=status.HTTP_404_NOT_FOUND,
            )

        request.data["votante_id"] = votante.id
        serialized_data = VotoEscultorSerializer(data=request.data)

        if serialized_data.is_valid():
            serialized_data.save()
            return Response(
                {"status": "Voto registrado"},
                status=status.HTTP_201_CREATED,
            )
        else:
            errors = serialized_data.errors
            if isinstance(errors, dict) and "non_field_errors" in errors:
                error_message = errors["non_field_errors"][0]
                datos_voto = VotoEscultor.objects.get(votante_id=votante.id)
                puntaje = datos_voto.puntaje
                error = f"Usted ya ha votado a este escultor con el puntaje {puntaje}. Error: {error_message}"
                logging.error(error)

                return Response(
                    {"error": error, "puntaje": puntaje},
                    status=status.HTTP_403_FORBIDDEN,
                )

            error = f"Ocurrió un error al serializar los datos. Error: {errors}"
            logging.error(error)
            return Response(
                {"error": error},
                status=status.HTTP_400_BAD_REQUEST,
            )


class EscultorRankingSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    nombre = serializers.CharField()
    apellido = serializers.CharField()
    total_puntaje = serializers.IntegerField()


@extend_schema(
    summary="Estado Votacion Endpoint",
    description="Consulta el estado del servidor y devuelve 204 si está funcionando.",
    responses={200: EscultorRankingSerializer(many=True)},
)
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def estado_votacion(_request: Request) -> Response:
    """
    Muestra el estado de la votacion y devuelve un JSON con los datos.
    """
    ranking = (
        Escultor.objects.annotate(
            total_puntaje=Coalesce(Sum("votoescultor__puntaje"), 0)
        )
        .values("id", "nombre", "apellido", "total_puntaje")
        .order_by("-total_puntaje")
    )

    return Response({"result": list(ranking)}, status=status.HTTP_200_OK)


@extend_schema(
    summary="Check Puntaje Endpoint",
    description="Chequea el puntaje realizado por un votante",
    responses={200: None},
)
@api_view(["GET"])
def check_puntaje(request: Request) -> Response:
    """ """
    correo_votante = request.query_params.get("correo")
    logging.info(f"Recibi este correo {correo_votante}")

    if correo_votante is None:
        return Response(
            {"error": "El correo del votante es obligatorio."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    escultor_id = request.query_params.get("escultor_id")

    if not escultor_id:
        return Response(
            {"error": "El id del escultor obligatorio."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        votante = Votante.objects.get(correo=correo_votante)
    except Votante.DoesNotExist:
        logging.error(f"Votante con correo {correo_votante} no encontrado.")
        return Response(
            {"error": "Votante no encontrado en la base de datos."},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        datos = VotoEscultor.objects.get(escultor_id=escultor_id, votante_id=votante.id)
    except VotoEscultor.DoesNotExist:
        logging.error(
            f"No existe voto regitrado para votante {votante.id} y escultor {escultor_id }"
        )
        return Response(
            {"votado": False, "puntaje": None},
            status=status.HTTP_200_OK,
        )

    return Response(
        {"votado": True, "puntaje": datos.puntaje},
        status=status.HTTP_200_OK,
    )
