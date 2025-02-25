// app/projeto/[id]/page.tsx
'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import withAuth from "@/components/hoc/withAuth";
import Image from "next/image";
import { Cpu } from "lucide-react";
import BarChart from '@/components/graficos/BarChart';
import PieChart from '@/components/graficos/PieChart';
import MateriaisList from '@/components/MateriaisList';

interface ProjetoType {
  cod_projeto: number;
  nome: string;
  imagem: string;
  pecas_totais: number;
  pecas_atuais: number;
  data_entrada: string;
}

interface GraficoType {
  labels: string[];
  data: number[];
}

interface PieChartDataType {
  labels: string[];
  data: number[];
}

interface Material {
  cod_peca: number;
  nome: string;
  quantidade: number;
}

function ProjetoPage() {
  const params = useParams();
  const router = useRouter();

  const [projeto, setProjeto] = useState<ProjetoType | null>(null);
  const [loadingProjeto, setLoadingProjeto] = useState(true);
  
  const [grafico, setGrafico] = useState<GraficoType>({ labels: [], data: [] });
  const [loadingGrafico, setLoadingGrafico] = useState(true);

  const [graficoPizza, setGraficoPizza] = useState<PieChartDataType>({ labels: [], data: [] });
  const [loadingGraficoPizza, setLoadingGraficoPizza] = useState(true);

  const [materiaisRetirados, setMateriaisRetirados] = useState<Material[]>([]);
  const [loadingRetirados, setLoadingRetirados] = useState(true);

  const [materiaisFaltantes, setMateriaisFaltantes] = useState<Material[]>([]);
  const [loadingFaltantes, setLoadingFaltantes] = useState(true);

  const [historicoRetiradas, setHistoricoRetiradas] = useState<{ 
    cod_pegou_peca: number;
    usuario: string;
    peca: string;
    quantidade: number;
    data_pegou: string;
  }[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(true);

  useEffect(() => {
    async function fetchProjeto() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          // Caso não encontre o projeto, redirecione para 404 ou outra página
          // router.push("/projetos");
          return;
        }
        const data = await response.json();
        setProjeto(data);
      } catch (error) {
        console.error("Erro ao buscar projeto:", error);
      } finally {
        setLoadingProjeto(false);
      }
    }

    fetchProjeto();
  }, [params.id, router]);

  useEffect(() => {
    async function fetchGrafico() {
      try {
        const token = localStorage.getItem("token");
        // Inclua o id do projeto na URL:
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/grafico/quantidades-por-data/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          console.error("Erro ao buscar dados do gráfico");
          return;
        }
        const data = await response.json();
        setGrafico(data);
      } catch (error) {
        console.error("Erro ao buscar dados do gráfico:", error);
      } finally {
        setLoadingGrafico(false);
      }
    }
    fetchGrafico();
  }, [params.id]);

  useEffect(() => {
    async function fetchGraficoPizza() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/grafico/pizza/por-usuario/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          console.error("Erro ao buscar dados do gráfico de pizza");
          return;
        }
        const data = await response.json();
        setGraficoPizza(data);
      } catch (error) {
        console.error("Erro ao buscar dados do gráfico de pizza:", error);
      } finally {
        setLoadingGraficoPizza(false);
      }
    }
    fetchGraficoPizza();
  }, [params.id]);

  // Fetch dos materiais retirados
  useEffect(() => {
    async function fetchMateriaisRetirados() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/materiais-retirados/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          console.error("Erro ao buscar materiais retirados");
          return;
        }
        const data = await response.json();
        setMateriaisRetirados(data);
      } catch (error) {
        console.error("Erro ao buscar materiais retirados:", error);
      } finally {
        setLoadingRetirados(false);
      }
    }
    fetchMateriaisRetirados();
  }, [params.id]);

  // Fetch dos materiais faltantes
  useEffect(() => {
    async function fetchMateriaisFaltantes() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/materiais-faltantes/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          console.error("Erro ao buscar materiais faltantes");
          return;
        }
        const data = await response.json();
        setMateriaisFaltantes(data);
      } catch (error) {
        console.error("Erro ao buscar materiais faltantes:", error);
      } finally {
        setLoadingFaltantes(false);
      }
    }
    fetchMateriaisFaltantes();
  }, [params.id]);

  useEffect(() => {
    async function fetchHistoricoRetiradas() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/historico-retiradas/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          console.error("Erro ao buscar histórico de retiradas");
          return;
        }
        const data = await response.json();
        setHistoricoRetiradas(data);
      } catch (error) {
        console.error("Erro ao buscar histórico de retiradas:", error);
      } finally {
        setLoadingHistorico(false);
      }
    }
    fetchHistoricoRetiradas();
  }, [params.id]);

  if (loadingProjeto || loadingGrafico || loadingGraficoPizza || loadingRetirados || loadingFaltantes || loadingHistorico) return <p>Carregando...</p>;
  if (!projeto) return <p>Projeto não encontrado.</p>;

  const progressPercentage = projeto.pecas_totais > 0 ? Math.min((projeto.pecas_atuais / projeto.pecas_totais) * 100, 100) : 0;

  return (
    <Layout>
      <div className="flex flex-col gap-10">
        <div className="flex flex-wrap gap-6 justify-between">
          <div className="flex flex-col items-center justify-start w-full md:flex-1 bg-white p-6 rounded-3xl shadow-xl">
            <h1 className="text-2xl font-bold mb-4">{projeto.nome}</h1>
            {projeto.imagem && projeto.imagem !== "" ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${projeto.imagem}`}
                alt={projeto.nome}
                width={250}
                height={250}
                className="rounded-md object-cover w-4/5 h-auto"
                priority
              />
            ) : (
              <Cpu size={150} className="text-gray-400 w-2/5 h-auto" />
            )}
            {/* Barra de progresso */}
            <div className="w-full mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-1 text-center">
                {projeto.pecas_atuais} / {projeto.pecas_totais}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-start w-full md:flex-1 bg-white p-6 rounded-3xl shadow-xl">
            <h1 className="text-2xl font-bold mb-4">Relação de Peças Por Dia</h1>
            <BarChart labels={grafico.labels} data={grafico.data} />
          </div>
          <div className="flex flex-col items-center justify-start w-full md:flex-1 bg-white p-6 rounded-3xl shadow-xl">
            <h1 className="text-2xl font-bold mb-4">Relação de Peças Por Usuário</h1>
            <PieChart labels={graficoPizza.labels} data={graficoPizza.data} />
          </div>
        </div>
        <div className="flex flex-wrap gap-6 justify-between">
          <div className="flex flex-col items-center justify-start w-full md:flex-1 bg-white p-6 rounded-3xl shadow-xl">
            <h1 className="text-2xl font-bold mb-4">Peças Já Retiradas</h1>
            <div className="p-6 w-full">
              <MateriaisList materiais={materiaisRetirados.map(m => ({
                id: m.cod_peca,
                nome: m.nome,
                quantidade: m.quantidade
              }))} />
            </div>
          </div>
          <div className="flex flex-col items-center justify-start w-full md:flex-1 bg-white p-6 rounded-3xl shadow-xl">
            <h1 className="text-2xl font-bold mb-4">Peças Que Faltam Retirar</h1>
            <div className="p-6 w-full">
              <MateriaisList materiais={materiaisFaltantes.map(m => ({
                id: m.cod_peca,
                nome: m.nome,
                quantidade: m.quantidade // aqui representa a quantidade que falta retirar
              }))} />
            </div>
          </div>
          <div className="flex flex-col items-center justify-start w-full md:flex-1 bg-white p-6 rounded-3xl shadow-xl">
            <h1 className="text-2xl font-bold mb-4">Histórico de Peças Retiradas</h1>

            {loadingHistorico ? (
              <p>Carregando histórico...</p>
            ) : historicoRetiradas.length === 0 ? (
              <p>Nenhuma peça retirada ainda.</p>
            ) : (
              <div className="w-full max-h-80 overflow-y-auto">
                <ul className="w-full">
                  {historicoRetiradas.map((retirada) => (
                    <li key={retirada.cod_pegou_peca} className="border-b py-2 flex justify-between">
                      <span className="font-semibold">{retirada.usuario}</span>
                      <span>{retirada.peca} ({retirada.quantidade}x)</span>
                      <span className="text-gray-500">{new Date(retirada.data_pegou).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(ProjetoPage);