from PIL import Image
import io
from django.core.files.base import ContentFile


class PositiveInt(int):
    """
    Representa un número entero que debe ser positivo.

    Esta clase garantiza que el valor instanciado sea un entero positivo.

    Si se proporciona un valor que no es un entero o un entero negativo,
    se levantará un ValueError.

    Parámetros
    ----------
    value : int
        El valor entero que se desea instanciar como PositiveInt. Debe ser mayor que cero.

    Raises
    ------
    ValueError
        Se levanta si `value` no es un entero o si es un entero menor o igual a cero.

    Ejemplos
    --------
    >>> p = PositiveInt(5)
    >>> print(p)
    5

    >>> p = PositiveInt(-3)
    ValueError: -3 no es un entero positivo

    >>> p = PositiveInt("string")
    ValueError: string no es un entero positivo
    """

    def __new__(cls, value):
        if not isinstance(value, int):
            raise ValueError(f"{value} no es un entero positivo")
        if value <= 0:
            raise ValueError(f"{value} no es un entero positivo")
        return super().__new__(cls, value)

    def __init__(self, value):
        super().__init__()


def convertir_a_webp(image_field, quality=100):
    """
    Convierte una imagen a formato WEBP.

    Args:
        image_field (File): Archivo de imagen a convertir.
        quality (int): Calidad de la imagen WEBP (por defecto 100).

    Returns:
        ContentFile: Imagen convertida en formato WEBP.
    """
    if not image_field:
        return None

    # Abrir la imagen usando PIL
    img = Image.open(image_field)

    # Convertir a RGB si no lo está
    if img.mode != "RGB":
        img = img.convert("RGB")

    # Convertir la imagen a webp
    img_io = io.BytesIO()
    img.save(img_io, format="WEBP", quality=quality)
    return ContentFile(img_io.getvalue(), name=image_field.name.split(".")[0] + ".webp")
