#!/usr/bin/env bash
set -x
set -eo pipefail

# PARA EJECUTAR ESTO NECESITAN TENER INSTALADO WSL2 Y EJECUTARLO DESDE UNA TERMINAL EN LINUX (Si estan en Windows) 
# (De igual manera van a tener que instalar WSL2 para utilizar Docker).


# PARA ESTE SCRIPT ES NECESARIO QUE TENGAS DOCKER INSTALADO.
# Los comandos básicos para cerrar los contenedores que generes son:
# $ docker ps  // Lista los contenedores que se están ejecutando (PID, Nombre, etc).
# $ docker kill // Necesita el PID del contenedor o su nombre.

if ! [ -x "$(command -v psql)" ]; then
    echo >&2 "Error: psql no está instalado."
    exit 1
fi

if ! [ -x "$(command -v sqlite3)" ]; then
    echo >&2 "Error: sqlite no está instalado."
    exit 1
fi

if ! [ -x "$(command -v mongosh)" ]; then
    echo >&2 "Error: mongosh no está instalado."
    exit 1
fi

if ! [ -x "$(command -v mysql)" ]; then
    echo >&2 "Error: mysql-client no está instalado."
    exit 1
fi

# Setup para Postgres:
PG_DB_USER="${POSTGRES_USER:=postgres}"
PG_DB_PASSWORD="${POSTGRES_PASSWORD:=desarrollo}"
PG_DB_NAME="${POSTGRES_DB:=test1}"
PG_DB_PORT="${POSTGRES_PORT:=5432}"

# Setup para Mongo:
MONGO_DB_NAME="${MONGO_NAME:=mongo}"
MONGO_DB_PORT="${MONGO_PORT:=27017}"

# Setup para MySQL:
MYSQL_DB_USER="${MYSQL_USER:=mysql}"
MYSQL_DB_PASSWORD="${MYSQL_PASSWORD:=desarrollo}"
MYSQL_DB_NAME="${MYSQL_DB:=test1}"
MYSQL_DB_PORT="${MYSQL_PORT:=3306}"


if [[ -z "${SKIP_DOCKER}" ]]
then
docker run \
-e POSTGRES_USER=${PG_DB_USER} \
-e POSTGRES_PASSWORD=${PG_DB_PASSWORD} \
-e POSTGRES_DB=${PG_DB_NAME} \
-p "${PG_DB_PORT}":5432 \
-d postgres:16 \
postgres -N 1000

# --name "${MONGO_DB_NAME}" \
docker run \
-p "${MONGO_DB_PORT}":27017 \
-d mongodb/mongodb-community-server:latest \

docker run \
-e MYSQL_ROOT_PASSWORD=${MYSQL_DB_PASSWORD} \
-e MYSQL_DATABASE=${MYSQL_DB_NAME} \
-e MYSQL_USER=${MYSQL_DB_USER} \
-e MYSQL_PASSWORD=${MYSQL_DB_PASSWORD} \
-p ${MYSQL_DB_PORT}:3306 \
-d mysql:latest
fi

export PGPASSWORD="${PG_DB_PASSWORD}"
until psql -h "localhost" -U "${PG_DB_USER}" -p "${PG_DB_PORT}" -d "postgres" -c '\q'; do
>&2 echo "Postgres no se encuentra disponible - durmiendo"
sleep 1
done

until mongosh --host "localhost" --port "${MONGO_DB_PORT}" --eval "db.runCommand({connectionStatus: 1})" >/dev/null 2>&1; do
>&2 echo "Mongo no se encuentra disponible - durmiendo"
sleep 1
done

# TODO: Añadir el equivalente para MySQL, ver por qué se queda en un loop infinito.

>&2 echo "SETUP LISTO:"
>&2 echo "Postgres está sirviendo en el puerto ${PG_DB_PORT}"
>&2 echo "Mongo está sirviendo en el puerto ${MONGO_DB_PORT}"
>&2 echo "MySQL está sirviendo en el puerto ${MYSQL_DB_PORT}"

