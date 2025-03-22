'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import withAuth from '@/components/hoc/withAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Cog, HandCoins, CircleDollarSign } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import styled from 'styled-components';

const relatoriosDisponiveis = [
  { id: 'estoque-baixo', titulo: 'Relatório de Peças', icone: < Cog size={48} />},
  { id: 'variacao-peca', titulo: 'Variação de Valor das Peças', icone: < HandCoins size={48} /> },
  { id: 'previsao', titulo: 'Previsão Financeira', icone: < CircleDollarSign size={48} /> },
  { id: 'projetos', titulo: 'Relatório de Projetos', icone: < LayoutDashboard size={48} /> }
];

function RelatoriosPage() {
  const router = useRouter();
  const [filtro, setFiltro] = useState('');
  
  const relatoriosFiltrados = relatoriosDisponiveis.filter((relatorio) =>
    relatorio.titulo.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <Layout>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <StyledWrapper>
          <div className="input-container">
            <input
              type="text"
              name="text"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Pesquise seu Relatório"
              className="input"
            />
            <label className="label" htmlFor="input">Pesquisar</label>
            <div className="topline" />
            <div className="underline" />
          </div>
        </StyledWrapper>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatoriosFiltrados.map((relatorio) => (
          <Card
            key={relatorio.id}
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => router.push(`/relatorios/${relatorio.id}`)}
          >
            <div className='flex items-center justify-between w-full'>
              <div className='flex w-1/5 items-center justify-center'>{relatorio.icone}</div>
              <div className='flex w-full items-start justify-center flex-col'>
                <CardHeader>
                  <CardTitle>{relatorio.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Clique para visualizar este relatório.</p>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>
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
  }`;

export default withAuth(RelatoriosPage);
