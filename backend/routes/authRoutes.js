const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
const { route } = require('./projetoRoutes');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Rota de cadastro (opcional, se quiser permitir criação de usuários via API)
router.post('/register', async (req, res) => {
    // console.log('➡️ Chegou na rota /register'); // 🚨 Log para debug

    try {
        const { nome, email, senha } = req.body;
        // console.log('📩 Dados recebidos:', { nome, email, senha }); // 🚨 Log dos dados recebidos

        // Verifica se o email já existe
        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            // console.log('⚠️ Email já cadastrado'); // 🚨 Log para saber se esse check está bloqueando
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        // Cria o usuário
        const usuario = await Usuario.create({ nome, email, senha });
        await usuario.save();
        // console.log('✅ Usuário salvo no banco:', usuario.toJSON()); // 🚨 Esse log deve aparecer

        res.status(201).json({ message: 'Usuário criado com sucesso!' });
    } catch (error) {
        console.error('❌ Erro ao criar usuário:', error); // 🚨 Captura qualquer erro
        res.status(400).json({ error: 'Erro ao criar usuário' });
    }
});


// Rota de login
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: usuario.cod_user, email: usuario.email }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
});

module.exports = router;
