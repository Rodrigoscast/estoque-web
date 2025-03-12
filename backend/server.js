const express = require('express');
const sequelize = require('./config/database');
require('dotenv').config();
const authMiddleware = require('./middlewares/authMiddleware');
const path = require('path');
const cookieParser = require('cookie-parser');
const startCronJobs = require('./scripts/cron'); 

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const projetoRoutes = require('./routes/projetoRoutes');
const pecaRoutes = require('./routes/pecaRoutes');
const pecaProjetoRoutes = require('./routes/pecaProjetoRoutes');
const pegouPecaRoutes = require('./routes/pegouPecaRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');
const endpointRoutes = require('./routes/endpointRoutes');
const categoriasRoutes = require('./routes/categoriasRoutes');

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cookieParser());

// Adicione isso antes das rotas
app.use(cors({
    origin: 'http://localhost:3001', // Altere para o endereço do seu frontend
    credentials: true, // Permite envio de cookies e headers de autenticação
}));

// Rotas públicas (sem autenticação)
app.use('/auth', authRoutes);
app.use('/uploads', express.static(path.join(__dirname, "uploads")));
app.use('/endpoint', endpointRoutes);

// Rotas protegidas (aplica o authMiddleware globalmente)
app.use(authMiddleware);
app.use('/usuarios', usuarioRoutes);
app.use('/projetos', projetoRoutes);
app.use('/pecas', pecaRoutes);
app.use('/peca_projeto', pecaProjetoRoutes);
app.use('/pegou_peca', pegouPecaRoutes);
app.use('/upload', uploadRoutes);
app.use('/relatorios', relatorioRoutes);
app.use('/categorias', categoriasRoutes);

sequelize.sync().then(() => {
    console.log('Banco de dados sincronizado 🚀');
    app.listen(3000, '0.0.0.0', () => {
        console.log("Servidor rodando na porta 3000");
        startCronJobs();
    });
}).catch(err => console.error('Erro ao sincronizar banco de dados:', err));
