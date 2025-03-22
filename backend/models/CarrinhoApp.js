const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CarrinhoApp = sequelize.define('CarrinhoApp', {
    cod_carrinho_app: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cod_user: { type: DataTypes.INTEGER },
    cod_projeto: { type: DataTypes.INTEGER },
    cod_peca: { type: DataTypes.INTEGER },
    quantidade: { type: DataTypes.INTEGER, allowNull: false },
}, {
    tableName: 'carrinho_app',  // Evita que o Sequelize tente pluralizar o nome da tabela
    timestamps: false       // Desativa createdAt e updatedAt
});

module.exports = CarrinhoApp;