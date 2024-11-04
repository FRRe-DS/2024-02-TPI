import sqlite3
from sqlite3 import Error
from faker import Faker
import random
from urls_imagenes import urls_esculturas, cant_escultores

fake = Faker("es_ES")

nombres_esculturas = [
    "Ecos del Tiempo",
    "Raíces de Hierro",
    "El Vuelo del Espíritu",
    "Sombras en Piedra",
    "Horizontes de Bronce",
    "Misterio del Mar",
    "Fragmentos del Alma",
    "Piedra y Luz",
    "Danza de Sombras",
    "Reflejos Eternos",
    "Luz en el Caos",
    "Alas de Libertad",
    "Espejismo del Desierto",
    "Luz y Sombra",
    "Espirales del Viento",
    "Guardianes de la Noche",
    "Corazón de la Tierra",
    "Fragmentos de Silencio",
    "Olas de Acero",
    "Senderos de Fuego",
    "Resonancia Profunda",
    "Caminos de Sal",
    "Reflejo en la Tormenta",
    "Lágrimas de Cristal",
    "Gravedad y Vuelo",
    "Sombras del Horizonte",
    "Alma de Fuego",
    "Bruma Matinal",
    "Cantos del Bosque",
    "Silencio de Roca",
    "Viento en la Montaña",
    "Fragilidad del Hielo",
    "Escala al Cielo",
    "Bosque Encantado",
    "Abismo de Luz",
    "Raíces en el Cielo",
    "Estelares del Tiempo",
    "Alquimia de Piedra",
    "Puentes de Sueño",
    "Fuente de Vida",
    "Ecos de Hierro",
    "Fragmentos de Pasado",
    "Peregrino de la Luz",
    "Voces de Agua",
    "Río de Bronce",
    "Silencio de Arena",
    "Hijos del Amanecer",
    "Sombras del Alba",
    "Ríos de Acero",
    "Tiempo Perdido",
    "Fronteras de Luz",
]


try:
    # Establece la conexión a la base de datos SQLite
    connection = sqlite3.connect(r"C:\code\FACULTAD\2024-02-TPI\server\src\db.sqlite3")
    print("Conexión exitosa a la base de datos SQLite")

    cursor = connection.cursor()

    for i in range(len(urls_esculturas)):
        id = i + 1
        nombre = nombres_esculturas[i]
        descripcion = fake.paragraph(
            nb_sentences=3
        )  # Genera un párrafo ficticio de 3 oraciones
        fecha_creacion = "2024-11-01"
        escultor_id = random.randint(1, cant_escultores)

        # Inserción de datos
        try:
            cursor.execute(
                """INSERT INTO app_escultura (id, nombre, descripcion, escultor_id, fecha_creacion) 
                VALUES (?, ?, ?, ?, ?)""",
                (id, nombre, descripcion, escultor_id, fecha_creacion),
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
