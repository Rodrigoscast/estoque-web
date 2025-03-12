const express = require("express");
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment");
const unzipper = require("unzipper");
const XLSX = require("xlsx");
const jwt = require("jsonwebtoken");
const PecaProjeto = require('../models/PecaProjeto');
const { Categorias, Peca, HistoricoCompras, PegouPeca, Usuario, Projeto } = require('../models/Associations');

const { spawn } = require("child_process");

const SECRET_KEY = process.env.JWT_SECRET;
const endpointRoutes = express.Router();

// Middleware para validar JWT
function verificarJWT(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ erro: "Token JWT não fornecido." });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ erro: "Token JWT inválido." });
    }
}

// Configuração do multer para upload de arquivos
const upload = multer({ dest: "uploads/temp/" });

endpointRoutes.post("/receber-dados", verificarJWT, upload.fields([{ name: "files" }, { name: "image" }]), async (req, res) => {
    try {
        const files = req.files?.files || []; // Garante que files seja um array
        const mainProjectFile = req.body.mainProject; // Nome do arquivo principal

        // Obtém o caminho da imagem principal (se houver)
        const mainProjectImage = req.files?.image[0] || "";

        delete req.files.image;

        const projetos = [];

        if (!files || files.length === 0) {
            return res.status(400).json({ erro: "Nenhum arquivo enviado." });
        }

        for (const file of files) {
            const filePath = file.path;
            const fileName = file.originalname;
            const isMainProject = fileName === mainProjectFile;

            // Extrai imagens do .xlsx
            const imagesFolder = path.join(__dirname, "../uploads/pecas/");
            const imageMap = await extractImages(filePath, imagesFolder);

            console.log(imageMap)

            // Lê os dados do .xlsx
            const workbook = XLSX.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            let pecasTotais = 0;
            const pecasDoProjeto = [];

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row[2] || !row[4]) continue;

                const nomePeca = row[2].trim();
                const quantidade = parseInt(row[4], 10) || 0;
                const numItem = row[1]?.toString().trim() || ""; // Ajuste para pegar corretamente o número do item

                if (!nomePeca || quantidade <= 0) continue;

                let peca = await Peca.findOne({ where: { nome: nomePeca } });

                console.log(`NumItem: ${numItem}`)

                const imagePath = imageMap[`image${numItem}.png`] || "";

                if (peca) {                   
                    if (imagePath) {
                        try {
                            // Exclui a imagem recém-carregada (se existir)
                            fs.unlinkSync(path.join(imagesFolder, imagePath));
                        } catch (err) {
                            console.error(`Erro ao excluir imagem: ${imagePath}`, err);
                        }
                    }
                } else {
                    // Caso a peça não exista, cria ela
                    peca = await Peca.create({ 
                        nome: nomePeca, 
                        imagem: imagePath, 
                        quantidade: 0, 
                        valor: 0, 
                        cod_categoria: null
                    });
                }

                pecasDoProjeto.push({ cod_peca: peca.cod_peca, quantidade });
                pecasTotais += quantidade;
            }

            projetos.push({ 
                nome: fileName, 
                pecasTotais, 
                pecasDoProjeto, 
                isMainProject 
            });
        }


        let mainProjectId = null;
        let mainProjectImagePath = "";
        const dataEntrada = moment().format("YYYY-MM-DD HH:mm:ss");
        const dataEntrega = moment().add(1, "month").format("YYYY-MM-DD HH:mm:ss");

        if (mainProjectImage !== "") {
            const imageExtension = path.extname(`${mainProjectImage.originalname}`);
            const uniqueImageName = `${moment().format("YYYYMMDD_HHmmss")}${imageExtension}`;
            mainProjectImagePath = `projetos/${uniqueImageName}`;
            await fs.move(mainProjectImage.path, path.join(__dirname, "../uploads/", mainProjectImagePath));
        }

        // Primeiro, cria o projeto principal
        for (const projeto of projetos) {
            if (projeto.isMainProject) {
                const nome_correto = projeto.nome.replace(".xlsx", "");

                const novoProjeto = await Projeto.create({
                    nome: nome_correto,
                    pecas_totais: projetos.reduce((sum, p) => sum + p.pecasTotais, 0), 
                    pecas_atuais: 0,
                    imagem: mainProjectImagePath,
                    data_entrada: dataEntrada,
                    ativo: true,
                    concluido: false,
                    projeto_main: 0, // O projeto principal referencia a si mesmo como 0
                    data_entrega: dataEntrega
                });

                mainProjectId = novoProjeto.cod_projeto;

                for (const pecaProjeto of projeto.pecasDoProjeto) {
                    await PecaProjeto.create({
                        cod_projeto: novoProjeto.cod_projeto,
                        cod_peca: pecaProjeto.cod_peca,
                        quantidade: pecaProjeto.quantidade
                    });
                }

                break; // Já encontramos e criamos o projeto principal, podemos sair do loop
            }
        }

        // Agora, cria os outros projetos referenciando o projeto principal
        for (const projeto of projetos) {
            if (!projeto.isMainProject) {
                const novoProjeto = await Projeto.create({
                    nome: projeto.nome,
                    pecas_totais: projeto.pecasTotais,
                    pecas_atuais: 0,
                    imagem: "",
                    data_entrada: dataEntrada,
                    ativo: true,
                    concluido: false,
                    projeto_main: mainProjectId, // Agora já temos um ID válido do projeto principal
                    data_entrega: dataEntrega
                });

                for (const pecaProjeto of projeto.pecasDoProjeto) {
                    await PecaProjeto.create({
                        cod_projeto: novoProjeto.cod_projeto,
                        cod_peca: pecaProjeto.cod_peca,
                        quantidade: pecaProjeto.quantidade
                    });
                }
            }
        }

        res.status(200).json({ mensagem: "Arquivos processados com sucesso!" });

        // Após enviar a resposta, executa o script Python para remover o fundo das imagens
        const now = moment();
        const thirtyMinutesAgo = now.subtract(30, "minutes");
        const imagensRecentes = [];

        const imageFolder = path.join(__dirname, "../uploads/pecas/");
        const filesInFolder = await fs.readdir(imageFolder);

        for (const file of filesInFolder) {
            const match = file.match(/^(\d{8})_(\d{6})_(.*)$/); // Formato esperado
            if (match) {
                const fileDate = moment(match[1] + match[2], "YYYYMMDDHHmmss");
                if (fileDate.isAfter(thirtyMinutesAgo)) {
                    imagensRecentes.push(path.join(imageFolder, file));
                }
            }
        }

        if (imagensRecentes.length > 0) {
            const pythonProcess = spawn("python", ["scripts/remover_fundo.py", ...imagensRecentes]);

            pythonProcess.stdout.on("data", (data) => {
                console.log(`Python Output: ${data}`);
            });

            pythonProcess.stderr.on("data", (data) => {
                console.error(`Python Error: ${data}`);
            });

            pythonProcess.on("close", (code) => {
                console.log(`Script Python finalizado com código ${code}`);
            });
        }

    } catch (error) {
        console.error("Erro ao processar arquivos:", error);
        res.status(500).json({ erro: "Erro interno do servidor." });
    }
});

// Função para extrair imagens de um arquivo .xlsx
async function extractImages(xlsxFilePath, outputFolder) {
    await fs.ensureDir(outputFolder);
    const imageMap = {};

    return new Promise((resolve, reject) => {
        fs.createReadStream(xlsxFilePath)
            .pipe(unzipper.Parse())
            .on("entry", async (entry) => {
                if (entry.path.startsWith("xl/media/")) {
                    const fileName = moment().format("YYYYMMDD_HHmmss") + "_" + path.basename(entry.path);
                    const outputPath = path.join(outputFolder, fileName);
                    imageMap[path.basename(entry.path)] = `pecas/${fileName}`;
                    entry.pipe(fs.createWriteStream(outputPath));
                } else {
                    entry.autodrain();
                }
            })
            .on("close", () => resolve(imageMap))
            .on("error", reject);
    });
}

module.exports = endpointRoutes;
