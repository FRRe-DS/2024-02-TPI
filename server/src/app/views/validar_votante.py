import os
import smtplib
from email.message import EmailMessage

import requests
from django.conf import settings
from django.http import JsonResponse
from django.http.response import HttpResponse
from django.shortcuts import redirect
from django.utils.autoreload import logging
from requests.sessions import Request
from rest_framework import status

from app.models import Votante


def mandar_email(destinatario: str, escultor_id: str) -> HttpResponse:
    """
    Endpoint para enviar un mail con un enlace que permite registrar un nuevo usuario.
    """
    html_file_path = os.path.join(os.path.dirname(__file__), "email.html")

    try:
        with open(html_file_path, "r", encoding="utf-8") as file:
            html_content = file.read()
    except FileNotFoundError:
        return HttpResponse(
            {"error": "No se encontró el archivo HTML."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if settings.DJANGO_ENV == "prod":
        api_url = "https://tpi-desarrollo-e0f8gccuhvhpbkhj.eastus-01.azurewebsites.net"
    else:
        api_url = "http://localhost:8000"

    logging.info(f"La API_URL = {api_url}")
    html_content = html_content.replace("{{correo}}", destinatario)
    html_content = html_content.replace("{{escultor_id}}", escultor_id)
    html_content = html_content.replace("{{api_url}}", api_url)

    remitente = settings.DEFAULT_FROM_EMAIL

    email = EmailMessage()
    email["From"] = remitente
    email["To"] = destinatario
    email["Subject"] = "Registro de nuevo usuario"

    email.add_alternative(html_content, subtype="html")

    try:
        smtp = smtplib.SMTP_SSL("smtp.gmail.com")
        smtp.login(remitente, settings.EMAIL_APP_KEY)
        smtp.sendmail(remitente, destinatario, email.as_string())
        smtp.quit()
    except Exception as e:
        return HttpResponse(
            {"error": f"Error al enviar el correo: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    logging.info(f"Correo a {destinatario} Enviado!")
    return HttpResponse(
        {"message": "Correo enviado correctamente"}, status=status.HTTP_200_OK
    )


def validar_votante(request: Request) -> HttpResponse:
    correo = request.GET.get("correo")
    escultor_id = request.GET.get("escultor_id")

    if correo:
        try:
            Votante.objects.get(correo=correo)

            logging.info(f"El usuario con el correo {correo} ya existe!")

            if settings.DJANGO_ENV == "prod":
                url = f"https://elrincondelinge.org/votar?correo={correo}&escultor_id={escultor_id}"
            else:
                url = f"http://localhost:4321/votar?correo={correo}&escultor_id={escultor_id}"

            return JsonResponse({"url": url}, status=status.HTTP_200_OK)

        except Votante.DoesNotExist:
            mandar_email(correo, escultor_id)
            return JsonResponse(
                {
                    "mensaje": "Se envío un mail de verificación a la dirección de correo indicada"
                },
                status=status.HTTP_201_CREATED,
            )

    else:
        return JsonResponse(
            {"error": "Faltan parámetros obligatorios `correo` y `escultor_id`."},
            status=status.HTTP_400_BAD_REQUEST,
        )


def crear_votante(request: Request) -> HttpResponse:
    correo = request.GET.get("correo")
    escultor_id = request.GET.get("escultor_id")
    api_url = (
        "https://tpi-desarrollo-e0f8gccuhvhpbkhj.eastus-01.azurewebsites.net"
        if settings.DJANGO_ENV == "prod"
        else "http://localhost:8000"
    )
    client_url = (
        "https://elrincondelinge.org"
        if settings.DJANGO_ENV == "prod"
        else "http://localhost:4321"
    )

    if not correo or not escultor_id:
        return JsonResponse(
            {"error": "Faltan parámetros obligatorios `correo` y `escultor_id`."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        url = f"{api_url}/api/votantes/"

        data = {
            "correo": correo,
        }

        response = requests.post(url, json=data)

        if response.status_code == 201:
            return redirect(
                f"{client_url}/votar?correo={correo}&escultor_id={escultor_id}"
            )
        else:
            return redirect(f"{client_url}/error?&escultor_id={escultor_id}")

    except Exception:
        return redirect(f"{client_url}/certamen")
