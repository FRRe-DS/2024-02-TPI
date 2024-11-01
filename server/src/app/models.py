from django.db import models


class Votante(models.Model):
    """
    Almacena la información de un votante.
    """

    id = models.AutoField(primary_key=True)
    correo = models.EmailField(null=False, blank=False, unique=True)


class Escultura(models.Model):
    """
    Almacena la información de una escultura.
    """

    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)
    descripcion = models.CharField(max_length=300, blank=False, null=False)
    fecha_creacion = models.DateField()
    # Tiene sentido almacenar los códigos QR si van a ser regenerados cada 10 minutos?
    qr = models.FileField(upload_to="qr/", blank=True, null=True)


class Pais(models.Model):
    """
    Almacena la información de un pais.
    """

    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)


class Escultor(models.Model):
    """
    Almacena la información de un escultor, está relacionado con :model:`app.Pais`.
    """

    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)
    pais_id = models.ForeignKey(Pais, on_delete=models.CASCADE, db_column="pais_id")
    correo = models.EmailField(null=False, blank=False, unique=True)
    # TODO: (Lautaro) Si quisieramos trabajar usando un Object Storage como S3 o R2 para guardar las imágenes,
    # este campo tendría que ser un URLField.
    foto = models.FileField(upload_to="perfiles/", blank=True, null=True)
    bibliografia = models.CharField(max_length=400, blank=False, null=False)


"""

Para utilizar la autenticacion de token tenemos que usar el model user que brinda django
Por ende cambie en el serializer eso y quedo sin uso esto, pero lo dejo por las dudas para mas adelante, si al final no lo usamos lo borramos nomas

class AdminSistema(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, null = False, blank=False, unique=True)
    correo = models.EmailField(null=False, blank=False, unique=True)
    password = models.CharField(max_length=32, blank=False)
"""


class Imagen(models.Model):
    """
    Almacena la información de una imagen, está relacionado con :model:`app.Escultura`.
    """

    id = models.AutoField(primary_key=True)
    fecha = models.DateField()
    # TODO: (Lautaro) Si quisieramos trabajar usando un Object Storage como S3 o R2 para guardar las imágenes,
    # este campo tendría que ser un URLField.
    #
    # imagen = models.URLField(max_length=200)
    #
    imagen = models.FileField(upload_to="imagenes/", blank=True, null=True)
    descripcion = models.CharField(max_length=255, blank=True, null=True)


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


class EsculturaImagen(models.Model):
    """
    Almacena la información de una escultura y las imagenes que le corresponde, está relacionado con :model:`app.Escultura` y :model:`app.Imagen`.
    """

    id = models.AutoField(primary_key=True)
    escultura_id = models.ForeignKey(
        Escultura, on_delete=models.CASCADE, db_column="escultura_id"
    )
    imagen_id = models.ForeignKey(
        Imagen, on_delete=models.CASCADE, db_column="imagen_id"
    )


class Escultorevento(models.Model):
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


class VotoEscultura(models.Model):
    """
    Almacena la información de los votos que tiene una escultura, está relacionado con :model:`app.Escultura` y :model:`app.Votante`.
    """

    id = models.AutoField(primary_key=True)
    escultura_id = models.ForeignKey(
        Escultura, on_delete=models.CASCADE, db_column="escultura_id"
    )
    votante_id = models.ForeignKey(
        Votante, on_delete=models.CASCADE, db_column="votante_id"
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
