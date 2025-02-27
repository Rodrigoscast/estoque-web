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
  ativo: boolean;
}

function Dashboard() {
  const [projetos, setProjetos] = useState<ProjetoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarConcluidos, setMostrarConcluidos] = useState(false);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    async function fetchProjetos() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projetos?concluidos=${mostrarConcluidos}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
            },
          }
        );

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
  }, [mostrarConcluidos]);

  const projetosFiltrados = projetos.filter((projeto) =>
    projeto.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-line items-center gap-8">
          <h1 className="text-2xl font-bold">{mostrarConcluidos ? "Projetos Concluídos" : "Projetos Ativos"}</h1>
          <button
            className="px-4 py-2 border rounded bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => setMostrarConcluidos(!mostrarConcluidos)}
          >
            {mostrarConcluidos ? "Mostrar Ativos" : "Mostrar Concluídos"}
          </button>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Buscar projeto..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-64 p-2 border rounded"
          />
          
        </div>
      </div>

      {loading ? (
        <p>Carregando projetos...</p>
      ) : projetosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {projetosFiltrados.map((projeto) => (
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
