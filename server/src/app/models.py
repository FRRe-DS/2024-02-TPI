from django.db import models
from rest_framework.fields import MaxValueValidator, MinValueValidator

from .utils import convertir_a_webp


class Votante(models.Model):
    """
    Almacena la información de un votante.

    Atributos:
        id (AutoField): Identificador único del votante.
        correo (EmailField): Correo electrónico del votante, debe ser único.
    """

    id = models.AutoField(primary_key=True)
    correo = models.EmailField(null=False, blank=False, unique=True)

    class Meta:
        verbose_name = "Votante"
        verbose_name_plural = "Votantes"

    def __str__(self):
        return self.correo


class Pais(models.Model):
    """
    Almacena la información de un pais.

    Atributos:
        id (AutoField): Identificador único del país.
        iso (CharField): Código ISO de 2 caracteres que representa el país.
        nombre (CharField): Nombre del país.
    """

    id = models.AutoField(primary_key=True)
    iso = models.CharField(max_length=2, blank=False, null=False)
    nombre = models.CharField(max_length=100, blank=False, null=False)

    class Meta:
        verbose_name = "Pais"
        verbose_name_plural = "Paises"

    def __str__(self):
        return self.nombre


class Escultor(models.Model):
    """
    Almacena la información de un escultor, está relacionado con :model:`app.Pais`.

    Atributos:
        id (AutoField): Identificador único del escultor.
        nombre (CharField): Nombre del escultor, requerido.
        apellido (CharField): Apellido del escultor, requerido.
        pais_id (ForeignKey): Relación con el país del escultor.
        correo (EmailField): Correo electrónico del escultor, debe ser único.
        fecha_nacimiento (DateField): Fecha de nacimiento del escultor.
        foto (FileField): Imagen de perfil del escultor, se almacena en formato WEBP.
        bibliografia (CharField): Biografía del escultor, requerida.
    """

    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=40, blank=False, null=False)
    apellido = models.CharField(max_length=30, blank=False, null=False)
    pais_id = models.ForeignKey(Pais, on_delete=models.CASCADE, db_column="pais_id")
    correo = models.EmailField(null=False, blank=False, unique=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    foto = models.ImageField(upload_to="img/perfiles/", blank=True, null=True)
    bibliografia = models.CharField(max_length=400, blank=False, null=False)

    def save(self, *args, **kwargs):
        if self.foto:
            self.foto = convertir_a_webp(self.foto)
        super(Escultor, self).save(*args, **kwargs)

    def update(self, instance, validated_data):
        foto = validated_data.pop('foto', None)
        if foto:
            instance.foto = foto
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    class Meta:
        verbose_name = "Escultor"
        verbose_name_plural = "Escultores"

    def __str__(self):
        return self.apellido + ", " + self.nombre


class Escultura(models.Model):
    """
    Almacena la información de una escultura.

    Atributos:
        id (AutoField): Identificador único de la escultura.
        escultor_id (ForeignKey): Relación con el escultor que creó la escultura.
        nombre (CharField): Nombre de la escultura, requerido.
        descripcion (CharField): Descripción de la escultura, requerida.
        fecha_creacion (DateField): Fecha de creación, se establece automáticamente al crear.
        qr (FileField): Archivo de código QR asociado a la escultura, opcional.
    """

    id = models.AutoField(primary_key=True)
    escultor_id = models.ForeignKey(
        Escultor,
        on_delete=models.CASCADE,
        db_column="escultor_id",
        related_name="esculturas",
    )
    nombre = models.CharField(max_length=100, blank=False, null=False)
    descripcion = models.CharField(blank=False, null=False)
    fecha_creacion = models.DateField(auto_now_add=True, blank=True, null=True)

    class Meta:
        verbose_name = "Escultura"
        verbose_name_plural = "Esculturas"

    def __str__(self):
        return self.nombre


class Imagen(models.Model):
    """
    Almacena la información de una imagen, está relacionado con :model:`app.Escultura`.

    Atributos:
        id (AutoField): Identificador único de la imagen.
        fecha_creacion (DateField): Fecha de creación de la imagen, se establece automáticamente.
        escultura_id (ForeignKey): Relación con la escultura a la que pertenece la imagen.
        imagen (FileField): Archivo de imagen, se almacena en formato WEBP.
        descripcion (CharField): Descripción de la imagen.
    """

    id = models.AutoField(primary_key=True)
    fecha_creacion = models.DateField(auto_now_add=True, blank=True, null=True)
    escultura_id = models.ForeignKey(
        Escultura,
        on_delete=models.CASCADE,
        db_column="escultura_id",
        related_name="imagenes",
    )
    imagen = models.ImageField(upload_to="img/esculturas/", blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.imagen:
            self.imagen = convertir_a_webp(self.imagen)
        super(Imagen, self).save(*args, **kwargs)

    class Meta:
        verbose_name = "Imagen"
        verbose_name_plural = "Imagenes"

    def __str__(self):
        return (
            str(self.id)
            + ", "
            + str(self.escultura_id)
            + " --> hecho por --> "
            + str(self.escultura_id.escultor_id)
        )


class Tematica(models.Model):
    """
    Almacena la información de una temática

    Atributos:
        id (AutoField): Identificador único de la temática.
        nombre (CharField): Nombre de la temática, requerido.
        descripcion (CharField): Descripción de la temática.
    """

    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)
    descripcion = models.CharField(blank=True, null=True)

    class Meta:
        verbose_name = "Tematica"
        verbose_name_plural = "Tematicas"

    def __str__(self):
        return self.nombre


class Lugar(models.Model):
    """
    Almacena la información de un lugar.

    Atributos:
        id (AutoField): Identificador único del lugar.
        nombre (CharField): Nombre del lugar, requerido.
        descripcion (CharField): Descripción del lugar, requerida.
    """

    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)
    descripcion = models.CharField(blank=False, null=False)

    class Meta:
        verbose_name = "Lugar"
        verbose_name_plural = "Lugares"

    def __str__(self):
        return self.nombre


