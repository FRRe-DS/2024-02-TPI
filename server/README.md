## Server
``` sh
# https://github.com/casey/just
# En ./src/Justfile o en cualquier subdirectorio:

just initdb
just test
just serve dev  # Inicializa el servidor http con Django, configurado para desarrollo.
just serve prod # Inicializa un servidor http con Gunicorn, configurado para producción.

# Ahora en otra terminal pueden ejecutar curl para ver si la aplicación está funcionando.
curl -v http://127.0.0.1:8000/health_check/
```

# API DOCS

Se debe consultar desde `/api/` y en cada uno de los recursos listados a continuación:

## API Endpoints

- **Votantes:** `/api/votantes/`
- **Escultores:** `/api/escultores/`
- **Esculturas:** `/api/esculturas/`
- **Eventos:** `/api/eventos/`
- **Imágenes:** `/api/imagenes/`
- **Países:** `/api/paises/`
- **Administradores del sistema (AdminSis):** `/api/adminsis/`
- **Temáticas:** `/api/tematica/`
- **Lugares:** `/api/lugar/`

## Autenticación por Token

Para autenticarse y obtener un token, envía una solicitud `POST` al endpoint `/api/adminsis/get_token/` con el `username` y `password` en el cuerpo de la solicitud y luego este devolverá el token.

### Usuario Administrador por Defecto

La base de datos por defecto incluye un usuario administrador que puedes utilizar para propósitos de prueba:

- **Usuario:** `admin`
- **Contraseña:** `admin`

## Base de Datos

Este proyecto utiliza PostgreSQL como base de datos. Previo a ejecutar la aplicación, corremos un script en python para cargar datos de prueba en ella. Si la base de datos está vacía se insertaran datos automáticamente utilizando el archivo SQL que se encuentran en el directorio `server/src/scripts/`.

Para ver ejemplos de la ejecución, leer el `server/Justfile`.

