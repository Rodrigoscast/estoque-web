const express = require('express');
const { Sequelize } = require('sequelize'); // Certifique-se de ter acesso ao Sequelize configurado
const PegouPeca = require('../models/PegouPeca');
const routerPegouPeca = express.Router();
const moment = require("moment-timezone");
const Projeto = require('../models/Projeto');
const Usuario = require('../models/Usuario');

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

routerPegouPeca.post("/", async (req, res) => {
    const transaction = await PegouPeca.sequelize.transaction(); // Inicia uma transação

    try {
        let { data_pegou, cod_projeto, quantidade, ...dados } = req.body;

        // Converte corretamente a data ISO 8601 para o fuso de Brasília
        data_pegou = moment.tz(data_pegou, "America/Sao_Paulo").toDate();

        // Criar o registro de retirada da peça
        const pegouPeca = await PegouPeca.create(
            { ...dados, cod_projeto, quantidade, data_pegou },
            { transaction }
        );

        // Buscar o projeto atual para obter pecas_atuais
        const projeto = await Projeto.findByPk(cod_projeto, { transaction });

        if (!projeto) {
            throw new Error("Projeto não encontrado.");
        }

        // Atualizar o número de peças atuais no projeto
        await projeto.update(
            { pecas_atuais: projeto.pecas_atuais + quantidade },
            { transaction }
        );

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

// Nova rota para retornar os dados agrupados por data_pegou com soma de quantidade
routerPegouPeca.get('/grafico/quantidades-por-data/:cod_projeto', async (req, res) => {
    try {
        const { cod_projeto } = req.params;
        const sequelize = PegouPeca.sequelize;
  
        const [results, metadata] = await sequelize.query(`
            SELECT 
                data_pegou::date AS data,
                SUM(quantidade) AS total
            FROM pegou_peca
            WHERE cod_projeto = :cod_projeto
            GROUP BY data_pegou::date
            ORDER BY data_pegou::date;
        `, {
            replacements: { cod_projeto: req.params.cod_projeto },
        });
  
        const labels = results.map(row => row.data);
        const data = results.map(row => parseInt(row.total, 10));
  
        res.json({ labels, data });
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

routerPegouPeca.get('/grafico/pizza/por-usuario/:cod_projeto', async (req, res) => {
    try {
        const { cod_projeto } = req.params;
        const sequelize = PegouPeca.sequelize;
        const [results, metadata] = await sequelize.query(`
            SELECT u.nome AS label, SUM(p.quantidade) AS total
            FROM pegou_peca p
            JOIN usuarios u ON p.cod_user = u.cod_user
            WHERE p.cod_projeto = :cod_projeto
            GROUP BY u.nome
            ORDER BY total DESC;
        `, {
            replacements: { cod_projeto },
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

routerPegouPeca.get('/grafico/pizza/por-projeto/:cod_user', async (req, res) => {
    try {
        const { cod_user } = req.params;
        const sequelize = PegouPeca.sequelize;

        const [results, metadata] = await sequelize.query(`
            SELECT pr.nome AS label, SUM(p.quantidade) AS total
            FROM pegou_peca p
            JOIN projeto pr ON p.cod_projeto = pr.cod_projeto
            WHERE p.cod_user = :cod_user
            GROUP BY pr.nome
            ORDER BY total DESC;
        `, {
            replacements: { cod_user: req.params.cod_user },
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

// Lista 1: Peças retiradas
routerPegouPeca.get('/materiais-retirados/:cod_projeto', async (req, res) => {
    try {
        const { cod_projeto } = req.params;
        const sequelize = PegouPeca.sequelize;
        const [results, metadata] = await sequelize.query(`
            SELECT 
                p.cod_peca,
                pc.nome,
                SUM(p.quantidade) AS quantidade
            FROM pegou_peca p
            JOIN pecas pc ON p.cod_peca = pc.cod_peca
            WHERE p.cod_projeto = :cod_projeto
            GROUP BY p.cod_peca, pc.nome
            ORDER BY pc.nome;
        `, {
            replacements: { cod_projeto },
        });
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar materiais retirados.' });
    }
});
  
// Lista 2: Peças que faltam retirar
routerPegouPeca.get('/materiais-faltantes/:cod_projeto', async (req, res) => {
    try {
        const { cod_projeto } = req.params;
        const sequelize = PegouPeca.sequelize;
        const [results, metadata] = await sequelize.query(`
            SELECT 
                pp.cod_peca,
                pc.nome,
                GREATEST(pp.quantidade - COALESCE(SUM(p.quantidade), 0), 0) AS quantidade
            FROM peca_projeto pp
            JOIN pecas pc ON pp.cod_peca = pc.cod_peca
            LEFT JOIN pegou_peca p ON p.cod_projeto = pp.cod_projeto 
                AND p.cod_peca = pp.cod_peca
            WHERE pp.cod_projeto = :cod_projeto
            GROUP BY pp.cod_peca, pc.nome, pp.quantidade
            HAVING GREATEST(pp.quantidade - COALESCE(SUM(p.quantidade), 0), 0) > 0
            ORDER BY pc.nome;
        `, {
            replacements: { cod_projeto },
        });
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar materiais faltantes.' });
    }
});

routerPegouPeca.get('/historico-retiradas/:cod_projeto', async (req, res) => {
    try {
        const { cod_projeto } = req.params;
        const sequelize = PegouPeca.sequelize;
        const [results, metadata] = await sequelize.query(`
            SELECT 
                p.cod_pegou_peca, 
                u.nome AS usuario,
                pc.nome AS peca,
                p.quantidade,
                p.data_pegou
            FROM pegou_peca p
            JOIN usuarios u ON p.cod_user = u.cod_user
            JOIN pecas pc ON p.cod_peca = pc.cod_peca
            WHERE p.cod_projeto = :cod_projeto
            ORDER BY p.data_pegou DESC;
        `, {
            replacements: { cod_projeto },
        });
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar histórico de peças retiradas.' });
    }
});
routerPegouPeca.get('/historico-retiradas/por-usuario/:cod_user', async (req, res) => {
    try {
        const { cod_user } = req.params;
        const sequelize = PegouPeca.sequelize;

        const [results, metadata] = await sequelize.query(`
            SELECT 
                p.cod_pegou_peca, 
                pr.nome AS projeto,
                pc.nome AS peca,
                p.quantidade,
                p.data_pegou
            FROM pegou_peca p
            JOIN projeto pr ON p.cod_projeto = pr.cod_projeto
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
