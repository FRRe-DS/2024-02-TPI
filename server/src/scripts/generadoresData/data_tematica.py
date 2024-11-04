import sqlite3
from sqlite3 import Error
from faker import Faker

fake = Faker("es_ES")

tematicas = [
    "Naturaleza y Paisaje",
    "Identidad Cultural",
    "Tecnología y Futuro",
    "Memoria Histórica",
    "Abstracción y Color",
    "Diversidad y Género",
    "Ecología y Sustentabilidad",
    "Exploración Espacial",
    "Misticismo y Religión",
    "Migración y Fronteras",
    "Arte y Ciencia",
    "Sueños y Realidad",
    "Tiempo y Espacio",
    "El Cuerpo Humano",
    "Emociones y Expresiones",
]

cant_tematicas = len(tematicas)

try:
    # Establece la conexión a la base de datos SQLite
    connection = sqlite3.connect(r"C:\code\FACULTAD\2024-02-TPI\server\src\db.sqlite3")
    print("Conexión exitosa a la base de datos SQLite")

    cursor = connection.cursor()

    for i in range(len(tematicas)):
        id = i + 1
        nombre = tematicas[i]
        descripcion = fake.paragraph(
            nb_sentences=3
        )  # Genera un párrafo ficticio de 3 oraciones

        # Inserción de datos
        try:
            cursor.execute(
                """INSERT INTO app_tematica (id, nombre, descripcion) 
                VALUES (?, ?, ?)""",
                (id, nombre, descripcion),
            )
        except Error as e:
            print(f"Error al insertar en la base de datos: {e}")

    # Commit después de completar la inserción
    connection.commit()
    print("{} filas insertadas.".format(i + 1))

except Error as e:
    print(f"Error al conectar a la base de datos: {e}")

finally:
    if connection:
        connection.close()
        print("Conexión cerrada")
