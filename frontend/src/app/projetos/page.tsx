'use client';

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import withAuth from "@/components/hoc/withAuth";
import Projeto from "@/components/project";

// Definição do tipo do projeto
interface ProjetoType {
  cod_projeto: number;
  nome: string;
  imagem: string;
  pecas_atuais: number;
  pecas_totais: number;
}

function Dashboard() {
  const [projetos, setProjetos] = useState<ProjetoType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjetos() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        const data: ProjetoType[] = await response.json();
        if (!response.ok) throw new Error("Erro ao buscar projetos");

        setProjetos(data);
      } catch (error) {
        console.error("Erro ao buscar projetos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjetos();
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold">Projetos</h1>
      <p>Acompanhe e gerencie seus projetos!</p>

      {loading ? (
        <p>Carregando projetos...</p>
      ) : projetos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {projetos.map((projeto) => (
            <Projeto 
              key={projeto.cod_projeto} 
              id={projeto.cod_projeto} 
              nome={projeto.nome} 
              imagem={projeto.imagem} 
              min={projeto.pecas_atuais} 
              max={projeto.pecas_totais}
            />
          ))}
        </div>
      ) : (
        <p>Nenhum projeto encontrado.</p>
      )}
    </Layout>
  );
}

export default withAuth(Dashboard);
