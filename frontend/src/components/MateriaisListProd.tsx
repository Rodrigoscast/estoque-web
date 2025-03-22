'use client';

import { useUser } from "@/contexts/UserContext";
import { useMemo } from "react";
import moment from "moment";

interface Material {
  id: number;
  nome: string;
  quantidade: number;
  data_final: string | null;
  data_inicio: string;
  cod_user: number;
  usuario_nome: string;
  produzido: number;
  cod_carrinho: number;
  comercial: number;
}

// ✅ Criamos uma nova interface que inclui o tempo de produção
interface MaterialComTempo extends Material {
  tempoEmProducao: string;
}

interface MateriaisListProps {
  materiais: Material[];
  onConcluirProducao: (id: number) => void;
}

export default function MateriaisListProd({ materiais, onConcluirProducao }: MateriaisListProps) {
  const { userCode } = useUser();

  // ✅ Processamos os materiais separando os produzidos dos não produzidos
  const { agrupados, individuais } = useMemo(() => {
    const grupos = new Map<number, MaterialComTempo[]>(); // Para os não produzidos
    const separados: MaterialComTempo[] = []; // Para os produzidos

    materiais.forEach((material) => {
        const inicio = moment.utc(material.data_inicio).format("YYYY-MM-DD HH:mm:ss");
        const agora = moment()
        
        let tempoEmProducao = "Data inválida";
        
        if (inicio) {
            const diffHoras = agora.diff(inicio, "hours");
            const diffMinutos = agora.diff(inicio, "minutes");
        
            if (diffHoras >= 24) {
            const dias = agora.diff(inicio, "days");
            tempoEmProducao = `Iniciado há ${dias} dia${dias > 1 ? "s" : ""}`;
            } else if (diffHoras >= 1) {
            tempoEmProducao = `Iniciado há ${diffHoras} hora${diffHoras > 1 ? "s" : ""}`;
            } else {
            tempoEmProducao = `Iniciado há ${diffMinutos} minuto${diffMinutos > 1 ? "s" : ""}`;
            }
        }

      const materialComTempo = { ...material, tempoEmProducao };

      if (material.produzido === 0) {
        // Agrupamos pelo cod_carrinho
        if (!grupos.has(material.cod_carrinho)) {
          grupos.set(material.cod_carrinho, []);
        }
        grupos.get(material.cod_carrinho)!.push(materialComTempo);
      } else {
        // Já produzido, então adicionamos individualmente
        separados.push(materialComTempo);
      }
    });

    return {
      agrupados: Array.from(grupos.entries()).map(([cod_carrinho, materiais]) => ({
        cod_carrinho,
        materiais
      })),
      individuais: separados
    };
  }, [materiais]);

  const corFundo = (comercial: number) => {
    if(comercial == 1){
      return 'bg-green-100'
    } else {
      return 'bg-gray-50'
    }
  }

  return (
    <div className="max-h-80 overflow-y-auto w-full">
      <ul className="space-y-3 p-4">
        {/* Materiais ainda em produção (agrupados por cod_carrinho) */}
        {agrupados.map(({ cod_carrinho, materiais }) => {
          const podeConcluir = materiais.some(mat => mat.cod_user === userCode);          

          return (
            <li
              key={`carrinho-${cod_carrinho}`}
              className="p-3 rounded-lg border border-gray-200 bg-orange-200"
            >
              <div className="flex flex-col space-y-1">
                {materiais.map((material, key) => (
                  <div key={`${material.id}-${key}`} className="flex items-center justify-between">
                    <span className="font-medium">{material.nome}</span>
                    <span className="font-medium">({material.quantidade}x)</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-2">                  
                <span className="text-gray-700 font-medium">
                  {materiais[0].usuario_nome.split(" ")[0]}
                </span>
                <span className="text-gray-600">{materiais[0].tempoEmProducao}</span>
                {podeConcluir && (
                  <button
                    onClick={() => onConcluirProducao(cod_carrinho)}
                    className="px-3 py-1 text-white bg-green-500 rounded-lg hover:bg-green-600"
                  >
                    Concluir
                  </button>
                )}
              </div>
            </li>
          );
        })}

        {/* Materiais já produzidos (listados individualmente) */}
        {individuais.map((material) => (
          <li
            key={`material-${material.id}`}
            className={`p-3 rounded-lg border border-gray-200 ${corFundo(material.comercial)}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{material.nome}</span>
              <span className="font-medium">({material.quantidade}x)</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
