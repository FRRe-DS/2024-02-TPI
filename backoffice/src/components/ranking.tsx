import { useEffect, useState } from "react";
import "../pages/pages.css";
import { url } from "../utils";
type RankingItem = {
  id: number
  nombre: string;
  nacionalidad: string;
  correo: string;
  foto: string;
  bibliografia: string;
  total_puntaje: number;
};
type RankingTableProps = {
  evento_id: number;
};


export default function RankingTable({ evento_id }: RankingTableProps)
   {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authToken = localStorage.getItem("token");
  if (!authToken) {
    window.location.href = "/Login";
  }

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch(`${url}/estado_votacion/?evento_id=${evento_id}`, {
          headers: {
            Authorization: `Token ${authToken}`, 
          },
        });

        if (!response.ok) {
          console.log(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data.ranking); 
        setRanking(data.ranking); 
       
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
            
            <th>Puntaje Total</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.nombre}</td>             
              <td>{item.total_puntaje}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
   
  );
};


