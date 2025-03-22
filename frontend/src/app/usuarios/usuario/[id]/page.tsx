'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import withAuth from "@/components/hoc/withAuth";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BarChart from '@/components/graficos/BarChart';
import PieChart from '@/components/graficos/PieChart';
import { customFetch } from '@/utils/CustomFetch';
import { toast } from "react-toastify";
import { Checkbox } from "@/components/ui/checkbox";
import moment from "moment";

type GraficoItem = {
  title: string;
  labels: string[];
  data: number[];
};

interface PieChartDataType {
  title: string;
  nome: string;
  labels: string[];
  data: number[];
}

interface Usuario {
  nome: string;
  email: string;
}

function UsuarioPage() {
  const router = useRouter();
  const { id } = useParams();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editData, setEditData] = useState({ nome: '', email: '', site: false, app: true });

  const [grafico, setGrafico] = useState<GraficoItem[]>([]);
  const [loadingGrafico, setLoadingGrafico] = useState(true);

  const [graficoPizza, setGraficoPizza] = useState<PieChartDataType[]>([]);
  const [loadingGraficoPizza, setLoadingGraficoPizza] = useState(true);

  const [historicoRetiradas, setHistoricoRetiradas] = useState<{ 
    cod_pegou_peca: number;
    projeto: string;
    peca: string;
    quantidade: number;
    data_retirou: string;
  }[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(true);

  const [historicoProduzidas, setHistoricoProduzidas] = useState<{ 
    cod_pegou_peca: number;
    projeto: string;
    peca: string;
    quantidade: number;
    data_inicio: string;
    data_final: string;
    cod_carrinho: string;
  }[]>([]);
  const [loadingHistoricoProd, setLoadingHistoricoProd] = useState(true);

  const [tipoGrafico, setTipoGrafico] = useState(0);
  const [tipoGraficoPizza, setTipoGraficoPizza] = useState(0);

  const [tempoMedio, setTempoMedio] = useState(0);
  const [loadingTempo, setLoadingTempo] = useState(true)

  const [mostrarRetiradas, setMostrarRetiradas] = useState(true);

  useEffect(() => {
    async function fetchUsuario() {
      try {
        const token = localStorage.getItem("token");
        const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
          },
        });
  
        if (!response.ok) {
          throw new Error('Usuário não encontrado ou desativado');
        }
  
        const data = await response.json()
        setUsuario(data);
        setEditData({ nome: data.nome, email: data.email, site: data.site, app: data.app });
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        setTimeout(() => router.push('/usuarios'), 100); // Pequeno delay para evitar conflitos de renderização
      } finally {
        setLoading(false);
      }
    }
  
    if (id) fetchUsuario();
  }, [id, router]);

  useEffect(() => {
    async function fetchTempo() {
      try {
        const token = localStorage.getItem("token");
        const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/tempo-medio-por-peca/usuario/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
          },
        });
  
        if (!response.ok) {
          throw new Error('Não foi possível encontrar o tempo médio');
        }
  
        const data = await response.json()
        setTempoMedio(data.tempo_medio_por_peca);

      } catch (error) {
        console.error('Erro ao buscar tempo:', error);
      } finally {
        setLoadingTempo(false);
      }
    }
  
    fetchTempo();
  }, [id]);

  useEffect(() => {
    async function fetchTempo() {
      try {
        const token = localStorage.getItem("token");
        const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/historico-producao/por-usuario/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
          },
        });
  
        if (!response.ok) {
          throw new Error('Não foi possível encontrar as peças produzidas');
        }
  
        const data = await response.json()
        setHistoricoProduzidas(data);

      } catch (error) {
        console.error('Erro ao buscar tempo:', error);
      } finally {
        setLoadingHistoricoProd(false);
      }
    }
  
    fetchTempo();
  }, [id]);

  const handleEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
          ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error('Erro ao editar usuário');

      setUsuario({ ...usuario, ...editData });
      setIsEditModalOpen(false);

      toast.success("Usuário editado com sucesso!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/${id}/desativar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
        },
      });

      if (!response.ok) throw new Error('Erro ao excluir usuário');
      toast.success("Usuário excluído com sucesso!");
      router.push('/usuarios');
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    async function fetchGrafico() {
      try {
        const token = localStorage.getItem("token");
        // Inclua o id do projeto na URL:
        const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/grafico/quantidades-por-usuario/${id}`, {
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
        const data = await response.json()
        setGrafico(data.dataOptions);
      } catch (error) {
        console.error("Erro ao buscar dados do gráfico:", error);
      } finally {
        setLoadingGrafico(false);
      }
    }
    fetchGrafico();
  }, [id]);

  useEffect(() => {
    async function fetchGraficoPizza() {
      try {
        const token = localStorage.getItem("token");
        const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/grafico/pizza/por-projeto/${id}`, {
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
  }, [id]);

  useEffect(() => {
    async function fetchHistoricoRetiradas() {
      try {
        const token = localStorage.getItem("token");
        const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/historico-retiradas/por-usuario/${id}`, {
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
        const data = await response.json()
        setHistoricoRetiradas(data);
      } catch (error) {
        console.error("Erro ao buscar histórico de retiradas:", error);
      } finally {
        setLoadingHistorico(false);
      }
    }
    fetchHistoricoRetiradas();
  }, [id]);

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

  const agrupadoPorCarrinho = historicoProduzidas.reduce((acc, retirada) => {
    const carrinho = retirada.cod_carrinho || "Sem Carrinho";
    if (!acc[carrinho]) {
      acc[carrinho] = [];
    }
    acc[carrinho].push(retirada);
    return acc;
  }, {} as Record<string, typeof historicoProduzidas>);
  
  // Ordena os grupos de carrinho pela data_final (da maior para a menor)
  const historicoAgrupado = Object.entries(agrupadoPorCarrinho)
    .sort(([, retiradasA], [, retiradasB]) => {
      const dataA = new Date(retiradasA[0].data_final).getTime();
      const dataB = new Date(retiradasB[0].data_final).getTime();
      return dataB - dataA; // Ordem decrescente
    });
  
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

  if (loading || loadingGrafico || loadingGraficoPizza || loadingHistorico || loadingTempo) return <p>Carregando usuário...</p>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Usuário: {usuario?.nome}</h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsEditModalOpen(true)}>Editar Dados</Button>
            <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>Excluir Usuário</Button>
          </div>
        </div>

        <div className="flex justify-between items-center justify-center gap-10">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Detalhes do Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Nome:</strong> {usuario?.nome}</p>
              <p><strong>Email:</strong> {usuario?.email}</p>
            </CardContent>
          </Card>

          <Card className="w-1/5 text-center">
            <CardHeader>
              <CardTitle>Tempo gasto por Peça em média</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{formatarTempo(tempoMedio) ?? 'N/A'}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex w-full gap-10">
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
            <div className='h-full w-full flex items-center justify-center'>
              <PieChart labels={graficoPizza[tipoGraficoPizza]?.labels} data={graficoPizza[tipoGraficoPizza]?.data} nome={graficoPizza[tipoGraficoPizza]?.nome} />
            </div>
          </div>
        </div>

        <div className="w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold mb-4 flex justify-between items-center">
                {mostrarRetiradas ? "Histórico de Retiradas" : "Histórico de Produção"}
                <Button 
                  className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition'
                  onClick={() => setMostrarRetiradas(!mostrarRetiradas)}
                >
                  {mostrarRetiradas ? "Ver Produção" : "Ver Retiradas"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mostrarRetiradas ? (
                loadingHistorico ? (
                  <p className="text-gray-500">Carregando histórico...</p>
                ) : historicoRetiradas.length === 0 ? (
                  <p className="text-gray-500">Nenhuma peça retirada ainda.</p>
                ) : (
                  <div className="w-full max-h-80 overflow-y-auto">
                    <ul className="w-full p-5">

                      {/* Cabeçalho */}
                      <li key="tittle" className="border-b py-2 grid grid-cols-3 gap-4 text-left">
                        <span className="font-bold min-w-[70px]">Projeto</span>
                        <span className="font-bold min-w-[70px]">Peça (quantidade)</span>
                        <span className="font-bold min-w-[70px]">Peça Retirada em</span>                        
                      </li>

                      {historicoRetiradas.map((retirada, index) => (
                        <li key={index} className="border-b py-2 grid grid-cols-3 gap-4 text-left">
                          <span className="min-w-[100px]">{retirada.projeto}</span>
                          <span className="min-w-[100px]">{retirada.peca} ({retirada.quantidade}x)</span>
                          <span className="text-gray-500 min-w-[100px]">{new Date(retirada.data_retirou).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              ) : (
                loadingHistoricoProd ? (
                  <p className="text-gray-500">Carregando histórico...</p>
                ) : historicoProduzidas.length === 0 ? (
                  <p className="text-gray-500">Nenhuma peça produzida ainda.</p>
                ) : (
                  <div className="w-full max-h-80 overflow-y-auto">
                    <ul className="w-full p-5">
                      {/* Cabeçalho */}
                      <li key="tittle" className="border-b py-2 grid grid-cols-4 gap-4 text-left">
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
                              className="py-2 grid grid-cols-4 gap-4 text-left"
                            >
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
                )
              )}
            </CardContent>
          </Card>
        </div>

      </div>
      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Altere os dados do usuário e salve as mudanças.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input
                type="text"
                value={editData.nome}
                onChange={(e) => setEditData({ ...editData, nome: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={!!editData.app} // Converte para boolean
                onCheckedChange={(checked) => setEditData({ ...editData, app: Boolean(checked) })}
              />
              <Label>Acesso ao Aplicativo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={!!editData.site}
                onCheckedChange={(checked) => setEditData({ ...editData, site: Boolean(checked) })}
              />

              <Label>Acesso ao Site</Label>
            </div>
            <Button onClick={handleEdit}>Salvar Alterações</Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tem certeza ? Esta ação é irreversível!</DialogTitle>
            <DialogDescription className='flex'>
              Os registros deste usuário permanecerão no sistema para histórico.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Confirmar Exclusão</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default withAuth(UsuarioPage);