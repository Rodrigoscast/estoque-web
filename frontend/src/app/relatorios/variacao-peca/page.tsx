'use client';

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import Layout from '@/components/Layout';
import withAuth from '@/components/hoc/withAuth';
import { customFetch } from '@/utils/CustomFetch';

interface Peca {
  cod_peca: number;
  nome: string;
  precos: {
    mes: string; // formato "YYYY-MM"
    preco: number;
  }[];
}

function RelatorioVariacaoPrecos() {
    const [pecas, setPecas] = useState<Peca[]>([]);
    const [pecasSelecionadas, setPecasSelecionadas] = useState<string[]>([]);
    const [dadosGrafico, setDadosGrafico] = useState<Record<string, any>[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const token = localStorage.getItem("token");

                const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/relatorios/variacao_precos`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                        ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
                    },
                });

                if (!response.ok) throw new Error("Erro ao buscar dados");
                const data: Peca[] = await response.json();

                // Filtrar apenas peças que têm histórico
                const pecasComHistorico = data.filter(peca => peca.precos.length > 0);
                setPecas(pecasComHistorico);
            } catch (error) {
                console.error(error);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        setDadosGrafico(formatarDadosParaGrafico());
    }, [pecasSelecionadas]);

    const handleSelectChange = (selected: string | string[]) => {
        setPecasSelecionadas(Array.isArray(selected) ? selected : [selected]);
    };

    const formatarNomeMes = (dataString: string) => {
        const [ano, mes] = dataString.split("-"); // "YYYY-MM"
        const data = new Date(Number(ano), Number(mes) - 1);
        return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(data);
    };

    const formatarValor = (valor: number) => {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
    };

    const formatarDadosParaGrafico = () => {
        const meses: Record<string, any> = {};

        pecasSelecionadas.forEach((codPeca) => {
            const peca = pecas.find((p) => p.cod_peca.toString() === codPeca);
            if (peca && peca.precos.length > 0) {
                peca.precos.forEach(({ mes, preco }) => {
                    const nomeMes = formatarNomeMes(mes);

                    if (!meses[nomeMes]) meses[nomeMes] = { mes: nomeMes };
                    meses[nomeMes][peca.nome] = preco;
                });
            }
        });

        return Object.values(meses);
    };

    return (
        <Layout>
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Variação de Preços das Peças</h2>
                <Select onValueChange={handleSelectChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione as peças" />
                    </SelectTrigger>
                    <SelectContent>
                        {pecas.map((peca) => (
                            <SelectItem key={peca.cod_peca} value={peca.cod_peca.toString()}>
                                {peca.nome}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {dadosGrafico.length > 0 ? (
                    <div className="w-full h-96 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dadosGrafico} className="p-2">
                                <XAxis dataKey="mes" />
                                <YAxis tickFormatter={formatarValor} />
                                <Tooltip formatter={(value) => formatarValor(value as number)} />
                                <Legend />
                                {pecasSelecionadas.map((codPeca) => {
                                    const peca = pecas.find(p => p.cod_peca.toString() === codPeca);
                                    return (
                                        peca && (
                                            <Line key={peca.nome} type="monotone" dataKey={peca.nome} stroke="#8884d8" />
                                        )
                                    );
                                })}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="mt-4 text-gray-500">Nenhuma peça selecionada possui histórico de preços.</p>
                )}
            </div>
        </Layout>
    );
}

export default withAuth(RelatorioVariacaoPrecos);
