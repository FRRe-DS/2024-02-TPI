package accesodb

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/lmittmann/tint"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	_ "modernc.org/sqlite"
)

func Run() {
	// Un archivo '.env' es una buena practica para almacenar y acceder a todas nuestras claves que queremos que sean secretas. En este repositorio voy subir el archivo porque es para nosotros y para que lo vean.
	// Pero generalmente no se sube al repositorio, porque se perdería el propósito.
	if err := godotenv.Load(".env"); err != nil {
		slog.Error("Fallo al intentar leer '.env', archivo no encontrado")
		os.Exit(1)
	}

	// Busquen qué es y para qué sirve el logging estructurado, en definitiva es una buena forma de ir dando información acerca del estado de nuestra aplicación durante su ejecución.
	// También bastante interesante es añadir tracing a nuestra aplicación, que es complementario al logging y da información con respecto al flujo de los datos. (Imaginate dar detalles sobre el viajeque realiza un request a lo largo de su vida)
	// No traje ningun package de tracing como OpenTelemetry porque no quiero hacer un ejemplo complicado.

	// logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	// logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	// slog.SetDefault(logger)

	// Tint es un package para que los logs tengan color, lo puse para probarlo.
	// Las siguiente linea es solamente para usar configurar Tint.
	logger := slog.New(tint.NewHandler(os.Stdout, &tint.Options{
		Level:      slog.LevelInfo,
		TimeFormat: time.DateTime,
	}))
	slog.SetDefault(logger)

	// Tengan en cuenta que cada driver permite configurar muchas mas cosas para cada DB, los ejemplos acá son los más básicos.

	ejemploPostgres()
	ejemploSQLite()
	ejemploMySQL()
	ejemploMongo()
}

