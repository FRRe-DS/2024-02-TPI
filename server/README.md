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
