package modelado

import "fmt"

// 1 - Agenda Personal
// Una agenda personal permita registrar reuniones en las que el usuario va a participar. En tal agenda debe registrarse donde ocurrirá la reunión, quienes van a participar de ella, el tema que van a tratar y la duración de la misma.

type usuario struct {
	nombre string
	edad   int
}

type reuniones struct {
	ubicacion     string
	fecha         string
	participantes []usuario
	tema          string
	duracion      int64
}

type agendaPersonal struct {
	dueno     usuario
	reuniones []reuniones
}

// 3 - Sistema de Control de Gastos Públicos
// Un país tiene que controlar el gasto público de las ciudades con más de 100.000 habitantes. Para ello, tiene información del monto recaudado por cada ciudad a través de cinco diferentes tipos de impuestos (denominados, aquí, de imp1, imp2, imp3, imp4 e imp5) e información acerca de gastos realizados en mantenimiento de la ciudad. Este país necesita un sistema que le informe cuales son las ciudades que gastan mas de lo que recaudan, y las provincias que tienen mas de la mitad de las ciudades en condición de déficit.

// No está claro como cada tipo de Impuesto es distinto entre sí, entonces no queda claro si es necesario definir distintos structs con atributos distintos. Despues si quisieramos implementar comportamiento distinto para cada uno, tendriamos que tal vez implementar una interfaz para el compartimiento que un impuesto debería tener. Los tipos de impuesto podrían definirse

type impuesto struct {
	monto_acumulado float64
	concepto        string
}

type ciudad struct {
	nombre    string
	poblacion int64
	imp1      impuesto
	imp2      impuesto
	imp3      impuesto
	imp4      impuesto
	imp5      impuesto
	gasto     int64
}

type provincia struct {
	nombre   string
	ciudades []ciudad
}

// 4 - Reservas de Pasajes Aéreos
// Típicamente nuestros clientes son personas que desean viajar cómodamente y rápido por eso utilizan aviones como medio de transporte. En general, ellos no planifican con demasiada anticipación sus viajes y toman la decisión de tomar un vuelo debido a que amigos distantes les reclaman su visita, o lo deciden porque ya ha pasado un tiempo determinado desde la última vez que se tomaron un merecido descanso. Cuando una persona solicita una reserva no sabe en que vuelo puede hacerlo. La persona especifica la ciudad de destino a la que quiere viajar, la fecha más temprana a partir de la cual quiere hacerlo y la fecha más tardía. Se lo consulta, por la clase (primera, turista, etc.) en la que quiere viajar, y luego por la subsección en la que se sentiría mas cómodo (fumador o no fumador). En base a esto se determinan los vuelos en los que haya lugar disponible en base a sus intereses. Se le pide confirmación por alguno de ellos. Si confirma alguno, se le solicitan sus datos, se asienta la reserva y se emite el pasaje correspondiente. Si a la persona no le satisficiera ninguno de los vuelos ofrecidos, o en caso de no poder determinar ningún vuelo acorde con sus intereses, se lo invita a pasar en otro momento por si surge alguna novedad.

type ciudad4 struct{ nombre string }

// type Turista struct {
// 	clasificacion string
// }

type primera struct {
}

func (p *primera) CalculoPrecio() float64 { return 10.0 }

type turista struct{}

type clase interface {
	CalculoPrecio() float64
}

type reserva struct {
	destino         ciudad
	fecha_temprana  string
	fecha_tardia    string
	clase           clase
	seccion_fumador bool
}

type cliente struct {
	nombre string
	edad   int64
}
type vuelo struct {
	asientos     []asiento
	fecha_salida string
}

type asiento struct {
	id              int64
	disponible      bool
	clase           clase
	seccion_fumador bool
}

// 5 - Sistema de encuestas
// Una empresa consultora desea desarrollar un sistema el cual le permita informatizar su mecanismo de encuestas. La compañía se encarga de realizar encuestas para empresas de terceros o para el gobierno. Una encuesta se compone de un conjunto de preguntas, una persona encuestada y el empleado que realizo la encuesta. La compañía guarda todas las encuestas realizadas. Los empleados cobran un plus por cantidad de encuestas realizadas, con lo cual la empresa desea conocer el numero de encuestas que realizo cada empleado. Para evitar falsificación de datos en la encuesta figura el numero de documento de la persona, una misma persona no puede llenar dos veces la misma encuesta, pero si una encuesta diferente.

type encuesta struct {
	preguntas []string
	persona   persona
	empleado  empleado
}

type compania struct {
	encuestas []encuesta
}

type persona struct {
	dni         int64
	contestadas []encuesta
}

type empleado struct {
	encuentas []encuesta
}

func holaClase(c clase) {
	fmt.Printf("a")
}

func Run() {
	prim := primera{}
	fmt.Printf("%v\n", prim)
	fmt.Printf("%v\n", prim.CalculoPrecio())
}
