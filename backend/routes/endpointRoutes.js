const express = require("express");
const endpointRoutes = express.Router();
const apiKeyMiddleware = require("../middlewares/apiKeyMiddleware"); // Importa o middleware

endpointRoutes.post("/receber-dados", (req, res) => {
  const dadosRecebidos = req.body;

  console.log("Dados recebidos:", dadosRecebidos);

  res.status(200).json({ mensagem: "Dados recebidos com sucesso!", dados: dadosRecebidos });
});

module.exports = endpointRoutes;
