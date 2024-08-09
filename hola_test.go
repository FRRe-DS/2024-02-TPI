package main

import "testing"

func TestFuncion(t *testing.T) {

	a := 2
	if a != 2 {
		t.Errorf("Fallo perri no son iguales %d != %d", a, 2)
	}
}
