const express = require('express');
const sequelize = require('./config/database');
const usuarioRoutes = require('./routes/usuarioRoutes');
const projetoRoutes = require('./routes/projetoRoutes');
const pecaRoutes = require('./routes/pecaRoutes');
const pecaProjetoRoutes = require('./routes/pecaProjetoRoutes');
const pegouPecaRoutes = require('./routes/pegouPecaRoutes');

const app = express();
app.use(express.json());

app.use('/usuarios', usuarioRoutes);
app.use('/projetos', projetoRoutes);
app.use('/pecas', pecaRoutes);
app.use('/peca_projeto', pecaProjetoRoutes);
app.use('/pegou_peca', pegouPecaRoutes);

sequelize.sync().then(() => {
    console.log('Banco de dados sincronizado');
    app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
}).catch(err => console.error('Erro ao sincronizar banco de dados:', err));
