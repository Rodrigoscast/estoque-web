const express = require('express');
const { Categorias, Peca, HistoricoCompras, PegouPeca, Usuario, Projeto } = require('../models/Associations');
const routerPeca = express.Router();

routerPeca.get('/', async (req, res) => {
    try {
        const pecas = await Peca.findAll({
            order: [['nome', 'ASC']] // Ordena em ordem alfabética crescente
        });
        res.json(pecas);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar peças' });
    }
});

routerPeca.post('/', async (req, res) => {
    const peca = await Peca.create(req.body);
    res.json(peca);
});

routerPeca.put('/:id', async (req, res) => {
    const { quantidade, valor_unitario } = req.body;
    const cod_peca = req.params.id;

    try {
        // Busca a peça para pegar a quantidade atual
        const peca = await Peca.findByPk(cod_peca);

        if (!peca) {
            return res.status(404).json({ error: "Peça não encontrada" });
        }

        const novaQuantidade = peca.quantidade + quantidade; // Soma a quantidade

        // Atualiza a peça (quantidade e valor)
        await Peca.update(
            { quantidade: novaQuantidade, valor: valor_unitario },
            { where: { cod_peca } }
        );

        // Insere no histórico de compras
        await HistoricoCompras.create({
            cod_peca,
            quantidade, // Quantidade adicionada
            valor: valor_unitario,
            data_compra: new Date()
        });

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar a peça e registrar o histórico." });
    }
});

// Atualizar uma Peça
routerPeca.put('/att/:id', async (req, res) => {
    try {
        await Peca.update(req.body, { where: { cod_peca: req.params.id } });
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar a peça' });
    }
});


routerPeca.delete('/:id', async (req, res) => {
    await Peca.destroy({ where: { cod_peca: req.params.id } });
    res.sendStatus(200);
});

module.exports = routerPeca;