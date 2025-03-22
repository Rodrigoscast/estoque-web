const cron = require('node-cron');
const moment = require('moment-timezone');
const fetch = require('node-fetch');
const sendEmail = require('../scripts/email');
require('dotenv').config();
const { Categorias, Peca, HistoricoCompras, PegouPeca, Usuario, Projeto, PecaProjeto } = require('../models/Associations');
const sequelize = require('../config/database');
const { Op, Sequelize } = require('sequelize');
const { differenceInYears, differenceInMonths, differenceInDays, addYears, addMonths } = require('date-fns');

const cronToken = process.env.CRON_JOB_TOKEN;

const startCronJobs = () => {
    console.log("Cron jobs iniciados...");

    cron.schedule('0 8 * * *', async () => {
        const agora = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');
        console.log(`Executando verificações às 08:00 (Horário de Brasília) - ${agora}`);

        await verificarEstoqueBaixo();
        await verificarProjetosPertoDaEntrega();
    }, {
        scheduled: true,
        timezone: "America/Sao_Paulo"
    });
};

async function verificarProjetosPertoDaEntrega() {
    try {
        const projetos = await Projeto.findAll({
            where: { concluido: false, ativo: true, projeto_main: 0 },
            order: [["nome", "ASC"]],
            attributes: [
                "cod_projeto",
                "nome",
                "concluido",
                "ativo",
                "imagem",
                "pecas_atuais",
                "pecas_totais",
                "data_entrada",
                "data_entrega",
                [
                    Sequelize.literal(`(
                        SELECT TO_CHAR(MIN(c.data_final), 'YYYY-MM-DD HH24:MI:SS') 
                        FROM "carrinho" AS c
                        JOIN "pegou_peca" AS pp ON pp.cod_carrinho = c.cod_carrinho
                        WHERE pp.cod_projeto = "Projeto".cod_projeto
                    )`),
                    "primeira_retirada"
                ]
            ],
            group: ["Projeto.cod_projeto"]
        });

        const agora = new Date();
        const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
        const destinoNew = new Date();

        for (const projeto of projetos) {
            if (projeto.concluido) continue;

            const partes_data_entrega = projeto.data_entrega.split("-");
            const destino = new Date(
                parseInt(partes_data_entrega[0]),
                parseInt(partes_data_entrega[1]) - 1,
                parseInt(partes_data_entrega[2])
            );

            destinoNew.setTime(destino.getTime() - 24 * 60 * 60 * 1000);

            let inicio;
            if (projeto.primeira_retirada) {
                const partes_data_entrada = projeto.primeira_retirada.split("-");
                inicio = new Date(
                    parseInt(partes_data_entrada[0]),
                    parseInt(partes_data_entrada[1]) - 1,
                    parseInt(partes_data_entrada[2])
                );
            } else {
                const partes_data_entrada = projeto.data_entrada.split("-");
                inicio = new Date(
                    parseInt(partes_data_entrada[0]),
                    parseInt(partes_data_entrada[1]) - 1,
                    parseInt(partes_data_entrada[2])
                );
            }

            const pecasRestantes = projeto.pecas_totais - projeto.pecas_atuais;

            const diasRestantes = differenceInDays(destinoNew, hoje); 
            const diasPassados = differenceInDays(hoje, inicio);

            const mediaEsperada = diasRestantes > 0 ? pecasRestantes / diasRestantes : pecasRestantes;
            const mediaAtual = diasPassados > 0 ? projeto.pecas_atuais / diasPassados : 0;

            let atrasoPercentual = 0;
            if (mediaEsperada > 0) {
                atrasoPercentual = Math.max(0, Math.min(1, (mediaEsperada - mediaAtual) / mediaEsperada));
            }

            if (destinoNew < hoje && pecasRestantes > 0) {
                atrasoPercentual = 1;
            }

            if (atrasoPercentual > 0.5) {
                await enviarAlertaProjeto(projeto, diasRestantes, pecasRestantes);
            }
        }
    } catch (error) {
        console.error("❌ Erro ao verificar projetos perto da entrega:", error);
    }
}

