import smtplib
from django.http.response import HttpResponse
from django.conf import settings
from email.message import EmailMessage
from django.http import JsonResponse
import requests
from app.models import Votante
from django.shortcuts import redirect


import os


def mandar_email(destinatario: str, escultor_id: str) -> HttpResponse:
    """
    Endpoint para enviar un mail con un enlace que permite registrar un nuevo usuario.
    """
    # Ruta al archivo HTML
    html_file_path = os.path.join(os.path.dirname(__file__), "email.html")

    try:
        with open(html_file_path, "r", encoding="utf-8") as file:
            html_content = file.read()  # Leer el contenido del archivo HTML
    except FileNotFoundError:
        return HttpResponse({"error": "No se encontró el archivo HTML"}, status=500)

    html_content = html_content.replace("{{correo}}", destinatario)
    html_content = html_content.replace("{{escultor_id}}", escultor_id)

    remitente = settings.DEFAULT_FROM_EMAIL

    email = EmailMessage()
    email["From"] = remitente
    email["To"] = destinatario
    email["Subject"] = "Registro de nuevo usuario"

    # Añadir contenido HTML
    email.add_alternative(html_content, subtype="html")

    # Enviar el correo
    try:
        smtp = smtplib.SMTP_SSL("smtp.gmail.com")
        smtp.login(remitente, settings.EMAIL_APP_KEY)
        smtp.sendmail(remitente, destinatario, email.as_string())
        smtp.quit()
    except Exception as e:
        return HttpResponse(
            {"error": f"Error al enviar el correo: {str(e)}"}, status=500
        )

    return HttpResponse({"message": "Correo enviado correctamente"}, status=200)


def validar_votante(request):
    correo = request.GET.get("correo")
    escultor_id = request.GET.get("escultor_id")

    if correo:
        try:
            Votante.objects.get(correo=correo)
            response = redirect(
                f"http://127.0.0.1:5173/votar.html?correo={correo}&escultor_id={escultor_id}"
            )
            print("YA EXISTE EL USUARIO")
            return response

        except Votante.DoesNotExist:
            mandar_email(correo, escultor_id)
            return JsonResponse(
                {
                    "mensaje": "Se envío un mail de verificación a la dirección de correo indicada"
                },
                status=201,
            )

    else:
        return JsonResponse({"error": "Faltan parámetros necesarios."}, status=400)


def crear_votante(request):
    correo = request.GET.get("correo")
    escultor_id = request.GET.get("escultor_id")

    try:
        url = "http://localhost:8000/api/votantes/"
        data = {
            "correo": correo,
        }

        response = requests.post(url, json=data)

        if response.status_code == 201:
            response = redirect(
                f"http://127.0.0.1:5173/votar.html?correo={correo}&escultor_id={escultor_id}"
            )
            return response
        else:
            return JsonResponse({"error": "Error al crear el votante."}, status=500)

    except:
        response = redirect(f"http://127.0.0.1:5173/certamen.html")
        return response
