const express = require('express');
const jwt = require('jsonwebtoken');
const { Categorias, Peca, HistoricoCompras, PegouPeca, Usuario, Projeto, Carrinho } = require('../models/Associations');
const routerProjeto = express.Router();
const { Sequelize } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para verificar se o projeto está ativo
const VerificarProjetoAtivo = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Token não fornecido' });

        const decoded = jwt.verify(token, JWT_SECRET);
        const projeto = await Projeto.findOne({ where: { cod_projeto: req.params.id, ativo: true } });

        if (!projeto) {
            return res.status(403).json({ error: 'Acesso negado. Projeto desativado ou não encontrado.' });
        }

        req.projeto = projeto;
        next();
    } catch (error) {
        console.error("Erro na verificação do projeto:", error);
        res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};

// Buscar projetos (ativos ou concluídos)
routerProjeto.get("/", async (req, res) => {
    try {
        const { concluidos } = req.query;
        const filtroConcluido = concluidos === "true"; // true -> concluídos, false -> ativos

        const projetos = await Projeto.findAll({
            where: { concluido: filtroConcluido, ativo: true, projeto_main: 0 },
            order: [["nome", "ASC"]],
            attributes: [
                "cod_projeto",
                "nome",
                "concluido",
                "ativo",
                "imagem",
                "pecas_atuais",
                "pecas_totais",
                "data_entrada",
                "data_entrega",
                [
                    Sequelize.literal(`(
                        SELECT TO_CHAR(MIN(c.data_final), 'YYYY-MM-DD HH24:MI:SS') 
                        FROM "carrinho" AS c
                        JOIN "pegou_peca" AS pp ON pp.cod_carrinho = c.cod_carrinho
                        WHERE pp.cod_projeto = "Projeto".cod_projeto
                    )`),
                    "primeira_retirada"
                ]
            ],
            group: ["Projeto.cod_projeto"]
        });

        res.json(projetos);
    } catch (error) {
        console.error("Erro ao buscar projetos:", error);
        res.status(500).json({ error: "Erro ao buscar projetos" });
    }
});

// Buscar um projeto específico por ID
routerProjeto.get('/:id', VerificarProjetoAtivo, async (req, res) => {
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

// Buscar todos os projetos cujo projeto_main seja igual ao id passado
routerProjeto.get('/:id/pecas', async (req, res) => {
    try {
        const subprojetos = await Projeto.findAll({
            where: { projeto_main: req.params.id, ativo: true },
            order: [["nome", "ASC"]],
        });
        res.json(subprojetos);
    } catch (error) {
        console.error("Erro ao buscar subprojetos:", error);
        res.status(500).json({ error: 'Erro ao buscar subprojetos' });
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
routerProjeto.put('/:id', VerificarProjetoAtivo, async (req, res) => {
    try {
        await Projeto.update(req.body, { where: { cod_projeto: req.params.id } });
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar o projeto' });
    }
});

// Deletar um projeto
routerProjeto.delete('/:id', VerificarProjetoAtivo, async (req, res) => {
    try {
        await Projeto.destroy({ where: { cod_projeto: req.params.id } });
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar o projeto' });
    }
});

// Desativar um projeto
routerProjeto.put('/:id/desativar', async (req, res) => {
    try {
        const projeto = await Projeto.findOne({ where: { cod_projeto: req.params.id, concluido: false } });

        if (!projeto) {
            return res.status(404).json({ error: 'Projeto não encontrado ou já está desativado' });
        }

        await Projeto.update({ ativo: false }, { where: { cod_projeto: req.params.id } });

        res.json({ message: 'Projeto desativado com sucesso' });
    } catch (error) {
        console.error("Erro ao desativar projeto:", error);
        res.status(500).json({ error: 'Erro ao desativar projeto' });
    }
});

// Concluir um projeto
routerProjeto.put('/:id/concluir', VerificarProjetoAtivo, async (req, res) => {
    try {
        const projeto = await Projeto.findOne({ where: { cod_projeto: req.params.id, ativo: true } });

        if (!projeto) {
            return res.status(404).json({ error: 'Projeto não encontrado ou já concluído' });
        }

        await Projeto.update({ concluido: true }, { where: { cod_projeto: req.params.id } });

        res.json({ message: 'Projeto concluído com sucesso' });
    } catch (error) {
        console.error("Erro ao concluir projeto:", error);
        res.status(500).json({ error: 'Erro ao concluir projeto' });
    }
});

module.exports = routerProjeto;
