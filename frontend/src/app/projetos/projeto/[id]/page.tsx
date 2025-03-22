'use client';

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import withAuth from "@/components/hoc/withAuth";
import Image from "next/image";
import { Cpu } from "lucide-react";
import BarChart from '@/components/graficos/BarChart';
import PieChart from '@/components/graficos/PieChart';
import MateriaisList from '@/components/MateriaisList';
import MateriaisListProd from '@/components/MateriaisListProd';
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { customFetch } from '@/utils/CustomFetch';
import { Label } from '@/components/ui/label';
import { toast } from "react-toastify";
import moment from "moment";


interface ProjetoType {
  cod_projeto: number;
  nome: string;
  imagem: string;
  pecas_totais: number;
  pecas_atuais: number;
  data_entrada: string;
  data_entrega: string;
  projeto_main: number;
}

type GraficoItem = {
  title: string;
  labels: string[];
  data: number[];
};

type GraficoTempo = {
  labels: string[];
  data: number[];
};

interface PieChartDataType {
  title: string;
  nome: string;
  labels: string[];
  data: number[];
}

interface Material {
  cod_peca: number;
  nome: string;
  quantidade: number;
  estoque: number;
  cod_categoria: number;
}

interface MaterialProd {
  cod_peca: number;
  nome: string;
  quantidade: number;
  estoque: number;
  cod_user: number;
  usuario_nome: string;
  data_inicio: string;
  data_final: string | null;
  produzido: number | 1;
  cod_carrinho: number;
  comercial: number | 0;
  tem_categoria: boolean | false;
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
  
  const [grafico, setGrafico] = useState<GraficoItem[]>([]);
  const [loadingGrafico, setLoadingGrafico] = useState(true);

  const [graficoTempo, setGraficoTempo] = useState<GraficoTempo>({
    labels: [],
    data: [],
  });
  const [loadingGraficoTempo, setLoadingGraficoTempo] = useState(true);

  const [graficoPizza, setGraficoPizza] = useState<PieChartDataType[]>([]);
  const [loadingGraficoPizza, setLoadingGraficoPizza] = useState(true);

  const [materiaisRetirados, setMateriaisRetirados] = useState<Material[]>([]);
  const [loadingRetirados, setLoadingRetirados] = useState(true);

  const [materiaisFaltantes, setMateriaisFaltantes] = useState<Material[]>([]);
  const [loadingFaltantes, setLoadingFaltantes] = useState(true);

  const [materiaisProducao, setMateriaisProducao] = useState<MaterialProd[]>([]);
  const [loadingProducao, setLoadingProducao] = useState(true);

