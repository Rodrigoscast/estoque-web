const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Categorias, Peca, HistoricoCompras, PegouPeca, Usuario, Projeto } = require('../models/Associations');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para verificar se o usuário está ativo
const verificarUsuarioAtivo = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const usuario = await Usuario.findOne({ where: { cod_user: decoded.id, ativado: true } });

        if (!usuario) {
            return res.status(403).json({ error: 'Acesso negado. Usuário desativado ou não encontrado.' });
        }

        req.usuario = usuario; // Passa o usuário para a requisição
        next();
    } catch (error) {
        console.error("Erro na verificação do usuário:", error);
        res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};

// Buscar apenas usuários ativos e ordenar por nome
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            where: { ativado: true },
            attributes: { exclude: ["senha"] },
            order: [['nome', 'ASC']] // Ordena por nome de forma crescente (A-Z)
        });
        res.json(usuarios);
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

// Atualizar usuário (somente se estiver ativo)
router.put('/:id', verificarUsuarioAtivo, async (req, res) => {
    try {
        await Usuario.update(req.body, { where: { cod_user: req.params.id, ativado: true } });
        res.sendStatus(200);
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

// Deletar usuário (somente se estiver ativo)
router.delete('/:id', verificarUsuarioAtivo, async (req, res) => {
    try {
        await Usuario.destroy({ where: { cod_user: req.params.id, ativado: true } });
        res.sendStatus(200);
    } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
});

// Obter informações do usuário autenticado
router.get('/me', verificarUsuarioAtivo, async (req, res) => {
    res.json(req.usuario);
});

// Buscar um usuário pelo ID (somente se estiver ativo)
router.get('/:id', verificarUsuarioAtivo, async (req, res) => {
    try {
        const usuario = await Usuario.findOne({
            where: { cod_user: req.params.id, ativado: true },
            attributes: { exclude: ["senha"] }
        });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado ou desativado' });
        }

        res.json(usuario);
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
});

// Desativar um usuário
router.put('/:id/desativar', verificarUsuarioAtivo, async (req, res) => {
    try {
        const usuario = await Usuario.findOne({ where: { cod_user: req.params.id, ativado: true } });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado ou já está desativado' });
        }

        await Usuario.update({ ativado: false }, { where: { cod_user: req.params.id } });

        res.json({ message: 'Usuário desativado com sucesso' });
    } catch (error) {
        console.error("Erro ao desativar usuário:", error);
        res.status(500).json({ error: 'Erro ao desativar usuário' });
    }
});

module.exports = router;
