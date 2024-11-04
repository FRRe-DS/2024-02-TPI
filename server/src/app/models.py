from django.db import models
from django.core.files.base import ContentFile
from PIL import Image
import io


class Votante(models.Model):
    """
    Almacena la información de un votante.
    """

    id = models.AutoField(primary_key=True)
    correo = models.EmailField(null=False, blank=False, unique=True)


class Pais(models.Model):
    """
    Almacena la información de un pais.
    """

    id = models.AutoField(primary_key=True)
    iso = models.CharField(max_length=2, blank=False, null=False)
    nombre = models.CharField(max_length=100, blank=False, null=False)


class Escultor(models.Model):
    """
    Almacena la información de un escultor, está relacionado con :model:`app.Pais`.
    """

    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=40, blank=False, null=False)
    apellido = models.CharField(max_length=30, blank=False, null=False)
    pais_id = models.ForeignKey(Pais, on_delete=models.CASCADE, db_column="pais_id")
    correo = models.EmailField(null=False, blank=False, unique=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    # TODO: (Lautaro) Si quisieramos trabajar usando un Object Storage como S3 o R2 para guardar las imágenes,
    # este campo tendría que ser un URLField.
    foto = models.FileField(upload_to="perfiles/", blank=True, null=True)
    bibliografia = models.CharField(max_length=400, blank=False, null=False)

    def save(self, *args, **kwargs):
        if self.foto:
            # Abrir la imagen usando PIL
            img = Image.open(self.foto)

            # Convertir a RGB si no lo está
            if img.mode != "RGB":
                img = img.convert("RGB")

            # Convertir la imagen a webp
            img_io = io.BytesIO()
            # Puedes ajustar la calidad
            img.save(img_io, format="WEBP", quality=100)
            img_content = ContentFile(
                img_io.getvalue(), name=self.foto.name.split(".")[0] + ".webp"
            )

            # Reemplazar la imagen original
            self.foto = img_content

        super(Escultor, self).save(*args, **kwargs)


class Escultura(models.Model):
    """
    Almacena la información de una escultura.
    """

    id = models.AutoField(primary_key=True)
    escultor_id = models.ForeignKey(
        Escultor, on_delete=models.CASCADE, db_column="escultor_id"
    )
    nombre = models.CharField(max_length=100, blank=False, null=False)
    descripcion = models.CharField(max_length=300, blank=False, null=False)
    fecha_creacion = models.DateField(auto_now_add=True, blank=True, null=True)
    # Tiene sentido almacenar los códigos QR si van a ser regenerados cada 10 minutos?
    qr = models.FileField(upload_to="qr/", blank=True, null=True)


class Imagen(models.Model):
    """
    Almacena la información de una imagen, está relacionado con :model:`app.Escultura`.
    """

    id = models.AutoField(primary_key=True)
    fecha_creacion = models.DateField(auto_now_add=True, blank=True, null=True)
    escultura_id = models.ForeignKey(
        Escultura, on_delete=models.CASCADE, db_column="escultura_id"
    )
    imagen = models.FileField(upload_to="imagenes/", blank=True, null=True)
    descripcion = models.CharField(max_length=255, blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.imagen and self.imagen.name:
            try:
                img_data = self.imagen.read()
                img = Image.open(io.BytesIO(img_data))

                if img.mode != "RGB":
                    img = img.convert("RGB")

                img_io = io.BytesIO()
                img.save(img_io, format="WEBP", quality=100)

                filename = self.imagen.name.rsplit(".", 1)[0]

                img_content = ContentFile(img_io.getvalue(), name=f"{filename}.webp")

                self.imagen = img_content

            except Exception as e:
                print(f"Error processing image: {e}")
            finally:
                if hasattr(img, "close"):
                    img.close()

        super().save(*args, **kwargs)


class Tematica(models.Model):
    """
    Almacena la información de una temática
    """

    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)
    descripcion = models.CharField(max_length=255, blank=True, null=True)


class Lugar(models.Model):
    """
    Almacena la información de un lugar.
    """

    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)
    descripcion = models.CharField(max_length=255, blank=False, null=False)


class Evento(models.Model):
    """
    Almacena la información de un evento, está relacionado con :model:`app.Lugar` y :model:`app.Tematica`.
    """

    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)
    lugar_id = models.ForeignKey(Lugar, on_delete=models.CASCADE, db_column="lugar_id")
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    descripcion = models.CharField(max_length=255, blank=False, null=False)
    tematica_id = models.ForeignKey(
        Tematica, on_delete=models.CASCADE, db_column="tematica_id"
    )


class EscultorEvento(models.Model):
    """
    Almacena la información de un Escultor y los eventos en donde participa, está relacionado con :model:`app.Escultor` y :model:`app.Evento`.
    """

    id = models.AutoField(primary_key=True)
    escultor_id = models.ForeignKey(
        Escultor, on_delete=models.CASCADE, db_column="escultor_id"
    )
    evento_id = models.ForeignKey(
        Evento, on_delete=models.CASCADE, db_column="evento_id"
    )


class VotoEscultor(models.Model):
    """
    Almacena la información de los votos que tiene un escultor, está relacionado con :model:`app.Escultor` y :model:`app.Votante`.
    """

    id = models.AutoField(primary_key=True)
    escultor_id = models.ForeignKey(
        Escultor, on_delete=models.CASCADE, db_column="escultor_id"
    )
    votante_id = models.ForeignKey(
        Votante, on_delete=models.CASCADE, db_column="votante_id"
    )
    puntaje = models.PositiveIntegerField()
