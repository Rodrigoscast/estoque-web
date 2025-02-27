'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Cpu, XCircle, CheckCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface ProjetoProps {
  id: number;
  nome: string;
  imagem: string;
  min: number;
  max: number;
}

export default function Projeto({ id, nome, imagem, min, max }: ProjetoProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState<"concluir" | "excluir" | null>(null);
  const [erroModalOpen, setErroModalOpen] = useState(false);
  const [sucessoModalOpen, setSucessoModalOpen] = useState<"concluir" | "excluir" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = (event: React.MouseEvent) => {
    if (menuOpen || modalTipo) {
      event.stopPropagation();
      return;
    }
    router.push(`/projetos/projeto/${id}`);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setMenuOpen(true);
  };

  const handleOptionClick = (tipo: "concluir" | "excluir", event: React.MouseEvent) => {
    event.stopPropagation();
    setModalTipo(tipo);
    setMenuOpen(false);
  };

  const handleCloseModal = (event: React.MouseEvent) => {
    event.stopPropagation();
    setModalTipo(null);
  };

  const handleConcluirProjeto = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (min !== max) {
      setModalTipo(null);
      setErroModalOpen(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${id}/concluir`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
        },
      });

      if (!response.ok) throw new Error("Erro ao concluir projeto");

      setModalTipo(null);
      setSucessoModalOpen("concluir"); // Abre a modal de sucesso
    } catch (error) {
      console.error(error);
      setErroModalOpen(true);
    }
  };

  const handleExcluirProjeto = async (event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${id}/desativar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
        },
      });

      if (!response.ok) throw new Error("Erro ao excluir projeto");

      setModalTipo(null);
      setSucessoModalOpen("excluir"); // Abre a modal de sucesso
    } catch (error) {
      console.error(error);
      setErroModalOpen(true);
    }
  };

  const progressPercentage = max > 0 ? Math.min((min / max) * 100, 100) : 0;

  return (
    <div 
      className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition justify-end relative"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
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
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-600 mt-1 text-center">
          {min} / {max}
        </div>
      </div>

      {menuOpen && (
        <div ref={menuRef} className="absolute right-2 top-2 bg-white border rounded-md shadow-lg z-10">
          <button 
            className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
            onClick={(event) => handleOptionClick("concluir", event)}
          >
            Concluir Projeto
          </button>
          <button 
            className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left text-red-500"
            onClick={(event) => handleOptionClick("excluir", event)}
          >
            Excluir Projeto
          </button>
        </div>
      )}

      {modalTipo && (
        <Dialog open={!!modalTipo} onOpenChange={handleCloseModal}>
          <DialogContent onClick={(event) => event.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>
                {modalTipo === "concluir" ? "Concluir Projeto" : "Excluir Projeto"}
              </DialogTitle>
            </DialogHeader>
            <p>
              {modalTipo === "concluir"
                ? "Tem certeza de que deseja concluir este projeto? Todas as peças devem ser retiradas."
                : "Tem certeza de que deseja excluir este projeto? Esta ação não pode ser desfeita."}
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseModal}>Cancelar</Button>
              <Button
                className={modalTipo === "concluir" ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}
                onClick={modalTipo === "concluir" ? handleConcluirProjeto : handleExcluirProjeto}
              >
                {modalTipo === "concluir" ? "Finalizar" : "Excluir"}
              </Button>

            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de erro */}
      {erroModalOpen && (
        <Dialog open={erroModalOpen} onOpenChange={() => {
          setErroModalOpen(false);
          handleCloseModal;
        }}>
          
          <DialogContent className="text-center">
            <DialogHeader>
              <DialogTitle><XCircle className="text-red-500 w-24 h-24 mx-auto mb-2" /></DialogTitle>
            </DialogHeader>
            <p>Para finalizar o projeto, todas as peças devem ser retiradas.</p>
            <DialogFooter>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de sucesso */}
      {sucessoModalOpen && (
        <Dialog open={!!sucessoModalOpen} onOpenChange={() => {
          setSucessoModalOpen(null);
          handleCloseModal;
        }}>
          <DialogContent className="text-center">
            <CheckCircle className="text-green-500 w-12 h-12 mx-auto mb-2" />
            <DialogHeader>
              <DialogTitle className="text-green-500">
                {sucessoModalOpen === "concluir" ? "Projeto Concluído" : "Projeto Excluído"}
              </DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setSucessoModalOpen(null);
                handleCloseModal;
              }}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
