const express = require('express');
const Usuario = require('../models/Usuario');
const router = express.Router();

router.get('/', async (req, res) => {
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
});

router.post('/', async (req, res) => {
    const usuario = await Usuario.create(req.body);
    res.json(usuario);
});

router.put('/:id', async (req, res) => {
    await Usuario.update(req.body, { where: { cod_user: req.params.id } });
    res.sendStatus(200);
});

router.delete('/:id', async (req, res) => {
    await Usuario.destroy({ where: { cod_user: req.params.id } });
    res.sendStatus(200);
});

module.exports = router;