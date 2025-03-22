'use client';

import Image from "next/image";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import withAuth from '@/components/hoc/withAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cog, Plus, Minus} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { customFetch } from '@/utils/CustomFetch';
import { toast } from "react-toastify";
import styled from 'styled-components';
import { NumericFormat } from "react-number-format";
import { motion } from "framer-motion";

interface Categoria {
  cod_categoria: number;
  nome: string;
  quantidade_pecas: number;
}

interface Peca {
  cod_peca: number;
  nome: string;
  quantidade: number;
  cod_categoria: number;
  valor: number;
  imagem?: string;
  quantidade_prevista: number;
  quantidade_executavel: number;
  tempo: number;
}

interface PecaArray {
  cod_peca: number;
  quantidade: number;
}

interface CategoriaArray {
  [pecaNome: string]: PecaArray; // Nome da peça -> código da peça
}

interface Subprojeto {
  cod_projeto: string;
  nome: string;
  categorias: Record<string, CategoriaArray>; // Nome da categoria -> Categoria
}

interface Projeto {
  cod_projeto: string;
  nome: string;
  concluido: boolean;
  categorias: Record<string, CategoriaArray>; // Nome da categoria -> Categoria
  subprojetos: Record<string, Subprojeto>; // ID do subprojeto -> Subprojeto
}

