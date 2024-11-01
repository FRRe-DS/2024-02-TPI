import sqlite3
from sqlite3 import Error
from faker import Faker
import random
from urls_imagenes import urls_escultores
from data_evento import cant_eventos

fake = Faker("es_ES")


try:
    # Establece la conexión a la base de datos SQLite
    connection = sqlite3.connect(r"C:\code\FACULTAD\2024-02-TPI\server\src\db.sqlite3")
    print("Conexión exitosa a la base de datos SQLite")

    cursor = connection.cursor()

    for i in range(len(urls_escultores)):
        id = i + 1
        escultor_id = id
        evento_id = 1  # suponiendo qu todos vienen a la expo de arte y que todos los que cargue van a participar

        # Inserción de datos
        try:
            cursor.execute(
                """INSERT INTO app_escultorevento (id, escultor_id, evento_id) 
                VALUES (?, ?, ?)""",
                (id, escultor_id, evento_id),
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
