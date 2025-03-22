const express = require('express');
const { CarrinhoApp, Projeto, Peca } = require('../models/Associations');
const routerCarrinhoApp = express.Router();
const sequelize = require('../config/database');

// Rota para obter todos os registros
routerCarrinhoApp.get('/', async (req, res) => {
    try {
        const registros = await CarrinhoApp.findAll();
        res.json(registros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar registros do carrinho' });
    }
});

// Rota para obter um registro por ID
routerCarrinhoApp.get('/:id', async (req, res) => {
    try {
        const registro = await CarrinhoApp.findByPk(req.params.id);
        if (registro) {
            res.json(registro);
        } else {
            res.status(404).json({ error: 'Registro não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar o registro' });
    }
});

// Rota para criar um novo registro
routerCarrinhoApp.post('/', async (req, res) => {
    try {
        const { cod_projeto, cod_user, cod_peca, quantidade } = req.body;

        // Validações
        if (!cod_projeto || !cod_user || !cod_peca) {
            return res.status(400).json({ error: 'Dados insuficientes' });
        }

        // Operação no banco
        const novoCarrinho = await CarrinhoApp.create({
            cod_projeto,
            cod_user,
            cod_peca,
            quantidade,
        });

        res.status(201).json(novoCarrinho);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// Rota para atualizar um registro por ID
routerCarrinhoApp.put('/:id', async (req, res) => {
    try {
        const [linhasAfetadas] = await CarrinhoApp.update(req.body, {
            where: { cod_carrinho_app: req.params.id }
        });

        if (linhasAfetadas > 0) {
            res.sendStatus(200);
        } else {
            res.status(404).json({ error: 'Registro não encontrado para atualizar' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar o registro' });
    }
});

// Rota para deletar um registro por ID
routerCarrinhoApp.delete('/:id', async (req, res) => {
    try {
        const linhasRemovidas = await CarrinhoApp.destroy({
            where: { cod_carrinho_app: req.params.id }
        });

        if (linhasRemovidas > 0) {
            res.sendStatus(200);
        } else {
            res.status(404).json({ error: 'Registro não encontrado para exclusão' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir o registro' });
    }
});

// Rota para deletar um registro por ID
routerCarrinhoApp.delete('/pegou_carrinho/:cod_user', async (req, res) => {
    try {
        const linhasRemovidas = await CarrinhoApp.destroy({
            where: { cod_user: req.params.cod_user }
        });

        if (linhasRemovidas > 0) {
            res.sendStatus(200);
        } else {
            res.status(404).json({ error: 'Registro não encontrado para exclusão' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir o registro' });
    }
});

// Rota para obter a quantidade de itens no carrinho de um usuário
routerCarrinhoApp.get('/quantidade/:cod_user', async (req, res) => {
    try {
        const { cod_user } = req.params;
        const totalItens = await CarrinhoApp.sum('quantidade', {
            where: { cod_user }
        });

        res.json({ cod_user, totalItens: totalItens || 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao obter a quantidade de itens no carrinho' });
    }
});

// Rota para obter os itens no carrinho de um usuário com nome do projeto e da peça
routerCarrinhoApp.get('/itens/:cod_user', async (req, res) => {
    try {
        const { cod_user } = req.params;

        const [results] = await sequelize.query(`
            SELECT 
                ca.cod_peca,
                pc.nome as nome_peca,
                ca.cod_projeto,
                p.nome as nome_projeto,
                ca.quantidade
            FROM carrinho_app ca
            INNER JOIN projeto p ON p.cod_projeto = ca.cod_projeto
            INNER JOIN pecas pc ON pc.cod_peca = ca.cod_peca
            WHERE ca.cod_user = :cod_user;
        `, { replacements: { cod_user } });

        res.json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao obter os itens do carrinho' });
    }
});

module.exports = routerCarrinhoApp;
