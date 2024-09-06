from django.test import SimpleTestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from app.models import Visitante
from app.serializers import VisitanteSerializer


class HealthCheckAPITest(SimpleTestCase):
    def test_health_check(self):
        response = self.client.get(reverse("health_check"))
        self.assertEqual(response.status_code, 204)


class VisitanteAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.get_url = reverse("getVisitantesData")
        self.post_url = reverse("addVisitante")

        Visitante.objects.create(correo="acostalautaro@ejemplo.com")
        Visitante.objects.create(correo="gonza_saucedo@ejemplo.com")

    def test_get_visitante_data_200_OK(self):
        response = self.client.get(self.get_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        expected_data = VisitanteSerializer(Visitante.objects.all(), many=True).data
        self.assertEqual(expected_data, response.data)

    def test_add_user_201_CREATED(self):
        valid_emails = {"correo": "Xxenzo_vallejosxX@xbox.com"}

        response = self.client.post(self.post_url, valid_emails, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["correo"], "Xxenzo_vallejosxX@xbox.com")
        self.assertTrue(
            Visitante.objects.filter(correo="Xxenzo_vallejosxX@xbox.com").exists()
        )

    def test_add_visitante_400_BAD_REQUEST(self):
        # La clase `EmailValidator` de Django ya se adhiere a los estándares de emails RFC 5321 y RFC 5322,
        # y además nuestro escenario no tiene ninguna restricción especial en tanto a los correos que debe aceptar
        # por lo que me parece que, de momento, estos controles son suficientes para nuestra aplicación y no haría
        # falta suar librerías como hypothesis para controlar las posibles entradas.

        invalid_emails = [
            "",
            1,
            "lautaro",
            "@",
            "lautaro@",
            "@ejemplo",
            "@ejemplo.com",
            "@.com",
        ]

        for email in invalid_emails:
            data = {"correo": email}
            response = self.client.post(self.post_url, data, format="json")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
