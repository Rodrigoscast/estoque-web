require('dotenv').config();
const { Sequelize } = require('sequelize');

// Verifica se todas as variáveis de ambiente estão definidas
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASS', 'DB_HOST', 'DB_PORT'];
requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
        console.error(`❌ ERRO: A variável ${envVar} não está definida no .env`);
        process.exit(1); // Sai do processo com erro
    }
});

// Cria a instância do Sequelize
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false, // Desativa logs no console
        pool: {
            max: 10,        // Número máximo de conexões simultâneas
            min: 0,         // Número mínimo de conexões
            acquire: 30000, // Tempo máximo para tentar adquirir uma conexão (ms)
            idle: 10000     // Tempo antes de liberar uma conexão inativa (ms)
        },
        retry: {
            max: 5 // Número máximo de tentativas de reconexão
        }
    }
);

// Testa a conexão
(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco de dados!');

        await sequelize.sync({ force: false }); // 🔄 Garante que a estrutura da tabela está sincronizada
        console.log('✅ Banco sincronizado!');
        
        const [result] = await sequelize.query("SELECT * FROM usuarios;");
        console.log('📌 Banco atual:', result);

    } catch (error) {
        console.error('❌ Erro ao conectar/sincronizar banco:', error);
    }
})();


module.exports = sequelize;
