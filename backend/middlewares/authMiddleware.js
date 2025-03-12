const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Usa optional chaining

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Erro ao validar token:", error.message);
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};
