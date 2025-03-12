'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Cpu } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { customFetch } from '@/utils/CustomFetch';
import styled from 'styled-components';
import { differenceInYears, differenceInMonths, differenceInDays, addYears, addMonths } from "date-fns";
import { format } from "date-fns";

interface ProjetoProps {
  id: number;
  nome: string;
  imagem: string;
  min: number;
  max: number;
  data_entrada: string;
  primeira_retirada: string;
  data_entrega: string;
  concluido: boolean;
}

interface Peca {
  cod_projeto: number;
  nome: string;
  imagem: string;
}

export default function Projeto({ id, nome, imagem, min, max, data_entrada, data_entrega, primeira_retirada, concluido }: ProjetoProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [pecas, setPecas] = useState<Peca[]>([]);

  useEffect(() => {
    if (modalOpen) {
      const fetchPecas = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await customFetch(
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
          const data = await response.json()
          setPecas(data);
        } catch (err) {
          console.error("Erro ao buscar peças:", err);
        }
      };
  
      fetchPecas();
    }
  }, [modalOpen, id]);

  const agora = new Date();
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const destinoNew = new Date();

  var primeira_data = '';

  const partes_data_entrega = data_entrega.split("-");
  const destino = new Date(
      parseInt(partes_data_entrega[0]),  // Ano
      parseInt(partes_data_entrega[1]) - 1, // Mês (JS começa do 0)
      parseInt(partes_data_entrega[2])  // Dia
  );

  // Ajustar para terminar um dia antes
  destinoNew.setTime(destino.getTime() - 24 * 60 * 60 * 1000);

  let inicio; // Declara a variável antes do if

  if (primeira_retirada) {
      const partes_data_entrada = primeira_retirada.split("-");
      inicio = new Date(
          parseInt(partes_data_entrada[0]),  // Ano
          parseInt(partes_data_entrada[1]) - 1, // Mês (JS começa do 0)
          parseInt(partes_data_entrada[2])  // Dia
      );
  } else {
  const partes_data_entrada = data_entrada.split("-");
      inicio = new Date(
      parseInt(partes_data_entrada[0]),  // Ano
      parseInt(partes_data_entrada[1]) - 1, // Mês (JS começa do 0)
      parseInt(partes_data_entrada[2])  // Dia
  );
  }

  // Agora inicio está definido corretamente e pode ser usado abaixo
  const diasTotais = differenceInDays(destinoNew, inicio);
  const diasPassados = differenceInDays(hoje, inicio);

  const pecasRestantes = max - min;  // Quantidade de peças ainda a serem produzidas
  const diasRestantes = differenceInDays(destinoNew, hoje);  // Dias que ainda restam

  // Média esperada: quantas peças por dia para terminar no tempo
  const mediaEsperada = diasRestantes > 0 ? pecasRestantes / diasRestantes : pecasRestantes;
  const mediaAtual = diasPassados > 0 ? min / diasPassados : 0;

  // Definir atrasoPercentual com base no quão abaixo está da média esperada
  let atrasoPercentual = 0;

  if (mediaEsperada > 0) {
    atrasoPercentual = Math.max(0, Math.min(1, (mediaEsperada - mediaAtual) / mediaEsperada));
  }
  
  // Se a data de entrega já passou e ainda não terminou, atraso total (100%)
  if (destinoNew < hoje && pecasRestantes > 0) {
      atrasoPercentual = 1;
  }

  // Definir cores com base no atraso
  const getCardColor = (atraso: number) => {
      if (concluido == true) return "rgba(119, 119, 119, 0.8)"; // Se estiver concluído, fica no cinza
      if (atraso === 0) return "rgba(76, 175, 79, 0.8)"; // Verde (No prazo)
      if (atraso <= 0.2) return "rgba(139, 195, 74, 0.8)"; // Amarelo-Verde (Ligeiramente atrasado)
      if (atraso <= 0.4) return "rgba(255, 235, 59, 0.8)"; // Amarelo (Atrasado moderado)
      if (atraso <= 0.6) return "rgba(255, 152, 0, 0.8)"; // Laranja (Atraso preocupante)
      if (atraso <= 0.8) return "rgba(255, 87, 34, 0.8)"; // Vermelho-Claro (Muito atrasado)
      return "rgba(244, 67, 54, 0.8)"; // Vermelho (Atraso crítico)
  };

  const cardcolor = getCardColor(atrasoPercentual);

  const calcularTempoRestante = (data: string, hoje: Date, destino: Date) => {

    if(data == null) return "em data não definida"
  
    if (destino < hoje) return "atrasada";
  
    // Calcula anos completos
    const anos = differenceInYears(destino, hoje);
    const dataMenosAnos = addYears(hoje, anos);
  
    // Calcula meses completos após subtrair os anos
    const meses = differenceInMonths(destino, dataMenosAnos);
    const dataMenosMeses = addMonths(dataMenosAnos, meses);
  
    // Calcula os dias restantes após subtrair anos e meses
    const dias = differenceInDays(destino, dataMenosMeses);
  
    // Formata a resposta
    const partes = [];
    if (anos > 0) partes.push(`${anos} ${anos === 1 ? "ano" : "anos"}`);
    if (meses > 0) partes.push(`${meses} ${meses === 1 ? "mês" : "meses"}`);
    if (dias > 0) partes.push(`${dias} ${dias === 1 ? "dia" : "dias"}`);
  
    return partes.length > 0 ? `em ${partes.join(" e ")}` : "Hoje";
  };

  function formatarData(dataSET: string) {
    const partes = dataSET.split("-");
    if (partes.length !== 3) return "Formato inválido"; // Verifica se a entrada está correta

    const [ano, mes, dia] = partes;
    return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
  }

  return (
      <StyledWrapper cardcolor={cardcolor} className="flex items-center justify-center">
        <div className="flip-card">
          <div className="flip-card-inner">
            <div className="flip-card-front">
            {imagem && imagem !== "" ? (
              <Image 
                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${imagem}`} 
                alt={nome} 
                width={1920}
                height={1080}
                sizes="100vw" 
                className="rounded-md object-cover w-full h-auto max-w-[250px]"
                priority
              />
            ) : (
                <Cpu size={80} className="text-white-400 w-2/6 h-auto" />
              )}
              
              <h2 className="text-lg font-semibold mt-2 text-center">{nome}</h2>

              {concluido == false ? (
                <h3>Entrega {calcularTempoRestante(data_entrega, hoje, destino)} - {formatarData(data_entrega)}</h3>
              ) : (
                <h3>Projeto entregue em {formatarData(data_entrega)}</h3>
              )}
              
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
            </div>
            <div className="flip-card-back">
            <div 
              className={`absolute rounded-lg bg-black bg-opacity-30 inset-0 flex transition duration-300 ease-in-out hover:bg-opacity-50`}
            >
              <Button 
                className="text-white text-md w-full h-full rounded-none bg-black/30 hover:bg-black/60 hover:text-2xl transition duration-300 ease-in-out"
                onClick={() => router.push(`/projetos/projeto/${id}`)}
              >
                Projeto
              </Button>
              <Button 
                className="text-white text-md w-full h-full rounded-none bg-black/30 hover:bg-black/60 hover:text-2xl transition duration-300 ease-in-out"
                onClick={() => setModalOpen(true)}
              >
                Peças
              </Button>
            </div>
            </div>
          </div>
        </div>

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
                        width={1920}
                        height={1080}
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
      </StyledWrapper>
  );
}

const StyledWrapper = styled.div<{ cardcolor: string }>`
  .flip-card {
    background-color: transparent;
    width: 85%;
    height: 300px;
    perspective: 1000px;
    font-family: sans-serif;
    transition: background-color 0.5s ease-in-out;
  }

  .title {
    font-size: 1.5em;
    font-weight: 900;
    text-align: center;
    margin: 0;
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }

  .flip-card:hover .flip-card-inner {
    transform: rotateY(180deg);
  }

  .flip-card-front, .flip-card-back {
    box-shadow: 0 8px 14px 0 rgba(0,0,0,0.2);
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    border-radius: 1rem;
  }
    
  .flip-card-front {
    background: linear-gradient(
      120deg, 
      rgba(245, 245, 245, 0.9) 60%, 
      rgba(238, 238, 238, 0.9) 88%, 
      rgba(224, 224, 224, 0.9) 40%, 
      rgba(224, 224, 224, 0.8) 48%, 
      ${(props) => props.cardcolor}
    );
    background-blend-mode: multiply; /* Mistura a cor com o gradiente */
    color: #333;
    padding: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1rem;
  }


   .flip-card-back {
    background: linear-gradient(120deg, #f5f5f5 60%, #eeeeee 88%, 
      #e0e0e0 40%, rgba(224, 224, 224, 0.8) 48%), 
      ${(props) => props.cardcolor}; /* Cor do atraso */
    color: #333;
    transform: rotateY(180deg);
  }`
;