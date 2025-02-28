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

function PecasPage() {
  const router = useRouter();
  const [pecas, setPecas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pecaSelecionada, setPecaSelecionada] = useState(null);
  const [quantidadeAdicionada, setQuantidadeAdicionada] = useState(0);

  useEffect(() => {
    async function fetchPecas() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pecas`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
          },
        });
        const data = await response.json();
        setPecas(data.sort((a, b) => a.nome.localeCompare(b.nome)));
      } catch (error) {
        console.error('Erro ao buscar estoque:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPecas();
  }, []);

  const handleAddQuantidade = async () => {
    if (!pecaSelecionada || quantidadeAdicionada <= 0) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pecas/${pecaSelecionada.cod_peca}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
        },
        body: JSON.stringify({ quantidade: pecaSelecionada.quantidade + quantidadeAdicionada }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar quantidade de estoque');
      
      setPecas(prevPecas => prevPecas.map(p =>
        p.cod_peca === pecaSelecionada.cod_peca ? { ...p, quantidade: p.quantidade + quantidadeAdicionada } : p
      ));
      setIsAddModalOpen(false);
      setPecaSelecionada(null);
      setQuantidadeAdicionada(0);
    } catch (error) {
      console.error(error);
    }
  };

  const getCardColor = (quantidade) => {
    if (quantidade <= 5) return "bg-red-700/70 text-white";
    if (quantidade <= 10) return "bg-red-600/70 text-white";
    if (quantidade <= 15) return "bg-red-500/70 text-white";
    if (quantidade <= 20) return "bg-red-400/70 text-white";
    if (quantidade <= 25) return "bg-red-300/70";
    return "bg-white";
  };

  if (loading) return <p>Carregando estoque...</p>;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gerenciamento de Estoque</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {pecas.map((peca) => (
          <Card 
            key={peca.cod_peca} 
            className={`${getCardColor(peca.quantidade)} cursor-pointer`} 
            onClick={() => {
              setPecaSelecionada(peca);
              setIsAddModalOpen(true);
            }}
          >
            <CardHeader>
              <CardTitle>{peca.nome}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {peca.imagem && peca.imagem !== "" ? (
                <Image 
                  src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${peca.imagem}`} 
                  alt={peca.nome} 
                  width={150} 
                  height={150} 
                  unoptimized
                  className="rounded-md object-cover w-3/5 h-auto"
                  priority
                />
              ) : (
                <Cog className="w-16 h-16 text-gray-200" />
              )}
              <p className="mt-2">Quantidade: {peca.quantidade}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Adicionar Quantidade */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Quantidade</DialogTitle>
            <DialogDescription>Adicione mais unidades para {pecaSelecionada?.nome}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Quantidade</Label>
              <Input
                type="number"
                value={quantidadeAdicionada}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 0) {
                    setQuantidadeAdicionada(value);
                  }
                }}
              />
            </div>
            <Button onClick={handleAddQuantidade}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default withAuth(PecasPage);
