const express = require('express');
const Projeto = require('../models/Projeto');
const routerProjeto = express.Router();

routerProjeto.get('/', async (req, res) => {
    const projetos = await Projeto.findAll();
    res.json(projetos);
}); 

routerProjeto.post('/', async (req, res) => {
    const projeto = await Projeto.create(req.body);
    res.json(projeto);
});

routerProjeto.put('/:id', async (req, res) => {
    await Projeto.update(req.body, { where: { cod_projeto: req.params.id } });
    res.sendStatus(200);
});

routerProjeto.delete('/:id', async (req, res) => {
    await Projeto.destroy({ where: { cod_projeto: req.params.id } });
    res.sendStatus(200);
});

module.exports = routerProjeto;