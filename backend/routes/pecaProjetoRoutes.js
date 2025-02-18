const express = require('express');
const PecaProjeto = require('../models/PecaProjeto');
const routerPecaProjeto = express.Router();

// Listar todas as associações peça-projeto
routerPecaProjeto.get('/', async (req, res) => {
    const pecaProjetos = await PecaProjeto.findAll();
    res.json(pecaProjetos);
});

// Criar uma nova associação entre peça e projeto
routerPecaProjeto.post('/', async (req, res) => {
    const pecaProjeto = await PecaProjeto.create(req.body);
    res.json(pecaProjeto);
});

// Atualizar a quantidade de uma peça em um projeto específico
routerPecaProjeto.put('/:cod_projeto/:cod_peca', async (req, res) => {
    await PecaProjeto.update(
        { quantidade: req.body.quantidade },
        { where: { cod_projeto: req.params.cod_projeto, cod_peca: req.params.cod_peca } }
    );
    res.sendStatus(200);
});

// Remover uma peça de um projeto
routerPecaProjeto.delete('/:cod_projeto/:cod_peca', async (req, res) => {
    await PecaProjeto.destroy({
        where: { cod_projeto: req.params.cod_projeto, cod_peca: req.params.cod_peca }
    });
    res.sendStatus(200);
});

module.exports = routerPecaProjeto;