  const [loadingComerciais, setLoadingComerciais] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalRetirarOpen, setModalRetirarOpen] = useState(false);

  const [selectedPeca, setSelectedPeca] = useState<Material | null>(null);
  const [quantidade, setQuantidade] = useState(0);

  const [selectedPecaRet, setSelectedPecaRet] = useState<MaterialProd | null>(null);
  const [quantidadeRet, setQuantidadeRet] = useState(0);

  const [refreshKey, setRefreshKey] = useState(0);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState("concluir");

  const toastShown = useRef(false); // Variável persistente


  const [historicoProducao, setHistoricoProducao] = useState<{ 
    cod_pegou_peca: number;
    usuario: string;
    peca: string;
    quantidade: number;
    data_inicio: string;
    data_final: string;
    cod_carrinho: number;
    projeto: string;
  }[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(true);

  const [historicoRetirada, setHistoricoRetiradas] = useState<{ 
    cod_pegou_peca: number;
    usuario: string;
    peca: string;
    quantidade: number;
    data_retirou: string;
    projeto: string;
  }[]>([]);
  const [loadingHistoricoRet, setLoadingHistoricoRet] = useState(true);

  const { userCode } = useUser();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editData, setEditData] = useState(Date);

  const [tipoGrafico, setTipoGrafico] = useState(0);
  const [tipoGraficoPizza, setTipoGraficoPizza] = useState(0);

  useEffect(() => {
    async function fetchProjeto() {
      try {
        const token = localStorage.getItem("token");
        const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${params.id}`, {
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
        const data = await response.json()
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
            setGrafico(data.dataOptions);
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
        const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/grafico/pizza/por-usuario/${params.id}`, {
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
        const data = await response.json()
        setGraficoPizza(data.dataOptions);
      } catch (error) {
        console.error("Erro ao buscar dados do gráfico de pizza:", error);
      } finally {
        setLoadingGraficoPizza(false);
      }
    }
    fetchGraficoPizza();
  }, [params.id, refreshKey]);
  
  useEffect(() => {
    async function fetchGraficoTempo() {
      try {
        const token = localStorage.getItem("token");
        const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/tempo-medio-por-peca/${params.id}`, {
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
        const data = await response.json()
        setGraficoTempo(data);
      } catch (error) {
        console.error("Erro ao buscar dados do gráfico de pizza:", error);
      } finally {
        setLoadingGraficoTempo(false);
      }
    }
    fetchGraficoTempo();
  }, [params.id, refreshKey]);

  // Fetch dos materiais retirados
  useEffect(() => {
    async function fetchMateriaisRetirados() {
      try {
        const token = localStorage.getItem("token");
        const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/materiais-retirados/${params.id}`, {
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
        const data = await response.json()
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
        const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/materiais-faltantes/${params.id}`, {
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
        const data = await response.json()

        if (!toastShown.current && data.some((mat: { cod_categoria: number }) => !mat.cod_categoria || mat.cod_categoria == 0)) {
          toast.info("Algumas peças desse projeto ainda não foram categorizadas!");
          toastShown.current = true; // Marca como exibido para evitar repetições
        }

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
    async function fetchMateriaisProducao() {
      try {
        const token = localStorage.getItem("token");
  
        const [materiaisResponse, itensComerciaisResponse] = await Promise.all([
          customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/materiais-em-producao/${params.id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
              ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === "true" && { "ngrok-skip-browser-warning": "true" })
            },
          }),
          customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/itens-comerciais/${params.id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
              ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === "true" && { "ngrok-skip-browser-warning": "true" })
            },
          })
        ]);
  
        if (!materiaisResponse.ok || !itensComerciaisResponse.ok) {
          console.error("Erro ao buscar dados");
          return;
        }
  
        const [materiais, itensComerciais] = await Promise.all([
          materiaisResponse.json(),
          itensComerciaisResponse.json()
        ]);
  
        // Mapeia os itens comerciais e adiciona os valores padrões
        const itensComerciaisFormatados = itensComerciais.map((item: { cod_peca: string; nome: string; quantidade?: number; estoque?: number }) => ({
          cod_peca: item.cod_peca,
          nome: item.nome,
          quantidade: item.quantidade || 0,
          estoque: item.estoque || 0,
          cod_user: null,
          usuario_nome: null,
          data_inicio: null,
          data_final: null,
          produzido: 1,
          cod_carrinho: null,
          comercial: 1,
          tem_categoria: true,
        }));

        if (!toastShown.current && materiais.some((mat: { tem_categoria: boolean }) => !mat.tem_categoria)) {
          toast.info("Algumas peças desse projeto ainda não foram categorizadas!");
          toastShown.current = true; // Marca como exibido para evitar repetições
        }
  
        // Junta tudo antes de atualizar o estado
        setMateriaisProducao([...materiais, ...itensComerciaisFormatados]);
  
      } catch (error) {
        console.error("Erro ao buscar materiais e itens comerciais:", error);
      } finally {
        setLoadingProducao(false);
        setLoadingComerciais(false);
      }
    }
  
    fetchMateriaisProducao();
  }, [params.id, refreshKey]);  

  useEffect(() => {
    async function fetchHistoricoProducao() {
      try {
        const token = localStorage.getItem("token");
        const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/historico-producao/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
          },
        });
        if (!response.ok) {
          console.error("Erro ao buscar histórico de produção");
          return;
        }
        const data = await response.json()

        setHistoricoProducao(data);
      } catch (error) {
        console.error("Erro ao buscar histórico de produção:", error);
      } finally {
        setLoadingHistorico(false);
      }
    }
    fetchHistoricoProducao();
  }, [params.id, refreshKey])

  useEffect(() => {
    async function fetchHistoricoRetirada() {
      try {
        const token = localStorage.getItem("token");
        const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/historico-retiradas/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
          },
        });
        if (!response.ok) {
          console.error("Erro ao buscar histórico de peças retiradas");
          return;
        }
        const data = await response.json()

        setHistoricoRetiradas(data);
      } catch (error) {
        console.error("Erro ao buscar histórico de peças retiradas:", error);
      } finally {
        setLoadingHistoricoRet(false);
      }
    }
    fetchHistoricoRetirada();
  }, [params.id, refreshKey]);

  async function handleProduzirPeca() {

    if (selectedPeca && quantidade > 0) {    
      
      if(!selectedPeca.cod_categoria || selectedPeca.cod_categoria == null){
        toast.error("Peças não podem ser produzidas antes de serem categorizadas!")
      } else {
        try {
            const token = localStorage.getItem("token");

            const dataPegou = new Date();
            const dataFormatada = new Date(dataPegou.getTime() - dataPegou.getTimezoneOffset() * 60000)
                .toISOString();

            const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${token}`,
                    ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
                },
                body: JSON.stringify({
                    cod_projeto: params.id,
                    cod_peca: selectedPeca.cod_peca,
                    cod_user: Number(userCode),
                    quantidade: Number(quantidade),
                    data_pegou: dataFormatada,
                }),
            });

            let responseData = null;

            // Só tenta converter para JSON se houver conteúdo na resposta
            const textResponse = await response.text();
            if (textResponse) {
                responseData = JSON.parse(textResponse);
            }

            if (!response.ok) {
              throw new Error(responseData?.error || "Erro ao produzir peça");
              return; // Evita continuar a execução
            }

            setModalOpen(false);
            setRefreshKey(prevKey => prevKey + 1); // Atualiza histórico sem recarregar a página
            toast.success("Produção das peças iniciada!");

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erro ao produzir peça");
        }
      }
    }
  }

  async function handleRetirarPeca() {

    if (selectedPecaRet && quantidadeRet > 0) {     
      try {

        if(!selectedPecaRet.tem_categoria){
          toast.error("Peças não podem ser retiradas antes de serem categorizadas!")
        } else {

          if(selectedPecaRet.estoque < quantidadeRet){
            toast.error(`Estoque Insuficiente! Peças atuais no estoque: ${selectedPecaRet.estoque}`)
          } else {
            
            const token = localStorage.getItem("token");

            const dataPegou = new Date();
            const dataFormatada = new Date(dataPegou.getTime() - dataPegou.getTimezoneOffset() * 60000)
                .toISOString();

            const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/retirada`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${token}`,
                    ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
                },
                body: JSON.stringify({
                    cod_projeto: params.id,
                    cod_peca: selectedPecaRet.cod_peca,
                    cod_user: Number(userCode),
                    quantidade: Number(quantidadeRet),
                    data_pegou: dataFormatada,
                }),
            });

            let responseData = null;

            // Só tenta converter para JSON se houver conteúdo na resposta
            const textResponse = await response.text();
            if (textResponse) {
                responseData = JSON.parse(textResponse);
            }

            if (!response.ok) {
              throw new Error(responseData?.error || "Erro ao retirar peça");
              return; // Evita continuar a execução
            }

            setModalRetirarOpen(false);
            setRefreshKey(prevKey => prevKey + 1); // Atualiza histórico sem recarregar a página
            toast.success("Peças retirada com sucesso!");
          }
        }

      } catch (error: any) {
          console.error(error);
          toast.error(error.message || "Erro ao retirar peças");
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

  
  const openConfirmModal = (type: "concluir" | "excluir") => {
    setActionType(type);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    setIsConfirmModalOpen(false);

    if (actionType === "concluir") {
      await handleConcluirProjeto();
    } else {
      await handleExcluirProjeto();
    }
  };

  const handleConcluirProjeto = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${params.id}/concluir`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
        },
      });

      if (!response.ok) {
        toast.error("Erro ao concluir projeto");
        throw new Error("Erro ao concluir projeto");
      }

      toast.success("Projeto concluído com sucesso!");
      router.push("/projetos");
    } catch (error) {
      console.error(error);
    }
  };

  const handleConcluirProducao = async (cod_historico: number) => {
    try {

      const dataPegou = new Date();
      const dataFormatada = new Date(dataPegou.getTime() - dataPegou.getTimezoneOffset() * 60000)
          .toISOString();
          
      const token = localStorage.getItem("token");
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/atualizar-data-final/${cod_historico}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
        },
        body: JSON.stringify({
          data_final: dataFormatada,
        }),
      });

      if (!response.ok) {
        toast.error("Erro ao concluir produção");
        throw new Error("Erro ao concluir projeto");
      }

      toast.success("produção concluída com sucesso!");
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const handleExcluirProjeto = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${params.id}/desativar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
        },
      });

      if (!response.ok) {
        toast.error("Erro ao excluir projeto");
        throw new Error("Erro ao excluir projeto");
      }

      toast.success("Projeto excluído com sucesso!");
      router.push("/projetos");
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
          ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
        },
        body: JSON.stringify(projeto),
      });

      if (!response.ok){
        toast.error("Erro ao editar data")
        throw new Error('Erro ao editar data');
      }

      setIsEditModalOpen(false);
      toast.success("Data alterada com sucesso!")
    } catch (error) {
      console.error(error);
    }
  };

  // Função para formatar tempo em dias, horas, minutos e segundos
  const formatarTempo = (segundos: number) => {
    const dias = Math.floor(segundos / 86400);
    const horas = Math.floor((segundos % 86400) / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segundosRestantes = Math.floor(segundos % 60);

    let resultado = [];

    if (dias > 0) resultado.push(`${dias}d`);
    if (horas > 0 || dias > 0) resultado.push(`${horas}h`);
    if (minutos > 0 || horas > 0 || dias > 0) resultado.push(`${minutos}m`);
    if (segundosRestantes > 0 || resultado.length === 0) resultado.push(`${segundosRestantes}s`);

    return resultado.join(" ");
  };

  const tempoDiff = (inicio: string, final: string) => {
    const inicio_moment = moment.utc(inicio);
    const final_moment = moment.utc(final);
  
    let tempoEmProducao = "Data inválida";
  
    if (inicio) {
      const diff = final_moment.diff(inicio_moment, "seconds");
      tempoEmProducao = formatarTempo(diff)
    }
  
    return tempoEmProducao;
  };

  const agrupadoPorCarrinho = historicoProducao.reduce((acc, retirada) => {
    const carrinho = retirada.cod_carrinho || "Sem Carrinho";
    if (!acc[carrinho]) {
      acc[carrinho] = [];
    }
    acc[carrinho].push(retirada);
    return acc;
  }, {} as Record<string, typeof historicoProducao>);
  
  // Ordena os grupos de carrinho pela data_final (da maior para a menor)
  const historicoAgrupado = Object.entries(agrupadoPorCarrinho)
    .sort(([, retiradasA], [, retiradasB]) => {
      const dataA = new Date(retiradasA[0].data_final).getTime();
      const dataB = new Date(retiradasB[0].data_final).getTime();
      return dataB - dataA; // Ordem decrescente
    });

  if (loadingProjeto || loadingGrafico || loadingGraficoPizza || loadingRetirados || loadingFaltantes || loadingHistorico || loadingProducao || loadingGraficoTempo || loadingComerciais) return <p>Carregando...</p>;
  if (!projeto) return <p>Projeto não encontrado.</p>;

  const progressPercentage = projeto.pecas_totais > 0 ? Math.min((projeto.pecas_atuais / projeto.pecas_totais) * 100, 100) : 0;

  return (
    <Layout>

      <div className="flex justify-between">
        <div className="flex gap-2 w-full justify-start items-center pl-8 pb-8">
          <Button variant="destructive" onClick={() => openConfirmModal("excluir")}>Excluir Projeto</Button>
        </div>
        {projeto && (
          <>
            {projeto.pecas_atuais < projeto.pecas_totais && (
              <div className="flex gap-2 w-full justify-end items-center pl-8 pb-8">
                <Button onClick={() => setIsEditModalOpen(true)}>Data de Entrega</Button>
                <Button onClick={() => setModalOpen(true)}>Produzir Peças</Button>
                <Button onClick={() => setModalRetirarOpen(true)}>Retirar Peças</Button>
              </div>
            )}
            {projeto.projeto_main === 0 && projeto.pecas_atuais >= projeto.pecas_totais &&(
              <div className="flex gap-2 w-full justify-end items-center pl-8 pb-8">
                <Button onClick={() => openConfirmModal("concluir")}>Concluir Projeto</Button>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Produzir Peças</DialogTitle>
            <DialogDescription>
              Confirme o inicio da produção da peça antes de continuar.
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
                  <SelectItem key={`${peca.cod_peca}-${peca.nome}`} value={peca.cod_peca.toString()}>
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

          <Button onClick={handleProduzirPeca} disabled={!selectedPeca || quantidade <= 0}>Confirmar Produção</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={modalRetirarOpen} onOpenChange={setModalRetirarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirar Peças</DialogTitle>
            <DialogDescription>
              Confirme a retirada de peças para o projeto.
            </DialogDescription>
          </DialogHeader>

          <Select
            onValueChange={(value) => {
              const pecaSelecionadaRet = materiaisProducao.find(p => p.cod_peca === Number(value) && p.produzido === 1);
              setSelectedPecaRet(pecaSelecionadaRet || null);
              setQuantidadeRet(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma peça" />
            </SelectTrigger>
            <SelectContent>
              {materiaisProducao
                .filter(peca => peca.produzido === 1) // Filtra apenas peças produzidas
                .map((peca) => (
                  <SelectItem key={peca.cod_peca} value={peca.cod_peca.toString()}>
                    {peca.nome} (Limite: {peca.quantidade})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {selectedPecaRet && (
            <Input
              type="number"
              value={quantidadeRet}
              onChange={(e) => {
                const novaQuantidade = Number(e.target.value);
                setQuantidadeRet(
                  isNaN(novaQuantidade) ? 1 : Math.min(novaQuantidade, selectedPecaRet.quantidade)
                );
              }}
              min={1}
              max={selectedPecaRet.quantidade}
              placeholder="Quantidade"
            />
          )}

          <Button onClick={handleRetirarPeca} disabled={!selectedPecaRet || quantidadeRet <= 0}>
            Confirmar Retirada
          </Button>
        </DialogContent>
      </Dialog>
      
      <div className="flex flex-wrap gap-6 justify-center">
        <div className="flex flex-col items-center justify-between w-full md:w-[30%] bg-white p-4 rounded-2xl shadow-lg min-h-[150px]">
          <h1 className="text-2xl font-bold mb-4">{projeto.nome}</h1>
          {projeto.imagem && projeto.imagem !== "" ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${projeto.imagem}`}
              alt={projeto.nome}
              width={1920}
              height={1080}
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
            <div className="w-full flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{grafico[tipoGrafico]?.title}</h1>
                <button 
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition" 
                    onClick={() => setTipoGrafico((tipoGrafico + 1) % grafico.length)}
                >
                    Alternar Gráfico
                </button>
            </div>
            <BarChart labels={grafico[tipoGrafico]?.labels} data={grafico[tipoGrafico]?.data} />
        </div>
        <div className="flex flex-col items-center justify-between w-full md:w-[40%] bg-white p-4 rounded-2xl shadow-lg min-h-[150px]">
          <div className="w-full flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{graficoPizza[tipoGraficoPizza]?.title}</h1>
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition" 
                onClick={() => setTipoGraficoPizza((tipoGraficoPizza + 1) % graficoPizza.length)}
              >
                Alternar Gráfico
              </button>
            </div>
          <PieChart labels={graficoPizza[tipoGraficoPizza]?.labels} data={graficoPizza[tipoGraficoPizza]?.data} nome={graficoPizza[tipoGraficoPizza]?.nome} />
        </div>
        <div className="flex flex-col items-center justify-between w-full md:w-[40%] bg-white p-4 rounded-2xl shadow-lg min-h-[150px]">
          <h1 className="text-2xl font-bold mb-4">Tempo Médio Por Peça</h1>
          <PieChart
            labels={graficoTempo.labels}
            data={graficoTempo.data} // Mantém os valores numéricos
            nome={'Tempo Médio'}
            tempo={true}
          />
        </div>        
        <div className="flex flex-col items-center justify-start w-full md:w-[30%] bg-white p-4 rounded-2xl shadow-lg min-h-[150px]">
          <h1 className="text-xl font-bold mb-4">Peças Para Produção</h1>
          <div className="p-6 w-full">
            <MateriaisList materiais={materiaisFaltantes.map(m => ({
              id: m.cod_peca,
              nome: m.nome,
              quantidade: m.quantidade // aqui representa a quantidade que falta retirar
            }))} />
          </div>
        </div>
        <div className="flex flex-col items-center justify-start w-full md:w-[30%] bg-white p-4 rounded-2xl shadow-lg min-h-[150px]">
          <h1 className="text-xl font-bold mb-4">Peças No Estoque</h1>
          <div className="p-6 w-full">
            <MateriaisListProd materiais={materiaisProducao.map(m => ({
              id: m.cod_peca,
              nome: m.nome,
              quantidade: m.quantidade,
              cod_user: m.cod_user,
              data_inicio: m.data_inicio,
              data_final: m.data_final,
              usuario_nome: m.usuario_nome,
              produzido: m.produzido,
              cod_carrinho: m.cod_carrinho,
              comercial: m.comercial,
            }))} onConcluirProducao={handleConcluirProducao} />
          </div>
        </div>
        <div className="flex flex-col items-center justify-start w-full md:w-[30%] bg-white p-4 rounded-2xl shadow-lg min-h-[150px]">
          <h1 className="text-xl font-bold mb-4">Peças Adicionadas ao Projeto</h1>
          <div className="p-6 w-full">
            <MateriaisList materiais={materiaisRetirados.map(m => ({
              id: m.cod_peca,
              nome: m.nome,
              quantidade: m.quantidade
            }))} />
          </div>
        </div>
        <div className="flex flex-col items-center justify-start w-full md:w-[90%] bg-white p-4 rounded-2xl shadow-lg min-h-[150px]">
          <h1 className="text-xl font-bold mb-4">Histórico de Produção de Peças</h1>

          {loadingHistorico ? (
            <p>Carregando histórico...</p>
          ) : historicoProducao.length === 0 ? (
            <p>Nenhuma peça produzida ainda.</p>
          ) : (
            <div className="w-full max-h-80 overflow-y-auto">
              <ul className="w-full p-5">
                {/* Cabeçalho */}
                <li key="tittle" className="border-b py-2 grid grid-cols-5 gap-4 text-left">
                  <span className="font-bold min-w-[70px]">Nome Usuário</span>
                  <span className="font-bold min-w-[70px]">Peça (quantidade)</span>
                  <span className="font-bold min-w-[70px]">Peça Finalizada em</span>
                  <span className="font-bold min-w-[70px]">Tempo para produção</span>
                  <span className="font-bold min-w-[70px]">Projeto</span>
                </li>

                {/* Itera sobre os grupos de carrinho */}
                {historicoAgrupado.map(([cod_carrinho, retiradas]) => (
                  <div key={cod_carrinho} className="border-b py-4">

                    {/* Lista de itens do carrinho */}
                    {retiradas.map((retirada, index) => (
                      <li
                        key={`${retirada.cod_pegou_peca}-${retirada.peca}-${retirada.quantidade}`}
                        className="py-2 grid grid-cols-5 gap-4 text-left"
                      >
                        {index === 0 ? (
                          <span className="font-semibold min-w-[70px]">{retirada.usuario}</span>
                        ) : (
                          <>
                            <span className="min-w-[70px]"></span>
                          </>
                        )}
                        <span className="min-w-[70px]">{retirada.peca} ({retirada.quantidade}x)</span>

                        {/* Exibe data_final e tempoDiff apenas na primeira linha */}
                        {index === 0 ? (
                          <>
                            <span className="text-gray-500 min-w-[70px]">
                              {new Date(retirada.data_final).toLocaleString()}
                            </span>
                            <span className="text-gray-500 min-w-[70px]">
                              {tempoDiff(retirada.data_inicio, retirada.data_final)}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="min-w-[70px]"></span>
                            <span className="min-w-[70px]"></span>
                          </>
                        )}        
                        {index === 0 ? (
                          <>
                            <span className="min-w-[70px]">{retirada.projeto}</span>
                          </>
                        ) : (
                          <>
                            <span className="min-w-[70px]"></span>
                          </>
                        )}        
                      </li>
                    ))}
                  </div>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-start w-full md:w-[90%] bg-white p-4 rounded-2xl shadow-lg min-h-[150px]">
          <h1 className="text-xl font-bold mb-4">Histórico de Retirada de Peças</h1>

          {loadingHistoricoRet ? (
            <p>Carregando histórico...</p>
          ) : historicoRetirada.length === 0 ? (
            <p>Nenhuma peça retirada ainda.</p>
          ) : (
            <div className="w-full max-h-80 overflow-y-auto">
              <ul className="w-full p-5">
                <li 
                  key={'tittle'}
                    className="border-b py-2 grid grid-cols-4 gap-4 text-left"
                >
                  <span className="font-bold min-w-[70px]">Nome Usuário</span>
                  <span className="font-bold min-w-[70px]">Peça (quantidade)</span>
                  <span className="font-bold min-w-[70px]">Data Retirada</span>
                  <span className="font-bold min-w-[70px]">Projeto</span>
                </li>
                {historicoRetirada.map((retirada) => (
                  <li 
                  key={`${retirada.cod_pegou_peca}-${retirada.peca}-${retirada.quantidade}`}
                    className="border-b py-2 grid grid-cols-4 gap-4 text-left"
                  >
                    <span className="font-semibold min-w-[70px]">{retirada.usuario}</span>
                    <span className="min-w-[70px]">{retirada.peca} ({retirada.quantidade}x)</span>
                    <span className="text-gray-500 min-w-[70px]">{new Date(retirada.data_retirou).toLocaleString()}</span>
                    <span className="text-gray-500 min-w-[70px]">{retirada.projeto}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Data de Entrega</DialogTitle>
            <DialogDescription>Altere a data de entrega e salve as mudanças.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Data de Entrega</Label>
              <Input
                type="date"
                value={projeto.data_entrega}
                onChange={(e) => 
                  setProjeto(prev => prev ? { ...prev, data_entrega: e.target.value } : prev)
                }
              />
            </div>
            <Button onClick={handleEdit}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmação</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja {actionType === "concluir" ? "concluir" : "excluir"} este projeto? Esta ação não pode ser desfeita.</p>
          <DialogFooter>
            <Button onClick={() => setIsConfirmModalOpen(false)} variant="outline">Cancelar</Button>
            <Button onClick={handleConfirmAction} variant="destructive">Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default withAuth(ProjetoPage);