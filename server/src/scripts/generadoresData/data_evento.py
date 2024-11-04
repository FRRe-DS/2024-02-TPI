import sqlite3
from sqlite3 import Error
from faker import Faker
import random
from data_lugar import cant_lugares
from data_tematica import cant_tematicas

fake = Faker("es_ES")

eventos_bienal = [
    "Concurso Internacional de Escultura",
    "Exposiciones de Arte",
    "Talleres y Capacitaciones",
    "Conferencias y Charlas",
    "Recorridos Guiados",
    "Intervenciones Urbanas",
    "Espectáculos de Música en Vivo",
    "Proyecciones de Cine",
    "Premiación y Clausura",
    "Actividades para Niños",
    "Artistas Invitados Internacionales",
    "Feria de Artesanía y Productos Locales",
    "Performance en Vivo",
    "Festival Gastronómico",
    "Exhibiciones de Realidad Virtual",
]
cant_eventos = len(eventos_bienal)


try:
    # Establece la conexión a la base de datos SQLite
    connection = sqlite3.connect(r"C:\code\FACULTAD\2024-02-TPI\server\src\db.sqlite3")
    print("Conexión exitosa a la base de datos SQLite")

    cursor = connection.cursor()

    for i in range(len(eventos_bienal)):
        id = i + 1
        nombre = eventos_bienal[i]
        fecha_inicio = "2024-11-01"
        fecha_fin = "2024-11-07"
        descripcion = fake.paragraph(
            nb_sentences=3
        )  # Genera un párrafo ficticio de 3 oraciones
        lugar_id = random.randint(1, cant_lugares)
        tematica_id = random.randint(1, cant_tematicas)
        # Inserción de datos
        try:
            cursor.execute(
                """INSERT INTO app_evento (id, nombre, fecha_inicio, fecha_fin, descripcion, lugar_id, tematica_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    id,
                    nombre,
                    fecha_inicio,
                    fecha_fin,
                    descripcion,
                    lugar_id,
                    tematica_id,
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
