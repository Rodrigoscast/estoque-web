'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import withAuth from '@/components/hoc/withAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function RelatorioPecasMaisUtilizadas() {
  const [pecas, setPecas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ dataInicio: '', dataFim: '', ordem: 'desc' });

  useEffect(() => {
    async function fetchPecas() {
      try {
        const token = localStorage.getItem("token");
        const query = new URLSearchParams(filtros).toString();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/relatorios/pecas-mais-utilizadas?${query}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setPecas(data);
      } catch (error) {
        console.error('Erro ao buscar relatório:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPecas();
  }, [filtros]);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Relatório - Peças Mais Utilizadas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label>Data Início</Label>
          <Input type="date" value={filtros.dataInicio} onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })} />
        </div>
        <div>
          <Label>Data Fim</Label>
          <Input type="date" value={filtros.dataFim} onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })} />
        </div>
        <div>
          <Label>Ordenar por</Label>
          <Select value={filtros.ordem} onValueChange={(value) => setFiltros({ ...filtros, ordem: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Mais utilizadas</SelectItem>
              <SelectItem value="asc">Menos utilizadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <p>Carregando relatório...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pecas.map((peca) => (
            <Card key={peca.cod_peca}>
              <CardHeader>
                <CardTitle>{peca.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Quantidade utilizada: {peca.total_utilizada}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default withAuth(RelatorioPecasMaisUtilizadas);
