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

function UsuarioPage() {
  const router = useRouter();
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editData, setEditData] = useState({ nome: '', email: '' });

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

  if (loading) return <p>Carregando usuário...</p>;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Usuário: {usuario?.nome}</h1>
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

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Gráficos</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Aqui vão os gráficos futuramente.</p>
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