async function buscarPecas() {
    try {
        const pecas = await Peca.findAll({
            order: [['nome', 'ASC']],
            where: { cod_categoria: 1 },
        });
        return pecas;
    } catch (error) {
        console.error('❌ Erro ao buscar peças:', error);
    }
}

async function previsaoEstoque(meses = 1) {
    try {
        const mesesInt = parseInt(meses);
        if (isNaN(mesesInt) || mesesInt <= 0) {
            console.error('❌ O parâmetro "meses" deve ser um número positivo');
            return;
        }

        const dataInicio = new Date();
        dataInicio.setMonth(dataInicio.getMonth() - mesesInt);

        const pecas = await Peca.findAll({
            attributes: ['cod_peca', 'nome', 'quantidade'],
            where: { cod_categoria: 1 },
        });

        const pecasProjeto = await PecaProjeto.findAll({
            attributes: ['cod_peca', [sequelize.fn('SUM', sequelize.col('quantidade')), 'total_necessario']],
            group: ['cod_peca'],
            raw: true
        });

        const pecasRetiradas = await PegouPeca.findAll({
            attributes: ['cod_peca', [sequelize.fn('SUM', sequelize.col('quantidade')), 'total_retirado']],
            group: ['cod_peca'],
            raw: true
        });

        const historicoConsumo = await PegouPeca.findAll({
            attributes: [
                'cod_peca',
                [sequelize.fn('SUM', sequelize.col('quantidade')), 'quantidade'],
                [sequelize.literal('EXTRACT(MONTH FROM data_retirou)'), 'mes'],
                [sequelize.literal('EXTRACT(YEAR FROM data_retirou)'), 'ano']
            ],
            where: { data_retirou: { [Op.gte]: dataInicio } },
            group: ['cod_peca', sequelize.literal('EXTRACT(YEAR FROM data_retirou)'), sequelize.literal('EXTRACT(MONTH FROM data_retirou)')],
            order: [
                [sequelize.literal('EXTRACT(YEAR FROM data_retirou)'), 'ASC'],
                [sequelize.literal('EXTRACT(MONTH FROM data_retirou)'), 'ASC']
            ],
            raw: true
        });

        const mapPecasProjeto = Object.fromEntries(pecasProjeto.map(p => [p.cod_peca, p.total_necessario || 0]));
        const mapPecasRetiradas = Object.fromEntries(pecasRetiradas.map(p => [p.cod_peca, p.total_retirado || 0]));

        const consumoPorPeca = {};
        historicoConsumo.forEach(({ cod_peca, quantidade, mes, ano }) => {
            if (!consumoPorPeca[cod_peca]) consumoPorPeca[cod_peca] = [];
            consumoPorPeca[cod_peca].push({ quantidade, mes, ano });
        });

        function calcularMediaPonderada(pecaId) {
            const historico = consumoPorPeca[pecaId] || [];
            if (historico.length === 0) return 0;

            let somaPesos = 0;
            let somaPonderada = 0;
            historico.forEach((item, index) => {
                let peso = index + 1;
                somaPesos += peso;
                somaPonderada += item.quantidade * peso;
            });

            return Math.round(somaPonderada / somaPesos);
        }

        const resultado = pecas.map(peca => {
            const totalNecessario = mapPecasProjeto[peca.cod_peca] || 0;
            const totalRetirado = mapPecasRetiradas[peca.cod_peca] || 0;
            const quantidadeExecutavel = Math.max(totalNecessario - totalRetirado, 0);
            const quantidadePrevista = calcularMediaPonderada(peca.cod_peca) * mesesInt;

            return {
                cod_peca: peca.cod_peca,
                nome: peca.nome,
                quantidade_prevista: quantidadePrevista,
                quantidade_executavel: quantidadeExecutavel
            };
        });

        return resultado;
    } catch (error) {
        console.error('❌ Erro ao gerar previsão de estoque:', error);
    }
}


