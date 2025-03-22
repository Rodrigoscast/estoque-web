const express = require('express');
const { Router } = require('express');
const { Op, Sequelize } = require('sequelize');
const { Categorias, Peca, HistoricoCompras, PegouPeca, Usuario, Projeto, PecaProjeto, Carrinho } = require('../models/Associations');
const relatorioRoutes = express.Router();
const sequelize = require('../config/database');

relatorioRoutes.get('/pecas-mais-utilizadas', async (req, res) => {
    try {
        console.log("Buscando relatório de peças mais utilizadas...");
        
        const { dataInicio, dataFim, ordem = 'DESC' } = req.query;

        let whereClause = {};
        if (dataInicio && dataFim) {
            whereClause["$carrinho.data_inicio$"] = {
                [Op.between]: [new Date(dataInicio), new Date(dataFim)]
            };
        }

        const pecasMaisUtilizadas = await PegouPeca.findAll({
            attributes: [
                'cod_peca',
                [Sequelize.fn('SUM', Sequelize.col('PegouPeca.quantidade')), 'total_utilizada']
            ],
            include: [
                {
                    model: Peca,
                    as: 'peca', // Confirme que esse alias está correto no relacionamento!
                    attributes: ['nome', 'imagem']
                },
                {
                    model: Carrinho,
                    as: 'carrinho', // Certifique-se de que o alias corresponde ao relacionamento no modelo!
                    attributes: [], // Não precisamos retornar dados do carrinho, apenas filtrar por data_inicio
                    required: true // Garante que só contemos peças associadas a um carrinho válido
                }
            ],
            where: whereClause,
            group: ['PegouPeca.cod_peca', 'peca.cod_peca', 'peca.nome', 'peca.imagem'],
            order: [[Sequelize.literal('"total_utilizada"'), ordem.toUpperCase()]]
        });

        console.log(`Total de registros encontrados: ${pecasMaisUtilizadas.length}`);
        res.json(pecasMaisUtilizadas);
    } catch (error) {
        console.error("Erro ao buscar relatório de peças mais utilizadas:", error);
        res.status(500).json({ error: 'Erro ao buscar relatório' });
    }
});

