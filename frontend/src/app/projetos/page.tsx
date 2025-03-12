'use client';

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import withAuth from "@/components/hoc/withAuth";
import Projeto from "@/components/project";
import { customFetch } from '@/utils/CustomFetch';
import styled from 'styled-components';

// Definição do tipo do projeto
interface ProjetoType {
  cod_projeto: number;
  nome: string;
  imagem: string;
  pecas_atuais: number;
  pecas_totais: number;
  ativo: boolean;
  data_entrada: string;
  data_entrega: string;
  primeira_retirada: string;
  concluido: boolean;
}

function Dashboard() {
  const [projetos, setProjetos] = useState<ProjetoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarConcluidos, setMostrarConcluidos] = useState(false);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    async function fetchProjetos() {
      try {
        const token = localStorage.getItem("token");
        const response = await customFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projetos?concluidos=${mostrarConcluidos}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
            },
          }
        );

        const data: ProjetoType[] = await response.json()
        if (!response.ok) throw new Error("Erro ao buscar projetos");

        setProjetos(data);
      } catch (error) {
        console.error("Erro ao buscar projetos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjetos();
  }, [mostrarConcluidos]);

  const projetosFiltrados = projetos.filter((projeto) =>
    projeto.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-line items-center gap-8">
          <StyledWrapper>
            <div className="checkbox-wrapper-8">
              <input
                type="checkbox"
                id="cb3-8"
                className="tgl tgl-skewed"
                checked={!mostrarConcluidos} 
                onChange={() => setMostrarConcluidos(prev => !prev)} 
              />
              <label
                htmlFor="cb3-8"
                data-tg-on="Projetos Ativos"
                data-tg-off="Projetos Concluídos"
                className="tgl-btn"
              />
            </div>
          </StyledWrapper>
        </div>

        <div className="flex gap-4">         

          <StyledWrapper>
            <div className="input-container">
              <input
                type="text"
                name="text"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Pesquise seu Projeto"
                className="input"
              />
              <label className="label" htmlFor="input">Pesquisar</label>
              <div className="topline" />
              <div className="underline" />
            </div>
          </StyledWrapper>
          
        </div>
      </div>

      {loading ? (
        <p>Carregando projetos...</p>
      ) : projetosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {projetosFiltrados.map((projeto) => (
            <Projeto
              key={projeto.cod_projeto}
              id={projeto.cod_projeto}
              nome={projeto.nome}
              imagem={projeto.imagem}
              min={projeto.pecas_atuais}
              max={projeto.pecas_totais}
              data_entrada={projeto.data_entrada}
              data_entrega={projeto.data_entrega}
              primeira_retirada={projeto.primeira_retirada}
              concluido={projeto.concluido}
            />
          ))}
        </div>
      ) : (
        <p>Nenhum projeto encontrado.</p>
      )}
    </Layout>
  );
}

export default withAuth(Dashboard);

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

  .checkbox-wrapper-8 .tgl,
    .checkbox-wrapper-8 .tgl:after,
    .checkbox-wrapper-8 .tgl:before,
    .checkbox-wrapper-8 .tgl *,
    .checkbox-wrapper-8 .tgl *:after,
    .checkbox-wrapper-8 .tgl *:before,
    .checkbox-wrapper-8 .tgl + .tgl-btn {
    box-sizing: border-box;
  }

  .checkbox-wrapper-8 .tgl::-moz-selection,
    .checkbox-wrapper-8 .tgl:after::-moz-selection,
    .checkbox-wrapper-8 .tgl:before::-moz-selection,
    .checkbox-wrapper-8 .tgl *::-moz-selection,
    .checkbox-wrapper-8 .tgl *:after::-moz-selection,
    .checkbox-wrapper-8 .tgl *:before::-moz-selection,
    .checkbox-wrapper-8 .tgl + .tgl-btn::-moz-selection,
    .checkbox-wrapper-8 .tgl::selection,
    .checkbox-wrapper-8 .tgl:after::selection,
    .checkbox-wrapper-8 .tgl:before::selection,
    .checkbox-wrapper-8 .tgl *::selection,
    .checkbox-wrapper-8 .tgl *:after::selection,
    .checkbox-wrapper-8 .tgl *:before::selection,
    .checkbox-wrapper-8 .tgl + .tgl-btn::selection {
    background: none;
  }

  .checkbox-wrapper-8 .tgl + .tgl-btn {
    outline: 0;
    display: block;
    width: 12em;
    height: 2em;
    position: relative;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .checkbox-wrapper-8 .tgl + .tgl-btn:after,
    .checkbox-wrapper-8 .tgl + .tgl-btn:before {
    position: relative;
    display: block;
    content: "";
    width: 50%;
    height: 100%;
  }

  .checkbox-wrapper-8 .tgl + .tgl-btn:after {
    left: 0;
  }

  .checkbox-wrapper-8 .tgl + .tgl-btn:before {
    display: none;
  }

  .checkbox-wrapper-8 .tgl:checked + .tgl-btn:after {
    left: 50%;
  }

  .checkbox-wrapper-8 .tgl-skewed + .tgl-btn {
    overflow: hidden;
    transform: skew(-10deg);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transition: all 0.2s ease;
    font-family: sans-serif;
    background: #888;
  }

  .checkbox-wrapper-8 .tgl-skewed + .tgl-btn:after,
    .checkbox-wrapper-8 .tgl-skewed + .tgl-btn:before {
    transform: skew(10deg);
    display: inline-block;
    transition: all 0.2s ease;
    width: 100%;
    text-align: center;
    position: absolute;
    line-height: 2em;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
  }

  .checkbox-wrapper-8 .tgl-skewed + .tgl-btn:after {
    left: 100%;
    content: attr(data-tg-on);
  }

  .checkbox-wrapper-8 .tgl-skewed + .tgl-btn:before {
    left: 0;
    content: attr(data-tg-off);
  }

  .checkbox-wrapper-8 .tgl-skewed + .tgl-btn:active {
    background: #888;
  }

  .checkbox-wrapper-8 .tgl-skewed + .tgl-btn:active:before {
    left: -10%;
  }

  .checkbox-wrapper-8 .tgl-skewed:checked + .tgl-btn {
    background: #86d993;
  }

  .checkbox-wrapper-8 .tgl-skewed:checked + .tgl-btn:before {
    left: -100%;
  }

  .checkbox-wrapper-8 .tgl-skewed:checked + .tgl-btn:after {
    left: 0;
  }

  .checkbox-wrapper-8 .tgl-skewed:checked + .tgl-btn:active:after {
    left: 10%;
  }`;