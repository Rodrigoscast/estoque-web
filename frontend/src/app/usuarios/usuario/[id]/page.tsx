'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function UsuarioPage() {
  const router = useRouter();
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ nome: '', email: '' });

  useEffect(() => {
    async function fetchUsuario() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/${id}`);
        const data = await response.json();
        setUsuario(data);
        setEditData({ nome: data.nome, email: data.email });
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchUsuario();
  }, [id]);

  const handleEdit = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/${id}`, {
        method: 'DELETE',
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
          <Button variant="destructive" onClick={handleDelete}>Excluir Usuário</Button>
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
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <Card>
          <CardHeader>
            <CardTitle>Editar Usuário</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </Modal>
    </Layout>
  );
}
