from django.test import SimpleTestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from rest_framework.authtoken.models import Token
import logging

from app.models import Escultor, Pais, Votante, Tematica, Evento, Lugar, Escultura
from django.contrib.auth.models import User
from app.serializers import (
    EscultorSerializer,
    VotanteSerializer,
    TematicaSerializer,
    EventoSerializer,
    LugarSerializer,
    EsculturaSerializer,
)


class HealthCheckAPITest(SimpleTestCase):
    def test_health_check(self):
        response = self.client.get(reverse("health_check"))
        self.assertEqual(response.status_code, 204)


class BaseAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="password")
        self.token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        logging.disable(logging.CRITICAL)


class VotanteAPITest(BaseAPITest):
    def setUp(self):
        super().setUp()

        # INFO: (Lautaro) Este endpoint tiene un nombre "generico" debido a que trabajando con CBV's (más inclusive aún si heredan `viewsets.ModelViewSet`)
        # De manera automática tendríamos implementadas funcionalidades básicas como listar (GET), crear (POST), destruir (DELETE), etcétera.
        # Como estas funciones solo difieren en la cabecera HTTP que es enviada a la url y no en la url en sí, decidí darle un nombre descriptivo.
        self.base_url = reverse("votantes-list")

        # INFO: (Lautaro) Esta funcion lambda tiene el proposito de generar dinamicamente endpoints como:
        # - <GET/PUT/DELETE> /votantes/<id>/
        self.detail_url = lambda pk: reverse("votantes-detail", kwargs={"pk": pk})

        Votante.objects.create(correo="acostalautaro@ejemplo.com")
        Votante.objects.create(correo="gonza_saucedo@ejemplo.com")
        Votante.objects.create(correo="enzovallejos@ejemplo.com")
        Votante.objects.create(correo="tobiasstegmayer@ejemplo.com")
        Votante.objects.create(correo="ivanniveyro@ejemplo.com")

    def test_get_votantes_data_200_OK(self):
        response = self.client.get(self.base_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)

        expected_data = VotanteSerializer(Votante.objects.all(), many=True).data
        self.assertEqual(expected_data, response.data)

    def test_get_votante_200_OK(self):
        votante = Votante.objects.first()

        response = self.client.get(self.detail_url(votante.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expected_data = VotanteSerializer(votante).data
        self.assertEqual(expected_data, response.data)

    def test_add_user_201_CREATED(self):
        valid_emails = {"correo": "Xxenzo_vallejosxX@xbox.com"}

        response = self.client.post(self.base_url, valid_emails, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["correo"], "Xxenzo_vallejosxX@xbox.com")
        self.assertTrue(
            Votante.objects.filter(correo="Xxenzo_vallejosxX@xbox.com").exists()
        )

    def test_add_votante_400_BAD_REQUEST(self):
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

    def test_delete_votante_204_NO_CONTENT(self):
        votante = Votante.objects.first()

        user = User.objects.create_user("username", "password")
        self.client.force_authenticate(user)

        response = self.client.delete(self.detail_url(votante.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Votante.objects.filter(pk=votante.pk).exists())


class EscultoresAPITest(BaseAPITest):
    def setUp(self):
        super().setUp()

        # INFO: (Lautaro) Este endpoint tiene un nombre "generico" debido a que trabajando con CBV's (más inclusive aún si heredan `viewsets.ModelViewSet`)
        # De manera automática tendríamos implementadas funcionalidades básicas como listar (GET), crear (POST), destruir (DELETE), etcétera.
        # Como estas funciones solo difieren en la cabecera HTTP que es enviada a la url y no en la url en sí, decidí darle un nombre descriptivo.
        self.base_url = reverse("escultores-list")

        # INFO: (Lautaro) Esta funcion lambda tiene el proposito de generar dinamicamente endpoints como:
        # - <GET/PUT/DELETE> /votantes/<id>/
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
            "nombre": 'Enzo "The Dog"',
            "apellido": "Vallejos",
            "pais_id": pais.id,
            "correo": "Xxenzo_vallejosxX@xbox.com",
            "fecha_nacimiento": "2024-02-1",
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

    def test_delete_votante_204_NO_CONTENT(self):
        escultor = Escultor.objects.first()

        user = User.objects.create_user("username", "password")
        self.client.force_authenticate(user)

        response = self.client.delete(self.detail_url(escultor.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Escultor.objects.filter(pk=escultor.pk).exists())


class TematicaAPITest(BaseAPITest):
    def setUp(self):
        super().setUp()

        self.base_url = reverse("tematicas-list")
        self.detail_url = lambda pk: reverse("tematicas-detail", kwargs={"pk": pk})
        self.tematica = Tematica.objects.create(nombre="Tematica Test")

    def test_get_tematica_list_200_OK(self):
        response = self.client.get(self.base_url)
        tematicas = Tematica.objects.all()
        expected_data = TematicaSerializer(tematicas, many=True).data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, expected_data)

    def test_post_tematica_authenticated_201_CREATED(self):
        data = {"nombre": "Nueva Tematica"}
        response = self.client.post(self.base_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["nombre"], data["nombre"])
        self.assertTrue(Tematica.objects.filter(nombre="Nueva Tematica").exists())

    def test_post_tematica_unauthenticated_401_UNAUTHORIZED(self):
        self.client.force_authenticate(
            user=None
        )  # elimina la autentificion forzadamente
        data = {"nombre": "Tematica no autenticada"}
        response = self.client.post(self.base_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_tematica_200_OK(self):
        data = {"nombre": "Tematica Actualizada"}
        response = self.client.put(
            self.detail_url(self.tematica.pk), data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.tematica.refresh_from_db()
        self.assertEqual(self.tematica.nombre, "Tematica Actualizada")

    def test_delete_tematica_204_NO_CONTENT(self):
        response = self.client.delete(self.detail_url(self.tematica.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Tematica.objects.filter(pk=self.tematica.pk).exists())


class EventoAPITest(BaseAPITest):
    def setUp(self):
        super().setUp()

        self.base_url = reverse("eventos-list")
        self.detail_url = lambda pk: reverse("eventos-detail", kwargs={"pk": pk})

        # crea los objetos de prueba que tienen FK,
        self.lugar = Lugar.objects.create(nombre="Lugar de prueba")
        self.tematica = Tematica.objects.create(nombre="Temática de prueba")

        # datos de prueba
        self.evento = Evento.objects.create(
            nombre="Evento Prueba",
            lugar_id=self.lugar,
            fecha_inicio="2024-10-09",
            fecha_fin="2024-10-10",
            descripcion="Descripción de prueba",
            tematica_id=self.tematica,
        )

    def test_get_evento_list_200_OK(self):
        response = self.client.get(self.base_url)
        eventos = Evento.objects.all()
        serializer = EventoSerializer(eventos, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_get_evento_detail_200_OK(self):
        response = self.client.get(self.detail_url(self.evento.pk))
        serializer = EventoSerializer(self.evento)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_post_evento_authenticated_201_CREATED(self):
        data = {
            "nombre": "Nuevo Evento",
            "lugar_id": self.lugar.pk,
            "fecha_inicio": "2023-02-01",
            "fecha_fin": "2023-02-02",
            "descripcion": "Descripción del nuevo evento",
            "tematica_id": self.tematica.pk,
        }
        response = self.client.post(self.base_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Evento.objects.filter(nombre="Nuevo Evento").exists())

    def test_post_evento_unauthenticated_401_UNAUTHORIZED(self):
        self.client.force_authenticate(user=None)  # Elimina autenticación
        data = {
            "nombre": "Evento sin autenticación",
            "lugar_id": self.lugar.pk,
            "fecha_inicio": "2023-03-01",
            "fecha_fin": "2023-03-02",
            "descripcion": "Intento sin autenticación",
            "tematica_id": self.tematica.pk,
        }
        response = self.client.post(self.base_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_evento_200_OK(self):
        data = {
            "nombre": "Evento Actualizado",
            "lugar_id": self.lugar.pk,
            "fecha_inicio": "2023-01-01",
            "fecha_fin": "2023-01-02",
            "descripcion": "Descripción actualizada",
            "tematica_id": self.tematica.pk,
        }
        response = self.client.put(self.detail_url(self.evento.pk), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.evento.refresh_from_db()
        self.assertEqual(self.evento.nombre, "Evento Actualizado")

    def test_delete_evento_204_NO_CONTENT(self):
        response = self.client.delete(self.detail_url(self.evento.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Evento.objects.filter(pk=self.evento.pk).exists())


class lugarAPITest(BaseAPITest):
    def setUp(self):
        super().setUp()

        self.base_url = reverse("lugares-list")
        self.detail_url = lambda pk: reverse("lugares-detail", kwargs={"pk": pk})
        # crea datos de prueba
        self.lugar = Lugar.objects.create(nombre="lugar Test")

    def test_get_lugar_list_200_OK(self):
        response = self.client.get(self.base_url)
        lugares = Lugar.objects.all()
        expected_data = LugarSerializer(lugares, many=True).data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, expected_data)

    def test_post_lugar_authenticated_201_CREATED(self):
        # se pasa los dos datos, ya que en los models se establecio que la descripcion de esta entidad es not null
        data = {
            "nombre": "nuevo lugar",
            "descripcion": "nueva descripcion",
        }
        response = self.client.post(self.base_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Lugar.objects.filter(nombre="nuevo lugar").exists())

    def test_post_lugar_unauthenticated_401_UNAUTHORIZED(self):
        self.client.force_authenticate(
            user=None
        )  # elimina la autentificion forzadamente
        data = {"nombre": "view lugar no autenticado"}
        response = self.client.post(self.base_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_lugar_200_OK(self):
        data = {
            "nombre": "lugar actualizado",
            "descripcion": "lugar actualizado",
        }

        response = self.client.put(self.detail_url(self.lugar.pk), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.lugar.refresh_from_db()
        self.assertEqual(self.lugar.nombre, "lugar actualizado")

    def test_delete_lugar_204_NO_CONTENT(self):
        response = self.client.delete(self.detail_url(self.lugar.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Lugar.objects.filter(pk=self.lugar.pk).exists())


# __
class EsculturaAPITest(BaseAPITest):
    def setUp(self):
        super().setUp()

        self.base_url = reverse("esculturas-list")
        self.detail_url = lambda pk: reverse("esculturas-detail", kwargs={"pk": pk})

        pais = Pais.objects.create(
            nombre="Argentina",
        )

        escultor = Escultor.objects.create(
            nombre="Gonza",
            apellido="Saucedo",
            pais_id=pais,
            correo="gonzubi@saucedo.gmail",
            fecha_nacimiento="2024-11-01",
            bibliografia="...",
        )

        self.escultura = Escultura.objects.create(
            nombre="Escultura de Prueba",
            escultor_id=escultor,
            descripcion="Descripción de la escultura de prueba",
            fecha_creacion="2024-01-01",
            qr=None,
        )

    def test_get_esculturas_list_200_OK(self):
        response = self.client.get(self.base_url)
        esculturas = Escultura.objects.all()
        expected_data = EsculturaSerializer(esculturas, many=True).data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, expected_data)

    def test_get_escultura_detail_200_OK(self):
        escultura = Escultura.objects.first()

        response = self.client.get(self.detail_url(escultura.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expected_data = EsculturaSerializer(escultura).data
        self.assertEqual(expected_data, response.data)

    def test_create_escultura_authenticated_201_CREATED(self):
        pais = Pais.objects.create(
            nombre="Argentina",
        )

        escultor = Escultor.objects.create(
            nombre="Gonza",
            apellido="Saucedo",
            pais_id=pais,
            correo="gonzubi@saucedo0.gmail",
            fecha_nacimiento="2024-11-01",
            bibliografia="...",
        )

        expected_data = EscultorSerializer(escultor).data

        data = {
            "escultor_id": expected_data,
            "nombre": "Escultura de Prueba",
            "descripcion": "Descripción de la escultura de prueba",
            "fecha_creacion": "2024-01-01",
            "qr": None,
        }

        response = self.client.post(self.base_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Escultura.objects.filter(nombre="Escultura de Prueba").exists())

    def test_create_escultura_unauthenticated_401_UNAUTHORIZED(self):
        self.client.force_authenticate(user=None)

        pais = Pais.objects.create(
            nombre="Argentina",
        )

        escultor = Escultor.objects.create(
            nombre="Gonza",
            apellido="Saucedo",
            pais_id=pais,
            correo="gonzubi@saucedo1.gmail",
            fecha_nacimiento="2024-11-01",
            bibliografia="...",
        )

        expected_data = EscultorSerializer(escultor).data
        data = {
            "nombre": "Escultura de Prueba",
            "descripcion": "Descripción de la escultura de prueba",
            "fecha_creacion": "2024-01-01",
            "escultor_id": expected_data,
            "qr": None,
        }
        response = self.client.post(self.base_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_escultura_200_OK(self):
        pais = Pais.objects.create(
            nombre="Argentina",
        )

        escultor = Escultor.objects.create(
            nombre="Gonza",
            apellido="Saucedo",
            pais_id=pais,
            correo="gonzubi@saucedo2.gmail",
            fecha_nacimiento="2024-11-01",
            bibliografia="...",
        )

        expected_data = EscultorSerializer(escultor).data
        data = {
            "nombre": "Escultura de Prueba",
            "descripcion": "Descripción de la escultura de prueba",
            "fecha_creacion": "2024-01-01",
            "escultor_id": expected_data,
            "qr": None,
        }

        response = self.client.put(
            self.detail_url(self.escultura.pk), data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.escultura.refresh_from_db()
        self.assertEqual(self.escultura.nombre, "Escultura Actualizada")

    def test_delete_escultura_204_NO_CONTENT(self):
        escultura = Escultura.objects.first()

        user = User.objects.create_user("username", "password")
        self.client.force_authenticate(user)

        response = self.client.delete(self.detail_url(escultura.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Escultura.objects.filter(pk=escultura.pk).exists())
