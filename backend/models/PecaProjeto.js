const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Projeto = require('./Projeto'); // Importando o modelo Projeto
const Peca = require('./Peca'); // Importando o modelo Peca

const PecaProjeto = sequelize.define('PecaProjeto', {
    cod_projeto: { type: DataTypes.INTEGER, primaryKey: true },
    cod_peca: { type: DataTypes.INTEGER, primaryKey: true },
    quantidade: { type: DataTypes.INTEGER, allowNull: false }
}, {
    tableName: 'peca_projeto',  // Evita que o Sequelize tente pluralizar o nome da tabela
    timestamps: false       // Desativa createdAt e updatedAt
});

module.exports = PecaProjeto;
