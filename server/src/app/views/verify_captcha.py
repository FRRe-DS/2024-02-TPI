import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class VerifyCaptchaView(APIView):
    def post(self, request):
        # Obtener el token del CAPTCHA desde el formulario
        turnstile_response = request.data.get('cf-turnstile-response')
        if not turnstile_response:
            return Response({'error': 'CAPTCHA no completado'}, status=status.HTTP_400_BAD_REQUEST)

        # Obtener la dirección IP del usuario (opcional, pero recomendado)
        remote_ip = request.META.get('REMOTE_ADDR')

        # Preparar los datos para la solicitud a la API de Turnstile
        secret_key = settings.CLOUDFLARE_TURNSTILE_SECRET_KEY
        data = {
            'secret': secret_key,
            'response': turnstile_response,
            'remoteip': remote_ip,
        }

        # Realizar la solicitud a la API de Turnstile
        url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
        response = requests.post(url, data=data)

        # Obtener la respuesta de la API de Turnstile
        result = response.json()

        if result.get('success'):
            # Si la validación fue exitosa
            return Response({'success': 'CAPTCHA verificado correctamente'}, status=status.HTTP_200_OK)
        else:
            # Si la validación falló
            return Response({'error': 'CAPTCHA inválido'}, status=status.HTTP_400_BAD_REQUEST)
