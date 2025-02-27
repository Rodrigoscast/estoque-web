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


interface GraficoType {
  labels: string[];
  data: number[];
}

interface PieChartDataType {
  labels: string[];
  data: number[];
}

function UsuarioPage() {
  const router = useRouter();
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editData, setEditData] = useState({ nome: '', email: '' });

  const [grafico, setGrafico] = useState<GraficoType>({ labels: [], data: [] });
  const [loadingGrafico, setLoadingGrafico] = useState(true);

  const [graficoPizza, setGraficoPizza] = useState<PieChartDataType>({ labels: [], data: [] });
  const [loadingGraficoPizza, setLoadingGraficoPizza] = useState(true);

  const [historicoRetiradas, setHistoricoRetiradas] = useState<{ 
    cod_pegou_peca: number;
    projeto: string;
    peca: string;
    quantidade: number;
    data_pegou: string;
  }[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(true);

  useEffect(() => {
    async function fetchUsuario() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Usuário não encontrado ou desativado');
        }
  
        const data = await response.json();
        setUsuario(data);
        setEditData({ nome: data.nome, email: data.email });
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        setTimeout(() => router.push('/usuarios'), 100); // Pequeno delay para evitar conflitos de renderização
      } finally {
        setLoading(false);
      }
    }
  
    if (id) fetchUsuario();
  }, [id, router]);

  const handleEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error('Erro ao editar usuário');

      setUsuario({ ...usuario, ...editData });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/${id}/desativar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Erro ao excluir usuário');
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/grafico/quantidades-por-usuario/${id}`, {
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
  }, [id]);

  useEffect(() => {
    async function fetchGraficoPizza() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/grafico/pizza/por-projeto/${id}`, {
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
  }, [id]);

  useEffect(() => {
    async function fetchHistoricoRetiradas() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/historico-retiradas/por-usuario/${id}`, {
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
  }, [id]);

  if (loading || loadingGrafico || loadingGraficoPizza || loadingHistorico) return <p>Carregando usuário...</p>;

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

        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Nome:</strong> {usuario?.nome}</p>
            <p><strong>Email:</strong> {usuario?.email}</p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Peças Retiradas por Dia</CardTitle>
            </CardHeader>
            <CardContent className='flex items-center justify-center h-4/5'>
              <BarChart labels={grafico.labels} data={grafico.data} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Peças por Projeto</CardTitle>
            </CardHeader>
            <CardContent className='flex items-start justify-center'>
              <PieChart labels={graficoPizza.labels} data={graficoPizza.data} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Retiradas</CardTitle>
          </CardHeader>
          <CardContent>
            {historicoRetiradas.length === 0 ? (
              <p className="text-gray-500">Nenhuma peça retirada ainda.</p>
            ) : (
              <ul className="space-y-2">
                {historicoRetiradas.map((retirada, index) => (
                  <li key={index} className="border-b py-2 flex justify-between text-sm">
                    <span className="font-semibold">{retirada.projeto}</span>
                    <span>{retirada.peca} ({retirada.quantidade}x)</span>
                    <span className="text-gray-500">{new Date(retirada.data_pegou).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
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