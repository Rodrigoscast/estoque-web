const cron = require('node-cron');
const moment = require('moment-timezone');
const fetch = require('node-fetch');
const sendEmail = require('../scripts/email');
require('dotenv').config();
const { Categorias, Peca, HistoricoCompras, PegouPeca, Usuario, Projeto } = require('../models/Associations');
const PecaProjeto = require('../models/PecaProjeto');
const sequelize = require('../config/database');
const { Op, Sequelize } = require('sequelize');

const cronToken = process.env.CRON_JOB_TOKEN;

const startCronJobs = () => {
    console.log("Cron jobs iniciados...");

    cron.schedule('8 * * * *', async () => {  // Executa todo dia às 08:00
        const agora = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');
        console.log(`Executando verificação de estoque baixo às 08:00 (Horário de Brasília) - ${agora}`);

        await verificarEstoqueBaixo();
    }, {
        scheduled: true,
        timezone: "America/Sao_Paulo"
    });
};

async function buscarPecas() {
    try {
        const pecas = await Peca.findAll({
            order: [['nome', 'ASC']]
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
            attributes: ['cod_peca', 'nome', 'quantidade']
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
                [sequelize.literal('EXTRACT(MONTH FROM data_pegou)'), 'mes'],
                [sequelize.literal('EXTRACT(YEAR FROM data_pegou)'), 'ano']
            ],
            where: { data_pegou: { [Op.gte]: dataInicio } },
            group: ['cod_peca', sequelize.literal('EXTRACT(YEAR FROM data_pegou)'), sequelize.literal('EXTRACT(MONTH FROM data_pegou)')],
            order: [
                [sequelize.literal('EXTRACT(YEAR FROM data_pegou)'), 'ASC'],
                [sequelize.literal('EXTRACT(MONTH FROM data_pegou)'), 'ASC']
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
    let mensagem = "<h3>As seguintes peças estão com estoque baixo:</h3><ul>";
    
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
