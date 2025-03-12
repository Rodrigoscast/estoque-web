const express = require('express');
const { Categorias, Peca, HistoricoCompras, PegouPeca, Usuario, Projeto } = require('../models/Associations');
const routerCategoria = express.Router();
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

routerCategoria.get('/', async (req, res) => {
    try {
        const categorias = await Categorias.findAll({
            attributes: [
                'cod_categoria', 
                'nome',
                [sequelize.fn('COUNT', sequelize.col('Pecas.cod_peca')), 'quantidade_pecas']
            ],
            include: [{
                model: Peca,
                attributes: [], // Como estamos apenas contando, não precisamos buscar outros atributos da peça
                required: false // LEFT JOIN (se não houver peças, a categoria ainda será listada)
            }],
            group: ['Categorias.cod_categoria']
        });

        res.json(categorias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
});

routerCategoria.post('/', async (req, res) => {
    const categorias = await Categorias.create(req.body);
    res.json(categorias);
});

routerCategoria.put('/:id', async (req, res) => {
    await Categorias.update(req.body, { where: { cod_categoria: req.params.id } });
    res.sendStatus(200);
});

routerCategoria.delete('/:id', async (req, res) => {
    await Categorias.destroy({ where: { cod_categoria: req.params.id } });
    res.sendStatus(200);
});

module.exports = routerCategoria;