const express = require('express');
const Projeto = require('../models/Projeto');
const routerProjeto = express.Router();

// Buscar todos os projetos
routerProjeto.get('/', async (req, res) => {
    const projetos = await Projeto.findAll();
    res.json(projetos);
}); 

// Buscar um projeto específico por ID
routerProjeto.get('/:id', async (req, res) => {
    try {
        const projeto = await Projeto.findOne({ where: { cod_projeto: req.params.id } });
        if (!projeto) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }
        res.json(projeto);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar o projeto' });
    }
});

// Criar um novo projeto
routerProjeto.post('/', async (req, res) => {
    try {
        const projeto = await Projeto.create(req.body);
        res.json(projeto);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar o projeto' });
    }
});

// Atualizar um projeto
routerProjeto.put('/:id', async (req, res) => {
    try {
        await Projeto.update(req.body, { where: { cod_projeto: req.params.id } });
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar o projeto' });
    }
});

// Deletar um projeto
routerProjeto.delete('/:id', async (req, res) => {
    try {
        await Projeto.destroy({ where: { cod_projeto: req.params.id } });
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar o projeto' });
    }
});

module.exports = routerProjeto;
