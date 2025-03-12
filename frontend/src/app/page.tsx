'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/projetos");
    }

    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, [router]);


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
            },
            credentials: 'include', // Envia cookies
            body: JSON.stringify({ email, senha, rememberMe })
        });

        if (!response.ok) {
            throw new Error('Credenciais inválidas');
        }

        const { token } = await response.json();
        localStorage.setItem('token', token); // Salva o token no localStorage

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        router.push('/projetos');

    } catch (err: any) {
        setError(err.message);
    }
  };

  const handleForgotPassword = async () => {
    setForgotMessage('');
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/esqueciSenha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar email de recuperação');
      }

      setForgotMessage('Email enviado com sucesso! Verifique sua caixa de entrada.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="relative flex items-center justify-center w-4/5 h-screen">
        <div className="w-full max-w-sm bg-white">
          <div className='absolute top-0 left-0 m-5'>
            <img src="/logo.png" alt="Logo" className="w-40 mx-auto" />
          </div>
          <div>
            <form onSubmit={handleLogin} autoComplete="on">
              <div className="space-y-6">
                <div className='text-center'>
                  <h1 className="text-4xl font-bold">Bem-vindo de volta!</h1>
                  <h2 className="text-sm text-gray-500">Acesse sua conta para continuar</h2>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    placeholder='Digite seu email'
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label>Senha</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={senha}
                      placeholder="Digite sua senha"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className='flex w-full'>
                  <div className="flex items-center justify-start space-x-2 w-full">
                  <Checkbox 
                    id="permanece" 
                    checked={rememberMe} 
                    onCheckedChange={(checked) => setRememberMe(checked === true)} 
                  />
                    <label
                      htmlFor="permanece"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Permanecer Logado
                    </label>
                  </div>
                  {/* 🔹 Botão para abrir o modal */}
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <div className="text-blue-500 text-sm w-full flex justify-end font-bold cursor-pointer">
                        Esqueceu sua Senha?
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Esqueci minha senha</DialogTitle>
                        <DialogDescription>Digite seu e-mail para receber as instruções de recuperação</DialogDescription>
                      </DialogHeader>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={forgotEmail}
                          placeholder="Digite seu email"
                          onChange={(e) => setForgotEmail(e.target.value)}
                          required
                        />
                      </div>
                      {forgotMessage && <p className="text-green-500 text-sm">{forgotMessage}</p>}
                      {error && <p className="text-red-500 text-sm">{error}</p>}
                      <Button onClick={handleForgotPassword} className="w-full">Enviar</Button>
                    </DialogContent>
                  </Dialog>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center w-full h-screen">
        <img src="/background.jpg" alt="Logo" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
