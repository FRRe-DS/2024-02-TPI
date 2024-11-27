import logging
import psycopg
import os

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INSERT_SQL_FILE = os.path.join(BASE_DIR, "insert_data_real.sql")

DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "tpi"
DB_USER = "postgres"
DB_PASSWORD = "password"

conn = psycopg.connect(
    host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD
)

cursor = conn.cursor()


def is_database_empty():
    """
    Verifica si la base de datos está vacía comprobando la existencia de filas en todas las tablas.
    """
    try:
        cursor.execute(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
        )
        tables = [row[0] for row in cursor.fetchall()]

        for table in tables:
            if table.startswith("app_"):
                cursor.execute(f"SELECT EXISTS(SELECT 1 FROM {table} LIMIT 1);")
                has_content = cursor.fetchone()[0]
                if has_content:
                    return False
        return True
    except Exception as e:
        logging.error(f"Error contorlando si la base de datos esta vacía: {e}")
        raise


def populate_database(sql_file: str):
    """
    Ejecuta el archivo SQL para insertar datos en la base de datos.
    """
    try:
        with open(sql_file, "r", encoding="utf-8") as file:
            sql_script = file.read()

        cursor.execute(sql_script)
        conn.commit()
        logging.info("Datos insertados en la base de datos.")
    except Exception as e:
        logging.error(f"Error ejecutando SQL: {e}")
        logging.error(f"SQL script que causó el error: {sql_script[:100]}")
        raise


if __name__ == "__main__":
    try:
        if is_database_empty():
            logging.info("La base de datos está vacía. Insertando datos...")
            populate_database(INSERT_SQL_FILE)
            cursor.close()
            conn.close()

            logging.info(
                "La base de datos está vacía. Insertando los datos reales... listo!"
            )
        else:
            logging.info("La base de datos ya contiene datos!")
    except Exception as e:
        logging.error(f"Error durante la inserción de datos:{e}:")
        cursor.close()
        conn.close()
