const express = require('express');
const { Op, Sequelize } = require('sequelize');
const { Categorias, Peca, HistoricoCompras, PegouPeca, Usuario, Projeto, PecaProjeto } = require('../models/Associations');
const routerPeca = express.Router();

routerPeca.get('/', async (req, res) => {
    let filtroConcluido = false;
    if (req.query.concluidos !== undefined) {
        filtroConcluido = req.query.concluidos === "true";
    }

    try {
        const whereProjeto = filtroConcluido
            ? { ativo: true } // Se `concluidos=true`, pega todos os projetos ativos
            : { concluido: false, ativo: true }; // Caso contrário, pega apenas projetos ativos e não concluídos

        // Buscar peças que NÃO possuem cod_categoria = 1
        const pecasSemCategoria1 = await Peca.findAll({
            where: {
                cod_categoria: { [Op.ne]: 1 } // Filtra todas as peças que NÃO são da categoria 1
            },
            include: [
                {
                    model: PecaProjeto,
                    required: true,
                    include: [
                        {
                            model: Projeto,
                            required: true,
                            where: whereProjeto
                        }
                    ]
                }
            ]
        });

        // Buscar peças que possuem cod_categoria = 1
        const pecasCategoria1 = await Peca.findAll({
            where: {
                cod_categoria: 1
            }
        });

        // Juntar os resultados
        const pecas = [...pecasSemCategoria1, ...pecasCategoria1];

        // Ordenar em ordem alfabética pelo nome
        pecas.sort((a, b) => a.nome.localeCompare(b.nome));

        res.json(pecas);
    } catch (error) {
        console.error('Erro ao buscar peças com projetos ativos:', error);
        res.status(500).json({ error: 'Erro ao buscar peças' });
    }
});

routerPeca.post('/', async (req, res) => {
    const peca = await Peca.create(req.body);
    res.json(peca);
});

routerPeca.put('/:id', async (req, res) => {
    const { quantidade, valor_unitario } = req.body;
    const cod_peca = req.params.id;

    try {
        // Busca a peça para pegar a quantidade atual
        const peca = await Peca.findByPk(cod_peca);

        if (!peca) {
            return res.status(404).json({ error: "Peça não encontrada" });
        }

        const novaQuantidade = peca.quantidade + quantidade; // Soma a quantidade

        // Atualiza a peça (quantidade e valor)
        await Peca.update(
            { quantidade: novaQuantidade, valor: valor_unitario },
            { where: { cod_peca } }
        );

        // Insere no histórico de compras
        await HistoricoCompras.create({
            cod_peca,
            quantidade, // Quantidade adicionada
            valor: valor_unitario,
            data_compra: new Date()
        });

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar a peça e registrar o histórico." });
    }
});

// Atualizar uma Peça
routerPeca.put('/att/:id', async (req, res) => {
    try {
        await Peca.update(req.body, { where: { cod_peca: req.params.id } });
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar a peça' });
    }
});


routerPeca.delete('/:id', async (req, res) => {
    await Peca.destroy({ where: { cod_peca: req.params.id } });
    res.sendStatus(200);
});

routerPeca.get('/agrupadas', async (req, res) => {
    const { concluidos } = req.query;
    const filtroConcluido = concluidos === "true";

    try {        
        const whereProjeto = filtroConcluido
            ? { ativo: true }
            : { concluido: false, ativo: true };

        // Buscar todos os projetos principais (projeto_main = 0)
        const projetosMain = await Projeto.findAll({
            where: { ...whereProjeto, projeto_main: 0 },
            include: [{ 
                model: PecaProjeto, 
                include: [{ model: Peca, include: [Categorias] }] 
            }]
        });

        const resultado = {};

        for (const projeto of projetosMain) {
            const projetoKey = `${projeto.nome}-${projeto.cod_projeto}`;
            resultado[projetoKey] = {
                cod_projeto: projeto.cod_projeto,
                nome: projeto.nome,
                concluido: projeto.concluido,
                categorias: {},
                subprojetos: {}
            };

            // Adicionar peças do projeto principal com quantidade
            projeto.PecaProjetos.forEach(pecaProjeto => {
                const peca = pecaProjeto.Peca;
                const categoriaNome = peca.Categoria?.nome || 'Não Categorizadas';
                
                if (!resultado[projetoKey].categorias[categoriaNome]) {
                    resultado[projetoKey].categorias[categoriaNome] = {};
                }

                resultado[projetoKey].categorias[categoriaNome][peca.nome] = {
                    cod_peca: peca.cod_peca,
                    quantidade: pecaProjeto.quantidade // Adiciona a quantidade
                };
            });

            // Buscar subprojetos
            const subprojetos = await Projeto.findAll({
                where: { projeto_main: projeto.cod_projeto },
                include: [{ 
                    model: PecaProjeto, 
                    include: [{ model: Peca, include: [Categorias] }] 
                }]
            });

            for (const subprojeto of subprojetos) {
                const subprojetoKey = `${subprojeto.nome}-${subprojeto.cod_projeto}`;
                resultado[projetoKey].subprojetos[subprojetoKey] = {
                    cod_projeto: subprojeto.cod_projeto,
                    nome: subprojeto.nome,
                    categorias: {}
                };

                subprojeto.PecaProjetos.forEach(pecaProjeto => {
                    const peca = pecaProjeto.Peca;
                    const categoriaNome = peca.Categoria?.nome || 'Não Categorizadas';
                    
                    if (!resultado[projetoKey].subprojetos[subprojetoKey].categorias[categoriaNome]) {
                        resultado[projetoKey].subprojetos[subprojetoKey].categorias[categoriaNome] = {};
                    }

                    resultado[projetoKey].subprojetos[subprojetoKey].categorias[categoriaNome][peca.nome] = {
                        cod_peca: peca.cod_peca,
                        quantidade: pecaProjeto.quantidade // Adiciona a quantidade
                    };
                });
            }
        }

        res.json(Object.values(resultado));
    } catch (error) {
        console.error('Erro ao buscar peças agrupadas:', error);
        res.status(500).json({ error: 'Erro ao buscar peças' });
    }
});

module.exports = routerPeca;