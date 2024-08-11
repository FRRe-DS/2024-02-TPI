package main

import (
	accesodb "tp_nivelador/acceso_db"
	"tp_nivelador/modelado"
)

// Como ven, cree un package por cada "punto" del tp nivelador que hicimos hasta ahora y en cada uno solamente expuse una funcion "Run", que no toma ningún parámetro de entrada, para ejecutar el codigo de ese punto.

func main() {
	modelado.Run()
	accesodb.Run()
}
