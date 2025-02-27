const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.header("x-api-key");
  
    if (!apiKey || apiKey !== process.env.JWT_SECRET) {
      return res.status(403).json({ mensagem: "Acesso negado. API Key inválida." });
    }
  
    next(); // Se o token for válido, segue para a rota
  };
  
  module.exports = apiKeyMiddleware;
  