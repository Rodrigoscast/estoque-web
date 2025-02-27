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
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


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

interface Peca {
  cod_peca: number;
  nome: string;
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

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPeca, setSelectedPeca] = useState<Material | null>(null);
  const [quantidade, setQuantidade] = useState(0);

  const [refreshKey, setRefreshKey] = useState(0);


  const [historicoRetiradas, setHistoricoRetiradas] = useState<{ 
    cod_pegou_peca: number;
    usuario: string;
    peca: string;
    quantidade: number;
    data_pegou: string;
  }[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(true);

  const { userCode } = useUser();

  useEffect(() => {
    async function fetchProjeto() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
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
  }, [params.id, router, refreshKey]);

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
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
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
  }, [params.id, refreshKey]);

  useEffect(() => {
    async function fetchGraficoPizza() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/grafico/pizza/por-usuario/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
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
  }, [params.id, refreshKey]);

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
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
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
  }, [params.id, refreshKey]);

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
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
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
  }, [params.id, refreshKey]);

  useEffect(() => {
    async function fetchHistoricoRetiradas() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/historico-retiradas/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
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
}, [params.id, refreshKey]);

async function handleRetirarPeca() {
    if (selectedPeca && quantidade > 0) {      
      try {
        const token = localStorage.getItem("token");

        const dataPegou = new Date();
        const dataFormatada = new Date(dataPegou.getTime() - dataPegou.getTimezoneOffset() * 60000)
            .toISOString();

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`,
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })},
            body: JSON.stringify({
                cod_projeto: params.id,
                cod_peca: selectedPeca.cod_peca,
                cod_user: Number(userCode),
                quantidade: Number(quantidade),
                data_pegou: dataFormatada,
            }),
        });

        if (!response.ok) throw new Error("Erro ao retirar peça");

        setModalOpen(false);

        // Atualiza o histórico de retiradas sem dar reload na página
        setRefreshKey(prevKey => prevKey + 1); 

      } catch (error) {
        console.error(error);
      }
    }
  }

  // Se o projeto não for encontrado, redireciona
  useEffect(() => {
    if (!loadingProjeto && !projeto) {
      setTimeout(() => {
        router.push("/projetos"); // Substitua pelo destino correto
      }, 1000);
    }
  }, [loadingProjeto, projeto]);

  if (loadingProjeto || loadingGrafico || loadingGraficoPizza || loadingRetirados || loadingFaltantes || loadingHistorico) return <p>Carregando...</p>;
  if (!projeto) return <p>Projeto não encontrado.</p>;

  const progressPercentage = projeto.pecas_totais > 0 ? Math.min((projeto.pecas_atuais / projeto.pecas_totais) * 100, 100) : 0;

  return (
    <Layout>
    
      {projeto && projeto.pecas_atuais < projeto.pecas_totais && (
        <div className="flex w-full justify-end items-center pl-8 pb-8">
          <Button onClick={() => setModalOpen(true)} className="mt-4">
            Retirar Peças
          </Button>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirar Peças</DialogTitle>
            <DialogDescription>
              Confirme a retirada da peça antes de continuar.
            </DialogDescription>
          </DialogHeader>

          <Select onValueChange={(value) => {
            const pecaSelecionada = materiaisFaltantes.find(p => p.cod_peca === Number(value));
            setSelectedPeca(pecaSelecionada || null);
            setQuantidade(1);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma peça" />
            </SelectTrigger>
            <SelectContent>
              {materiaisFaltantes
                .filter(peca => peca.nome.toLowerCase())
                .map((peca) => (
                  <SelectItem key={peca.cod_peca} value={peca.cod_peca.toString()}>
                    {peca.nome} (Limite: {peca.quantidade})
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPeca && (
            <Input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(Math.min(Number(e.target.value), selectedPeca.quantidade))}
              min={1}
              max={selectedPeca.quantidade}
              placeholder="Quantidade"
            />
          )}

          <Button onClick={handleRetirarPeca} disabled={!selectedPeca || quantidade <= 0}>Confirmar Retirada</Button>
        </DialogContent>
      </Dialog>
      
      <div className="flex flex-wrap gap-6 justify-center">
        <div className="flex flex-col items-center justify-between w-full md:w-[30%] bg-white p-4 rounded-2xl shadow-lg min-h-[150px]">
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
        <div className="flex flex-col items-center justify-between w-full md:w-[60%] bg-white p-4 rounded-2xl shadow-lg min-h-[150px]">
          <h1 className="text-2xl font-bold mb-4">Relação de Peças Por Dia</h1>
          <BarChart labels={grafico.labels} data={grafico.data} />
        </div>
        <div className="flex flex-col items-center justify-between w-full md:w-[40%] bg-white p-4 rounded-2xl shadow-lg min-h-[150px]">
          <h1 className="text-2xl font-bold mb-4">Relação de Peças Por Usuário</h1>
          <PieChart labels={graficoPizza.labels} data={graficoPizza.data} />
        </div>
        <div className="flex flex-col items-center justify-start w-full md:w-[25%] bg-white p-4 rounded-2xl shadow-lg min-h-[150px]">
          <h1 className="text-xl font-bold mb-4">Peças Já Retiradas</h1>
          <div className="p-6 w-full">
            <MateriaisList materiais={materiaisRetirados.map(m => ({
              id: m.cod_peca,
              nome: m.nome,
              quantidade: m.quantidade
            }))} />
          </div>
        </div>
        <div className="flex flex-col items-center justify-start w-full md:w-[25%] bg-white p-4 rounded-2xl shadow-lg min-h-[150px]">
          <h1 className="text-xl font-bold mb-4">Peças Que Faltam Retirar</h1>
          <div className="p-6 w-full">
            <MateriaisList materiais={materiaisFaltantes.map(m => ({
              id: m.cod_peca,
              nome: m.nome,
              quantidade: m.quantidade // aqui representa a quantidade que falta retirar
            }))} />
          </div>
        </div>
        <div className="flex flex-col items-center justify-start w-full md:w-[90%] bg-white p-4 rounded-2xl shadow-lg min-h-[150px]">
          <h1 className="text-xl font-bold mb-4">Histórico de Peças Retiradas</h1>

          {loadingHistorico ? (
            <p>Carregando histórico...</p>
          ) : historicoRetiradas.length === 0 ? (
            <p>Nenhuma peça retirada ainda.</p>
          ) : (
            <div className="w-full max-h-80 overflow-y-auto">
              <ul className="w-full p-5">
                {historicoRetiradas.map((retirada) => (
                  <li 
                    key={retirada.cod_pegou_peca} 
                    className="border-b py-2 grid grid-cols-3 gap-4 text-left"
                  >
                    <span className="font-semibold min-w-[100px]">{retirada.usuario}</span>
                    <span className="min-w-[100px]">{retirada.peca} ({retirada.quantidade}x)</span>
                    <span className="text-gray-500 min-w-[100px]">{new Date(retirada.data_pegou).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(ProjetoPage);