'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import withAuth from '@/components/hoc/withAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { customFetch } from '@/utils/CustomFetch';

function RelatorioProjetos() {
  const [projetos, setProjetos] = useState([]);
  const [subprojetos, setSubprojetos] = useState({});
  const [loading, setLoading] = useState(true);
  const [mostrarConcluidos, setMostrarConcluidos] = useState(false);
  const [mostrarSubprojetos, setMostrarSubprojetos] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    async function fetchProjetos() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos?concluidos=${mostrarConcluidos}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
          },
        });
        const data = await response.json();
        setProjetos(data);

        // Buscar subprojetos para cada projeto
        data.forEach(projeto => fetchSubprojetos(projeto.cod_projeto));
      } catch (error) {
        console.error("Erro ao buscar projetos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjetos();
  }, [mostrarConcluidos]);

  async function fetchSubprojetos(projetoId) {
    try {
      const token = localStorage.getItem("token");
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${projetoId}/pecas`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
        },
      });
      const data = await response.json();
      setSubprojetos(prev => ({ ...prev, [projetoId]: data }));
    } catch (error) {
      console.error("Erro ao buscar subprojetos:", error);
    }
  }

  const imprimirRelatorio = () => {
    const printContent = document.getElementById('relatorio-projetos').innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = `<h1 style='text-align: center; font-size: 24px; margin-bottom: 6px;'>Relatório de Projetos</h1>` + printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const projetosFiltrados = projetos.filter(projeto => 
    projeto.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    (mostrarSubprojetos && subprojetos[projeto.cod_projeto]?.some(sub => sub.nome.toLowerCase().includes(filtro.toLowerCase())))
  );

  console.log(projetosFiltrados)

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Relatório de Projetos</h1>
      
      <div className="flex items-center gap-4 mb-6 w-full justify-between">
        <div className='flex w-full flex-col gap-1'>
          <Label>Filtrar por nome</Label>
          <Input type="text" value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Digite o nome do projeto" />
        </div>
        <div className='flex w-full items-center gap-2 justify-center'>
          <Label>Mostrar concluídos</Label>
          <Switch checked={mostrarConcluidos} onCheckedChange={setMostrarConcluidos} />
        </div>
        <div className='flex w-full items-center gap-2 justify-center'>
          <Label>Mostrar subprojetos</Label>
          <Switch checked={mostrarSubprojetos} onCheckedChange={setMostrarSubprojetos} />
        </div>
        <Button onClick={imprimirRelatorio} className='flex w-3/5' >Imprimir</Button>
      </div>
      
      {loading ? (
        <p>Carregando projetos...</p>
      ) : (
        <div id='relatorio-projetos'>
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2">Nome</th>
                      <th className="border p-2">Peças Totais</th>
                      <th className="border p-2">Peças Atuais</th>
                      <th className="border p-2">Data Entrada</th>
                      <th className="border p-2">Data Entrega</th>
                      <th className="border p-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {projetosFiltrados.map((projeto) => (
                    <tr key={projeto.cod_projeto} className="border">
                        <td className="border p-2 font-bold">{projeto.nome}</td>
                        <td className="border p-2 font-bold">{projeto.pecas_totais}</td>
                        <td className="border p-2 font-bold">{projeto.pecas_atuais}</td>
                        <td className="border p-2 font-bold">{projeto.data_entrada || '-'}</td>
                        <td className="border p-2 font-bold">{projeto.data_entrega || '-'}</td>
                        <td className="border p-2 font-bold">{projeto.concluido ? 'Concluído' : 'Em andamento'}</td>
                    </tr>
                    ))}

                    {mostrarSubprojetos && projetosFiltrados.flatMap((projeto) => (
                    subprojetos[projeto.cod_projeto]?.map((sub) => (
                        <tr key={`sub-${projeto.cod_projeto}-${sub.cod_projeto}`} className="border text-gray-600">
                        <td className="border p-2 pl-6">↳ {sub.nome}</td>
                        <td className="border p-2">{sub.pecas_totais}</td>
                        <td className="border p-2">{sub.pecas_atuais}</td>
                        <td className="border p-2"></td>
                        <td className="border p-2"></td>
                        <td className="border p-2">{sub.concluido ? 'Concluído' : 'Em andamento'}</td>
                        </tr>
                    ))
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </Layout>
  );
}

export default withAuth(RelatorioProjetos);
