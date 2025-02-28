'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Cpu } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ProjetoProps {
  id: number;
  nome: string;
  imagem: string;
  min: number;
  max: number;
}

interface Peca {
  cod_projeto: number;
  nome: string;
  imagem: string;
}

export default function Projeto({ id, nome, imagem, min, max }: ProjetoProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [animateMenu, setAnimateMenu] = useState(false);

  useEffect(() => {
    if (modalOpen) {
      const fetchPecas = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/projetos/${id}/pecas`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
              },
            }
          );
          const data = await response.json();
          setPecas(data);
        } catch (err) {
          console.error("Erro ao buscar peças:", err);
        }
      };
  
      fetchPecas();
    }
  }, [modalOpen, id]);
  

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (menuOpen) {
      setShowMenu(true);
      timer = setTimeout(() => setAnimateMenu(true), 50); // Pequeno atraso para iniciar animação
    } else {
      setAnimateMenu(false);
      setTimeout(() => setShowMenu(false), 300); // Tempo da animação antes de esconder
    }
    return () => clearTimeout(timer);
  }, [menuOpen]);

  return (
    <div 
      className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition justify-end relative"
      onMouseEnter={() => setMenuOpen(true)}
      onMouseLeave={() => setMenuOpen(false)}
    >
      {imagem && imagem !== "" ? (
        <Image 
          src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${imagem}`} 
          alt={nome} 
          width={150} 
          height={150} 
          unoptimized
          className="rounded-md object-cover w-3/5 h-auto"
          priority
        />
      ) : (
        <Cpu size={80} className="text-gray-400 w-2/6 h-auto" />
      )}
      
      <h2 className="text-lg font-semibold mt-2 text-center">{nome}</h2>
      
      <div className="w-full mt-4">
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full" 
            style={{ width: `${Math.min((min / max) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-600 mt-1 text-center">
          {min} / {max}
        </div>
      </div>

      {showMenu && (
        <div 
          className={`absolute rounded-lg inset-0 bg-black/50 flex items-center justify-between p-4 transition-all duration-300 ease-in-out
            ${animateMenu ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white w-1/2 m-1"
            onClick={() => router.push(`/projetos/projeto/${id}`)}
          >
            Projeto
          </Button>
          <Button 
            className="bg-green-500 hover:bg-green-600 text-white w-1/2 m-1"
            onClick={() => setModalOpen(true)}
          >
            Peças
          </Button>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Peças do Projeto</DialogTitle>
          </DialogHeader>
          <ul className="space-y-2">
            {pecas.length > 0 ? (
              pecas.map((peca) => (
                <li 
                  key={peca.cod_projeto} 
                  className="p-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 flex flex-line justify-between items-center"
                  onClick={() => router.push(`/projetos/projeto/${peca.cod_projeto}`)}
                >
                  {peca.nome}

                  {peca.imagem && peca.imagem !== "" ? (
                    <Image 
                      src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${peca.imagem}`} 
                      alt={nome} 
                      width={50} 
                      height={50}
                      unoptimized
                      className="rounded-md object-cover h-auto"
                      priority
                    />
                  ) : (
                    <Cpu className="text-gray-400 h-auto" />
                  )}
                </li>
              ))
            ) : (
              <p>Nenhuma peça encontrada.</p>
            )}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}
