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
import { Cog } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { customFetch } from '@/utils/CustomFetch';
import { toast } from "react-toastify";
import styled from 'styled-components';
import { NumericFormat } from "react-number-format";

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
}

function PecasPage() {
  const router = useRouter();
  const [pecas, setPecas] = useState<Peca[]>([]);
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

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
  
        // Buscar peças
        const pecasResponse = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pecas`, {
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
        const previsaoDict = previsaoData.reduce((acc: Record<number, { quantidade_prevista: number; quantidade_executavel: number }>, item: any) => {
          acc[item.cod_peca] = {
            quantidade_prevista: item.quantidade_prevista,
            quantidade_executavel: item.quantidade_executavel,
          };
          return acc;
        }, {});
  
        // Verifica se já existe uma categoria "Não Categorizadas", se não existir, cria uma
        let categoriaNaoCategorizada = categoriasData.find((c) => c.nome === "Não Categorizadas");
  
        if (!categoriaNaoCategorizada) {
          categoriaNaoCategorizada = {
            cod_categoria: -1, // Um ID temporário, você pode trocar por um ID válido do banco
            nome: "Não Categorizadas",
            quantidade_pecas: 0,
          };
          categoriasData.push(categoriaNaoCategorizada);
        }
  
        let qtdNaoCategorizadas = 0; // Contador para peças sem categoria
  
        // Atualizar peças com previsão de estoque e atribuir categoria correta
        pecasData = pecasData.map((peca) => {
          const isSemCategoria = peca.cod_categoria === null;
          if (isSemCategoria) qtdNaoCategorizadas++; // Incrementa contador
  
          return {
            ...peca,
            cod_categoria: isSemCategoria ? categoriaNaoCategorizada!.cod_categoria : peca.cod_categoria,
            quantidade_prevista: previsaoDict[peca.cod_peca]?.quantidade_prevista || 0,
            quantidade_executavel: previsaoDict[peca.cod_peca]?.quantidade_executavel || 0,
          };
        });
  
        // Atualiza a quantidade de peças na categoria "Não Categorizadas"
        categoriaNaoCategorizada.quantidade_pecas += qtdNaoCategorizadas;
  
        setCategorias([...categoriasData]); // Atualiza categorias no estado
        setPecas(pecasData); // Atualiza peças no estado

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  
    fetchData();
  }, []);
  
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
      toast.success("Peças cadastradas!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar peça.");
    }
  };


  const handleEditCategoria = () => {
    setIsEditCategoriaModalOpen(true);
  };

  const getCardColor = (quantidade: number, quantidade_prevista: number, quantidade_executavel: number) => {
    if (quantidade_prevista <= quantidade_executavel){
      if (quantidade >= 2 * quantidade_executavel) return "bg-green-500/70 text-white"; // Acima do ideal
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
  
    if (!destination || source.droppableId === destination.droppableId) return;
  
    try {
      setPecas((prevPecas) =>
        prevPecas.map((peca) =>
          peca.cod_peca === Number(draggableId)
            ? { ...peca, cod_categoria: Number(destination.droppableId) }
            : peca
        )
      );
  
      const token = localStorage.getItem("token");
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pecas/att/${Number(draggableId)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
        },
        body: JSON.stringify({
          cod_categoria: Number(destination.droppableId),
        }),
      });
  
      if (!response.ok) {
        toast.error("Erro ao atualizar peça");
        throw new Error("Erro ao atualizar peça");
      }
  
      setCategorias((prevCategorias) =>
        prevCategorias.map((cat) => {
          if (cat.cod_categoria === Number(destination.droppableId)) {
            return { ...cat, quantidade_pecas: cat.quantidade_pecas + 1 };
          }
          if (cat.cod_categoria === Number(source.droppableId)) {
            return { ...cat, quantidade_pecas: cat.quantidade_pecas - 1 };
          }
          return cat;
        })
      );
    } catch (err) {
      console.error("Erro ao atualizar peça:", err);
      toast.error("Erro ao atualizar peça");
    }
  };  
  

  if (loading) return <p>Carregando estoque...</p>;

  const pecasFiltradas = pecas.filter((pecas) =>
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
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      toast.error("Erro ao adicionar categoria.");
    }
  };
  
  const formatarParaReais = (valor: number): string => {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

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
                data-tg-on="Mostrar por Categoria"
                data-tg-off="Mostrar Todo Estoque"
                className="tgl-btn"
              />
            </div>
          </StyledWrapper>
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

      {/* Toggle entre mostrar todas as peças ou por categoria */}
      {mostrarPorCategoria ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <StyledWrapper>
            <div className="flex flex-row gap-6 overflow-x-auto p-4">
              {categorias.map((categoria) => (
                <div key={categoria.cod_categoria} className="w-[20%] flex-shrink-0">
                  <h2 className="text-xl font-semibold text-center mb-2">{categoria.nome}</h2>
                  <Droppable droppableId={String(categoria.cod_categoria)}>
                    {(provided) => {
                      try {
                        return (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="card"
                          >
                            {pecasFiltradas
                              .filter((peca) => peca.cod_categoria === categoria.cod_categoria)
                              .map((peca, index) => (
                                <Draggable key={peca.cod_peca} draggableId={String(peca.cod_peca)} index={index}>
                                  {(provided) => (
                                    <Card
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`cursor-pointer ${getCardColorList(peca.quantidade, peca.quantidade_prevista, peca.quantidade_executavel)} hover:shadow-lg transition w-full flex items-center justify-center flex-col`}
                                      onClick={() => {
                                        setPecaSelecionada(peca);
                                        setIsAddModalOpen(true);
                                      }}
                                    >
                                      <CardHeader>
                                        <CardTitle>{peca.nome}</CardTitle>
                                      </CardHeader>
                                      <CardContent className="flex flex-col items-center relative w-full">
                                        {peca.imagem ? (
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
                                        <p className="mt-2 text-xl">No Estoque: {peca.quantidade}</p>
                                        <p className="text-sm">Mínimo: {peca.quantidade_executavel}</p>
                                        <p className="text-sm">
                                          Recomendado: {peca.quantidade_prevista ? peca.quantidade_prevista : "(Não calculado)"}
                                        </p>
                                        <div className="absolute right-0 bottom-0 m-2">
                                          <p className="text-sm font-bold">{formatarParaReais(peca.valor)}</p>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </div>
                        );
                      } catch (error) {
                        console.error("Erro no Droppable:", error);
                        return <div>Erro ao carregar categoria</div>;
                      }
                    }}
                  </Droppable>
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
              className={`${getCardColor(peca.quantidade, peca.quantidade_prevista, peca.quantidade_executavel)} cursor-pointer hover:shadow-lg transition flex items-center justify-center flex-col`}
              onClick={() => {
                setPecaSelecionada(peca);
                setIsAddModalOpen(true);
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
                <p className="text-sm">Mínimo: {peca.quantidade_executavel}</p>
                <p className="text-sm">
                  Recomendado: {peca.quantidade_prevista >= peca.quantidade_executavel ? peca.quantidade_prevista : "(Não calculado)"}
                </p>
                <div className="absolute right-0 bottom-0 m-2">
                  <p className="text-sm font-bold">{formatarParaReais(peca.valor)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Adição de Quantidade */}
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

      {/* Modal de Edição de Categorias */}
      <Dialog open={isEditCategoriaModalOpen} onOpenChange={setIsEditCategoriaModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categorias</DialogTitle>
            <DialogDescription>
              Aqui você pode editar as categorias das peças.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 overflow-y-auto max-h-60">
            {categorias.map((categoria) => (
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

          {/* Botão de Adicionar Categoria */}
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
    background:rgb(255, 255, 255);
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
