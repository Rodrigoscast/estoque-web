// app/projeto/[id]/page.tsx
'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import withAuth from "@/components/hoc/withAuth";
import Image from "next/image";
import { Cpu } from "lucide-react";
import BarChart from '@/components/graficos/BarChart';

interface ProjetoType {
  cod_projeto: number;
  nome: string;
  imagem: string;
  pecas_totais: number;
  pecas_atuais: number;
  data_entrada: string;
}

function ProjetoPage() {
  const params = useParams();
  const [projeto, setProjeto] = useState<ProjetoType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchProjeto() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          // Caso não encontre o projeto, redirecione para 404 ou outra página
          // router.push("/projetos");
          return;
        }
        const data = await response.json();
        setProjeto(data);
      } catch (error) {
        console.error("Erro ao buscar projeto:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjeto();
  }, [params.id, router]);

  if (loading) return <p>Carregando projeto...</p>;
  if (!projeto) return <p>Projeto não encontrado.</p>;

  const progressPercentage = projeto.pecas_totais > 0 ? Math.min((projeto.pecas_atuais / projeto.pecas_totais) * 100, 100) : 0;

  const data = [10, 15, 20, 12, 8, 18, 22, 17, 14, 19, 25, 30, 12, 15];
  const labels = [
    '2023-06-01',
    '2023-06-02',
    '2023-06-03',
    '2023-06-04',
    '2023-06-05',
    '2023-06-06',
    '2023-06-07',
    '2023-06-08',
    '2023-06-09',
    '2023-06-10',
    '2023-06-11',
    '2023-06-12',
    '2023-06-13',
    '2023-06-14'
  ];

  return (
    <Layout>
      <div className="flex flex-col gap-10">
        <div className="flex flex-lines items-center justify-between">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4">{projeto.nome}</h1>
            {projeto.imagem && projeto.imagem !== "" ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${projeto.imagem}`}
                alt={projeto.nome}
                width={250}
                height={250}
                unoptimized
                className="rounded-md object-cover"
              />
            ) : (
              <Cpu size={150} className="text-gray-400" />
            )}
            {/* Barra de progresso */}
            <div className="w-full mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-1 text-center">
                {projeto.pecas_atuais} / {projeto.pecas_totais}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4">Relação de Peças Por Dia</h1>
            <BarChart data={data} labels={labels} />
          </div>
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4">Relação de Peças Por Usuário</h1>
          </div>
        </div>
        <div className="flex flex-lines items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-4">Peças Já Retiradas</h1>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-4">Peças Que Faltam Retirar</h1>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-4">Histórico de Peças Retiradas</h1>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(ProjetoPage);