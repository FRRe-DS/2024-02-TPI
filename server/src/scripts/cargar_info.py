import logging
import dj_database_url
import psycopg
import os
from rich.logging import RichHandler
from rich.traceback import install
from decouple import config

install(show_locals=True)

logging.basicConfig(
    level=logging.DEBUG,
    format="%(message)s",
    datefmt="[%X]",
    handlers=[
        RichHandler(
            rich_tracebacks=True, tracebacks_show_locals=True, log_time_format="[%X]"
        )
    ],
)

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INSERT_SQL_FILE = os.path.join(BASE_DIR, "insert_data_real.sql")

if config("DJANGO_ENV") == "dev":
    DB_HOST = "localhost"
    DB_PORT = 5432
    DB_NAME = "tpi"
    DB_USER = "postgres"
    DB_PASSWORD = "password"
else:
    DATABASE_URL: dj_database_url.DBConfig = config(
        "DATABASE_URL", cast=dj_database_url.parse
    )
    DB_HOST = DATABASE_URL.get("HOST")
    DB_PORT = DATABASE_URL.get("PORT")
    DB_NAME = DATABASE_URL.get("NAME")
    DB_USER = DATABASE_URL.get("USER")
    DB_PASSWORD = DATABASE_URL.get("PASSWORD")

conn = psycopg.connect(
    host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD
)

cursor = conn.cursor()


def is_database_empty() -> bool:
    """
    Verifica si la base de datos está vacía comprobando la existencia de filas en todas las tablas.
    """
    try:
        cursor.execute(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'app_%';"
        )
        tables = [row[0] for row in cursor.fetchall()]

        for table in tables:
            cursor.execute(f"SELECT EXISTS(SELECT 1 FROM {table} LIMIT 1);")
            has_content = cursor.fetchone()[0]
            if has_content:
                return False

        return True
    except psycopg.Error as e:
        logger.error(f"Error al verificar el estado de la base de datos: {e}")
        raise


def populate_database(sql_file: str):
    """
    Ejecuta el archivo SQL para insertar datos en la base de datos.
    """
    try:
        with open(sql_file, "r", encoding="utf-8") as file:
            sql_script = file.read().strip()

            try:
                cursor.execute(sql_script)
                conn.commit()
                logging.info("Datos insertados exitosamente en la base de datos.")

            except psycopg.Error as e:
                conn.rollback()
                logger.error(f"Error de ejecucion SQL: {e}")
                logger.error(f"SQL problemático: \n{sql_script}")
                raise

    except (psycopg.Error, IOError) as e:
        logger.error(f"Error durante la población de la base de datos: {e}")
        raise


def main():
    try:
        if is_database_empty():
            logging.info("La base de datos está vacía. Insertando datos...")
            populate_database(INSERT_SQL_FILE)
            logging.info(
                "La base de datos está vacía. Insertando los datos reales... listo!"
            )
        else:
            logging.info("La base de datos ya contiene datos. Omitiendo operación.")
    except Exception as e:
        logger.error(f"Error inesperado: {e}")
        raise


if __name__ == "__main__":
    main()
    cursor.close()
    conn.close()
