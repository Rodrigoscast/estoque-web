'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import withAuth from '@/components/hoc/withAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import styled from 'styled-components';

const relatoriosDisponiveis = [
  { id: 'estoque-baixo', titulo: 'Relatório de Peças' },
  { id: 'variacao-peca', titulo: 'Variação de Valor das Peças' },
  { id: 'previsao', titulo: 'Previsão Financeira' },
  { id: 'projetos', titulo: 'Relatório de Projetos' }
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
            <CardHeader>
              <CardTitle>{relatorio.titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Clique para visualizar este relatório.</p>
            </CardContent>
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
