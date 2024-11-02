## Server
> [!IMPORTANT]
> Para ejecutar la aplicación utilizamos `docker compose`, asi que es necesario que lo tengas instalado.

![Visualización del compose.yaml](../assets/compose.svg)

``` sh
# https://github.com/casey/just
# En ./src/Justfile o en cualquier subdirectorio:

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

Este proyecto utiliza SQLite como base de datos. Si la base de datos está vacía, ya sea porque se ha clonado el repositorio y no contiene datos, el sistema insertará automáticamente utilizando los archivos SQL que se encuentran en el directorio `server/src/scripts/insert_sql/` utilizando el archivo `inicizalicacion.py` que se encuentra en  el mismo directorio. Estos archivos incluyen instrucciones `INSERT` que agregarán datos iniciales a las tablas necesarias.

### Pasos para inserción automática

**Ejecutar el proyecto mediante just serve** para que el sistema detecte si la base de datos esta vacía

*Esto facilita la configuración inicial del proyecto, permitiendo pruebas y desarrollo sin necesidad de insertar datos manualmente.

