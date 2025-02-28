const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Projeto = sequelize.define('Projeto', {
    cod_projeto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(300), allowNull: false },
    pecas_totais: { type: DataTypes.INTEGER, allowNull: false },
    pecas_atuais: { type: DataTypes.INTEGER, allowNull: false },
    imagem: { type: DataTypes.STRING(500) },
    data_entrada: { type: DataTypes.DATE },
    ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    concluido: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    projeto_main: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'projeto',  // Evita que o Sequelize tente pluralizar o nome da tabela
    timestamps: false       // Desativa createdAt e updatedAt
});

module.exports = Projeto;