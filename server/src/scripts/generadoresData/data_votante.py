import sqlite3
from sqlite3 import Error
from faker import Faker

fake = Faker("es_ES")


try:
    # Establece la conexión a la base de datos SQLite
    connection = sqlite3.connect(r"C:\code\FACULTAD\2024-02-TPI\server\src\db.sqlite3")
    print("Conexión exitosa a la base de datos SQLite")

    cursor = connection.cursor()

    for i in range(100):
        id = i + 1
        correo = fake.email()

        # Inserción de datos
        try:
            cursor.execute(
                """INSERT INTO app_votante (id, correo) 
                VALUES (?, ?)""",
                (id, correo),
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
