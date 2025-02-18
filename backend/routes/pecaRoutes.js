const express = require('express');
const Peca = require('../models/Peca');
const routerPeca = express.Router();

routerPeca.get('/', async (req, res) => {
    const pecas = await Peca.findAll();
    res.json(pecas);
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