const getCardColor = (quantidade, quantidade_prevista, quantidade_executavel) => {
    if (quantidade_prevista <= quantidade_executavel) {
        if (quantidade >= 2 * quantidade_executavel) return "bg-green-500/70";
        if (quantidade > quantidade_executavel) return "bg-green-300/70";
        if (quantidade == quantidade_executavel) return "bg-white";
        if (quantidade >= quantidade_executavel * 0.6) return "bg-orange-400/70";
        if (quantidade >= quantidade_executavel * 0.3) return "bg-red-500/70";
        return "bg-red-700/70";
    } else {
        if (quantidade > quantidade_prevista) return "bg-green-500/70";
        if (quantidade == quantidade_prevista * 0.8) return "bg-green-300/70";
        if (quantidade >= quantidade_executavel) return "bg-white";
        if (quantidade >= quantidade_executavel * 0.6) return "bg-orange-400/70";
        if (quantidade >= quantidade_executavel * 0.3) return "bg-red-500/70";
        return "bg-red-700/70";
    }
};

const enviarAlertaProjeto = async (projeto, diasRestantes, pecasRestantes) => {
    const assunto = `⚠️ Alerta: Projeto ${projeto.nome} precisa ser finalizado!`;
    const mensagem = `
        <h3>O projeto <strong>${projeto.nome}</strong> deve ser entregue em ${diasRestantes} dias.</h3>
        <p>Peças concluídas: ${projeto.pecas_atuais}</p>
        <p>Peças restantes: ${pecasRestantes}</p>
        <p>Cuidado para não perder a data de entrega!.</p>
    `;
    await sendEmail("rodrigo.kontato@gmail.com", assunto, mensagem);
    console.log(`Email de alerta enviado para o projeto ${projeto.nome}`);
};

const verificarEstoqueBaixo = async () => {     
    try {
        const pecas = await buscarPecas();
        const previsao = await previsaoEstoque(1);

        let pecasCriticas = [];

        pecas.forEach(peca => {
            const previsaoPeca = previsao.find(p => p.cod_peca === peca.cod_peca);
            if (previsaoPeca) {
                const { quantidade_prevista, quantidade_executavel } = previsaoPeca;
                const cor = getCardColor(peca.quantidade, quantidade_prevista, quantidade_executavel);

                if (cor.includes("orange") || cor.includes("red")) {
                    pecasCriticas.push({
                        nome: peca.nome,
                        cod_peca: peca.cod_peca,
                        imagem: peca.imagem, // URL da imagem
                        cor
                    });
                }
            }
        });

        if (pecasCriticas.length > 0) {
            await enviarAlertaEmail(pecasCriticas);
        }
    } catch (error) {
        console.error("❌ Erro ao verificar estoque baixo:", error);
    }
};

const enviarAlertaEmail = async (pecas) => {
    const assunto = "🚨 Alerta: Peças com Estoque Baixo";
    let mensagem = "<h3>Itens comerciais com estoque baixo:</h3><ul>";
    
    pecas.forEach(peca => {
        mensagem += `<li style='background:${peca.cor}; padding: 10px; margin-bottom: 5px;'>
                        <img src='${process.env.API_URL}/uploads/${peca.imagem}' alt='${peca.nome}' style='width:50px; height:50px;'>
                        ${peca.nome} (Código: ${peca.cod_peca})
                        </li>`;
    });
    
    mensagem += "</ul><p>Favor verificar e tomar as medidas necessárias.</p>";
    
    await sendEmail("rodrigo.kontato@gmail.com", assunto, mensagem);
    console.log("Email de alerta enviado com sucesso!"); 
};

module.exports = startCronJobs;
