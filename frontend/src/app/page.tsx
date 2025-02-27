'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/projetos");
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' }) 
        },
        body: JSON.stringify({ email, senha })
      });
      
      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      router.push('/projetos');
    } catch (err) {
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
            <form onSubmit={handleLogin}>
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
