const express = require('express');
const { Op } = require('sequelize');
const Peca = require('../models/Peca');
const PegouPeca = require('../models/PegouPeca');
const relatorioRoutes = express.Router();
const { Sequelize } = require('sequelize'); 

relatorioRoutes.get('/pecas-mais-utilizadas', async (req, res) => {
    try {
        console.log("Buscando relatório de peças mais utilizadas...");
        
        const { dataInicio, dataFim, ordem = 'DESC' } = req.query;

        let whereClause = {};
        if (dataInicio && dataFim) {
            whereClause.data_pegou = {
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

module.exports = relatorioRoutes;