func ejemploSQLite() {
	// https://github.com/mattn/go-sqlite3
	db_name := os.Getenv("SQLITE_URI")
	if err := os.Remove(db_name); err != nil {
		os.Create(db_name)
	}

	slog.Info("Intentando conectar a SQLite...")

	db, err := sql.Open("sqlite", db_name)
	if err != nil {
		slog.Error("Error al obtener un handler a la base de datos!", slog.String("db", "SQLite"), slog.Any("error", err))
		os.Exit(1)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		slog.Error("Error al obtener una conexión a la base de datos!", slog.String("db", "SQLite"), slog.Any("error", err))
		os.Exit(1)
	}

	slog.Info("Conexion exitosa a SQLite!")

	ahora := time.Now()
	if _, err := db.Exec("create table if not exists widgets (id int, name text, weight int);"); err != nil {
		slog.Error("Error en la base de datos!", slog.String("db", "SQLite"), slog.Any("err", err))
		os.Exit(1)
	}
	// De momento podríamos decir que esto es nuestras "migraciones" aunque mas tarde vamos a hacerlo bien y tenerlas en otra carpeta.
	slog.Info("Migraciones realizadas exitosamente!", slog.String("db", "SQLite"), slog.Duration("completado en", time.Since(ahora)))

	if _, err := db.Exec("insert into widgets values (43, 'Lautaro', 100);"); err != nil {
		slog.Error("Error al insertar en la tabla, %v\n", slog.String("db", "SQLite"), slog.Any("err", err))
		os.Exit(1)
	}

	var name string
	var weight int64

	// QueryRow solamente devuelve la primer fila que encuentra.
	err = db.QueryRow("select name, weight from widgets where id=$1", 43).Scan(&name, &weight)
	if err != nil {
		slog.Error("Error en la base de datos!", slog.String("db", "SQLite"), slog.Any("err", err))

		os.Exit(1)
	}

	fmt.Println(name, weight)

	// Query devuelve todas las filas que encuentra.
	rows, err := db.Query("select * from widgets")
	if err != nil {
		slog.Error("Error en la base de datos!", slog.String("db", "SQLite"), slog.Any("err", err))
		os.Exit(1)
	}
	defer rows.Close()

	// Aca les muestro una manera en donde leemos los resultados y los asignamos a variables.
	for rows.Next() {
		var id int
		var nombre string
		var peso int

		if err := rows.Scan(&id, &nombre, &peso); err != nil {
			slog.Error("Error al leer las filas!", "error", err.Error())
		}
		fmt.Println("ID:", id, "Nombre:", nombre, "Peso:", peso)
	}

	if err := rows.Err(); err != nil {
		slog.Error("Error durante el procesamiento de las filas!", slog.String("db", "SQLite"), slog.Any("err", err))
		os.Exit(1)
	}

	// Esta es otra manera en donde podemos mapear los resultados a una struct, en caso de que tengamos una lógica (generalmente de negocio) asociada a esa información.

	rows, err = db.Query("select * from widgets")
	if err != nil {
		slog.Error("Error en la base de datos.", slog.String("db", "SQLite"), slog.Any("err", err))
		os.Exit(1)
	}
	defer rows.Close()

	var widgets []Widget
	for rows.Next() {
		var widget Widget
		if err := rows.Scan(&widget.id, &widget.nombre, &widget.peso); err != nil {
			slog.Error("Error al leer las filas.", slog.String("db", "SQLite"), slog.Any("err", err))
		}
		widgets = append(widgets, widget)
	}

	if err := rows.Err(); err != nil {
		slog.Error("Error durante el procesamiento de las filas.", slog.String("db", "SQLite"), slog.Any("err", err))
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

func ejemploMySQL() {
	// https://github.com/go-sql-driver/mysql/wiki/Examples
	slog.Info("Intentando conectar a MySQL...")

	database_url := os.Getenv("MYSQL_DATABASE_URL")
	fmt.Println(database_url)
	db, err := sql.Open("mysql", database_url)
	if err != nil {
		slog.Error("Error al obtener un handler a la base de datos!", slog.String("db", "MySQL"), slog.Any("error", err))
		os.Exit(1)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		slog.Error("Error al obtener una conexión a la base de datos!", slog.String("db", "MySQL"), slog.Any("error", err))
		os.Exit(1)
	}
	slog.Info("Conexion exitosa a MySQL!")

	ahora := time.Now()
	if _, err := db.Exec("create table if not exists widgets (id int, name text, weight int);"); err != nil {
		slog.Error("Error en la base de datos!", slog.String("db", "MySQL"), slog.Any("err", err))
		os.Exit(1)
	}
	// De momento podríamos decir que esto es nuestras "migraciones" aunque mas tarde vamos a hacerlo bien y tenerlas en otra carpeta.
	slog.Info("Migraciones realizadas exitosamente!", slog.String("db", "MySQL"), slog.Duration("completado en", time.Since(ahora)))

	if _, err := db.Exec("insert into widgets values (43, 'Lautaro', 100);"); err != nil {
		slog.Error("Error al insertar en la tabla, %v\n", slog.String("db", "MySQL"), slog.Any("err", err))
		os.Exit(1)
	}

	var name string
	var weight int64

	// QueryRow solamente devuelve la primer fila que encuentra.
	err = db.QueryRow("select name, weight from widgets where id=?", 43).Scan(&name, &weight)
	if err != nil {
		slog.Error("Error en la base de datos!", slog.String("db", "MySQL"), slog.Any("err", err))

		os.Exit(1)
	}

	fmt.Println(name, weight)

	// Query devuelve todas las filas que encuentra.
	rows, err := db.Query("select * from widgets")
	if err != nil {
		slog.Error("Error en la base de datos!", slog.String("db", "MySQL"), slog.Any("err", err))
		os.Exit(1)
	}
	defer rows.Close()

	// Aca les muestro una manera en donde leemos los resultados y los asignamos a variables.
	for rows.Next() {
		var id int
		var nombre string
		var peso int

		if err := rows.Scan(&id, &nombre, &peso); err != nil {
			slog.Error("Error al leer las filas!", "error", err.Error())
		}
		fmt.Println("ID:", id, "Nombre:", nombre, "Peso:", peso)
	}

	if err := rows.Err(); err != nil {
		slog.Error("Error durante el procesamiento de las filas!", slog.String("db", "MySQL"), slog.Any("err", err))
		os.Exit(1)
	}

	// Esta es otra manera en donde podemos mapear los resultados a una struct, en caso de que tengamos una lógica (generalmente de negocio) asociada a esa información.

	rows, err = db.Query("select * from widgets")
	if err != nil {
		slog.Error("Error en la base de datos.", slog.String("db", "MySQL"), slog.Any("err", err))
		os.Exit(1)
	}
	defer rows.Close()

	var widgets []Widget
	for rows.Next() {
		var widget Widget
		if err := rows.Scan(&widget.id, &widget.nombre, &widget.peso); err != nil {
			slog.Error("Error al leer las filas.", slog.String("db", "MySQL"), slog.Any("err", err))
		}
		widgets = append(widgets, widget)
	}

	if err := rows.Err(); err != nil {
		slog.Error("Error durante el procesamiento de las filas.", slog.String("db", "MySQL"), slog.Any("err", err))
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

func ejemploMongo() {
	// Ejemplo sacado de https://www.mongodb.com/docs/drivers/go/current/quick-start/#std-label-golang-quickstart
	slog.Info("Intentando conectar a MongoDB...")

	mongo_uri := os.Getenv("MONGODB_URI")
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(mongo_uri))
	if err != nil {
		slog.Error("Error al conectarse a la base de datos!", slog.String("db", "MongoDB"), slog.Any("error", err))
		os.Exit(1)
	}

	// func() {}() es una clausura, basicamente es una función que toma variables de su entorno.
	// En go las funciones son, como suele decirse, "first class citizens" entonces pueden ser tratadas como variables, etc.
	// en vez de hacer el defer func() ... , podría haber hecho x := func() ... y luego defer x()
	defer func() {
		if err := client.Disconnect(context.TODO()); err != nil {
			slog.Error("Error al cerrar la conexión en MongoDB!", slog.String("db", "MongoDB"), slog.Any("error", err))
			os.Exit(1)
		}
	}()

	slog.Info("Conexion exitosa a MongoDB!")

	coll := client.Database("test1").Collection("peliculas")
	titulo := "Volver al Futuro"

	// Aclarar los campos es opcional.
	doc := bson.D{{Key: "titulo", Value: titulo}, {"puntuación", 3}}

	res, err := coll.InsertOne(context.TODO(), doc)
	if err != nil {
		slog.Error("Error al insertar registro en la base de datos!", slog.String("db", "MongoDB"), slog.Any("err", err))
		os.Exit(1)
	}
	slog.Info("Se ha insertado un solo documento.", slog.String("db", "MongoDB"), slog.Any("id", res.InsertedID))

	var resultado bson.M
	err = coll.FindOne(context.TODO(), bson.D{{Key: "titulo", Value: titulo}}).Decode(&resultado)

	if err == mongo.ErrNoDocuments {
		slog.Error("No se ha encontrado ningún documento con ese título.", slog.String("db", "MongoDB"), slog.String("titulo", titulo))
		os.Exit(1)
	}
	if err != nil {
		slog.Error("Error en la base de datos!", slog.String("db", "mongodb"), slog.Any("error", err))
		os.Exit(1)
	}

	jsonData, err := json.MarshalIndent(resultado, "", "    ")
	if err != nil {
		slog.Error("Error serializar el resultado a JSON", "error", err)
		os.Exit(1)
	}

	slog.Info("Documento encontrado!", slog.String("db", "MongoDB"), slog.String("data", string(jsonData)))

}

func ejemploPostgres() {
	// https://github.com/jackc/pgx

	// En vez de leer la URL de la base de datos desde el archivo .env (que guarda todas nuestras claves privadas), podriamos escribir directamente la URL dentro del código.
	// Esto obviamente se vuelve tedioso rápidamente porque vamos a tener muchos puntos de acceso a nuestra db a lo largo del programa y ni hablar de que la URL es un secreto y no debería estar expuesta de esta manera.
	//
	// database_url := "postgres://postgres:desarrollo@127.0.0.1:5432/test1"
	//
	slog.Info("Intentando conexión Postgres...")
	database_url := os.Getenv("PG_DATABASE_URL")

	poolConfig, err := pgxpool.ParseConfig(database_url)
	if err != nil {
		slog.Error("Error al parsear la URL de la base de datos.", slog.String("db", "Postgres"), slog.Any("err", err))
		os.Exit(1)
	}

	conn, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
	if err != nil {
		slog.Error("Error al conectarse a la base de datos.", slog.String("db", "Postgres"), slog.Any("err", err))
		os.Exit(1)
	}
	defer conn.Close()

	if err := conn.Ping(context.Background()); err != nil {
		slog.Error("Error al obtener una conexión a la base de datos!", slog.String("db", "MySQL"), slog.Any("error", err))
		os.Exit(1)
	}

	slog.Info("Conexion exitosa a Postgres!")

	ahora := time.Now()
	if _, err := conn.Exec(context.Background(), "create table if not exists widgets (id int, name text, weight int);"); err != nil {
		slog.Error("Error en la base de datos!", slog.String("db", "Postgres"), slog.Any("err", err))
		os.Exit(1)
	}

	// De momento podríamos decir que esto es nuestras "migraciones" aunque mas tarde vamos a hacerlo bien y tenerlas en otra carpeta.
	slog.Info("Migraciones realizadas exitosamente!", slog.String("db", "Postgres"), slog.Duration("completado en", time.Since(ahora)))

	// Aca les dejo varios casos de uso básicos para manipular una bd.

	if _, err := conn.Exec(context.Background(), "insert into widgets values (43, 'Lautaro', 100);"); err != nil {
		slog.Error("Error al insertar en la tabla, %v\n", slog.String("db", "Postgres"), slog.Any("err", err))
		os.Exit(1)
	}

	var name string
	var weight int64

	// QueryRow solamente devuelve la primer fila que encuentra.
	err = conn.QueryRow(context.Background(), "select name, weight from widgets where id=$1", 43).Scan(&name, &weight)
	if err != nil {
		slog.Error("Error en la base de datos!", slog.String("db", "Postgres"), slog.Any("err", err))

		os.Exit(1)
	}

	fmt.Println(name, weight)

	// Query devuelve todas las filas que encuentra.
	rows, err := conn.Query(context.Background(), "select * from widgets")
	if err != nil {
		slog.Error("Error en la base de datos!", slog.String("db", "Postgres"), slog.Any("err", err))
		os.Exit(1)
	}
	defer rows.Close()

	// Aca les muestro una manera en donde leemos los resultados y los asignamos a variables.
	for rows.Next() {
		var id int
		var nombre string
		var peso int

		if err := rows.Scan(&id, &nombre, &peso); err != nil {
			slog.Error("Error al leer las filas!", "error", err.Error())
		}
		fmt.Println("ID:", id, "Nombre:", nombre, "Peso:", peso)
	}

	if err := rows.Err(); err != nil {
		slog.Error("Error durante el procesamiento de las filas!", slog.String("db", "Postgres"), slog.Any("err", err))
		os.Exit(1)
	}

	// Esta es otra manera en donde podemos mapear los resultados a una struct, en caso de que tengamos una lógica (generalmente de negocio) asociada a esa información.

	rows, err = conn.Query(context.Background(), "select * from widgets")
	if err != nil {
		slog.Error("Error en la base de datos.", slog.String("db", "Postgres"), slog.Any("err", err))
		os.Exit(1)
	}
	defer rows.Close()

	var widgets []Widget
	for rows.Next() {
		var widget Widget
		if err := rows.Scan(&widget.id, &widget.nombre, &widget.peso); err != nil {
			slog.Error("Error al leer las filas.", slog.String("db", "Postgres"), slog.Any("err", err))
		}
		widgets = append(widgets, widget)
	}

	if err := rows.Err(); err != nil {
		slog.Error("Error durante el procesamiento de las filas.", slog.String("db", "Postgres"), slog.Any("err", err))
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
