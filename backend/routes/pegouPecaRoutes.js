const express = require('express');
const PegouPeca = require('../models/PegouPeca');
const routerPegouPeca = express.Router();

// Listar todos os registros de retirada de peças
routerPegouPeca.get('/', async (req, res) => {
    const pegouPecas = await PegouPeca.findAll();
    res.json(pegouPecas);
});

// Criar um novo registro de retirada de peça
routerPegouPeca.post('/', async (req, res) => {
    const pegouPeca = await PegouPeca.create(req.body);
    res.json(pegouPeca);
});

// Atualizar um registro de retirada de peça
routerPegouPeca.put('/:cod_pegou_peca', async (req, res) => {
    await PegouPeca.update(req.body, { where: { cod_pegou_peca: req.params.cod_pegou_peca } });
    res.sendStatus(200);
});

// Remover um registro de retirada de peça
routerPegouPeca.delete('/:cod_pegou_peca', async (req, res) => {
    await PegouPeca.destroy({ where: { cod_pegou_peca: req.params.cod_pegou_peca } });
    res.sendStatus(200);
});

module.exports = routerPegouPeca;
