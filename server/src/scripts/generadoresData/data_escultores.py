import sqlite3
from sqlite3 import Error
from faker import Faker
import random
from urls_imagenes import urls_escultores

fake = Faker("es_ES")


try:
    # Establece la conexión a la base de datos SQLite
    connection = sqlite3.connect(r"C:\code\FACULTAD\2024-02-TPI\server\src\db.sqlite3")
    print("Conexión exitosa a la base de datos SQLite")

    cursor = connection.cursor()

    for i in range(len(urls_escultores)):
        id = i + 1
        nombre = fake.first_name()
        apellido = fake.last_name()
        correo = fake.email()
        foto = urls_escultores[
            i
        ]  # solo paso el id de la img en drive ya que facilita la toma de datos desde el front
        bibliografia = fake.paragraph(
            nb_sentences=3
        )  # Genera un párrafo ficticio de 3 oraciones
        pais_id = random.randint(1, 240)
        fecha_nacimiento = fake.date_of_birth(minimum_age=18, maximum_age=45)

        # Inserción de datos
        try:
            cursor.execute(
                """INSERT INTO app_escultor (id, nombre, apellido, correo, foto, bibliografia, pais_id, fecha_nacimiento) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    id,
                    nombre,
                    apellido,
                    correo,
                    foto,
                    bibliografia,
                    pais_id,
                    fecha_nacimiento,
                ),
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