relatorioRoutes.get('/previsao-estoque', async (req, res) => {
    try {
        const { meses = 1 } = req.query; // Número de meses a prever (padrão: 1)
        const mesesInt = parseInt(meses);

        if (isNaN(mesesInt) || mesesInt <= 0) {
            return res.status(400).json({ error: 'O parâmetro "meses" deve ser um número positivo' });
        }

        // Data de corte para o histórico
        const dataInicio = new Date();
        dataInicio.setMonth(dataInicio.getMonth() - mesesInt);

        // Buscar todas as peças cadastradas
        const pecas = await Peca.findAll({
            attributes: ['cod_peca', 'nome', 'quantidade'],
        });

        // Buscar a necessidade de peças para os projetos ativos
        const pecasProjeto = await PecaProjeto.findAll({
            attributes: ['cod_peca', [sequelize.fn('SUM', sequelize.col('quantidade')), 'total_necessario']],
            group: ['cod_peca'],
            raw: true
        });

        // Buscar quantas peças já foram retiradas para os projetos ativos
        const pecasRetiradas = await PegouPeca.findAll({
            attributes: ['cod_peca', [sequelize.fn('SUM', sequelize.col('quantidade')), 'total_retirado']],
            where: {
                data_retirou: { [Op.not]: null },
                cod_carrinho: { [Op.is]: null }
            },
            group: ['cod_peca'],
            raw: true
        });

        // Buscar histórico de retirada de peças para calcular a média ponderada
        const historicoConsumo = await PegouPeca.findAll({
            attributes: [
                'cod_peca',
                [sequelize.fn('SUM', sequelize.col('quantidade')), 'quantidade'],
                [sequelize.literal('EXTRACT(MONTH FROM "Carrinho"."data_inicio")'), 'mes'],
                [sequelize.literal('EXTRACT(YEAR FROM "Carrinho"."data_inicio")'), 'ano']
            ],
            include: [
                {
                    model: Carrinho,
                    attributes: [], // Não precisamos dos dados do carrinho, apenas filtrar por data_inicio
                    required: true // Apenas pegar registros que tenham um carrinho válido
                }
            ],
            where: { "$Carrinho.data_inicio$": { [Op.gte]: dataInicio } },
            group: [
                'cod_peca',
                sequelize.literal('EXTRACT(YEAR FROM "Carrinho"."data_inicio")'),
                sequelize.literal('EXTRACT(MONTH FROM "Carrinho"."data_inicio")')
            ],
            order: [
                [sequelize.literal('EXTRACT(YEAR FROM "Carrinho"."data_inicio")'), 'ASC'],
                [sequelize.literal('EXTRACT(MONTH FROM "Carrinho"."data_inicio")'), 'ASC']
            ],
            raw: true
        });

        const [tempoPeca] = await sequelize.query(`
            WITH tempo_total AS (
                SELECT 
                    p.cod_peca,
                    p.cod_carrinho,
                    EXTRACT(EPOCH FROM (c.data_final - c.data_inicio)) AS tempo_gasto,
                    SUM(p.quantidade) AS total_pecas
                FROM pegou_peca p
                JOIN carrinho c ON p.cod_carrinho = c.cod_carrinho
                WHERE c.data_inicio IS NOT NULL
                AND c.data_final IS NOT NULL
                AND p.data_retirou IS NULL
                GROUP BY p.cod_peca, p.cod_carrinho, c.data_inicio, c.data_final
            )
            SELECT 
                t.cod_peca,
                ROUND(AVG(t.tempo_gasto / NULLIF(t.total_pecas, 0)), 2) AS tempo_medio_por_peca
            FROM tempo_total t
            GROUP BY t.cod_peca
            ORDER BY tempo_medio_por_peca ASC;
        `);

        // Criar um mapa para facilitar a busca das peças
        const mapPecasProjeto = Object.fromEntries(pecasProjeto.map(p => [p.cod_peca, p.total_necessario || 0]));
        const mapPecasRetiradas = Object.fromEntries(pecasRetiradas.map(p => [p.cod_peca, p.total_retirado || 0]));
        const mapTempoPeca = Object.fromEntries(tempoPeca.map(p => [p.cod_peca, p.tempo_medio_por_peca || 0]));

        // Criar mapa de consumo de peças por mês para calcular a média ponderada
        const consumoPorPeca = {};
        historicoConsumo.forEach(({ cod_peca, quantidade, mes, ano }) => {
            if (!consumoPorPeca[cod_peca]) consumoPorPeca[cod_peca] = [];
            consumoPorPeca[cod_peca].push({ quantidade, mes, ano });
        });

        // Função para calcular a média ponderada de consumo
        function calcularMediaPonderada(pecaId) {
            const historico = consumoPorPeca[pecaId] || [];
            if (historico.length === 0) return 0;

            let somaPesos = 0;
            let somaPonderada = 0;
            historico.forEach((item, index) => {
                let peso = index + 1; // O mês mais recente tem o maior peso
                somaPesos += peso;
                somaPonderada += item.quantidade * peso;
            });

            return Math.round(somaPonderada / somaPesos);
        }

        // Construir a resposta final
        const resultado = pecas.map(peca => {
            const totalNecessario = mapPecasProjeto[peca.cod_peca] || 0;
            const totalRetirado = mapPecasRetiradas[peca.cod_peca] || 0;
            const totalTempo = mapTempoPeca[peca.cod_peca] || 0;
            const quantidadeExecutavel = Math.max(totalNecessario - totalRetirado, 0);
            const quantidadePrevista = calcularMediaPonderada(peca.cod_peca) * mesesInt;

            return {
                cod_peca: peca.cod_peca,
                nome: peca.nome,
                quantidade_prevista: quantidadePrevista,
                quantidade_executavel: quantidadeExecutavel,
                tempo: totalTempo
            };
        });

        return res.json(resultado);
    } catch (error) {
        console.error('❌ Erro ao gerar previsão de estoque:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

relatorioRoutes.get('/variacao_precos', async (req, res) => {
    try {
        const historico = await HistoricoCompras.findAll({
            attributes: [
                'cod_peca',
                [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('data_compra')), 'mes'],
                [Sequelize.fn('AVG', Sequelize.col('valor')), 'preco_medio']
            ],
            group: ['cod_peca', Sequelize.literal('DATE_TRUNC(\'month\', "data_compra")')],
            order: [[Sequelize.literal('mes'), 'ASC']]
        });

        const pecas = await Peca.findAll({
            attributes: ['cod_peca', 'nome']
        });

        // Formatar os dados
        const resultado = pecas.map((peca) => {
            const precos = historico
                .filter(h => h.cod_peca === peca.cod_peca)
                .map(h => ({
                    mes: h.getDataValue('mes').toISOString().slice(0, 7), // Formata para YYYY-MM
                    preco: parseFloat(h.getDataValue('preco_medio'))
                }));

            return { cod_peca: peca.cod_peca, nome: peca.nome, precos };
        });
        res.json(resultado);
    } catch (error) {
        console.error("Erro ao buscar variação de preços:", error);
        res.status(500).json({ error: 'Erro ao buscar relatório' });
    }
});

relatorioRoutes.get('/compras_por_periodo', async (req, res) => {
    try {
        const { dataInicio, dataFim } = req.query;

        if (!dataInicio || !dataFim) {
            return res.status(400).json({ error: "Datas inválidas" });
        }

        const compras = await HistoricoCompras.findAll({
            where: {
                data_compra: {
                    [Sequelize.Op.between]: [new Date(dataInicio), new Date(dataFim)]
                }
            },
            include: [
                { model: Peca, attributes: ['nome'] }
            ],
            order: [['data_compra', 'ASC']]
        });

        const resultado = compras.map(compra => ({
            id: compra.cod_historico,
            nome: compra.Peca.nome,
            quantidade: compra.quantidade,
            valor: parseFloat(compra.valor),
            data_compra: new Date(compra.data_compra).toISOString().split('T')[0] // Formato YYYY-MM-DD
        }));

        res.json(resultado);
    } catch (error) {
        console.error("Erro ao buscar relatório de compras por período:", error);
        res.status(500).json({ error: 'Erro ao buscar relatório' });
    }
});



module.exports = relatorioRoutes;