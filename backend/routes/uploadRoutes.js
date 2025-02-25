const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const routerUpload = express.Router();

// Criar a pasta "uploads" se não existir
const uploadDir = path.join(__dirname, "../uploads"); // Corrigido para evitar problemas no caminho
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Renomeia o arquivo
  },
});

const upload = multer({ storage });

// Servir arquivos estáticos
routerUpload.use("/uploads", express.static(uploadDir));

// Rota para upload de imagem
routerUpload.post("/", upload.single("imagem"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhuma imagem enviada" });
  }

  const imagePath = `/uploads/${req.file.filename}`;
  res.json({ message: "Imagem salva!", path: imagePath });
});

module.exports = routerUpload;
