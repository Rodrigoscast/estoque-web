'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Cpu } from "lucide-react";

interface ProjetoProps {
  id: number;
  nome: string;
  imagem: string;
  min: number;
  max: number;
}

export default function Projeto({ id, nome, imagem, min, max }: ProjetoProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/projetos/projeto/${id}`);
  };

  // Calcula a porcentagem de progresso
  const progressPercentage = max > 0 ? Math.min((min / max) * 100, 100) : 0;

  return (
    <div 
      className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
      onClick={handleClick}
    >
      {imagem && imagem !== "" ? (
        <Image 
          src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${imagem}`} 
          alt={nome} 
          width={150} 
          height={150} 
          unoptimized
          className="rounded-md object-cover"
        />
      ) : (
        <Cpu size={80} className="text-gray-400" />
      )}
      
      <h2 className="text-lg font-semibold mt-2 text-center">{nome}</h2>
      
      {/* Barra de progresso */}
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
    </div>
  );
}