class Evento(models.Model):
    """
    Almacena la información de un evento, está relacionado con :model:`app.Lugar` y :model:`app.Tematica`.

    Atributos:
        id (AutoField): Identificador único del evento.
        nombre (CharField): Nombre del evento, requerido.
        lugar_id (ForeignKey): Relación con el lugar donde se realiza el evento.
        fecha_inicio (DateField): Fecha de inicio del evento.
        fecha_fin (DateField): Fecha de fin del evento.
        descripcion (CharField): Descripción del evento, requerida.
        tematica_id (ForeignKey): Relación con la temática del evento.
        foto (fileField): Almacena una unica foto del evento.
    """

    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)
    lugar_id = models.ForeignKey(Lugar, on_delete=models.CASCADE, db_column="lugar_id")
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    descripcion = models.CharField(blank=False, null=False)
    foto = models.ImageField(upload_to="img/eventos/", blank=True, null=True)
    tematica_id = models.ForeignKey(
        Tematica, on_delete=models.CASCADE, db_column="tematica_id"
    )
    finalizado = models.BooleanField(default=True, blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.foto:
            self.foto = convertir_a_webp(self.foto)
        super(Evento, self).save(*args, **kwargs)

    class Meta:
        verbose_name = "Evento"
        verbose_name_plural = "Eventos"

    def __str__(self):
        return self.nombre


class EscultorEvento(models.Model):
    """
    Almacena la información de un Escultor y los eventos en donde participa, está relacionado con :model:`app.Escultor` y :model:`app.Evento`.

    Atributos:
        id (AutoField): Identificador único de la relación.
        escultor_id (ForeignKey): Relación con el escultor que participa en el evento.
        evento_id (ForeignKey): Relación con el evento en el que participa el escultor.
    """

    id = models.AutoField(primary_key=True)
    escultor_id = models.ForeignKey(
        Escultor, on_delete=models.CASCADE, db_column="escultor_id"
    )
    evento_id = models.ForeignKey(
        Evento, on_delete=models.CASCADE, db_column="evento_id"
    )

    class Meta:
        verbose_name = "Escultor Evento"
        verbose_name_plural = "Escultor Evento"

    def __str__(self):
        return str(self.escultor_id) + " ---> " + str(self.evento_id)


class VotoEscultor(models.Model):
    """
    Almacena la información de los votos que tiene un escultor, está relacionado con :model:`app.Escultor` y :model:`app.Votante`.

    Atributos:
        id (AutoField): Identificador único del voto.
        escultor_id (ForeignKey): Relación con el escultor que recibe el voto.
        votante_id (ForeignKey): Relación con el votante que emite el voto.
        puntaje (PositiveIntegerField): Puntaje del voto otorgado al escultor.
    """

    id = models.AutoField(primary_key=True)
    escultor_id = models.ForeignKey(
        Escultor, on_delete=models.CASCADE, db_column="escultor_id"
    )
    votante_id = models.ForeignKey(
        Votante, on_delete=models.CASCADE, db_column="votante_id"
    )
    puntaje = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )

    class Meta:
        unique_together = ("escultor_id", "votante_id")
