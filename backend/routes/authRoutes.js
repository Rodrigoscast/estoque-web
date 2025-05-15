const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Categorias, Peca, HistoricoCompras, PegouPeca, Usuario, Projeto } = require('../models/Associations');
const { route } = require('./projetoRoutes');
const PasswordResetToken = require('../models/PasswordResetToken');
const crypto = require('crypto');
const sendEmail = require('../scripts/email');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Rota de cadastro (opcional, se quiser permitir criação de usuários via API)
router.post('/register', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        // Verifica se o email já existe
        const usuarioExistente = await Usuario.findOne({ where: { email, ativado: 1 } });
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
    const { email, senha, permanecerLogado } = req.body;

    const usuario = await Usuario.findOne({ where: { email, ativado: true, site: true } });
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

// Rota para renovar o access token
router.post('/refresh-token-app', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
        return res.status(401).json({ error: 'Token ausente' });
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        const usuario = await Usuario.findByPk(decoded.id);

        if (!usuario) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        // Criar um novo access token
        const accessToken = jwt.sign({ id: usuario.cod_user, email: usuario.email }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token: accessToken });
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
});


//Login
router.post('/login/app', async (req, res) => {
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({ where: { email, ativado: true, app: true } });
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
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token não encontrado" });
        }

        jwt.verify(refreshToken, JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Refresh token inválido" });
            }

            const usuario = await Usuario.findByPk(decoded.id);
            if (!usuario) {
                return res.status(403).json({ message: "Usuário não encontrado" });
            }

            // Criar novo token de acesso
            const novoAccessToken = jwt.sign(
                { id: usuario.cod_user, email: usuario.email },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.cookie('accessToken', novoAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 60 * 60 * 1000 // 1 hora
            });

            res.json({ token: novoAccessToken });
        });
    } catch (error) {
        console.error("❌ Erro ao renovar token:", error);
        res.status(500).json({ message: "Erro ao renovar token" });
    }
});

router.post('/esqueciSenha', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email é obrigatório' });

        const user = await Usuario.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 1000 * 60 * 60); // Expira em 1 hora

        // Upsert correto no Sequelize
        await PasswordResetToken.upsert({ cod_user: user.cod_user, token, expires });

        const resetLink = `${process.env.FRONT_URL || 'http://localhost:3001'}/alterar-senha?token=${token}`;

        await sendEmail(email, 'Redefinição de Senha', `Clique no link para redefinir sua senha: ${resetLink}`);

        res.json({ message: 'Email de redefinição enviado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
});

router.post('/redefineSenha', async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido' });
    
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token e nova senha são obrigatórios' });
    
    const resetToken = await PasswordResetToken.findOne({ where: { token } });
    if (!resetToken || resetToken.expires < new Date()) {
        return res.status(400).json({ message: 'Token inválido ou expirado' });
    }
    
    const user = await Usuario.findByPk(resetToken.cod_user);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Usuario.update(
        { senha: hashedPassword }, 
        { where: { cod_user: user.cod_user } } // Filtro para atualizar apenas o usuário correto
    );
    
    await resetToken.destroy(); // Remove o token após o uso
    
    res.json({ message: 'Senha redefinida com sucesso' });
});

router.post('/logout', (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: "Logout realizado com sucesso" });
});

module.exports = router;
