'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import withAuth from "@/components/hoc/withAuth";
import UsuarioCard from "@/components/UsuarioCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

// Definição do tipo do usuário
interface UsuarioType {
    cod_user: number;
  nome: string;
  email: string;
}

function Usuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioType[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  async function fetchUsuarios() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data: UsuarioType[] = await response.json();
      if (!response.ok) throw new Error("Erro ao buscar usuários");

      setUsuarios(data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cadastrar usuário');
      }

      setSuccess('Usuário cadastrado com sucesso!');

      // Atualiza a lista de usuários adicionando o novo usuário
      const novoUsuario = { cod_user: data.cod_user, nome, email }; // Assume que o backend retorna o ID
      setUsuarios((prevUsuarios) => [...prevUsuarios, novoUsuario]);

      // Reseta o formulário e fecha o modal
      setTimeout(() => {
        setOpen(false);
        setNome('');
        setEmail('');
        setSenha('');
        setSuccess('');
      }, 1500);
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Usuários</h1>

        {/* Botão que abre a modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 text-white">Cadastrar Usuário</Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastro de Usuário</DialogTitle>
              <DialogDescription>
                Confirme os dados do usuário antes de cadastrar.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCadastro} className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label>Senha</Label>
                <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}
              <Button type="submit" className="w-full">Cadastrar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <p>Gerencie os usuários do sistema.</p>

      {loading ? (
        <p>Carregando usuários...</p>
      ) : usuarios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {usuarios.map((usuario) => (
            <UsuarioCard key={usuario.cod_user} cod_user={usuario.cod_user} nome={usuario.nome} email={usuario.email} />
          ))}
        </div>
      ) : (
        <p>Nenhum usuário encontrado.</p>
      )}
    </Layout>
  );
}

export default withAuth(Usuarios);
