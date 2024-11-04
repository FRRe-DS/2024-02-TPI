import sqlite3
from sqlite3 import Error
from faker import Faker

fake = Faker("es_ES")

lugares = [
    "Zona Automotrices",
    "Zona Artesanos",
    "Zona Emprendedores",
    "Zona Cancha de basket",
    "Zona Cancha de voley",
    "Zona Gastronomias",
    "Zona Pymes",
    "Zona Prensa",
    "Zona Pista de atletismo",
    "Zona Puestos de Salud",
]
cant_lugares = len(lugares)

try:
    # Establece la conexión a la base de datos SQLite
    connection = sqlite3.connect(r"C:\code\FACULTAD\2024-02-TPI\server\src\db.sqlite3")
    print("Conexión exitosa a la base de datos SQLite")

    cursor = connection.cursor()

    for i in range(len(lugares)):
        id = i + 1
        nombre = lugares[i]
        descripcion = fake.paragraph(
            nb_sentences=3
        )  # Genera un párrafo ficticio de 3 oraciones

        # Inserción de datos
        try:
            cursor.execute(
                """INSERT INTO app_lugar (id, nombre, descripcion) 
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
