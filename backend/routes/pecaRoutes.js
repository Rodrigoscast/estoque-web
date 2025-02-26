const express = require('express');
const Peca = require('../models/Peca');
const routerPeca = express.Router();

routerPeca.get('/', async (req, res) => {
    try {
        console.log("Buscando todas as peças..."); // Log de início da operação
        
        const pecas = await Peca.findAll();
        
        console.log(`Peças encontradas: ${pecas.length}`); // Log da quantidade de peças retornadas
        res.json(pecas);
    } catch (error) {
        console.error("Erro ao buscar peças:", error); // Log do erro
        res.status(500).json({ error: 'Erro ao buscar peças' });
    }
});


routerPeca.post('/', async (req, res) => {
    const peca = await Peca.create(req.body);
    res.json(peca);
});

routerPeca.put('/:id', async (req, res) => {
    await Peca.update(req.body, { where: { cod_peca: req.params.id } });
    res.sendStatus(200);
});

routerPeca.delete('/:id', async (req, res) => {
    await Peca.destroy({ where: { cod_peca: req.params.id } });
    res.sendStatus(200);
});

module.exports = routerPeca;