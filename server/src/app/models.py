from django.db import models


class Escultura(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)
    descripcion = models.CharField(max_length=300, blank=True, null=True)
    fecha_creacion = models.DateField()
    qr = models.FileField(upload_to="qr/", blank=True, null=True)


class Pais(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)


class Escultor(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)
    pais_id = models.ForeignKey(Pais, on_delete=models.CASCADE, db_column="pais_id")
    correo = models.EmailField(null=True, blank=True, unique=True)
    foto = models.FileField(upload_to="perfiles/", blank=True, null=True)
    bibliografia = models.CharField(max_length=400)


class Visitante(models.Model):
    id = models.AutoField(primary_key=True)
    correo = models.EmailField(null=False, blank=False, unique=True)


class Adm_sistemas(models.Model):
    id = models.AutoField(primary_key=True)
    correo = models.EmailField(null=True, blank=True, unique=True)
    password = models.CharField(max_length=32)


class Imagen(models.Model):
    id = models.AutoField(primary_key=True)
    fecha = models.DateField()
    imagen = models.FileField(upload_to="imagenes/", blank=True, null=True)
    descripcion = models.CharField(max_length=255, blank=True, null=True)


class Tematica(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)
    descripcion = models.CharField(max_length=255, blank=True, null=True)


class Lugar(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)
    descripcion = models.CharField(max_length=255, blank=True, null=True)


class Evento(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=False, null=False)
    lugar_id = models.ForeignKey(Lugar, on_delete=models.CASCADE, db_column="lugar_id")
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    descripcion = models.CharField(max_length=255, blank=True, null=True)
    tematica_id = models.ForeignKey(
        Tematica, on_delete=models.CASCADE, db_column="tematica_id"
    )


class EsculturaImagen(models.Model):
    id = models.AutoField(primary_key=True)
    escultura_id = models.ForeignKey(
        Escultura, on_delete=models.CASCADE, db_column="escultura_id"
    )
    imagen_id = models.ForeignKey(
        Imagen, on_delete=models.CASCADE, db_column="imagen_id"
    )


class Escultorevento(models.Model):
    id = models.AutoField(primary_key=True)
    escultor_id = models.ForeignKey(
        Escultor, on_delete=models.CASCADE, db_column="escultor_id"
    )
    evento_id = models.ForeignKey(
        Evento, on_delete=models.CASCADE, db_column="evento_id"
    )


class VotoEscultura(models.Model):
    id = models.AutoField(primary_key=True)
    escultura_id = models.ForeignKey(
        Escultura, on_delete=models.CASCADE, db_column="escultura_id"
    )
    visitante_id = models.ForeignKey(
        Visitante, on_delete=models.CASCADE, db_column="visitante_id"
    )


class VotoEscultor(models.Model):
    id = models.AutoField(primary_key=True)
    escultor_id = models.ForeignKey(
        Escultor, on_delete=models.CASCADE, db_column="escultor_id"
    )
    visitante_id = models.ForeignKey(
        Visitante, on_delete=models.CASCADE, db_column="visitante_id"
    )
