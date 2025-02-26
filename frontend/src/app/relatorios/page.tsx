'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import withAuth from '@/components/hoc/withAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const relatoriosDisponiveis = [
  { id: 'estoque-baixo', titulo: 'Peças com Estoque Baixo' },
  { id: 'movimentacoes', titulo: 'Movimentações de Peças' },
  { id: 'mais-utilizadas', titulo: 'Peças Mais Utilizadas' },
  { id: 'historico', titulo: 'Histórico de Alterações' }
];

function RelatoriosPage() {
  const router = useRouter();
  const [filtro, setFiltro] = useState('');
  
  const relatoriosFiltrados = relatoriosDisponiveis.filter((relatorio) =>
    relatorio.titulo.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <Layout>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <Input
          type="text"
          placeholder="Filtrar relatórios..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-64 bg-white"
        />
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

export default withAuth(RelatoriosPage);
