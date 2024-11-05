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
