package main

import (
	"context"
	"database/sql"
	"os"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func TestPostgresConnection(t *testing.T) {
	if err := godotenv.Load(".env"); err != nil {
		t.Fatalf("Fallo al intentar leer '.env', archivo no encontrado")
	}

	database_url := os.Getenv("PG_DATABASE_URL")
	if database_url == "" {
		t.Fatal("La variable de ambiente PG_DATABASE_URL no se encuentra definida")
	}

	poolConfig, err := pgxpool.ParseConfig(database_url)
	if err != nil {
		t.Fatalf("Error al parsear la URL de la base de datos. %v", err)
	}

	conn, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
	if err != nil {
		t.Fatalf("Error al conectarse a la base de datos. %v", err)
	}
	defer conn.Close()

	if err := conn.Ping(context.Background()); err != nil {
		t.Fatalf("Error al obtener una conexión a la base de datos. %v", err)
	}

}

func TestMySQLConnection(t *testing.T) {
	if err := godotenv.Load(".env"); err != nil {
		t.Fatalf("Fallo al intentar leer '.env', archivo no encontrado")
	}

	database_url := os.Getenv("MYSQL_DATABASE_URL")
	if database_url == "" {
		t.Fatal("La variable de ambiente MYSQL_DATABASE_URL no se encuentra definida")
	}

	db, err := sql.Open("mysql", "mysql:desarrollo@/test1")
	if err != nil {
		t.Fatalf("Error al obtener un handler a la base de datos. %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		t.Fatalf("Error al obtener una conexión a la base de datos. %v", err)
		os.Exit(1)
	}
}

func TestSQLiteConnection(t *testing.T) {
	if err := godotenv.Load(".env"); err != nil {
		t.Fatalf("Fallo al intentar leer '.env', archivo no encontrado")
	}

	db_name := os.Getenv("SQLITE_URI")
	if db_name == "" {
		t.Fatal("La variable de ambiente SQLITE_URI no se encuentra definida")
	}

	if err := os.Remove(db_name); err != nil && !os.IsNotExist(err) {
		t.Fatalf("No se ha podido remover la base de datos %v", err)
	}

	if _, err := os.Create(db_name); err != nil {
		t.Fatalf("No se ha podido crear la base de datos %v", err)
	}

	db, err := sql.Open("sqlite", db_name)
	if err != nil {
		t.Fatalf("Error al obtener un handler a la base de datos. %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		t.Fatalf("Error al obtener una conexión a la base de datos. %v", err)
		os.Exit(1)
	}
}

func TestMongoConnection(t *testing.T) {
	if err := godotenv.Load(".env"); err != nil {
		t.Fatalf("Fallo al intentar leer '.env', archivo no encontrado")
	}

	mongo_uri := os.Getenv("MONGODB_URI")
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(mongo_uri))
	if err != nil {
		t.Fatalf("Error al conectarse a la base de datos. %v", err)
	}

	defer func() {
		if err := client.Disconnect(context.TODO()); err != nil {
			t.Fatalf("Error al cerrar la conexión en MongoDB. %v", err)
		}
	}()

}
