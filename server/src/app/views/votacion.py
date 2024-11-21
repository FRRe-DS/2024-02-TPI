import datetime
import logging
import smtplib
from email.message import EmailMessage
from io import BytesIO

import qrcode
import ulid
from django.db.models import ObjectDoesNotExist, Sum
from django.db.models.base import Coalesce
from django.http.response import HttpResponse
from rest_framework import authentication, permissions, status, viewsets
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response

from app.models import Escultor, Votante, VotoEscultor
from app.serializers import VotoEscultorSerializer
from app.utils import PositiveInt


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

        id = ulid.from_timestamp(datetime.datetime.now())

        query_params = f"escultor_id={escultor_id}&id={id}&nombre-escultor={escultor.nombre + " " + escultor.apellido}"

        if settings.DJANGO_ENV == "prod":
            voto_url = (
                f"https://2024-02-tpi-cloudflare.pages.dev/validar.html?{query_params}"
            )
        else:
            voto_url = f"http://localhost:5173/validar.html?{query_params}"

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


# @api_view(["GET"])
# def generar_qr(request: Request) -> HttpResponse:


class VotoEscultorViewSet(viewsets.ModelViewSet):
    queryset = VotoEscultor.objects.all()
    serializer_class = VotoEscultorSerializer

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]

    def create(self, request: Request):
        correo_votante = str(request.query_params.get("correo_votante"))

        if not correo_votante:
            return Response(
                {"error": "El correo del votante es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        votante: Votante
        try:
            votante = Votante.objects.get(correo=correo_votante)
        except ObjectDoesNotExist:
            logging.info(
                "Este votante no se encuentra registrado hasta la fecha. Enviando correo electrónico para verificar su registro."
            )
            mandar_email(correo_votante)
            return Response(
                {
                    "status": "Se ha enviado un email de verificación a la dirección indicada"
                },
                status=status.HTTP_202_ACCEPTED,
            )

        request.data["votante_id"] = votante.id
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


def mandar_email(destinatario: str) -> Response:
    """
    Endpoint para enviar un mail usando la API REST de Resend.
    """

    remitente = settings.DEFAULT_FROM_EMAIL
    print(remitente)

    email = EmailMessage()
    email["From"] = remitente
    email["To"] = destinatario
    email["Subject"] = "Confirmación de correo electrónico"
    email.set_content("<strong> Funciona! </strong>")

    smtp = smtplib.SMTP_SSL("smtp.gmail.com")
    smtp.login(remitente, settings.EMAIL_APP_KEY)
    smtp.sendmail(remitente, destinatario, email.as_string())
    smtp.quit()

    print(email.as_string())
    return Response(status=status.HTTP_200_OK)


@api_view(["GET"])
# @permission_classes([IsAuthenticated])
def estado_votacion(_request: Request) -> Response:
    ranking = (
        Escultor.objects.annotate(
            total_puntaje=Coalesce(Sum("votoescultor__puntaje"), 0)
        )
        .values("id", "nombre", "apellido", "total_puntaje")
        .order_by("-total_puntaje")
    )

    return Response({"result": list(ranking)}, status=status.HTTP_200_OK)
