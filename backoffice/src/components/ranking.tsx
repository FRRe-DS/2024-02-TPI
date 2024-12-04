import { useEffect, useState } from "react";
import "../pages/pages.css";

type RankingItem = {
  id: number;
  nombre: string;
  apellido: string;
  total_puntaje: number;
};

export default function RankingTable()
   {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authToken = localStorage.getItem("token");
  if (!authToken) {
    window.location.href = "/Login";
  }

  const url = "http://localhost:8000/api";

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch(`${url}/estado_votacion/`, {
          headers: {
            Authorization: `Token ${authToken}`, 
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setRanking(data.result); 
      } catch (err: any) {
        setError(err.message || "Error fetching ranking data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRanking();
  }, []);

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="table-container">
      <table className="event-table">
        <thead>
          <tr>
            <th>Posición</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Puntaje Total</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.nombre}</td>
              <td>{item.apellido}</td>
              <td>{item.total_puntaje}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
   
  );
};


