'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Layout from '@/components/Layout';
import withAuth from '@/components/hoc/withAuth';
import { customFetch } from '@/utils/CustomFetch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Compra {
  id: number;
  data_compra: string;
  nome: string;
  quantidade: number;
  valor: number;
}

function RelatorioComprasPorPeriodo() {
    const [dataInicio, setDataInicio] = useState<Date | null>(null);
    const [dataFim, setDataFim] = useState<Date | null>(null);
    const [open, setOpen] = useState(false);
    const [compras, setCompras] = useState<Compra[]>([]);

    const buscarRelatorio = async () => {
        if (!dataInicio || !dataFim) {
            alert("Selecione um intervalo válido!");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/relatorios/compras_por_periodo?dataInicio=${dataInicio.toISOString()}&dataFim=${dataFim.toISOString()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
                },
            });

            if (!response.ok) throw new Error("Erro ao buscar dados");

            const data = await response.json();
            console.log(data)
            setCompras(data);
        } catch (error) {
            console.error(error);
        }
    };

    const formatarValor = (valor: number) => {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
    };

    const handleDateChange = (date: any) => {
      if (!dataInicio || (dataInicio && dataFim)) {
        setDataInicio(date);
        setDataFim(null);
      } else {
        setDataFim(date);
        setOpen(false);
      }
    };
  
    const imprimirRelatorio = () => {
      const relatorio = document.getElementById("relatorio-pecas");
      if (!relatorio) {
        alert("Elemento do relatório não encontrado!");
        return;
      }

      const printContent = relatorio.innerHTML;
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = `
        <h1 style='text-align: center; font-size: 24px; margin-bottom: 6px;'>Relatório de Peças</h1>
        ${printContent}
      `;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    };


    return (
        <Layout>
            <div className="p-4">
              <div className="flex items-center gap-4 mb-4 justify-between">
                <div className="flex gap-4">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        {dataInicio && dataFim
                          ? `${format(dataInicio, "dd/MM/yyyy", { locale: ptBR })} - ${format(dataFim, "dd/MM/yyyy", { locale: ptBR })}`
                          : "Selecionar Período"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={dataInicio || dataFim || undefined}
                        onSelect={handleDateChange}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button onClick={buscarRelatorio}>
                      Gerar Relatório
                  </Button>
                </div>

                <Button onClick={imprimirRelatorio} className="bg-blue-500 text-white">
                  Imprimir Relatório
                </Button>
              </div>

                <div id="relatorio-pecas" className="border p-2 rounded-md">
                  {compras.length > 0 && (
                    <div id="relatorio-pecas">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-bold">Data</TableHead>
                            <TableHead className="font-bold">Peça</TableHead>
                            <TableHead className="font-bold">Quantidade</TableHead>
                            <TableHead className="font-bold">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {compras.map((compra) => (
                            <TableRow key={compra.id}>
                              <TableCell>{compra.data_compra}</TableCell>
                              <TableCell>{compra.nome}</TableCell>
                              <TableCell>{compra.quantidade}</TableCell>
                              <TableCell>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(compra.valor)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
            </div>
        </Layout>
    );
}

export default withAuth(RelatorioComprasPorPeriodo);
