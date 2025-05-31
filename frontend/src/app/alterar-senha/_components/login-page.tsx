'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [senha, setPassword] = useState('');
  const [senha2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = searchParams.get('token');
      setToken(t);
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (senha !== senha2) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    const token = searchParams.get('token');
    if (!token) {
      toast.error('Token inválido ou expirado');
      return;
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/redefineSenha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: senha })
      });
      
      if (!response.ok) {
        toast.error("Erro ao redefinir senha, tente novamente");
        throw new Error('Erro ao redefinir senha');
      }

      toast.success('Senha alterada com sucesso!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message);
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Seção do formulário */}
      <div className="flex items-center justify-center w-full md:w-1/2 p-6 bg-white">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-40 mx-auto cursor-pointer" 
              onClick={() => router.push('/')} 
            />
          </div>

          {/* Formulário */}
          <form onSubmit={handleResetPassword} className="mt-6 space-y-6">
            <h1 className="text-2xl font-bold text-center">Redefinir Senha</h1>

            <div>
              <Label>Nova Senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={senha}
                  placeholder="Digite sua nova senha"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Mostrar/Esconder senha"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <Label>Confirmar Senha</Label>
              <div className="relative">
                <Input
                  type={showPassword2 ? "text" : "password"}
                  value={senha2}
                  placeholder="Confirme sua senha"
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  onClick={() => setShowPassword2(!showPassword2)}
                  aria-label="Mostrar/Esconder confirmação de senha"
                >
                  {showPassword2 ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button type="submit" className="w-full">
              Redefinir Senha
            </Button>
          </form>
        </div>
      </div>

      {/* Seção do background */}
      <div className="hidden md:flex items-center justify-center w-1/2">
        <img 
          src="/background.jpg" 
          alt="Imagem de fundo" 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
