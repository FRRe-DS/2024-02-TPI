package accesodb

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func Run() {
	// Busquen qué es y para qué sirve el logging estructurado, en definitiva es una buena forma de ir dando información acerca del estado de nuestra aplicación durante su ejecución.
	// También bastante interesante es añadir tracing a nuestra aplicación, que es complementario al logging y da información con respecto al flujo de los datos. (Imaginate dar detalles sobre el viajeque realiza un request a lo largo de su vida)
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	//Todavia queda hacer lo mismo para MySQL, Mongo y SQLite.
	ejemploPostgres(logger)

}

func ejemploPostgres(logger *slog.Logger) {
	// Un archivo '.env' es una buena practica para almacenar y acceder a todas nuestras claves que queremos que sean secretas. En este repositorio voy subir el archivo porque es para nosotros y para que lo vean.
	// Pero generalmente no se sube al repositorio, porque se perdería el propósito.
	if err := godotenv.Load(".env"); err != nil {
		slog.Error("Fallo al intentar leer '.env', archivo no encontrado")
	}

	// En vez de leer la URL de la base de datos desde el archivo .env (que guarda todas nuestras claves privadas), podriamos escribir directamente la URL dentro del código.
	// Esto obviamente se vuelve tedioso rápidamente porque vamos a tener muchos puntos de acceso a nuestra db a lo largo del programa y ni hablar de que la URL es un secreto y no debería estar expuesta de esta manera.
	//
	// database_url := "postgres://postgres:desarrollo@127.0.0.1:5432/test1"
	//

	database_url := os.Getenv("DATABASE_URL")

	logger.Info("Intentando conexión a la base de datos...")

	conn, err := pgxpool.New(context.Background(), database_url)
	if err != nil {
		logger.Error("Error al conectarse a la base de datos!", "error", err)
		os.Exit(1)
	}
	defer conn.Close()

	logger.Info("Conexion exitosa a la base de datos!")

	ahora := time.Now()
	if _, err := conn.Exec(context.Background(), "create table if not exists widgets (id int, name text, weight int);"); err != nil {
		logger.Error("Error en la base de datos!", "error", err.Error())
		os.Exit(1)
	}
	// De momento podríamos decir que esto es nuestras "migraciones" aunque mas tarde vamos a hacerlo bien y tenerlas en otra carpeta.
	logger.Info("Migraciones realizas exitosamente!", "completado en", time.Since(ahora))

	// Aca les dejo varios casos de uso básicos para manipular una bd.
	if _, err := conn.Exec(context.Background(), "insert into widgets values (43, 'Lautaro', 100);"); err != nil {
		logger.Error("Error al insertar en la tabla, %v\n", slog.String("error", err.Error()))
		os.Exit(1)
	}

	var name string
	var weight int64

	// QueryRow solamente devuelve la primer fila que encuentra.
	err = conn.QueryRow(context.Background(), "select name, weight from widgets where id=$1", 43).Scan(&name, &weight)
	if err != nil {
		logger.Error("Error en la base de datos!", "error", err.Error())
		os.Exit(1)
	}

	fmt.Println(name, weight)

	// Query devuelve todas las filas que encuentra.
	rows, err := conn.Query(context.Background(), "select * from widgets")
	if err != nil {
		logger.Error("Error en la base de datos!", "error", err.Error())
		os.Exit(1)
	}
	defer rows.Close()

	// Aca les muestro una manera en donde leemos los resultados y los asignamos a variables.
	for rows.Next() {
		var id int
		var nombre string
		var peso int

		if err := rows.Scan(&id, &nombre, &peso); err != nil {
			logger.Error("Error al leer las filas!", "error", err.Error())
		}
		fmt.Println("ID:", id, "Nombre:", nombre, "Peso:", peso)
	}

	if err := rows.Err(); err != nil {
		logger.Error("Error durante el procesamiento de las filas!", "error", err.Error())
		os.Exit(1)
	}

	// Esta es otra manera en donde podemos mapear los resultados a una struct, en caso de que tengamos una lógica (generalmente de negocio) asociada a esa información.

	rows, err = conn.Query(context.Background(), "select * from widgets")
	if err != nil {
		logger.Error("Error en la base de datos!", "error", err.Error())
		os.Exit(1)
	}
	defer rows.Close()

	var widgets []Widget
	for rows.Next() {
		var widget Widget
		if err := rows.Scan(&widget.id, &widget.nombre, &widget.peso); err != nil {
			logger.Error("Error al leer las filas!", "error", err.Error())
		}
		widgets = append(widgets, widget)
	}

	if err := rows.Err(); err != nil {
		logger.Error("Error durante el procesamiento de las filas!", "error", err.Error())
		os.Exit(1)
	}

	for _, v := range widgets {
		// Acá podríamos hacer algo como:
		//
		// fmt.Println("ID:", v.id, "Nombre:", v.nombre, "Peso:", v.peso)
		//
		// Lo que estaría bien, aunque también podríamos imprimirlo de esta manera:
		//
		// fmt.Println(v)
		//
		// Que resultaria en un string "{<id>  <nombre> <peso>}", ya que es el formato predeterminado para imprimir una struct (simplemente se imprimen los datos que contiene).
		// Por último podrías implementar la Interfaz Stringer, que consiste en un método "String()" para que nuestra struct ya sepa imprimirse así misma dentro de una función como fmt.Println() y poder realizar solamente:
		fmt.Println(v)
		// En general, muchas cosas en Go funcionan a traves de implementar interfaces, asi que generlamente es recomendable buscar si ya existe una interfaz que permite realizar ciertas funciones antes que implementar dicha función a mano.
	}
}

type Widget struct {
	id     int
	nombre string
	peso   int
}

func (w Widget) String() string {
	return fmt.Sprintf("Esta lo hago a través de implementar 'Stringer' -> ID: %d, Nombre: %s, Peso: %d", w.id, w.nombre, w.peso)
}
