from django.test import SimpleTestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from rest_framework.authtoken.models import Token

from app.models import Escultor, Pais, Visitante
from django.contrib.auth.models import User
from app.serializers import EscultorSerializer, VisitanteSerializer


class HealthCheckAPITest(SimpleTestCase):
    def test_health_check(self):
        response = self.client.get(reverse("health_check"))
        self.assertEqual(response.status_code, 204)


class VisitanteAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(username="testuser", password="password")
        self.token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

        # INFO: (Lautaro) Este endpoint tiene un nombre "generico" debido a que trabajando con CBV's (más inclusive aún si heredan `viewsets.ModelViewSet`)
        # De manera automática tendríamos implementadas funcionalidades básicas como listar (GET), crear (POST), destruir (DELETE), etcétera.
        # Como estas funciones solo difieren en la cabecera HTTP que es enviada a la url y no en la url en sí, decidí darle un nombre descriptivo.
        self.base_url = reverse("visitantes-list")

        # INFO: (Lautaro) Esta funcion lambda tiene el proposito de generar dinamicamente endpoints como:
        # - <GET/PUT/DELETE> /visitantes/<id>/
        self.detail_url = lambda pk: reverse("visitantes-detail", kwargs={"pk": pk})

        Visitante.objects.create(correo="acostalautaro@ejemplo.com")
        Visitante.objects.create(correo="gonza_saucedo@ejemplo.com")
        Visitante.objects.create(correo="enzovallejos@ejemplo.com")
        Visitante.objects.create(correo="tobiasstegmayer@ejemplo.com")
        Visitante.objects.create(correo="ivanniveyro@ejemplo.com")

    def test_get_visitantes_data_200_OK(self):
        response = self.client.get(self.base_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)

        expected_data = VisitanteSerializer(Visitante.objects.all(), many=True).data
        self.assertEqual(expected_data, response.data)

    def test_get_visitante_200_OK(self):
        visitante = Visitante.objects.first()

        response = self.client.get(self.detail_url(visitante.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expected_data = VisitanteSerializer(visitante).data
        self.assertEqual(expected_data, response.data)

    def test_add_user_201_CREATED(self):
        valid_emails = {"correo": "Xxenzo_vallejosxX@xbox.com"}

        response = self.client.post(self.base_url, valid_emails, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["correo"], "Xxenzo_vallejosxX@xbox.com")
        self.assertTrue(
            Visitante.objects.filter(correo="Xxenzo_vallejosxX@xbox.com").exists()
        )

    def test_add_visitante_400_BAD_REQUEST(self):
        # La clase `EmailValidator`, utilizada por `EmailField`, ya se adhiere a los estándares de emails RFC 5321 y RFC 5322.
        # Además nuestro escenario no tiene ninguna restricción especial en tanto a los correos que debe aceptar
        # por lo que me parece que, los controles que este validador realiza son suficientes para nuestra aplicación y no haría
        # falta usar librerías como hypothesis para controlar sobre una amplia variedad de entradas.

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
            response = self.client.post(self.base_url, data, format="json")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_visitante_204_NO_CONTENT(self):
        visitante = Visitante.objects.first()

        user = User.objects.create_user("username", "password")
        self.client.force_authenticate(user)

        response = self.client.delete(self.detail_url(visitante.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Visitante.objects.filter(pk=visitante.pk).exists())


class EscultoresAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(username="testuser", password="password")
        self.token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

        # INFO: (Lautaro) Este endpoint tiene un nombre "generico" debido a que trabajando con CBV's (más inclusive aún si heredan `viewsets.ModelViewSet`)
        # De manera automática tendríamos implementadas funcionalidades básicas como listar (GET), crear (POST), destruir (DELETE), etcétera.
        # Como estas funciones solo difieren en la cabecera HTTP que es enviada a la url y no en la url en sí, decidí darle un nombre descriptivo.
        self.base_url = reverse("escultores-list")

        # INFO: (Lautaro) Esta funcion lambda tiene el proposito de generar dinamicamente endpoints como:
        # - <GET/PUT/DELETE> /visitantes/<id>/
        self.detail_url = lambda pk: reverse("escultores-detail", kwargs={"pk": pk})

        pais = Pais.objects.create(nombre="Argentina")

        Escultor.objects.create(
            nombre="Lautaro Acosta Quintana",
            pais_id=pais,
            correo="acostalautaro@ejemplo.com",
            bibliografia="...",
        )
        Escultor.objects.create(
            nombre="Gonzalo Saucedo",
            pais_id=pais,
            correo="gonza_saucedo@ejemplo.com",
            bibliografia="...",
        )
        Escultor.objects.create(
            nombre="Enzo Vallejos",
            pais_id=pais,
            correo="enzovallejos@ejemplo.com",
            bibliografia="...",
        )
        Escultor.objects.create(
            nombre="Tobias Stegmayer",
            pais_id=pais,
            correo="tobiasstegmayer@ejemplo.com",
            bibliografia="...",
        )
        Escultor.objects.create(
            nombre="Ivan Niveyro",
            pais_id=pais,
            correo="ivanniveyro@ejemplo.com",
            bibliografia="...",
        )

    def test_get_escultores_data_200_OK(self):
        response = self.client.get(self.base_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)

        expected_data = EscultorSerializer(Escultor.objects.all(), many=True).data
        self.assertEqual(expected_data, response.data)

    def test_get_escultor_200_OK(self):
        escultor = Escultor.objects.first()

        response = self.client.get(self.detail_url(escultor.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expected_data = EscultorSerializer(escultor).data
        self.assertEqual(expected_data, response.data)

    def test_add_escultor_201_CREATED(self):
        pais = Pais.objects.create(nombre="Argentina")
        escultor = {
            "nombre": 'Enzo "The Dog" Vallejos',
            "pais_id": pais.id,
            "correo": "Xxenzo_vallejosxX@xbox.com",
            "bibliografia": "...",
        }

        response = self.client.post(self.base_url, escultor, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(response.data["correo"], "Xxenzo_vallejosxX@xbox.com")
        self.assertTrue(
            Escultor.objects.filter(correo="Xxenzo_vallejosxX@xbox.com").exists()
        )

    def test_add_escultor_400_BAD_REQUEST(self):
        # La clase `EmailValidator`, utilizada por `EmailField`, ya se adhiere a los estándares de emails RFC 5321 y RFC 5322.
        # Además nuestro escenario no tiene ninguna restricción especial en tanto a los correos que debe aceptar
        # por lo que me parece que, los controles que este validador realiza son suficientes para nuestra aplicación y no haría
        # falta usar librerías como hypothesis para controlar sobre una amplia variedad de entradas.

        pais = Pais.objects.create(nombre="Argentina")
        invalid_escultores = [
            {
                "nombre": 'Enzo "The Dog" Vallejos',
                "pais_id": pais.id,
                "correo": "Xxenzo_vallejosxXxbox.com",
                "bibliografia": "...",
            },
        ]

        for escultor in invalid_escultores:
            response = self.client.post(self.base_url, escultor, format="json")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_visitante_204_NO_CONTENT(self):
        escultor = Escultor.objects.first()

        user = User.objects.create_user("username", "password")
        self.client.force_authenticate(user)

        response = self.client.delete(self.detail_url(escultor.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Escultor.objects.filter(pk=escultor.pk).exists())
