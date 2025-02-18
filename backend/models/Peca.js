const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Caminho correto para a configuração do banco

const Peca = sequelize.define('Peca', {
    cod_peca: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(300), allowNull: false },
    imagem: { type: DataTypes.STRING(500) },
    quantidade: { type: DataTypes.INTEGER, allowNull: false },
    valor: { type: DataTypes.FLOAT, allowNull: false }
}, {
    tableName: 'pecas',  // Evita que o Sequelize tente pluralizar o nome da tabela
    timestamps: false       // Desativa createdAt e updatedAt
});

module.exports = Peca;