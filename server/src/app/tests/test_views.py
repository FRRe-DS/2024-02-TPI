import hashlib
from io import BytesIO
from django.test import SimpleTestCase
import logging
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from rest_framework.authtoken.models import Token
from PIL import Image

from app.models import (
    Escultor,
    Pais,
    Votante,
    Tematica,
    Evento,
    Lugar,
    Escultura,
    VotoEscultor,
    EscultorEvento,
)
from django.contrib.auth.models import User
from app.serializers import (
    EscultorWriteSerializer,
    EscultorReadSerializer,
    EscultorEventoReadSerializer,
    EsculturaSerializer,
    VotanteSerializer,
    TematicaSerializer,
    EventoReadSerializer,
    LugarSerializer,
)


class BaseAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="password")
        self.token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        logging.disable(logging.CRITICAL)


class HealthCheckAPITest(SimpleTestCase):
    def test_health_check(self):
        response = self.client.get(reverse("health_check"))
        self.assertEqual(response.status_code, 204)


class VotacionAPITest(BaseAPITest):
    def setUp(self):
        super().setUp()

        # INFO: (Lautaro) Este endpoint tiene un nombre "generico" debido a que trabajando con CBV's (más inclusive aún si heredan `viewsets.ModelViewSet`)
        # De manera automática tendríamos implementadas funcionalidades básicas como listar (GET), crear (POST), destruir (DELETE), etcétera.
        # Como estas funciones solo difieren en la cabecera HTTP que es enviada a la url y no en la url en sí, decidí darle un nombre descriptivo.
        self.base_url = reverse("voto_escultor-list")

        # INFO: (Lautaro) Esta funcion lambda tiene el proposito de generar dinamicamente endpoints como:
        # - <GET/PUT/DELETE> /votantes/<id>/
        self.detail_url = lambda pk: reverse("voto_escultor-detail", kwargs={"pk": pk})

        pais = Pais.objects.create(nombre="Argentina")

        self.escultor = Escultor.objects.create(
            nombre="Lautaro Acosta Quintana",
            pais_id=pais,
            correo="acostalautaro@ejemplo.com",
            bibliografia="...",
        )

        self.votante = Votante.objects.create(correo="ramon@ejemplo.com")

    def test_votar_escultor_201_CREATED(self):
        valid_input = {
            "escultor_id": self.escultor.id,
            "puntaje": 5,
            "correo_votante": self.votante.correo,
        }
        response = self.client.post(
            self.base_url,
            valid_input,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "Voto registrado")
        self.assertTrue(
            VotoEscultor.objects.filter(escultor_id=self.escultor.id).exists()
        )

    def test_votar_escultor_403_FORBIDDEN(self):
        self.test_votar_escultor_201_CREATED()
        valid_input = {
            "escultor_id": self.escultor.id,
            "puntaje": 5,
            "correo_votante": self.votante.correo,
        }
        response = self.client.post(
            self.base_url,
            valid_input,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_votar_escultor_400_BAD_REQUEST(self):
        self.test_votar_escultor_201_CREATED()
        valid_input = {
            "escultor_id": self.escultor.id,
            "puntaje": 10,
            "correo_votante": self.votante.correo,
        }
        response = self.client.post(
            self.base_url,
            valid_input,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        valid_input = {
            "escultor_id": self.escultor.id,
            "puntaje": -10,
            "correo_votante": self.votante.correo,
        }
        response = self.client.post(
            self.base_url,
            valid_input,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class QRAPITest(BaseAPITest):
    def setUp(self):
        super().setUp()

        pais = Pais.objects.create(nombre="Argentina")

        self.escultor = Escultor.objects.create(
            nombre="Lautaro Acosta Quintana",
            pais_id=pais,
            correo="acostalautaro@ejemplo.com",
            bibliografia="...",
        )

    def test_qr_generation_valid_id_200_OK(self):
        response = self.client.get(
            reverse("generar_qr"), {"escultor_id": self.escultor.id}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "image/png")
        img = Image.open(BytesIO(response.content))
        self.assertEqual(img.format, "PNG")

    def test_qr_generation_uniqueness(self):
        response = self.client.get(
            reverse("generar_qr"), {"escultor_id": self.escultor.id}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "image/png")
        img1 = Image.open(BytesIO(response.content))
        self.assertEqual(img1.format, "PNG")

        response = self.client.get(
            reverse("generar_qr"), {"escultor_id": self.escultor.id}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "image/png")
        img2 = Image.open(BytesIO(response.content))
        self.assertEqual(img2.format, "PNG")

        hash1 = get_image_hash(img1)
        hash2 = get_image_hash(img2)
        self.assertNotEqual(hash1, hash2, "QR codes should be unique but they are identical.")

    def test_qr_generation_invalid_id_400_BAD_REQUEST(self):
        response = self.client.get(reverse("generar_qr"), {"escultor_id": -2})
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    def test_qr_generation_nonexistent_id_400_BAD_REQUEST(self):
        response = self.client.get(reverse("generar_qr"), {"escultor_id": 2})
        self.assertEqual(response.status_code, 404)
        self.assertIn("error", response.data)

    def test_qr_generation_no_id_400_BAD_REQUEST(self):
        response = self.client.get(reverse("generar_qr"))
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

def get_image_hash(img):
    """Compute the hash of the binary content of an image."""
    with BytesIO() as output:
        img.save(output, format='PNG')
        return hashlib.md5(output.getvalue()).hexdigest()

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

        self.escultor = Escultor.objects.create(
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

        self.escultura = Escultura.objects.create(
            nombre="Escultura de Prueba",
            escultor_id=self.escultor,
            descripcion="Descripción de la escultura de prueba",
            fecha_creacion="2024-01-01",
        )

        self.lugar = Lugar.objects.create(nombre="Lugar de prueba")
        self.tematica = Tematica.objects.create(nombre="Temática de prueba")

        self.evento = Evento.objects.create(
            nombre="Evento Prueba",
            lugar_id=self.lugar,
            fecha_inicio="2024-10-09",
            fecha_fin="2024-10-10",
            descripcion="Descripción de prueba",
            tematica_id=self.tematica,
        )

    def test_get_escultores_data_200_OK(self):
        response = self.client.get(self.base_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)

        expected_data = EscultorReadSerializer(Escultor.objects.all(), many=True).data
        self.assertEqual(expected_data, response.data)

    def test_get_escultor_200_OK(self):
        escultor = Escultor.objects.first()

        response = self.client.get(self.detail_url(escultor.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expected_data = EscultorReadSerializer(escultor).data
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
        self.client.force_authenticate(user=None)
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

        self.lugar = Lugar.objects.create(
            nombre="Lugar de prueba", descripcion="valor de prueba"
        )
        self.tematica = Tematica.objects.create(nombre="Temática de prueba")

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
        serializer = EventoReadSerializer(eventos, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_get_evento_detail_200_OK(self):
        response = self.client.get(self.detail_url(self.evento.pk))
        serializer = EventoReadSerializer(self.evento)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_post_evento_authenticated_201_CREATED(self):
        data = {
            "nombre": "Nuevo Evento",
            "lugar_id": self.lugar.pk,
            "fecha_inicio": "2023-01-01",
            "fecha_fin": "2023-01-02",
            "descripcion": "Descripción actualizada",
            "tematica_id": self.tematica.pk,
            "finalizado": True,
        }
        response = self.client.post(self.base_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Evento.objects.filter(nombre="Nuevo Evento").exists())

    def test_post_evento_unauthenticated_401_UNAUTHORIZED(self):
        self.client.force_authenticate(user=None)
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
            "finalizado": True,
        }

        response = self.client.put(self.detail_url(self.evento.pk), data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.evento.refresh_from_db()
        self.assertEqual(self.evento.nombre, "Evento Actualizado")

    def test_delete_evento_204_NO_CONTENT(self):
        response = self.client.delete(self.detail_url(self.evento.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Evento.objects.filter(pk=self.evento.pk).exists())


class LugarAPITest(BaseAPITest):
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

        data = {
            "escultor_id": escultor.id,
            "nombre": "Escultura de Prueba",
            "descripcion": "Descripción de la escultura de prueba",
            "fecha_creacion": "2024-01-01",
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

        expected_data = EscultorWriteSerializer(escultor).data
        data = {
            "nombre": "Escultura de Prueba",
            "descripcion": "Descripción de la escultura de prueba",
            "fecha_creacion": "2024-01-01",
            "escultor_id": expected_data,
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

        data = {
            "nombre": "Escultura Actualizada",
            "descripcion": "Descripción de la escultura de prueba",
            "fecha_creacion": "2024-01-01",
            "escultor_id": escultor.id,
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


class EscultorEventoAPITest(BaseAPITest):
    def setUp(self):
        super().setUp()

        self.base_url = reverse("escultor_evento-list")
        self.detail_url = lambda pk: reverse(
            "escultor_evento-detail", kwargs={"pk": pk}
        )

        pais = Pais.objects.create(nombre="Argentina", iso="AR")
        self.lugar = Lugar.objects.create(nombre="Lugar de prueba")
        self.tematica = Tematica.objects.create(nombre="Temática de prueba")

        self.escultor = Escultor.objects.create(
            nombre="Escultor de prueba",
            apellido="Prueba",
            pais_id=pais,
            correo="escultor@prueba.com",
            fecha_nacimiento="1980-01-01",
            bibliografia="Bibliografía del escultor de prueba",
        )
        self.evento = Evento.objects.create(
            nombre="Evento de prueba",
            lugar_id=self.lugar,  # Ajusta si el modelo Evento requiere más datos obligatorios
            fecha_inicio="2024-01-01",
            fecha_fin="2024-01-05",
            descripcion="Descripción del evento de prueba",
            tematica_id=self.tematica,  # Ajusta si el modelo Evento requiere datos obligatorios
        )

        self.escultorevento = EscultorEvento.objects.create(
            escultor_id=self.escultor,
            evento_id=self.evento,
        )

    def test_get_escultorevento_list_200_OK(self):
        response = self.client.get(self.base_url)
        escultoresevento = EscultorEvento.objects.all()
        serializer = EscultorEventoReadSerializer(escultoresevento, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_get_escultorevento_detail_200_OK(self):
        response = self.client.get(self.detail_url(self.escultorevento.pk))
        serializer = EscultorEventoReadSerializer(self.escultorevento)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_post_escultorevento_authenticated_201_CREATED(self):
        data = {
            "escultor_id": self.escultor.id,
            "evento_id": self.evento.id,
        }
        response = self.client.post(self.base_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            EscultorEvento.objects.filter(
                escultor_id=self.escultor, evento_id=self.evento
            ).exists()
        )

    def test_post_escultorevento_unauthenticated_401_UNAUTHORIZED(self):
        self.client.force_authenticate(user=None)
        data = {
            "escultor_id": self.escultor.id,
            "evento_id": self.evento.id,
        }
        response = self.client.post(self.base_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_escultorevento_200_OK(self):
        new_evento = Evento.objects.create(
            nombre="Evento actualizado",
            lugar_id=self.lugar,
            fecha_inicio="2024-02-01",
            fecha_fin="2024-02-05",
            descripcion="Descripción del evento actualizado",
            tematica_id=self.tematica,
        )

        data = {
            "escultor_id": self.escultor.id,
            "evento_id": new_evento.id,
        }
        response = self.client.put(
            self.detail_url(self.escultorevento.pk), data, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.escultorevento.refresh_from_db()
        self.assertEqual(self.escultorevento.evento_id, new_evento)

    def test_delete_escultorevento_204_NO_CONTENT(self):
        response = self.client.delete(self.detail_url(self.escultorevento.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            EscultorEvento.objects.filter(pk=self.escultorevento.pk).exists()
        )
