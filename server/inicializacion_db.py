import sqlite3
import os

# Obtiene la ruta actual del script para construir rutas relativas
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Define las rutas relativas para la base de datos y el archivo de inserciones
DB_PATH = os.path.join(
    BASE_DIR, "src", "app", "db.sqlite3"
)  # Carpeta "db" para la base de datos
INSERT_SQL_FILE = os.path.join(
    BASE_DIR, "src", "scripts", "insert_data.sql"
)  # Carpeta "scripts" para el archivo SQL


def is_database_empty(db_path):
    """
    Verifica si la base de datos está vacía comprobando la existencia de filas en todas las tablas.
    """
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()

        # Obtener la lista de tablas en la base de datos
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]

        # Revisar si alguna tabla tiene datos
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table};")
            if cursor.fetchone()[0] > 0:
                return False  # La base de datos tiene datos

    return True  # La base de datos está vacía


def populate_database(db_path, sql_file):
    """
    Ejecuta el archivo SQL para insertar datos en la base de datos.
    """
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()

        # Leer el archivo SQL y ejecutar las sentencias
        with open(sql_file, "r") as file:
            sql_script = file.read()

        # Ejecutar el script de inserción
        cursor.executescript(sql_script)
        conn.commit()
        print("Datos insertados en la base de datos.")


if __name__ == "__main__":
    # Verificar si la base de datos está vacía
    if is_database_empty(DB_PATH):
        print("La base de datos está vacía. Insertando datos...")
        populate_database(DB_PATH, INSERT_SQL_FILE)
    else:
        print("La base de datos ya contiene datos.")