function PecasPage() {
  const router = useRouter();
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [pecasProj, setPecasProj] = useState<Projeto[]>([]);
  const [loadingPecas, setLoadingPecas] = useState(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pecaSelecionada, setPecaSelecionada] = useState<Peca | null>(null);
  const [quantidadeAdicionada, setQuantidadeAdicionada] = useState(1);
  const [valorPorPeca, setValorPorPeca] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);
  const [usarValorTotal, setUsarValorTotal] = useState(false);
  const [mostrarPorCategoria, setMostrarPorCategoria] = useState(false);
  const [modoValorTotal, setModoValorTotal] = useState(true);
  const [isEditCategoriaModalOpen, setIsEditCategoriaModalOpen] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [editando, setEditando] = useState(0);
  const [novoNome, setNovoNome] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [mostrarConcluidos, setMostrarConcluidos] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [visibilidade, setVisibilidade] = useState<Record<string, boolean>>({});

  const toggleVisibilidade = (projeto: any) => {
    setVisibilidade((prev) => ({
      ...prev,
      [projeto]: !prev[projeto],
    }));
  };

  const encontrarPeca = (codPeca: number) => {
    return pecas.find((peca) => peca.cod_peca === codPeca);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
  
        // Buscar peças
        const pecasResponse = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pecas?concluidos=${mostrarConcluidos}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === "true" && { "ngrok-skip-browser-warning": "true" }),
          },
        });
  
        if (!pecasResponse.ok) throw new Error("Erro ao buscar peças");
        let pecasData: Peca[] = await pecasResponse.json();
  
        // Buscar categorias
        const categoriasResponse = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/categorias`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === "true" && { "ngrok-skip-browser-warning": "true" }),
          },
        });
  
        if (!categoriasResponse.ok) throw new Error("Erro ao buscar categorias");
        let categoriasData: Categoria[] = await categoriasResponse.json();
  
        // Buscar previsão de estoque
        const previsaoResponse = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/relatorios/previsao-estoque?meses=1`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === "true" && { "ngrok-skip-browser-warning": "true" }),
          },
        });
  
        if (!previsaoResponse.ok) throw new Error("Erro ao buscar previsão de estoque");
        const previsaoData = await previsaoResponse.json();
  
        // Criar dicionário de previsão
        const previsaoDict = previsaoData.reduce((acc: Record<number, { quantidade_prevista: number; quantidade_executavel: number, tempo: number }>, item: any) => {
          acc[item.cod_peca] = {
            quantidade_prevista: item.quantidade_prevista,
            quantidade_executavel: item.quantidade_executavel,
            tempo: item.tempo
          };
          return acc;
        }, {});

        // Verifica se há peças sem categoria
        const existePecaSemCategoria = pecasData.some((peca) => peca.cod_categoria === null);

        let categoriaNaoCategorizada: any = null;

        // Só cria a categoria "Não Categorizadas" se houver peças sem categoria
        if (existePecaSemCategoria) {
          categoriaNaoCategorizada = categoriasData.find((c) => c.nome === "Não Categorizadas");

          if (!categoriaNaoCategorizada) {
            categoriaNaoCategorizada = {
              cod_categoria: -1, // Um ID temporário, você pode trocar por um ID válido do banco
              nome: "Não Categorizadas",
              quantidade_pecas: 0,
            };
            categoriasData.push(categoriaNaoCategorizada);
          }
        }

        let qtdNaoCategorizadas = 0; // Contador para peças sem categoria

        // Atualizar peças com previsão de estoque e atribuir categoria correta
        pecasData = pecasData.map((peca) => {
          const isSemCategoria = peca.cod_categoria === null;
          if (isSemCategoria) qtdNaoCategorizadas++; // Incrementa contador

          return {
            ...peca,
            cod_categoria: isSemCategoria ? categoriaNaoCategorizada?.cod_categoria ?? peca.cod_categoria : peca.cod_categoria,
            quantidade_prevista: previsaoDict[peca.cod_peca]?.quantidade_prevista || 0,
            quantidade_executavel: previsaoDict[peca.cod_peca]?.quantidade_executavel || 0,
            tempo: previsaoDict[peca.cod_peca]?.tempo || 0,
          };
        });

        // Se a categoria foi criada, atualiza a quantidade de peças nela
        if (categoriaNaoCategorizada) {
          categoriaNaoCategorizada.quantidade_pecas += qtdNaoCategorizadas;
        }

        // Atualiza os estados apenas se a categoria foi criada ou modificada
        setCategorias([...categoriasData]); 
        setPecas(pecasData);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  
    fetchData();
  }, [mostrarConcluidos, refreshKey]);

  useEffect(() => {
    async function fetchPecas() {
      try {
        const token = localStorage.getItem("token");  

        const pecasAgrupadas = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pecas/agrupadas?concluidos=${mostrarConcluidos}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === "true" && { "ngrok-skip-browser-warning": "true" }),
          },
        });
        const data = await pecasAgrupadas.json();
        setPecasProj(data);
        console.log(data)
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingPecas(false);
      }
    }
    fetchPecas();
  }, [mostrarConcluidos, refreshKey]);
  
  const handleValorChange = (values: { floatValue?: number }, isTotal: boolean) => {
    const valor = values.floatValue || 0;
    if (isTotal) {
      setValorTotal(valor);
      setValorPorPeca(valor / quantidadeAdicionada);
    } else {
      setValorPorPeca(valor);
      setValorTotal(valor * quantidadeAdicionada);
    }
  };

  const handleQuantidadeChange = (e: any) => {
    const quantidade = Number(e.target.value) || 1;
    setQuantidadeAdicionada(quantidade);
    if (modoValorTotal) {
      setValorPorPeca(valorTotal / quantidade);
    } else {
      setValorTotal(valorPorPeca * quantidade);
    }
  };

  const toggleModoValor = () => {
    setModoValorTotal(!modoValorTotal);
  };

  const handleAddQuantidade = async () => {
    if (!pecaSelecionada || quantidadeAdicionada <= 0){
      toast.error("Erro ao inserir dados, selecione uma quantidade válida!");
      return;
    } 

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pecas/${pecaSelecionada.cod_peca}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
        },
        body: JSON.stringify({ 
          quantidade: quantidadeAdicionada,
          valor_unitario: valorPorPeca
        }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar quantidade");

      setPecas((prevPecas) =>
        prevPecas.map((p) =>
          p.cod_peca === pecaSelecionada.cod_peca
            ? { 
                ...p, 
                quantidade: p.quantidade + quantidadeAdicionada, 
                valor: valorPorPeca // 🔹 Atualiza o valor da peça no estado também
              }
            : p
        )
      );

      setIsAddModalOpen(false);
      setQuantidadeAdicionada(1);
      setValorPorPeca(0);
      setValorTotal(0);

      setRefreshKey(prevKey => prevKey + 1);

      toast.success("Peças cadastradas!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar peça.");
    }
  };


  const handleEditCategoria = () => {
    setIsEditCategoriaModalOpen(true);
  };

  const getCardColor = (quantidade: number, quantidade_prevista: number, quantidade_executavel: number, cod_categoria: number) => {
    if(cod_categoria == 1){
      if (quantidade_prevista <= quantidade_executavel){
        if (quantidade >= 2 * quantidade_executavel && quantidade > quantidade_executavel) return "bg-green-500/70 text-white"; // Acima do ideal
        if (quantidade > quantidade_executavel) return "bg-green-300/70"; // Levemente acima do necessário
        if (quantidade == quantidade_executavel) return "bg-white"; // Próximo do ideal
        if (quantidade >= quantidade_executavel * 0.6) return "bg-orange-400/70 text-white"; // Um pouco abaixo do necessário
        if (quantidade >= quantidade_executavel * 0.3) return "bg-red-500/70 text-white"; // Bem abaixo do necessário
        return "bg-red-700/70 text-white"; // Estoque crítico
      } else {
        if (quantidade > quantidade_prevista) return "bg-green-500/70 text-white"; // Acima do ideal
        if (quantidade == quantidade_prevista * 0.8) return "bg-green-300/70"; // Levemente acima do necessário
        if (quantidade >= quantidade_executavel) return "bg-white"; // Próximo do ideal
        if (quantidade >= quantidade_executavel * 0.6) return "bg-orange-400/70 text-white"; // Um pouco abaixo do necessário
        if (quantidade >= quantidade_executavel * 0.3) return "bg-red-500/70 text-white"; // Bem abaixo do necessário
        return "bg-red-700/70 text-white"; // Estoque crítico
      }
    } else {
      if (quantidade >= 2 * quantidade_executavel && quantidade > quantidade_executavel) return "bg-green-500/70 text-white"; // Acima do ideal
      if (quantidade > quantidade_executavel) return "bg-green-300/70"; // Levemente acima do necessário
      if (quantidade == quantidade_executavel) return "bg-white"; // Próximo do ideal
      if (quantidade >= quantidade_executavel * 0.6) return "bg-orange-400/70 text-white"; // Um pouco abaixo do necessário
      if (quantidade >= quantidade_executavel * 0.3) return "bg-red-400/70 text-white"; // Bem abaixo do necessário
      return "bg-red-700/70 text-white"; // Estoque crítico
    }
  };
  
  const getCardColorList = (quantidade: number, quantidade_prevista: number, quantidade_executavel: number) => {
    if (quantidade_prevista <= quantidade_executavel){
      if (quantidade >= 2 * quantidade_executavel) return "bg-green-500/70 text-white"; // Acima do ideal
      if (quantidade > quantidade_executavel) return "bg-green-300/70"; // Levemente acima do necessário
      if (quantidade == quantidade_executavel) return "bg-[#ededed]"; // Próximo do ideal
      if (quantidade >= quantidade_executavel * 0.6) return "bg-orange-400/70 text-white"; // Um pouco abaixo do necessário
      if (quantidade >= quantidade_executavel * 0.3) return "bg-red-500/70 text-white"; // Bem abaixo do necessário
      return "bg-red-700/70 text-white"; // Estoque crítico
    } else {
      if (quantidade > quantidade_prevista) return "bg-green-500/70 text-white"; // Acima do ideal
      if (quantidade == quantidade_prevista * 0.8) return "bg-green-300/70"; // Levemente acima do necessário
      if (quantidade >= quantidade_executavel) return "bg-[#ededed]"; // Próximo do ideal
      if (quantidade >= quantidade_executavel * 0.6) return "bg-orange-400/70 text-white"; // Um pouco abaixo do necessário
      if (quantidade >= quantidade_executavel * 0.3) return "bg-red-500/70 text-white"; // Bem abaixo do necessário
      return "bg-red-700/70 text-white"; // Estoque crítico
    }
  };

  const handleDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;
  
    if (!destination) return;
  
    const idProjeto = Number(source.droppableId.split('-')[0]);
    const inicio = Number(source.droppableId.split('-')[1]);
    const destino = Number(destination.droppableId.split('-')[1]);
    const idPeca = Number(draggableId.split('-')[1]);

    const att = destino <= 0? null : destino;
  
    if (inicio === destino) return;
  
    // 🔥 Atualiza a UI imediatamente para evitar flickering
    setPecas((prevPecas) =>
      prevPecas.map((peca) =>
        peca.cod_peca === idPeca ? { ...peca, cod_categoria: destino } : peca
      )
    );
  
    setCategorias((prevCategorias) =>
      prevCategorias.map((cat) => {
        if (cat.cod_categoria === destino) {
          return { ...cat, quantidade_pecas: cat.quantidade_pecas + 1 };
        }
        if (cat.cod_categoria === inicio) {
          return { ...cat, quantidade_pecas: cat.quantidade_pecas - 1 };
        }
        return cat;
      })
    );
  
    try {
      const token = localStorage.getItem("token");
  
      const response = await customFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pecas/att/${idPeca}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === "true" && {
              "ngrok-skip-browser-warning": "true",
            }),
          },
          body: JSON.stringify({ cod_categoria: att }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Erro ao atualizar peça");
      }
  
      setRefreshKey((prevKey) => prevKey + 1);
    } catch (err) {
      console.error("Erro ao atualizar peça:", err);
      toast.error("Erro ao atualizar peça");
  
      // 🔄 Reverte a mudança na UI se a API falhar
      setPecas((prevPecas) =>
        prevPecas.map((peca) =>
          peca.cod_peca === idPeca ? { ...peca, cod_categoria: inicio } : peca
        )
      );
  
      setCategorias((prevCategorias) =>
        prevCategorias.map((cat) => {
          if (cat.cod_categoria === destino) {
            return { ...cat, quantidade_pecas: cat.quantidade_pecas - 1 };
          }
          if (cat.cod_categoria === inicio) {
            return { ...cat, quantidade_pecas: cat.quantidade_pecas + 1 };
          }
          return cat;
        })
      );
    }
  };  

  if (loading) return <p>Carregando estoque...</p>;

  const pecasFiltradas = pecas.filter((pecas) =>
    pecas.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  const pecasProjFiltradas = pecasProj.filter((pecas) =>
    pecas.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleEditar = (cod_categoria: number, nome: string) => {
    setEditando(cod_categoria);
    setNovoNome(nome);
  };
  
  const handleSalvarEdicao = async (cod_categoria: number) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categorias/${cod_categoria}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
        },
        body: JSON.stringify({ nome: novoNome })
      });
  
      setCategorias(categorias.map(cat => cat.cod_categoria === cod_categoria ? { ...cat, nome: novoNome } : cat));
      setEditando(0);
      setNovoNome("");
      toast.success("Categoria atualizada com sucesso!");

      setRefreshKey(prevKey => prevKey + 1);

    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      toast.error("Erro ao atualizar categoria.");
    }
  };
  
  const handleExcluir = async (cod_categoria: number, quantidade_pecas: number) => {
    if (quantidade_pecas > 0) {
      toast.error("Retire os produtos antes de excluir a categoria!");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categorias/${cod_categoria}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
        }
      });
  
      setCategorias(categorias.filter(cat => cat.cod_categoria !== cod_categoria));
      toast.success("Categoria excluída!");

      setRefreshKey(prevKey => prevKey + 1);

    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast.error("Erro ao excluir categoria.");
    }
  };
  
  const handleAdicionar = async () => {
    if (!novaCategoria.trim()) {
      toast.error("Digite um nome para a categoria!");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categorias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
        },
        body: JSON.stringify({ nome: novaCategoria })
      });
  
      const nova = await response.json();
      setCategorias([...categorias, { ...nova, quantidade_pecas: 0 }]);
      setNovaCategoria(""); // Limpa o input
      toast.success("Categoria adicionada!");

      setRefreshKey(prevKey => prevKey + 1);

    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      toast.error("Erro ao adicionar categoria.");
    }
  };
  
  const formatarParaReais = (valor: number): string => {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
  
  if (loading || loadingPecas) return <p>Carregando...</p>;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-line items-center gap-8">
          <h1 className="text-2xl font-bold">Gerenciamento de Estoque</h1>
          <StyledWrapper>
            <div className="checkbox-wrapper-8">
              <input
                type="checkbox"
                id="cb3-8"
                className="tgl tgl-skewed"
                checked={!mostrarPorCategoria} 
                onChange={() => setMostrarPorCategoria((prev) => !prev)} 
              />
              <label
                htmlFor="cb3-8"
                data-tg-on="Mostrar Completo"
                data-tg-off="Dividir Por Projeto"
                className="tgl-btn"
              />
            </div>
          </StyledWrapper>
          <div className="flex items-center space-x-3">
            <label className="group flex items-center cursor-pointer">
              <input 
                className="hidden peer" 
                type="checkbox" 
                checked={mostrarConcluidos} 
                onChange={() => setMostrarConcluidos((prev) => !prev)} 
              />
              <span className="relative w-8 h-8 flex justify-center items-center bg-gray-100 border-2 border-gray-400 rounded-md shadow-md transition-all duration-500 peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-hover:scale-105">
                <span className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 opacity-0 peer-checked:opacity-100 rounded-md transition-all duration-500 peer-checked:animate-pulse" />
                <svg fill="currentColor" viewBox="0 0 20 20" className="hidden w-5 h-5 text-white peer-checked:block transition-transform duration-500 transform scale-50 peer-checked:scale-100" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" fillRule="evenodd" />
                </svg>
              </span>
              <span className="ml-3 text-gray-700 group-hover:text-blue-500 font-medium transition-colors duration-300">
                Mostrar Projetos Concluídos
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-8">    

          <Button onClick={handleEditCategoria}>
            Editar Categorias
          </Button>     

          <StyledWrapper>
            <div className="input-container">
              <input
                type="text"
                name="text"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Pesquise no Estoque"
                className="input"
              />
              <label className="label" htmlFor="input">Pesquisar</label>
              <div className="topline" />
              <div className="underline" />
            </div>
          </StyledWrapper>
          
        </div>
      </div>
      
      {!mostrarPorCategoria ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <StyledWrapper>
            <div className="p-4">
              {pecasProjFiltradas.map((projeto) => (
                <div key={projeto.cod_projeto} className="mb-6 border rounded-lg shadow-md bg-white">                  
                  {projeto.concluido? (
                    <div className="flex justify-between items-center border-2 border-blue-400 p-4 rounded-lg cursor-pointer" onClick={() => toggleVisibilidade(projeto.cod_projeto)}>
                      <div className="flex items-center justify-between gap-8">
                        <h2
                          className="text-xl font-semibold text-blue-400"
                          onClick={(e) => { e.stopPropagation(); toggleVisibilidade(projeto.cod_projeto); }}
                        >
                          {projeto.nome}
                        </h2>
                        <div className="bg-gray-400 text-white p-1 rounded-lg border-gray-600" onClick={(e) => { e.stopPropagation(); toggleVisibilidade(projeto.cod_projeto); }}>
                          Concluído
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); toggleVisibilidade(projeto.cod_projeto); }}>
                        {visibilidade[projeto.cod_projeto] ? <Minus className="text-blue-400"/> : <Plus className="text-blue-400"/>}
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center border-2 border-blue-400 p-4 rounded-lg cursor-pointer" onClick={() => toggleVisibilidade(projeto.cod_projeto)}>
                      <h2
                        className="text-xl font-semibold cursor-pointer text-blue-400"
                        onClick={(e) => { e.stopPropagation(); toggleVisibilidade(projeto.cod_projeto); }}
                      >
                        {projeto.nome}
                      </h2>
                      <button onClick={(e) => { e.stopPropagation(); toggleVisibilidade(projeto.cod_projeto); }}>
                        {visibilidade[projeto.cod_projeto] ? <Minus className="text-blue-400"/> : <Plus className="text-blue-400"/>}
                      </button>
                    </div>
                    )}                    
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: visibilidade[projeto.cod_projeto] ? "auto" : 0, opacity: visibilidade[projeto.cod_projeto] ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-row gap-6 overflow-x-auto p-4">
                    {[
                      ...categorias.filter((categoria) => categoria.nome === "Não Categorizadas"), // Categoria específica no início
                      ...categorias
                        .filter((categoria) => categoria.nome !== "Não Categorizadas")
                        .sort((a, b) => a.nome.localeCompare(b.nome)), // O resto ordenado
                    ].map((categoria) => {
                      const pecasRow = projeto.categorias?.[categoria.nome] || {}; // Evita erro se a categoria não existir

                      return (
                        <div key={categoria.cod_categoria} className="w-[20%] flex-shrink-0 p-4 rounded-md pb-8">
                          <h3 className="text-lg font-medium text-center mb-2">{categoria.nome}</h3>
                          
                          <Droppable droppableId={`${projeto.cod_projeto}-${categoria.cod_categoria}`}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="card"
                              >
                                {Object.entries(pecasRow)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([pecaNome, pecaData], index) => {
                                  const peca = pecas.find((p) => p.cod_peca === Number(pecaData.cod_peca));

                                  const tempo = peca?.tempo || 0

                                  return (
                                    <Draggable key={`${projeto.cod_projeto}-${pecaData.cod_peca}`} draggableId={`${projeto.cod_projeto}-${pecaData.cod_peca}`} index={index + 5000}>
                                      {(provided) => (
                                        <Card
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`cursor-pointer ${getCardColorList(peca?.quantidade ?? 0, peca?.quantidade_prevista ?? 0, peca?.quantidade_executavel ?? 0)} hover:shadow-lg transition w-full flex items-center justify-center flex-col`}
                                          onClick={() => {
                                            if (peca?.cod_categoria == 1) {
                                              setPecaSelecionada(peca);
                                              setIsAddModalOpen(true);
                                            }
                                          }}
                                        >
                                          <CardHeader>
                                            <CardTitle>{pecaNome}</CardTitle>
                                          </CardHeader>
                                          <CardContent className="flex flex-col items-center relative w-full">
                                            {peca?.imagem ? (
                                              <Image
                                                src={`/api/proxy?imageUrl=${encodeURIComponent(`${process.env.NEXT_PUBLIC_API_URL}/uploads/${peca.imagem}`)}`}
                                                alt={peca.nome}
                                                width={150}
                                                height={150}
                                                className="rounded-md"
                                                priority
                                              />
                                            ) : (
                                              <Cog className="w-24 h-16 text-gray" />
                                            )}
                                            <p className="mt-2 text-xl">No Estoque: {peca?.quantidade}</p>
                                            
                                            {peca?.cod_categoria == 1?(
                                              <div className="flex items-center justify-center flex-col">
                                                <p className="text-sm">Para o Projeto: {pecaData.quantidade}</p>
                                                <p className="text-sm">
                                                  Recomendado: {peca?.quantidade_prevista >= peca?.quantidade_executavel ? peca?.quantidade_prevista : "(Não calculado)"}
                                                </p>
                                                <div className="absolute right-0 bottom-0 m-2">
                                                  <p className="text-sm font-bold">{formatarParaReais(peca?.valor)}</p>
                                                </div>
                                              </div>
                                            ) : (
                                              <div>
                                                <p className="text-sm">Para o Projeto: {pecaData.quantidade}</p>
                                                <div className="absolute right-0 bottom-0 m-2">
                                                  <p className="text-sm font-bold">
                                                    {tempo > 0?(
                                                      `${formatarTempo(tempo)}`
                                                    ) : (
                                                      'Não Calculado'
                                                    )}
                                                    
                                                  </p>
                                                </div>
                                              </div>
                                            )}
                                          </CardContent>
                                        </Card>
                                      )}
                                    </Draggable>
                                  );
                                })}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      )})}
                    </div>
                    {/* Subprojetos */}
                    {Object.values(projeto.subprojetos).length > 0 && (
                      <div className="mt-4 p-4 border-t">
                        {Object.values(projeto.subprojetos).map((subprojeto) => (
                          <div key={subprojeto.cod_projeto} className="mt-4 border rounded-lg shadow-md bg-gray-100 p-4">
                            <h4 
                              className="text-md font-semibold w-full h-full cursor-pointer" 
                              onClick={() => toggleVisibilidade(subprojeto.cod_projeto)}
                            >
                              {subprojeto.nome}
                            </h4>
                            
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: visibilidade[subprojeto.cod_projeto] ? "auto" : 0, opacity: visibilidade[subprojeto.cod_projeto] ? 1 : 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-row gap-6 overflow-x-auto p-2">
                                {[
                                  ...categorias.filter((categoria) => categoria.nome === "Não Categorizadas"), // Categoria específica no início
                                  ...categorias
                                    .filter((categoria) => categoria.nome !== "Não Categorizadas")
                                    .sort((a, b) => a.nome.localeCompare(b.nome)), // O resto ordenado
                                ].map((categoria) => {
                                  const pecasRow = subprojeto.categorias?.[categoria.nome] || {}; // Evita erro se a categoria não existir

                                  return (
                                    <div key={categoria.cod_categoria} className="w-[20%] flex-shrink-0 p-4 rounded-md pb-8">
                                      <h3 className="text-lg font-medium text-center mb-2">{categoria.nome}</h3>
                                      
                                      <Droppable droppableId={`${subprojeto.cod_projeto}-${categoria.cod_categoria}`}>
                                        {(provided) => (
                                          <div 
                                            ref={provided.innerRef} 
                                            {...provided.droppableProps} 
                                            className="card"
                                          >
                                            {Object.entries(pecasRow).map(([pecaNome, pecaData], index) => {
                                              const peca = pecas.find((p) => p.cod_peca === Number(pecaData.cod_peca));
                                              const tempo = peca?.tempo || 0;

                                              return (
                                                <Draggable key={`${subprojeto.cod_projeto}-${pecaData.cod_peca}`} draggableId={`${subprojeto.cod_projeto}-${pecaData.cod_peca}`} index={index + 10000}>
                                                  {(provided) => (
                                                    <Card
                                                      ref={provided.innerRef}
                                                      {...provided.draggableProps}
                                                      {...provided.dragHandleProps}
                                                      className={`cursor-pointer ${getCardColorList(peca?.quantidade ?? 0, peca?.quantidade_prevista ?? 0, peca?.quantidade_executavel ?? 0)} hover:shadow-lg transition w-full flex items-center justify-center flex-col`}
                                                    >
                                                      <CardHeader>
                                                        <CardTitle>{pecaNome}</CardTitle>
                                                      </CardHeader>
                                                      <CardContent className="flex flex-col items-center relative w-full">
                                                        {peca?.imagem ? (
                                                          <Image
                                                            src={`/api/proxy?imageUrl=${encodeURIComponent(`${process.env.NEXT_PUBLIC_API_URL}/uploads/${peca.imagem}`)}`}
                                                            alt={peca.nome}
                                                            width={150}
                                                            height={150}
                                                            className="rounded-md"
                                                            priority
                                                          />
                                                        ) : (
                                                          <Cog className="w-24 h-16 text-gray" />
                                                        )}
                                                        <p className="mt-2 text-xl">No Estoque: {peca?.quantidade}</p>

                                                        {peca?.cod_categoria == 1 ? (
                                                          <div className="flex items-center justify-center flex-col">
                                                            <p className="text-sm">Para o Projeto: {pecaData.quantidade}</p>
                                                            <p className="text-sm">
                                                              Recomendado: {peca?.quantidade_prevista >= peca?.quantidade_executavel ? peca?.quantidade_prevista : "(Não calculado)"}
                                                            </p>
                                                            <div className="absolute right-0 bottom-0 m-2">
                                                              <p className="text-sm font-bold">{formatarParaReais(peca?.valor)}</p>
                                                            </div>
                                                          </div>
                                                        ) : (
                                                          <div>
                                                            <p className="text-sm">Para o Projeto: {pecaData.quantidade}</p>
                                                            <div className="absolute right-0 bottom-0 m-2">
                                                              <p className="text-sm font-bold">
                                                                {tempo > 0 ? formatarTempo(tempo) : "Não Calculado"}
                                                              </p>
                                                            </div>
                                                          </div>
                                                        )}
                                                      </CardContent>
                                                    </Card>
                                                  )}
                                                </Draggable>
                                              );
                                            })}
                                            {provided.placeholder}
                                          </div>
                                        )}
                                      </Droppable>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>
              ))}
            </div>
          </StyledWrapper>
        </DragDropContext>
      
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {pecasFiltradas.map((peca) => (
            <Card
              key={peca.cod_peca}
              className={`${getCardColor(peca.quantidade, peca.quantidade_prevista, peca.quantidade_executavel, peca.cod_categoria)} cursor-pointer hover:shadow-lg transition flex items-center justify-center flex-col`}
              onClick={() => {
                if (peca.cod_categoria == 1) {
                  setPecaSelecionada(peca);
                  setIsAddModalOpen(true);
                }
              }}
            >
              <CardHeader>
                <CardTitle className="font-bold">{peca.nome}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center relative w-full">
                {peca.imagem && peca.imagem !== "" ? (
                  <Image
                    src={`/api/proxy?imageUrl=${encodeURIComponent(`${process.env.NEXT_PUBLIC_API_URL}/uploads/${peca.imagem}`)}`}
                    alt={peca.nome}
                    width={150}
                    height={150}
                    unoptimized
                    className="rounded-md object-cover w-3/5 h-auto"
                    priority
                  />
                
                ) : (
                  <Cog className="w-24 h-24 text-gray-200" />
                )}
                <p className="mt-2 text-xl">No Estoque: {peca.quantidade}</p>
                {peca.cod_categoria == 1?(
                  <div className="flex items-center justify-center flex-col">
                    <p className="text-sm">Mínimo: {peca.quantidade_executavel}</p>
                    <p className="text-sm">
                      Recomendado: {peca.quantidade_prevista >= peca.quantidade_executavel ? peca.quantidade_prevista : "(Não calculado)"}
                    </p>
                    <div className="absolute right-0 bottom-0 m-2">
                      <p className="text-sm font-bold">{formatarParaReais(peca.valor)}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm">Necessário: {peca.quantidade_executavel}</p>
                    <div className="absolute right-0 bottom-0 m-2">
                      <p className="text-sm font-bold">
                        {peca.tempo > 0?(
                          `${formatarTempo(peca.tempo)}`
                        ) : (
                          'Não Calculado'
                        )}
                        
                      </p>
                    </div>
                  </div>
                )}
                
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md p-6 space-y-4">
          <DialogHeader>
            <DialogTitle>Adicionar Quantidade</DialogTitle>
            <DialogDescription>Adicione a quantidade de peças e o valor correspondente.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade</Label>
            <StyledWrapper>
              <input 
                id="quantidade" 
                placeholder="Insira a quantidade" 
                className="input2" 
                name="text" 
                type="number" 
                min={1}
                value={quantidadeAdicionada}
                onChange={handleQuantidadeChange}
              />
            </StyledWrapper>
          </div>
          <div className="flex flex-line w-full justify-end items-center gap-6">
            {modoValorTotal ? (
              <div className="space-y-2 w-full">
                <Label htmlFor="valor-total">Valor Total</Label>
                <StyledWrapper>
                  <NumericFormat
                    id="valor-total"
                    value={valorTotal}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    allowNegative={false}
                    decimalScale={2}
                    fixedDecimalScale
                    onValueChange={(values) => handleValorChange(values, true)}
                    className="input-class input2"
                  />
                </StyledWrapper>
              </div>
            ) : (
              <div className="space-y-2 w-full">
                <Label htmlFor="valor-por-peca">Valor por Peça</Label>
                <StyledWrapper>
                  <NumericFormat
                    id="valor-por-peca"
                    value={valorPorPeca}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    allowNegative={false}
                    decimalScale={2}
                    fixedDecimalScale
                    onValueChange={(values) => handleValorChange(values, false)}
                    className="input-class input2"
                  />
                </StyledWrapper>
              </div>
            )}

              <div className="flex w-2/3 h-full justify-end flex-col mb-3">
                <Button variant="outline" onClick={toggleModoValor} className="w-full">
                  {modoValorTotal ? "Valor por Peça" : "Valor Total"}
                </Button>
              </div>
            </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddQuantidade}>Adicionar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditCategoriaModalOpen} onOpenChange={setIsEditCategoriaModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categorias</DialogTitle>
            <DialogDescription>
              Aqui você pode editar as categorias das peças.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 overflow-y-auto max-h-60">
            {categorias
            .filter(categoria => categoria.cod_categoria >= 1)
            .map((categoria) => (
              <div key={categoria.cod_categoria} className="flex items-center justify-between p-2 border rounded-md">
                {editando === categoria.cod_categoria ? (
                  <Input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} className="mr-2" />
                ) : (
                  <span>{categoria.nome}</span>
                )}
                <div className="flex space-x-2">
                  {editando === categoria.cod_categoria ? (
                    <Button onClick={() => handleSalvarEdicao(categoria.cod_categoria)} size="sm">Salvar</Button>
                  ) : (
                    <Button onClick={() => handleEditar(categoria.cod_categoria, categoria.nome)} size="sm">Editar</Button>
                  )}
                  <Button variant="destructive" onClick={() => handleExcluir(categoria.cod_categoria, categoria.quantidade_pecas)} size="sm">
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Input
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              placeholder="Nova categoria"
            />
            <Button onClick={handleAdicionar} size="sm">Adicionar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

const StyledWrapper = styled.div`
  .card {
    height: 72vh;
    border-radius: 30px;
    background:rgb(233, 233, 233);
    box-shadow: 15px 15px 30px #bebebe, -15px -15px 30px #ffffff;
    display: flex;
    flex-direction: column;
    gap: 15px;
    overflow-y: auto; /* Permite rolar */
    padding: 5%;
    
    /* Esconde a barra de rolagem no Firefox */
    scrollbar-width: none;  
  }

  /* Esconde a barra de rolagem no Chrome, Edge e Safari */
  .card::-webkit-scrollbar {
    display: none;
  }
    
  .input-container {
    position: relative;
  }

  .input {
    padding: 10px;
    height: 40px;
    border: 2px solid #0B2447;
    border-top: none;
    border-bottom: none;
    font-size: 16px;
    background: transparent;
    outline: none;
    box-shadow: 7px 7px 0px 0px #0B2447;
    transition: all 0.5s;
  }

  .input:focus {
    box-shadow: none;
    transition: all 0.5s;
  }

  .label {
    position: absolute;
    top: 10px;
    left: 10px;
    color: #0B2447;
    transition: all 0.5s;
    transform: scale(0);
    z-index: 0;
  }

  .input-container .topline {
    position: absolute;
    content: "";
    background-color: #0B2447;
    width: 0%;
    height: 2px;
    right: 0;
    top: 0;
    transition: all 0.5s;
  }

  .input-container input[type="text"]:focus ~ .topline {
    width: 55%;
    transition: all 0.5s;
  }

  .input-container .underline {
    position: absolute;
    content: "";
    background-color: #0B2447;
    width: 0%;
    height: 2px;
    right: 0;
    bottom: 0;
    transition: all 0.5s;
  }

  .input-container input[type="text"]:focus ~ .underline {
    width: 100%;
    transition: all 0.5s;
  }

  .input-container input[type="text"]:focus ~ .label {
    top: -10px;
    transform: scale(1);
    transition: all 0.5s;
  }
    
  .input::placeholder {
    color: gray;
    transition: color 0.3s ease;
  }

  .input:focus::placeholder {
    color: transparent;
  }
    .checkbox-wrapper-8 .tgl {
    display: none;
  }

  .checkbox-wrapper-8 .tgl,
    .checkbox-wrapper-8 .tgl:after,
    .checkbox-wrapper-8 .tgl:before,
    .checkbox-wrapper-8 .tgl *,
    .checkbox-wrapper-8 .tgl *:after,
    .checkbox-wrapper-8 .tgl *:before,
    .checkbox-wrapper-8 .tgl + .tgl-btn {
    box-sizing: border-box;
  }

  .checkbox-wrapper-8 .tgl::-moz-selection,
    .checkbox-wrapper-8 .tgl:after::-moz-selection,
    .checkbox-wrapper-8 .tgl:before::-moz-selection,
    .checkbox-wrapper-8 .tgl *::-moz-selection,
    .checkbox-wrapper-8 .tgl *:after::-moz-selection,
    .checkbox-wrapper-8 .tgl *:before::-moz-selection,
    .checkbox-wrapper-8 .tgl + .tgl-btn::-moz-selection,
    .checkbox-wrapper-8 .tgl::selection,
    .checkbox-wrapper-8 .tgl:after::selection,
    .checkbox-wrapper-8 .tgl:before::selection,
    .checkbox-wrapper-8 .tgl *::selection,
    .checkbox-wrapper-8 .tgl *:after::selection,
    .checkbox-wrapper-8 .tgl *:before::selection,
    .checkbox-wrapper-8 .tgl + .tgl-btn::selection {
    background: none;
  }

  .checkbox-wrapper-8 .tgl + .tgl-btn {
    outline: 0;
    display: block;
    width: 12em;
    height: 2em;
    position: relative;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .checkbox-wrapper-8 .tgl + .tgl-btn:after,
    .checkbox-wrapper-8 .tgl + .tgl-btn:before {
    position: relative;
    display: block;
    content: "";
    width: 50%;
    height: 100%;
  }

  .checkbox-wrapper-8 .tgl + .tgl-btn:after {
    left: 0;
  }

  .checkbox-wrapper-8 .tgl + .tgl-btn:before {
    display: none;
  }

  .checkbox-wrapper-8 .tgl:checked + .tgl-btn:after {
    left: 50%;
  }

  .checkbox-wrapper-8 .tgl-skewed + .tgl-btn {
    overflow: hidden;
    transform: skew(-10deg);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transition: all 0.2s ease;
    font-family: sans-serif;
    background: #888;
  }

  .checkbox-wrapper-8 .tgl-skewed + .tgl-btn:after,
    .checkbox-wrapper-8 .tgl-skewed + .tgl-btn:before {
    transform: skew(10deg);
    display: inline-block;
    transition: all 0.2s ease;
    width: 100%;
    text-align: center;
    position: absolute;
    line-height: 2em;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
  }

  .checkbox-wrapper-8 .tgl-skewed + .tgl-btn:after {
    left: 100%;
    content: attr(data-tg-on);
  }

  .checkbox-wrapper-8 .tgl-skewed + .tgl-btn:before {
    left: 0;
    content: attr(data-tg-off);
  }

  .checkbox-wrapper-8 .tgl-skewed + .tgl-btn:active {
    background: #888;
  }

  .checkbox-wrapper-8 .tgl-skewed + .tgl-btn:active:before {
    left: -10%;
  }

  .checkbox-wrapper-8 .tgl-skewed:checked + .tgl-btn {
    background:rgb(0, 0, 0);
  }

  .checkbox-wrapper-8 .tgl-skewed:checked + .tgl-btn:before {
    left: -100%;
  }

  .checkbox-wrapper-8 .tgl-skewed:checked + .tgl-btn:after {
    left: 0;
  }

  .checkbox-wrapper-8 .tgl-skewed:checked + .tgl-btn:active:after {
    left: 10%;
  }

  .input2 {
    font-family: "SF Pro";
    width: 100%;
    padding: 0.875rem;
    font-size: 1rem;
    border: 1.5px solid #000;
    border-radius: 0.5rem;
    box-shadow: 2.5px 3px 0 #000;
    outline: none;
    transition: ease 0.25s;
  }

  .input2:focus {
    box-shadow: 5.5px 7px 0 black;
  }`;
  
export default withAuth(PecasPage);
