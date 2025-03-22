const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Carrinho = sequelize.define('Carrinho', {
    cod_carrinho: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data_inicio: { type: DataTypes.DATE, allowNull: false },
    data_final: { type: DataTypes.DATE },
}, {
    tableName: 'carrinho',
    timestamps: false
});

module.exports = Carrinho;