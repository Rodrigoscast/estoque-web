const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
const { route } = require('./projetoRoutes');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Rota de cadastro (opcional, se quiser permitir criação de usuários via API)
router.post('/register', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        // Verifica se o email já existe
        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        // Cria o usuário
        const usuario = await Usuario.create({ nome, email, senha });
        await usuario.save();

        // Retorna o ID do usuário criado
        res.status(201).json({ cod_user: usuario.cod_user, message: 'Usuário criado com sucesso!' });
    } catch (error) {
        console.error('❌ Erro ao criar usuário:', error);
        res.status(400).json({ error: 'Erro ao criar usuário' });
    }
});

//Login
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({ where: { email, ativado: true } });
    if (!usuario) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Criar tokens
    const accessToken = jwt.sign({ id: usuario.cod_user, email: usuario.email }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: usuario.cod_user }, JWT_SECRET, { expiresIn: '7d' });

    // Enviar refresh token no cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // Impede que o JS do frontend acesse o cookie
        secure: process.env.NODE_ENV === 'production', // True em produção (HTTPS)
        sameSite: 'Strict', // Evita envio em sites terceiros
        maxAge: 7 * 24 * 60 * 60 * 1000, // Expira em 7 dias
    });

    // Enviar access token na resposta
    res.json({ token: accessToken });
});

router.post('/refresh-token', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken; // Pega do cookie

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token não encontrado" });
        }

        jwt.verify(refreshToken, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Refresh token inválido" });
            }

            // Criar novo token de acesso
            const novoToken = jwt.sign({ id: decoded.id, email: decoded.email }, JWT_SECRET, { expiresIn: '1h' });

            console.log(`Novo token gerado para o usuário ${decoded.email}: ${novoToken}`);

            res.json({ token: novoToken });
        });
    } catch (error) {
        res.status(500).json({ message: "Erro ao renovar token" });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken');
    res.json({ message: "Logout realizado com sucesso" });
});

module.exports = router;
