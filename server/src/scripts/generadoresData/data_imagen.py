import sqlite3
from sqlite3 import Error
from faker import Faker
import random
from urls_imagenes import urls_esculturas

fake = Faker("es_ES")


try:
    # Establece la conexión a la base de datos SQLite
    connection = sqlite3.connect(r"C:\code\FACULTAD\2024-02-TPI\server\src\db.sqlite3")
    print("Conexión exitosa a la base de datos SQLite")

    cursor = connection.cursor()

    for i in range(len(urls_esculturas)):
        id = i + 1
        imagen = urls_esculturas[
            i
        ]  # solo paso el id de la img en drive ya que facilita la toma de datos desde el front
        descripcion = fake.paragraph(
            nb_sentences=3
        )  # Genera un párrafo ficticio de 3 oraciones
        escultura_id = id
        fecha_creacion = "2024-11-01"

        # Inserción de datos
        try:
            cursor.execute(
                """INSERT INTO app_imagen (id, imagen, descripcion, escultura_id, fecha_creacion) 
                VALUES (?, ?, ?, ?, ?)""",
                (id, imagen, descripcion, escultura_id, fecha_creacion),
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
