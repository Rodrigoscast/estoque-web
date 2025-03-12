const express = require('express');
const { Op, Sequelize } = require('sequelize');
const routerPegouPeca = express.Router();
const moment = require("moment-timezone");
const { Categorias, Peca, HistoricoCompras, PegouPeca, Usuario, Projeto } = require('../models/Associations');
const sequelize = require('../config/database');

// Função auxiliar para obter IDs dos projetos relacionados
const obterProjetosRelacionados = async (cod_projeto) => {
    const sequelize = PegouPeca.sequelize;
    const [result] = await sequelize.query(`
        SELECT cod_projeto FROM projeto WHERE projeto_main = :cod_projeto
    `, { replacements: { cod_projeto } });

    return result.map(p => p.cod_projeto);
};

// Middleware para obter projetos relacionados
const getProjetosIDs = async (cod_projeto) => {
    const projeto = await Projeto.findByPk(cod_projeto);
    if (!projeto) return [];

    if (projeto.projeto_main === 0) {
        const projetosRelacionados = await obterProjetosRelacionados(cod_projeto);
        return [cod_projeto, ...projetosRelacionados];
    }
    return [cod_projeto];
};

// Rota para listar todos os registros de retirada de peças
routerPegouPeca.get('/', async (req, res) => {
    try {
        const pegouPecas = await PegouPeca.findAll();
        res.json(pegouPecas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar registros.' });
    }
});

routerPegouPeca.get('/retiradas', async (req, res) => {
    try {
        let { tempo } = req.query;

        // Converte tempo para número e garante que esteja entre 1 e 12 meses
        tempo = parseInt(tempo);
        if (isNaN(tempo) || tempo < 1 || tempo > 12) {
            return res.status(400).json({ error: 'O tempo deve ser um número entre 1 e 12 meses.' });
        }

        const dataInicio = new Date();
        dataInicio.setMonth(dataInicio.getMonth() - tempo); // Retrocede o número de meses solicitado

        const pegouPecas = await PegouPeca.findAll({
            attributes: [
                'cod_peca',
                [sequelize.fn('SUM', sequelize.col('quantidade')), 'total_retirado']
            ],
            where: {
                data_pegou: {
                    [Op.gte]: dataInicio
                }
            },
            group: ['cod_peca'],
            raw: true // Retorna apenas objetos JavaScript puros
        });

        // Formata os dados no formato desejado
        const resultadoFormatado = pegouPecas.map(item => ({
            cod_peca: item.cod_peca,
            quantidade: Number(item.total_retirado) // Garante que o valor seja numérico
        }));

        res.json(resultadoFormatado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar registros.' });
    }
});

//Depois de pegar uma peça, atualizar a quantidade de peças atuais no projeto e no main dele
routerPegouPeca.post("/", async (req, res) => {

    const transaction = await PegouPeca.sequelize.transaction(); // Inicia uma transação

    try {
        let { data_pegou, cod_projeto, cod_peca, quantidade, ...dados } = req.body;

        // Converte a data corretamente para o fuso de Brasília
        data_pegou = moment.tz(data_pegou, "America/Sao_Paulo").toDate();

        // Buscar a peça para verificar o estoque
        const peca = await Peca.findByPk(cod_peca, { transaction });

        if (!peca) {
            throw new Error("Peça não encontrada.");
        }

        if (peca.quantidade < quantidade) {
            await transaction.rollback(); // Desfaz a transação
            return res.status(400).json({ error: "Estoque insuficiente." });
        }

        // Criar o registro de retirada da peça
        const pegouPeca = await PegouPeca.create(
            { ...dados, cod_projeto, cod_peca, quantidade, data_pegou },
            { transaction }
        );

        // Atualizar a quantidade de peças no estoque
        await peca.update(
            { quantidade: peca.quantidade - quantidade },
            { transaction }
        );

        // Buscar o projeto atual para atualizar pecas_atuais
        const projeto = await Projeto.findByPk(cod_projeto, { transaction });

        if (!projeto) {
            throw new Error("Projeto não encontrado.");
        }

        // Atualizar o número de peças atuais no projeto
        await projeto.update(
            { pecas_atuais: projeto.pecas_atuais + quantidade },
            { transaction }
        );

        // Se o projeto estiver vinculado a um projeto principal, atualizar o projeto principal também
        if (projeto.projeto_main !== 0) {
            const projetoMain = await Projeto.findByPk(projeto.projeto_main, { transaction });

            if (projetoMain) {
                await projetoMain.update(
                    { pecas_atuais: projetoMain.pecas_atuais + quantidade },
                    { transaction }
                );
            }
        }

        await transaction.commit(); // Confirma a transação
        res.json(pegouPeca);
    } catch (error) {
        await transaction.rollback(); // Desfaz a transação em caso de erro
        console.error("Erro ao criar registro:", error);
        res.status(500).json({ error: "Erro ao criar registro." });
    }
});


// Rota para atualizar um registro de retirada de peça
routerPegouPeca.put('/:cod_pegou_peca', async (req, res) => {
    try {
        await PegouPeca.update(req.body, { where: { cod_pegou_peca: req.params.cod_pegou_peca } });
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar registro.' });
    }
});

// Rota para remover um registro de retirada de peça
routerPegouPeca.delete('/:cod_pegou_peca', async (req, res) => {
    try {
        await PegouPeca.destroy({ where: { cod_pegou_peca: req.params.cod_pegou_peca } });
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao remover registro.' });
    }
});

// Rota para gráfico de quantidades por data
routerPegouPeca.get('/grafico/quantidades-por-data/:cod_projeto', async (req, res) => {
    try {
        const projetosIDs = await getProjetosIDs(req.params.cod_projeto);
        const sequelize = PegouPeca.sequelize;

        const [results] = await sequelize.query(`
            SELECT data_pegou::date AS data, SUM(quantidade) AS total
            FROM pegou_peca
            WHERE cod_projeto IN (:projetosIDs)
            GROUP BY data_pegou::date
            ORDER BY data_pegou::date;
        `, { replacements: { projetosIDs } });

        res.json({ 
            labels: results.map(row => row.data),
            data: results.map(row => parseInt(row.total, 10))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar dados para o gráfico.' });
    }
});

//Peças por dia busca por usuários
routerPegouPeca.get('/grafico/quantidades-por-usuario/:cod_user', async (req, res) => {
    try {
        const { cod_user } = req.params;
        const sequelize = PegouPeca.sequelize;

        const [results, metadata] = await sequelize.query(`
            SELECT 
                data_pegou::date AS data,
                SUM(quantidade) AS total
            FROM pegou_peca
            WHERE cod_user = :cod_user
            GROUP BY data_pegou::date
            ORDER BY data_pegou::date;
        `, {
            replacements: { cod_user: req.params.cod_user},
        });

        const labels = results.map(row => row.data);
        const data = results.map(row => parseInt(row.total, 10));

        res.json({ labels, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar dados para o gráfico.' });
    }
});

// Rota para gráfico de pizza considerando projetos relacionados
routerPegouPeca.get('/grafico/pizza/por-usuario/:cod_projeto', async (req, res) => {
    try {
        const { cod_projeto } = req.params;
        const projetosIDs = await getProjetosIDs(cod_projeto);
        
        const sequelize = PegouPeca.sequelize;
        const [results, metadata] = await sequelize.query(`
            SELECT u.nome AS label, SUM(p.quantidade) AS total
            FROM pegou_peca p
            JOIN usuarios u ON p.cod_user = u.cod_user
            WHERE p.cod_projeto IN (:projetosIDs)
            GROUP BY u.nome
            ORDER BY total DESC;
        `, {
            replacements: { projetosIDs },
        });
      
        // Mapeia os resultados para arrays de labels e dados
        const labels = results.map(row => row.label);
        const data = results.map(row => parseInt(row.total, 10));
      
        res.json({ labels, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar dados para o gráfico de pizza.' });
    }
});

// Rota para gráfico de pizza por projeto, consolidando quantidades em projetos principais
routerPegouPeca.get('/grafico/pizza/por-projeto/:cod_user', async (req, res) => {
    try {
        const { cod_user } = req.params;
        const sequelize = PegouPeca.sequelize;

        const [results] = await sequelize.query(`
            SELECT 
                CASE 
                    WHEN pr.projeto_main = 0 THEN pr.nome 
                    ELSE pm.nome 
                END AS label, 
                SUM(p.quantidade) AS total
            FROM pegou_peca p
            JOIN projeto pr ON p.cod_projeto = pr.cod_projeto
            LEFT JOIN projeto pm ON pr.projeto_main = pm.cod_projeto
            WHERE p.cod_user = :cod_user
            GROUP BY label
            ORDER BY total DESC;
        `, { replacements: { cod_user } });

        res.json({ 
            labels: results.map(row => row.label),
            data: results.map(row => parseInt(row.total, 10))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar dados para o gráfico de pizza.' });
    }
});


// Peças retiradas
routerPegouPeca.get('/materiais-retirados/:cod_projeto', async (req, res) => {
    try {
        const projetosIDs = await getProjetosIDs(req.params.cod_projeto);
        const sequelize = PegouPeca.sequelize;

        const [results] = await sequelize.query(`
            SELECT p.cod_peca, pc.nome, SUM(p.quantidade) AS quantidade
            FROM pegou_peca p
            JOIN pecas pc ON p.cod_peca = pc.cod_peca
            WHERE p.cod_projeto IN (:projetosIDs)
            GROUP BY p.cod_peca, pc.nome
            ORDER BY pc.nome;
        `, { replacements: { projetosIDs } });

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar materiais retirados.' });
    }
});

// Peças que faltam retirar com informação do estoque
routerPegouPeca.get('/materiais-faltantes/:cod_projeto', async (req, res) => {
    try {
        const projetosIDs = await getProjetosIDs(req.params.cod_projeto);
        const sequelize = PegouPeca.sequelize;

        const [results] = await sequelize.query(`
            SELECT 
                pp.cod_peca, 
                pc.nome,
                GREATEST(pp.quantidade - COALESCE(SUM(p.quantidade), 0), 0) AS quantidade,
                pc.quantidade AS estoque -- Adiciona o estoque disponível da peça
            FROM peca_projeto pp
            JOIN pecas pc ON pp.cod_peca = pc.cod_peca
            LEFT JOIN pegou_peca p ON p.cod_projeto = pp.cod_projeto AND p.cod_peca = pp.cod_peca
            WHERE pp.cod_projeto IN (:projetosIDs)
            GROUP BY pp.cod_peca, pc.nome, pp.quantidade, pc.quantidade -- Inclui estoque no GROUP BY
            HAVING GREATEST(pp.quantidade - COALESCE(SUM(p.quantidade), 0), 0) > 0
            ORDER BY pc.nome;
        `, { replacements: { projetosIDs } });

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar materiais faltantes.' });
    }
});

// Histórico de retiradas
routerPegouPeca.get('/historico-retiradas/:cod_projeto', async (req, res) => {
    try {
        const projetosIDs = await getProjetosIDs(req.params.cod_projeto);
        const sequelize = PegouPeca.sequelize;

        const [results] = await sequelize.query(`
            SELECT p.cod_pegou_peca, u.nome AS usuario, pc.nome AS peca, 
                   p.quantidade, p.data_pegou
            FROM pegou_peca p
            JOIN usuarios u ON p.cod_user = u.cod_user
            JOIN pecas pc ON p.cod_peca = pc.cod_peca
            WHERE p.cod_projeto IN (:projetosIDs)
            ORDER BY p.data_pegou DESC;
        `, { replacements: { projetosIDs } });

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar histórico de peças retiradas.' });
    }
});

// Rota para histórico de retiradas por usuário, considerando nome do projeto principal
routerPegouPeca.get('/historico-retiradas/por-usuario/:cod_user', async (req, res) => {
    try {
        const { cod_user } = req.params;
        const sequelize = PegouPeca.sequelize;

        const [results, metadata] = await sequelize.query(`
            SELECT 
                p.cod_pegou_peca, 
                CASE 
                    WHEN pr.projeto_main != 0 THEN CONCAT(pr.nome, ' [', pm.nome, ']') 
                    ELSE pr.nome 
                END AS projeto,
                pc.nome AS peca,
                p.quantidade,
                p.data_pegou
            FROM pegou_peca p
            JOIN projeto pr ON p.cod_projeto = pr.cod_projeto
            LEFT JOIN projeto pm ON pr.projeto_main = pm.cod_projeto
            JOIN pecas pc ON p.cod_peca = pc.cod_peca
            WHERE p.cod_user = :cod_user
            ORDER BY p.data_pegou DESC;
        `, {
            replacements: { cod_user },
        });

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar histórico de peças retiradas por usuário.' });
    }
});

module.exports = routerPegouPeca;
