const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

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

// Rota para obter informações do usuário autenticado
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        console.log("Token recebido:", token); // Debug

        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Token decodificado:", decoded); // Debug

        const usuario = await Usuario.findOne({
            where: { cod_user: decoded.id },
            attributes: { exclude: ["senha"] },
        });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        console.error("Erro ao validar token:", error); // Debug
        res.status(401).json({ error: 'Token inválido ou expirado' });
    }
});

module.exports = router;