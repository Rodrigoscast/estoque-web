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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Categoria {
    cod_categoria: number;
    nome: string;
    quantidade_pecas: number;
}

interface Peca {
    cod_peca: number;
    nome: string;
    quantidade: number;
    cod_categoria: number;
    valor: number;
    imagem?: string;
    quantidade_prevista: number;
    quantidade_executavel: number;
    tempo: number;
}

function RelatorioPecas() {
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');
    const [estoqueBaixo, setEstoqueBaixo] = useState(false);
    const [mostrarCores, setmostrarCores] = useState(false);
    const [maisUsadas, setMaisUsadas] = useState(false);
    const [estoque, setEstoque] = useState(false);
    const [mesesSelecionados, setMesesSelecionados] = useState("1");
    const [pecas, setPecas] = useState<Peca[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
    const [retiradas, setRetiradas] = useState<Peca[]>([]);
    const [tempoRetiradas, setTempoRetiradas] = useState("1");

    useEffect(() => {
        async function fetchRetiradas() {
            try {
                const token = localStorage.getItem("token");
                const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pegou_peca/retiradas?tempo=${tempoRetiradas}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                        ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === "true" && { "ngrok-skip-browser-warning": "true" }),
                    },
                });
    
                if (!response.ok) throw new Error("Erro ao buscar retiradas");
    
                const retiradasData = await response.json();
    
                setRetiradas(retiradasData);

            } catch (error) {
                console.error(error);
            }
        }    
        fetchRetiradas();
    }, [tempoRetiradas]); // Atualiza quando o tempo mudar
    

    useEffect(() => {
        async function fetchData() {
        try {
            const token = localStorage.getItem("token");

            // Buscar peças
            const pecasResponse = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/pecas`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === "true" && { "ngrok-skip-browser-warning": "true" }),
            },
            });

            if (!pecasResponse.ok) throw new Error("Erro ao buscar peças");
            let pecasData: Peca[] = await pecasResponse.json();

            // Buscar categorias
            const categoriasResponse = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/categorias`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === "true" && { "ngrok-skip-browser-warning": "true" }),
            },
            });

            if (!categoriasResponse.ok) throw new Error("Erro ao buscar categorias");
            let categoriasData: Categoria[] = await categoriasResponse.json();

            // Buscar previsão de estoque
            const previsaoResponse = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/relatorios/previsao-estoque?meses=1`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === "true" && { "ngrok-skip-browser-warning": "true" }),
            },
            });

            if (!previsaoResponse.ok) throw new Error("Erro ao buscar previsão de estoque");
            const previsaoData = await previsaoResponse.json();

            // Criar dicionário de previsão
            const previsaoDict = previsaoData.reduce((acc: Record<number, { quantidade_prevista: number; quantidade_executavel: number, tempo: number}>, item: any) => {
            acc[item.cod_peca] = {
                quantidade_prevista: item.quantidade_prevista,
                quantidade_executavel: item.quantidade_executavel,
                tempo: item.tempo,
            };
            return acc;
            }, {});

            // Verifica se já existe uma categoria "Não Categorizadas", se não existir, cria uma
            let categoriaNaoCategorizada = categoriasData.find((c) => c.nome === "Não Categorizadas");

            if (!categoriaNaoCategorizada) {
            categoriaNaoCategorizada = {
                cod_categoria: -1, // Um ID temporário, você pode trocar por um ID válido do banco
                nome: "Não Categorizadas",
                quantidade_pecas: 0,
            };
            categoriasData.push(categoriaNaoCategorizada);
            }

            let qtdNaoCategorizadas = 0; // Contador para peças sem categoria

            // Atualizar peças com previsão de estoque e atribuir categoria correta
            pecasData = pecasData.map((peca) => {
            const isSemCategoria = peca.cod_categoria === null;
            if (isSemCategoria) qtdNaoCategorizadas++; // Incrementa contador

            return {
                ...peca,
                cod_categoria: isSemCategoria ? categoriaNaoCategorizada!.cod_categoria : peca.cod_categoria,
                quantidade_prevista: previsaoDict[peca.cod_peca]?.quantidade_prevista || 0,
                quantidade_executavel: previsaoDict[peca.cod_peca]?.quantidade_executavel || 0,
                tempo: previsaoDict[peca.cod_peca]?.tempo || 0,
            };
            });

            // Atualiza a quantidade de peças na categoria "Não Categorizadas"
            categoriaNaoCategorizada.quantidade_pecas += qtdNaoCategorizadas;

            setCategorias([...categoriasData]); // Atualiza categorias no estado
            setPecas(pecasData); // Atualiza peças no estado

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
        }

        fetchData();
    }, []);

    const imprimirRelatorio = () => {
        const relatorioElement = document.getElementById('relatorio-pecas');
      
        if (!relatorioElement) {
          console.error("Elemento 'relatorio-pecas' não encontrado!");
          return;
        }
      
        const printContent = relatorioElement.innerHTML;
        const originalContent = document.body.innerHTML;
      
        document.body.innerHTML = `
          <h1 style="text-align: center; font-size: 24px; margin-bottom: 6px;">
            Relatório de Peças
          </h1>
          ${printContent}
        `;
      
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
      };

  const getCardColor = (quantidade: number, quantidade_prevista: number, quantidade_executavel: number) => {
    if (quantidade_prevista <= quantidade_executavel){
      if (quantidade >= 2 * quantidade_executavel) return "bg-green-500/70 text-white"; // Acima do ideal
      if (quantidade > quantidade_executavel) return "bg-green-300/70"; // Levemente acima do necessário
      if (quantidade == quantidade_executavel) return "bg-white"; // Próximo do ideal
      if (quantidade >= quantidade_executavel * 0.6) return "bg-orange-400/70 text-white"; // Um pouco abaixo do necessário
      if (quantidade >= quantidade_executavel * 0.3) return "bg-red-500/70 text-white"; // Bem abaixo do necessário
      return "bg-red-700/70 text-white"; // Estoque crítico
    } else {
      if (quantidade > quantidade_prevista) return "bg-green-500/70 text-white"; // Acima do ideal
      if (quantidade == quantidade_prevista * 0.8) return "bg-green-300/70"; // Levemente acima do necessário
      if (quantidade >= quantidade_executavel) return "bg-white"; // Próximo do ideal
      if (quantidade >= quantidade_executavel * 0.6) return "bg-orange-400/70 text-white"; // Um pouco abaixo do necessário
      if (quantidade >= quantidade_executavel * 0.3) return "bg-red-500/70 text-white"; // Bem abaixo do necessário
      return "bg-red-700/70 text-white"; // Estoque crítico
    }
  };

  const pecasFiltradas = pecas
    .filter((peca) => {
        const cor = getCardColor(peca.quantidade, peca.quantidade_prevista, peca.quantidade_executavel);
        const pertenceEstoqueBaixo = estoqueBaixo 
            ? ["bg-orange-400/70 text-white", "bg-red-500/70 text-white", "bg-red-700/70 text-white"].includes(cor)
            : true;

        const pertenceCategoria = categoriaSelecionada && categoriaSelecionada !== "todas"
            ? String(peca.cod_categoria) === categoriaSelecionada
            : true;

        return pertenceEstoqueBaixo && pertenceCategoria;
    })
    .map((peca) => {
        const comprado = retiradas.find(ret => ret.cod_peca === peca.cod_peca);
        return {
            ...peca,
            compradoQuantidade: comprado ? Number(comprado.quantidade) : 0
        };
    })
    .sort((a, b) => {
        if (maisUsadas) {
            return b.compradoQuantidade - a.compradoQuantidade; // Ordena pelo mais retirado
        }
        if (estoque) {
            return b.quantidade - a.quantidade; // Ordena pelo estoque
        }
        return 0;
    });

    // Função para formatar tempo em dias, horas, minutos e segundos
  const formatarTempo = (segundos: number) => {
    const dias = Math.floor(segundos / 86400);
    const horas = Math.floor((segundos % 86400) / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segundosRestantes = Math.floor(segundos % 60);

    let resultado = [];

    if (dias > 0) resultado.push(`${dias}d`);
    if (horas > 0 || dias > 0) resultado.push(`${horas}h`);
    if (minutos > 0 || horas > 0 || dias > 0) resultado.push(`${minutos}m`);
    if (segundosRestantes > 0 || resultado.length === 0) resultado.push(`${segundosRestantes}s`);

    return resultado.join(" ");
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Relatório de Peças</h1>

      <div className="flex items-center gap-4 mb-6 w-full justify-between">
        <div className='flex flex-col w-full gap-6'>
            <div className='flex flex-line items-center justify-between border-b-2 pb-2'>
                <div className='flex w-full flex-col gap-1'>
                  <Label>Filtrar por nome</Label>
                  <Input className='bg-white' type="text" value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Digite o nome da peça" />
                </div>
                <div className='flex w-full items-center gap-2 justify-center'>
                    <Label>Mostrar Cores</Label>
                    <Switch
                        checked={mostrarCores}
                        onCheckedChange={() => {
                            setmostrarCores(!mostrarCores);
                        }}
                    />
                </div>
                <div className='flex w-full items-center gap-2 justify-center'>
                    <Label>Estoque Baixo</Label>
                    <Switch
                        checked={estoqueBaixo}
                        onCheckedChange={() => {
                            setEstoqueBaixo(!estoqueBaixo);
                            if (!estoqueBaixo) {
                                setMaisUsadas(false);
                            }
                        }}
                    />
                </div>
                
                <div className='flex w-full items-center gap-2 justify-center'>
                    <Label>Quantidade de Meses</Label>
                    <Select onValueChange={setMesesSelecionados} value={mesesSelecionados}>
                        <SelectTrigger className="w-[150px] bg-white">
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i + 1} value={String(i + 1)}>{i + 1} {i === 0 ? "mês" : "meses"}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className='flex w-full items-center gap-2 justify-center'>
                    <Label>Categoria</Label>
                    <Select onValueChange={setCategoriaSelecionada} value={categoriaSelecionada}>
                        <SelectTrigger className="w-[200px] bg-white">
                            <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todas">Todas</SelectItem>
                            {categorias.map((categoria) => (
                                <SelectItem key={categoria.cod_categoria} value={String(categoria.cod_categoria)}>{categoria.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className='flex flex-line justify-center'>
                <div className='flex justify-center w-2/5 border-2 border-gray-400 p-2'>
                    <h2 className='flex w-full items-center justify-start'>Ordenar Peças Por:</h2>
                    <div className='flex w-full items-center gap-2 justify-start'>
                        <Label>Filtrar por Mais Usadas</Label>
                        <Switch
                            checked={maisUsadas}
                            onCheckedChange={() => {
                                setMaisUsadas(!maisUsadas);
                                if(!maisUsadas){
                                    setEstoque(false)
                                }
                            }}
                        />
                    </div>
                    
                    <div className='flex w-full items-center gap-2 justify-start'>
                        <Label>Filtrar por Maior Estoque</Label>
                        <Switch
                            checked={estoque}
                            onCheckedChange={() => {
                                setEstoque(!estoque);
                                if(!estoque){
                                    setMaisUsadas(false)
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>

        <Button onClick={imprimirRelatorio} className='flex w-1/5'>Imprimir</Button>
      </div>

      {loading ? (
        <div id="relatorio-pecas">
            <p>Carregando peças...</p>
        </div>
      ) : (
        <div id="relatorio-pecas" className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className='font-bold'>Nome da Peça</TableHead>
                <TableHead className='font-bold'>Quantidade em Estoque</TableHead>
                <TableHead className='font-bold'>{mesesSelecionados == '1' ? "Comprado no último mês" : `Comprado nos últimos ${mesesSelecionados} meses`}</TableHead>
                <TableHead className='font-bold'>Tempo / Valor por Peça</TableHead>
                <TableHead className='font-bold'>Categoria</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {pecasFiltradas.map((peca) => {
                    const categoria = categorias.find(cat => cat.cod_categoria === peca.cod_categoria);
                    const comprado = retiradas.find(cat => cat.cod_peca === peca.cod_peca);
                    const corDeFundo = mostrarCores 
                        ? getCardColor(peca.quantidade, peca.quantidade_prevista, peca.quantidade_executavel) 
                        : "";

                    return (
                        <TableRow key={peca.cod_peca} className={corDeFundo}>
                        <TableCell>{peca.nome}</TableCell>
                        <TableCell>{peca.quantidade}</TableCell>
                        <TableCell>{comprado ? comprado.quantidade : "0"}</TableCell>
                        {categoria?.cod_categoria == 1? (
                            <TableCell>R${peca.valor.toFixed(2)}</TableCell>
                        ): (
                            <TableCell>{formatarTempo(peca.tempo)}</TableCell>
                        )}                        
                        <TableCell>{categoria ? categoria.nome : "Sem categoria"}</TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
            </Table>
        </div>
        )}
    </Layout>
  );
}

export default withAuth(RelatorioPecas);