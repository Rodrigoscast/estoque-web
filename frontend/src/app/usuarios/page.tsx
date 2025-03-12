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
import { toast } from "react-toastify";
import { customFetch } from '@/utils/CustomFetch';
import styled from 'styled-components';

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
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    fetchUsuarios();
  }, []);

  async function fetchUsuarios() {
    try {
      const token = localStorage.getItem("token");
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
        },
      });

      const data: UsuarioType[] = await response.json()
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
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' }) },
        body: JSON.stringify({ nome, email, senha })
      });

      const data = await response.json()

      if (!response.ok) {
        toast.error(`${data.error}!`);
        throw new Error(data.error || 'Erro ao cadastrar usuário');
      }

      setSuccess('Usuário cadastrado com sucesso!');

      toast.success("Usuário cadastrado com sucesso!");

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

  const usuariosFiltrados = usuarios.filter((usuarios) =>
    usuarios.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Usuários</h1>

        {/* Botão que abre a modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <div className="flex flex-line gap-6 items-center">
            <DialogTrigger asChild>
              <Button className="bg-blue-500 text-white">Cadastrar Usuário</Button>
            </DialogTrigger>
            <StyledWrapper>
              <div className="input-container">
                <input
                  type="text"
                  name="text"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  placeholder="Pesquise um Usuário"
                  className="input"
                />
                <label className="label" htmlFor="input">Pesquisar</label>
                <div className="topline" />
                <div className="underline" />
              </div>
            </StyledWrapper>
          </div>

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
                <StyledWrapper><Input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="input2" /></StyledWrapper>
              </div>
              <div>
                <Label>Email</Label>
                <StyledWrapper><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input2" /></StyledWrapper>
              </div>
              <div>
                <Label>Senha</Label>
                <StyledWrapper><Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required className="input2" /></StyledWrapper>
              </div>
              <Button type="submit" className="w-full">Cadastrar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <p>Gerencie os usuários do sistema.</p>

      {loading ? (
        <p>Carregando usuários...</p>
      ) : usuariosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {usuariosFiltrados.map((usuario) => (
            <UsuarioCard key={usuario.cod_user} cod_user={usuario.cod_user} nome={usuario.nome} email={usuario.email} />
          ))}
        </div>
      ) : (
        <p>Nenhum usuário encontrado.</p>
      )}
    </Layout>
  );
}

const StyledWrapper = styled.div`
    
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
  

export default withAuth(Usuarios);
