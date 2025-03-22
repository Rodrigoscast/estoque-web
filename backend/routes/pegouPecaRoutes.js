const express = require('express');
const { Op, Sequelize } = require('sequelize');
const routerPegouPeca = express.Router();
const moment = require("moment-timezone");
const { Categorias, Peca, HistoricoCompras, PegouPeca, Usuario, Projeto, Carrinho } = require('../models/Associations');
const sequelize = require('../config/database');

// Função auxiliar para obter IDs dos projetos relacionados
const obterProjetosRelacionados = async (cod_projeto) => {
    const sequelize = PegouPeca.sequelize;
    const [result] = await sequelize.query(`
        SELECT cod_projeto FROM projeto WHERE projeto_main = :cod_projeto
    `, { replacements: { cod_projeto } });

    return result.map(p => p.cod_projeto);
};

// Middleware para obter projetos relacionados
const getProjetosIDs = async (cod_projeto) => {
    const projeto = await Projeto.findByPk(cod_projeto);
    if (!projeto) return [];

    if (projeto.projeto_main === 0) {
        const projetosRelacionados = await obterProjetosRelacionados(cod_projeto);
        return [cod_projeto, ...projetosRelacionados];
    }
    return [cod_projeto];
};

// Rota para listar todos os registros de retirada de peças
routerPegouPeca.get('/', async (req, res) => {
    try {
        const pegouPecas = await PegouPeca.findAll();
        res.json(pegouPecas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar registros.' });
    }
});

// Relatório de Peças, puxar quantidade de peças retiradas em X tempo
routerPegouPeca.get('/retiradas', async (req, res) => {
    try {
        let { tempo } = req.query;

        // Converte tempo para número e garante que esteja entre 1 e 12 meses
        tempo = parseInt(tempo);
        if (isNaN(tempo) || tempo < 1 || tempo > 12) {
            return res.status(400).json({ error: 'O tempo deve ser um número entre 1 e 12 meses.' });
        }

        const dataInicio = new Date();
        dataInicio.setMonth(dataInicio.getMonth() - tempo); // Retrocede o número de meses solicitado

        const pegouPecas = await PegouPeca.findAll({
            attributes: [
                'cod_peca',
                [sequelize.fn('SUM', sequelize.col('quantidade')), 'total_retirado']
            ],
            include: [
                {
                    model: Carrinho,
                    attributes: [],
                    required: true, // Garante que só traga registros com Carrinho vinculado
                    where: {
                        data_final: {
                            [Op.gte]: dataInicio
                        }
                    }
                }
            ],
            group: ['cod_peca'],
            raw: true // Retorna apenas objetos JavaScript puros
        });

        // Formata os dados no formato desejado
        const resultadoFormatado = pegouPecas.map(item => ({
            cod_peca: item.cod_peca,
            quantidade: Number(item.total_retirado) // Garante que o valor seja numérico
        }));

        res.json(resultadoFormatado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar registros.' });
    }
});


//Cadastra peça sendo única ou sendo carrinho do APP
routerPegouPeca.post("/", async (req, res) => {
    const transaction = await PegouPeca.sequelize.transaction(); // Inicia uma transação

    try {
        let { data_pegou, cod_user, cod_projeto, cod_peca, quantidade, itens } = req.body;

        // Converte a data para o fuso de Brasília
        data_pegou = moment.tz(data_pegou, "America/Sao_Paulo").toDate();

        // Criar o carrinho
        const carrinho = await Carrinho.create(
            { data_inicio: data_pegou }, // Apenas data_inicio é obrigatória
            { transaction }
        );

        // Verifica se a requisição veio no formato individual ou em lote
        const registros = itens
            ? itens.map(item => ({
                cod_projeto: item.cod_projeto,
                cod_peca: item.cod_peca,
                quantidade: item.quantidade
            }))
            : [{ cod_projeto, cod_peca, quantidade }];

        for (const { cod_projeto, cod_peca, quantidade } of registros) {
            // Buscar a peça para verificar o estoque
            const peca = await Peca.findByPk(cod_peca, { transaction });

            if (!peca) throw new Error(`Peça ${cod_peca} não encontrada.`);

            // Criar o registro de retirada da peça
            await PegouPeca.create(
                {
                    cod_projeto,
                    cod_peca,
                    cod_user,
                    quantidade,
                    cod_carrinho: carrinho.cod_carrinho // Associa todas ao mesmo carrinho
                },
                { transaction }
            );
        }

        await transaction.commit(); // Confirma a transação
        res.json({ success: true, carrinho: carrinho.cod_carrinho });

    } catch (error) {
        await transaction.rollback(); // Desfaz a transação em caso de erro
        console.error("Erro ao criar registro:", error);
        res.status(500).json({ error: "Erro ao criar registro." });
    }
});

// Rota para retirada de peças
routerPegouPeca.post("/retirada", async (req, res) => {
    const transaction = await PegouPeca.sequelize.transaction();
    
    try {
        let { data_pegou, cod_projeto, cod_peca, cod_user, quantidade } = req.body;

        // Converte a data para o fuso de Brasília
        const data_retirou = moment.tz(data_pegou, "America/Sao_Paulo").toDate();

        // Buscar a peça para verificar o estoque
        const peca = await Peca.findByPk(cod_peca, { transaction });
        if (!peca) throw new Error(`Peça ${cod_peca} não encontrada.`);
        
        // Verifica se há estoque suficiente
        if (peca.quantidade < quantidade) throw new Error(`Estoque insuficiente para a peça ${cod_peca}.`);

        // Reduz a quantidade da peça no estoque
        peca.quantidade -= quantidade;
        await peca.save({ transaction });

        // Criar o registro de retirada da peça
        await PegouPeca.create(
            {
                cod_projeto,
                cod_peca,
                cod_user,
                quantidade,
                cod_carrinho: null, // Sem carrinho
                data_retirou
            },
            { transaction }
        );

        // Atualizar a quantidade de peças no projeto
        const projeto = await Projeto.findByPk(cod_projeto, { transaction });
        if (!projeto) throw new Error(`Projeto ${cod_projeto} não encontrado.`);

        projeto.pecas_atuais += quantidade;
        await projeto.save({ transaction });

        // Se o projeto apontar para um projeto main, atualizar também
        if (projeto.projeto_main !== 0) {
            const projetoMain = await Projeto.findByPk(projeto.projeto_main, { transaction });
            if (projetoMain) {
                projetoMain.pecas_atuais += quantidade;
                await projetoMain.save({ transaction });
            }
        }

        await transaction.commit();
        res.json({ success: true });
    } catch (error) {
        console.error("Erro capturado antes do rollback:", error);
        await transaction.rollback();
        console.error("Erro ao criar registro após rollback:", error);
        res.status(500).json({ error: error.message });
    }
});


// Rota para atualizar um registro de retirada de peça
routerPegouPeca.put('/:cod_pegou_peca', async (req, res) => {
    try {
        await PegouPeca.update(req.body, { where: { cod_pegou_peca: req.params.cod_pegou_peca } });
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar registro.' });
    }
});

// Rota para remover um registro de retirada de peça
routerPegouPeca.delete('/:cod_pegou_peca', async (req, res) => {
    try {
        await PegouPeca.destroy({ where: { cod_pegou_peca: req.params.cod_pegou_peca } });
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao remover registro.' });
    }
});

// Rota para gráfico de quantidades por data
routerPegouPeca.get('/grafico/quantidades-por-data/:cod_projeto', async (req, res) => {
    try {
        const projetosIDs = await getProjetosIDs(req.params.cod_projeto);
        const sequelize = PegouPeca.sequelize;

        const [produzidas] = await sequelize.query(`
            SELECT c.data_final::date AS data, SUM(p.quantidade) AS total
            FROM pegou_peca p
            INNER JOIN carrinho c ON p.cod_carrinho = c.cod_carrinho
            WHERE p.cod_projeto IN (:projetosIDs)
            AND p.data_retirou IS NULL
            AND c.data_final IS NOT NULL
            GROUP BY c.data_final::date
            ORDER BY c.data_final::date;
        `, { replacements: { projetosIDs } });

        const [retiradas] = await sequelize.query(`
            SELECT p.data_retirou::date AS data, SUM(p.quantidade) AS total
            FROM pegou_peca p
            WHERE p.cod_projeto IN (:projetosIDs)
            AND p.data_retirou IS NOT NULL
            AND p.cod_carrinho IS NULL
            GROUP BY p.data_retirou::date
            ORDER BY p.data_retirou::date;
        `, { replacements: { projetosIDs } });

        res.json({
            dataOptions: [
                {
                    title: "Relação de Peças Produzidas Por Dia",
                    labels: produzidas.map(row => row.data),
                    data: produzidas.map(row => parseInt(row.total, 10))
                },
                {
                    title: "Relação de Peças Retiradas Por Dia",
                    labels: retiradas.map(row => row.data),
                    data: retiradas.map(row => parseInt(row.total, 10))
                }
            ]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar dados para o gráfico.' });
    }
});

// Peças por dia busca por usuários
routerPegouPeca.get('/grafico/quantidades-por-usuario/:cod_user', async (req, res) => {
    try {
        const { cod_user } = req.params;
        const sequelize = PegouPeca.sequelize;

        const [produzidas] = await sequelize.query(`
            SELECT c.data_final::date AS data, SUM(p.quantidade) AS total
            FROM pegou_peca p
            INNER JOIN carrinho c ON p.cod_carrinho = c.cod_carrinho
            JOIN projeto pr ON p.cod_projeto = pr.cod_projeto
            LEFT JOIN projeto pm ON pr.projeto_main = pm.cod_projeto
            WHERE p.cod_user = :cod_user
            AND p.data_retirou IS NULL
            AND c.data_final IS NOT NULL
            GROUP BY c.data_final::date
            ORDER BY c.data_final::date;
        `, { replacements: { cod_user } });

        const [retiradas] = await sequelize.query(`
            SELECT p.data_retirou::date AS data, SUM(p.quantidade) AS total
            FROM pegou_peca p
            JOIN projeto pr ON p.cod_projeto = pr.cod_projeto
            LEFT JOIN projeto pm ON pr.projeto_main = pm.cod_projeto
            WHERE p.cod_user = :cod_user
            AND p.data_retirou IS NOT NULL
            AND p.cod_carrinho IS NULL
            GROUP BY p.data_retirou::date
            ORDER BY p.data_retirou::date;
        `, { replacements: { cod_user } });

        res.json({
            dataOptions: [
                {
                    title: "Relação de Peças Produzidas Por Dia",
                    labels: produzidas.map(row => row.data),
                    data: produzidas.map(row => parseInt(row.total, 10))
                },
                {
                    title: "Relação de Peças Retiradas Por Dia",
                    labels: retiradas.map(row => row.data),
                    data: retiradas.map(row => parseInt(row.total, 10))
                }
            ]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar dados para o gráfico.' });
    }
});

// Rota para gráfico de pizza considerando projetos relacionados
routerPegouPeca.get('/grafico/pizza/por-usuario/:cod_projeto', async (req, res) => {
    try {
        const { cod_projeto } = req.params;
        const projetosIDs = await getProjetosIDs(cod_projeto);
        
        const sequelize = PegouPeca.sequelize;

        const [produzidas] = await sequelize.query(`
            SELECT 
                CONCAT(split_part(u.nome, ' ', 1), ' ', split_part(u.nome, ' ', 2)) AS label, 
                SUM(p.quantidade) AS total
            FROM pegou_peca p
            JOIN usuarios u ON p.cod_user = u.cod_user
            INNER JOIN carrinho c ON p.cod_carrinho = c.cod_carrinho            
            WHERE p.cod_projeto IN (:projetosIDs)
            AND p.data_retirou IS NULL
            AND c.data_final IS NOT NULL
            GROUP BY label
            ORDER BY total DESC;
        `, { replacements: { projetosIDs } });

        const [retiradas] = await sequelize.query(`
            SELECT 
                CONCAT(split_part(u.nome, ' ', 1), ' ', split_part(u.nome, ' ', 2)) AS label, 
                SUM(p.quantidade) AS total
            FROM pegou_peca p
            JOIN usuarios u ON p.cod_user = u.cod_user          
            WHERE p.cod_projeto IN (:projetosIDs)
            AND p.data_retirou IS NOT NULL
            AND p.cod_carrinho IS NULL
            GROUP BY label
            ORDER BY total DESC;
        `, { replacements: { projetosIDs } });
      
        res.json({
            dataOptions: [
                {
                    title: "Peças Produzidas por Usuário",
                    nome: "Peças Produzidas",
                    labels: produzidas.map(row => row.label),
                    data: produzidas.map(row => parseInt(row.total, 10))
                },
                {
                    title: "Peças Retiradas por Usuário",
                    nome: "Peças Retiradas",
                    labels: retiradas.map(row => row.label),
                    data: retiradas.map(row => parseInt(row.total, 10))
                }
            ]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar dados para o gráfico de pizza.' });
    }
});

//Gráfico de tempo gasto por peça
routerPegouPeca.get('/tempo-medio-por-peca/:cod_projeto', async (req, res) => {
    try {
        const projetosIDs = await getProjetosIDs(req.params.cod_projeto);
        const sequelize = PegouPeca.sequelize;

        const [result] = await sequelize.query(`
            WITH tempo_total AS (
                SELECT 
                    p.cod_user,
                    p.cod_carrinho,
                    EXTRACT(EPOCH FROM (c.data_final - c.data_inicio)) AS tempo_gasto,
                    SUM(p.quantidade) AS total_pecas
                FROM pegou_peca p
                JOIN carrinho c ON p.cod_carrinho = c.cod_carrinho
                WHERE c.data_inicio IS NOT NULL
                AND c.data_final IS NOT NULL
                AND p.data_retirou IS NULL
                AND p.cod_projeto IN (:projetosIDs)
                GROUP BY p.cod_user, p.cod_carrinho, c.data_inicio, c.data_final
            )
            SELECT 
                CONCAT(split_part(u.nome, ' ', 1), ' ', split_part(u.nome, ' ', 2)) AS usuario,
                ROUND(AVG(t.tempo_gasto / NULLIF(t.total_pecas, 0)), 2) AS tempo_medio_por_peca
            FROM tempo_total t
            JOIN usuarios u ON t.cod_user = u.cod_user
            GROUP BY u.nome
            ORDER BY tempo_medio_por_peca ASC;
        `, { replacements: { projetosIDs } });

        res.json({
            labels: result.map(row => row.usuario),
            data: result.map(row => row.tempo_medio_por_peca)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao calcular o tempo médio por peça.' });
    }
});

// Gráfico de tempo médio gasto por peça para um usuário
routerPegouPeca.get('/tempo-medio-por-peca/usuario/:cod_user', async (req, res) => {
    try {
        const { cod_user } = req.params;
        const sequelize = PegouPeca.sequelize;

        const [result] = await sequelize.query(`
            WITH tempo_total AS (
                SELECT 
                    p.cod_carrinho,
                    EXTRACT(EPOCH FROM (c.data_final - c.data_inicio)) AS tempo_gasto,
                    SUM(p.quantidade) AS total_pecas
                FROM pegou_peca p
                JOIN carrinho c ON p.cod_carrinho = c.cod_carrinho
                WHERE c.data_inicio IS NOT NULL
                AND c.data_final IS NOT NULL
                AND p.data_retirou IS NULL
                AND p.cod_user = :cod_user
                GROUP BY p.cod_carrinho, c.data_inicio, c.data_final
            )
            SELECT 
                ROUND(AVG(t.tempo_gasto / NULLIF(t.total_pecas, 0)), 2) AS tempo_medio_por_peca
            FROM tempo_total t;
        `, { replacements: { cod_user } });

        res.json({
            tempo_medio_por_peca: result.length > 0 ? result[0].tempo_medio_por_peca : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao calcular o tempo médio por peça do usuário.' });
    }
});

// Rota para gráfico de pizza por projeto, consolidando quantidades em projetos principais
routerPegouPeca.get('/grafico/pizza/por-projeto/:cod_user', async (req, res) => {
    try {
        const { cod_user } = req.params;
        const sequelize = PegouPeca.sequelize;

        const [produzidas] = await sequelize.query(`
            SELECT 
                CASE 
                    WHEN pr.projeto_main = 0 THEN pr.nome 
                    ELSE pm.nome 
                END AS label, 
                SUM(p.quantidade) AS total
            FROM pegou_peca p
            JOIN projeto pr ON p.cod_projeto = pr.cod_projeto
            LEFT JOIN projeto pm ON pr.projeto_main = pm.cod_projeto
            INNER JOIN carrinho c ON p.cod_carrinho = c.cod_carrinho
            WHERE p.cod_user = :cod_user
            AND p.data_retirou IS NULL
            AND c.data_final IS NOT NULL
            GROUP BY label
            ORDER BY total DESC;
        `, { replacements: { cod_user } });

        const [retiradas] = await sequelize.query(`
            SELECT 
                CASE 
                    WHEN pr.projeto_main = 0 THEN pr.nome 
                    ELSE pm.nome 
                END AS label, 
                SUM(p.quantidade) AS total
            FROM pegou_peca p
            JOIN projeto pr ON p.cod_projeto = pr.cod_projeto
            LEFT JOIN projeto pm ON pr.projeto_main = pm.cod_projeto
            WHERE p.cod_user = :cod_user
            AND p.data_retirou IS NOT NULL
            AND p.cod_carrinho IS NULL
            GROUP BY label
            ORDER BY total DESC;
        `, { replacements: { cod_user } });

        res.json({
            dataOptions: [
                {
                    title: "Peças Produzidas por Projeto",
                    nome: "Peças Produzidas",
                    labels: produzidas.map(row => row.label),
                    data: produzidas.map(row => parseInt(row.total, 10))
                },
                {
                    title: "Peças Retiradas por Projeto",
                    nome: "Peças Retiradas",
                    labels: retiradas.map(row => row.label),
                    data: retiradas.map(row => parseInt(row.total, 10))
                }
            ]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar dados para o gráfico de pizza.' });
    }
});

// Peças retiradas
routerPegouPeca.get('/materiais-retirados/:cod_projeto', async (req, res) => {
    try {
        const projetosIDs = await req.params.cod_projeto;
        const sequelize = PegouPeca.sequelize;

        const [results] = await sequelize.query(`
            SELECT p.cod_peca, pc.nome, SUM(p.quantidade) AS quantidade
            FROM pegou_peca p
            JOIN pecas pc ON p.cod_peca = pc.cod_peca
            WHERE p.cod_projeto IN (:projetosIDs)
            AND p.data_retirou IS NOT NULL -- Apenas materiais retirados
            GROUP BY p.cod_peca, pc.nome
            ORDER BY pc.nome;
        `, { replacements: { projetosIDs } });

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar materiais retirados.' });
    }
});

// Peças que faltam retirar com informação do estoque
routerPegouPeca.get('/materiais-faltantes/:cod_projeto', async (req, res) => {
    try {
        const projetosIDs = await req.params.cod_projeto;
        const sequelize = PegouPeca.sequelize;

        const [results] = await sequelize.query(`
            SELECT 
                pp.cod_peca, 
                pc.nome,
                GREATEST(pp.quantidade - COALESCE(SUM(p.quantidade), 0), 0) AS quantidade,
                pc.quantidade AS estoque, -- Adiciona o estoque disponível da peça
                pc.cod_categoria
            FROM peca_projeto pp
            JOIN pecas pc ON pp.cod_peca = pc.cod_peca
            LEFT JOIN pegou_peca p 
                ON p.cod_projeto = pp.cod_projeto 
                AND p.cod_peca = pp.cod_peca
                AND p.data_retirou IS NULL -- Considera apenas peças que ainda não foram retiradas
            WHERE pp.cod_projeto = :projetosIDs
            AND (pc.cod_categoria IS NULL OR pc.cod_categoria != 1)
            GROUP BY pp.cod_peca, pc.nome, pp.quantidade, pc.quantidade, pc.cod_categoria -- Inclui estoque no GROUP BY
            HAVING GREATEST(pp.quantidade - COALESCE(SUM(p.quantidade), 0), 0) > 0
            ORDER BY pc.nome;
        `, { replacements: { projetosIDs } });

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar materiais faltantes.' });
    }
});

// Peças que faltam retirar com informação do estoque
routerPegouPeca.get('/itens-comerciais/:cod_projeto', async (req, res) => {
    try {
        const projetosIDs = await getProjetosIDs(req.params.cod_projeto);
        const sequelize = PegouPeca.sequelize;

        const [results] = await sequelize.query(`
            SELECT 
                pp.cod_peca, 
                pc.nome,
                GREATEST(pp.quantidade - COALESCE(SUM(p.quantidade), 0), 0) AS quantidade,
                pc.quantidade as estoque
            FROM peca_projeto pp
            JOIN pecas pc ON pp.cod_peca = pc.cod_peca
            LEFT JOIN pegou_peca p 
                ON p.cod_projeto = pp.cod_projeto 
                AND p.cod_peca = pp.cod_peca
            WHERE pc.cod_categoria = 1 -- Apenas itens comerciais
                AND pp.cod_projeto IN (:projetosIDs) -- Usando parâmetros seguros
            GROUP BY pp.cod_peca, pc.nome, pp.quantidade, pc.quantidade
            HAVING GREATEST(pp.quantidade - COALESCE(SUM(p.quantidade), 0), 0) > 0 -- Substituindo o alias diretamente
            ORDER BY pc.nome;
        `, { replacements: { projetosIDs } });

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar itens comerciais pendentes para retirada.' });
    }
});

// Pega peças que estão em produção mas ainda não foram retiradas
routerPegouPeca.get('/materiais-em-producao/:cod_projeto', async (req, res) => {
    try {
        const projetosIDs = await req.params.cod_projeto;
        const sequelize = PegouPeca.sequelize;

        const [results] = await sequelize.query(`
            WITH Produzindo AS (
                SELECT 
                    p.cod_peca, 
                    p.cod_carrinho,
                    pc.nome, 
                    p.quantidade,
                    p.cod_user,
                    pc.cod_categoria,  -- Pega a categoria da peça
                    TO_CHAR(c.data_inicio, 'YYYY-MM-DD HH24:MI:SS') AS data_inicio,
                    TO_CHAR(c.data_final, 'YYYY-MM-DD HH24:MI:SS') AS data_final,
                    u.nome AS usuario_nome
                FROM pegou_peca p
                JOIN pecas pc ON p.cod_peca = pc.cod_peca
                JOIN carrinho c ON p.cod_carrinho = c.cod_carrinho
                JOIN usuarios u ON p.cod_user = u.cod_user
                WHERE p.cod_projeto IN (:projetosIDs)
                AND p.data_retirou IS NULL
            ),
            Retiradas AS (
                SELECT 
                    cod_peca, 
                    SUM(quantidade) AS quantidade_retirada
                FROM pegou_peca
                WHERE cod_projeto IN (:projetosIDs)
                AND data_retirou IS NOT NULL
                AND cod_carrinho IS NULL
                GROUP BY cod_peca
            ),
            Agrupado AS (
                SELECT 
                    p.cod_peca, 
                    MAX(p.cod_carrinho) AS cod_carrinho,
                    p.nome, 
                    p.cod_categoria, -- Pega a categoria da peça
                    GREATEST(SUM(p.quantidade) - COALESCE(r.quantidade_retirada, 0), 0) AS quantidade_produzida
                FROM Produzindo p
                LEFT JOIN Retiradas r ON p.cod_peca = r.cod_peca
                WHERE p.data_final IS NOT NULL
                GROUP BY p.cod_peca, p.nome, p.cod_categoria, r.quantidade_retirada
            )
            SELECT 
                p.cod_peca, 
                p.cod_carrinho, 
                p.nome, 
                p.quantidade,
                p.cod_user,
                p.data_inicio,
                p.data_final,
                p.usuario_nome,
                p.cod_categoria,  -- Retorna o campo da categoria
                (p.cod_categoria IS NOT NULL) AS tem_categoria,  -- Retorna true se tiver categoria, senão false
                0 AS produzido
            FROM Produzindo p
            WHERE p.data_final IS NULL

            UNION ALL
            
            SELECT 
                a.cod_peca, 
                a.cod_carrinho, 
                a.nome, 
                a.quantidade_produzida AS quantidade,
                NULL AS cod_user,
                NULL AS data_inicio,
                NULL AS data_final,
                NULL AS usuario_nome,
                a.cod_categoria,  -- Retorna o campo da categoria
                (a.cod_categoria IS NOT NULL) AS categorizada,  -- Retorna true se tiver categoria, senão false
                1 AS produzido
            FROM Agrupado a
            WHERE a.quantidade_produzida > 0 -- Evita exibir peças com quantidade zerada
            ORDER BY nome ASC NULLS LAST;
        `, { replacements: { projetosIDs } });

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar materiais em produção.' });
    }
});

// Histórico de produção
routerPegouPeca.get('/historico-producao/:cod_projeto', async (req, res) => {
    try {
        const projetosIDs = await getProjetosIDs(req.params.cod_projeto);
        const sequelize = PegouPeca.sequelize;

        const [results] = await sequelize.query(`
            SELECT p.cod_pegou_peca, CONCAT(split_part(u.nome, ' ', 1), ' ', split_part(u.nome, ' ', 2)) AS usuario, pc.nome AS peca, 
                   p.quantidade, c.data_inicio, c.data_final, c.cod_carrinho,
                CASE 
                    WHEN pr.projeto_main != 0 THEN CONCAT(pm.nome, ' [', pr.nome, ']') 
                    ELSE pr.nome 
                END AS projeto
            FROM pegou_peca p
            JOIN usuarios u ON p.cod_user = u.cod_user
            JOIN pecas pc ON p.cod_peca = pc.cod_peca
            JOIN carrinho c ON p.cod_carrinho = c.cod_carrinho
            JOIN projeto pr ON p.cod_projeto = pr.cod_projeto
            LEFT JOIN projeto pm ON pr.projeto_main = pm.cod_projeto
            WHERE p.cod_projeto IN (:projetosIDs)
            AND c.data_final IS NOT NULL
            ORDER BY c.data_final DESC;
        `, { replacements: { projetosIDs } });

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar histórico de produção.' });
    }
});

// Histórico de retiradas
routerPegouPeca.get('/historico-retiradas/:cod_projeto', async (req, res) => {
    try {
        const projetosIDs = await getProjetosIDs(req.params.cod_projeto);
        const sequelize = PegouPeca.sequelize;

        const [results] = await sequelize.query(`
            SELECT p.cod_pegou_peca, CONCAT(split_part(u.nome, ' ', 1), ' ', split_part(u.nome, ' ', 2)) AS usuario, pc.nome AS peca, 
                   p.quantidade, p.data_retirou,
                CASE 
                    WHEN pr.projeto_main != 0 THEN CONCAT(pm.nome, ' [', pr.nome, ']') 
                    ELSE pr.nome 
                END AS projeto
            FROM pegou_peca p
            JOIN usuarios u ON p.cod_user = u.cod_user
            JOIN pecas pc ON p.cod_peca = pc.cod_peca
            JOIN projeto pr ON p.cod_projeto = pr.cod_projeto
            LEFT JOIN projeto pm ON pr.projeto_main = pm.cod_projeto
            WHERE p.cod_projeto IN (:projetosIDs)
            AND p.data_retirou IS NOT NULL
            AND p.cod_carrinho IS NULL
            ORDER BY p.data_retirou DESC;
        `, { replacements: { projetosIDs } });

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar histórico de peças retiradas.' });
    }
});

// Histórico de produção
routerPegouPeca.get('/historico-producao/por-usuario/:cod_user', async (req, res) => {
    try {
        const { cod_user } = req.params;
        const sequelize = PegouPeca.sequelize;

        const [results] = await sequelize.query(`
            SELECT p.cod_pegou_peca, pc.nome AS peca, 
                   p.quantidade, c.data_inicio, c.data_final, c.cod_carrinho,
                CASE 
                    WHEN pr.projeto_main != 0 THEN CONCAT(pm.nome, ' [', pr.nome, ']') 
                    ELSE pr.nome 
                END AS projeto
            FROM pegou_peca p
            JOIN pecas pc ON p.cod_peca = pc.cod_peca
            JOIN carrinho c ON p.cod_carrinho = c.cod_carrinho
            JOIN projeto pr ON p.cod_projeto = pr.cod_projeto
            LEFT JOIN projeto pm ON pr.projeto_main = pm.cod_projeto
            WHERE p.cod_user = :cod_user
            AND c.data_final IS NOT NULL
            ORDER BY c.data_final DESC;
        `, { replacements: { cod_user } });

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar histórico de produção.' });
    }
});

// Rota para histórico de retiradas por usuário, considerando nome do projeto principal
routerPegouPeca.get('/historico-retiradas/por-usuario/:cod_user', async (req, res) => {
    try {
        const { cod_user } = req.params;
        const sequelize = PegouPeca.sequelize;

        const [results, metadata] = await sequelize.query(`
            SELECT 
                p.cod_pegou_peca, 
                CASE 
                    WHEN pr.projeto_main != 0 THEN CONCAT(pm.nome, ' [', pr.nome, ']') 
                    ELSE pr.nome 
                END AS projeto,
                pc.nome AS peca,
                p.quantidade,
                p.data_retirou
            FROM pegou_peca p
            JOIN projeto pr ON p.cod_projeto = pr.cod_projeto
            LEFT JOIN projeto pm ON pr.projeto_main = pm.cod_projeto
            JOIN pecas pc ON p.cod_peca = pc.cod_peca
            WHERE p.cod_user = :cod_user
            AND p.data_retirou IS NOT NULL
            AND p.cod_carrinho IS NULL
            ORDER BY p.data_retirou DESC;
        `, {
            replacements: { cod_user },
        });

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar histórico de peças retiradas por usuário.' });
    }
});

//Finalizar produção de peças
routerPegouPeca.put('/atualizar-data-final/:cod_carrinho', async (req, res) => {
    try {
        const { cod_carrinho } = req.params;
        const { data_final } = req.body;

        if (!data_final) {
            return res.status(400).json({ error: 'A data_final é obrigatória.' });
        }

        const sequelize = PegouPeca.sequelize;
        const transaction = await sequelize.transaction();

        try {
            // Atualiza a data_final no carrinho
            const [updated] = await Carrinho.update(
                { data_final },
                { where: { cod_carrinho }, transaction }
            );

            if (!updated) {
                await transaction.rollback();
                return res.status(404).json({ error: 'Carrinho não encontrado.' });
            }

            // Pega todas as peças associadas ao cod_carrinho na tabela pegou_peca
            const pecasRetiradas = await PegouPeca.findAll({
                where: { cod_carrinho },
                transaction
            });

            if (pecasRetiradas.length === 0) {
                await transaction.rollback();
                return res.status(404).json({ error: 'Nenhuma peça encontrada para este carrinho.' });
            }

            // Atualiza a quantidade na tabela pecas
            for (const retirada of pecasRetiradas) {
                await Peca.increment(
                    { quantidade: retirada.quantidade }, // Adiciona a quantidade retirada de volta ao estoque
                    { where: { cod_peca: retirada.cod_peca }, transaction }
                );
            }

            // Confirma a transação
            await transaction.commit();
            return res.json({ success: true, message: 'Data final e estoque atualizados com sucesso.' });

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar a data final e o estoque.' });
    }
});

routerPegouPeca.get('/listas-em-producao/:cod_user', async (req, res) => {
    try {
        const codUser = req.params.cod_user;
        const sequelize = PegouPeca.sequelize;

        const [results] = await sequelize.query(`
            SELECT 
                p.cod_carrinho,
                p.cod_projeto,
                pr.nome AS nome_projeto,
                p.cod_peca,
                pc.nome AS nome_peca,
                p.quantidade,
                TO_CHAR(c.data_inicio, 'YYYY-MM-DD HH24:MI:SS') AS data_inicio,
                u.nome AS usuario_nome
            FROM pegou_peca p
            JOIN pecas pc ON p.cod_peca = pc.cod_peca
            JOIN carrinho c ON p.cod_carrinho = c.cod_carrinho
            JOIN projeto pr ON p.cod_projeto = pr.cod_projeto
            JOIN usuarios u ON p.cod_user = u.cod_user
            WHERE p.cod_user = :codUser
            AND p.cod_carrinho IS NOT NULL
            AND p.data_retirou IS NULL
            AND c.data_final IS NULL
            ORDER BY c.data_inicio ASC;
        `, { replacements: { codUser } });

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar listas em produção.' });
    }
});

module.exports = routerPegouPeca;
