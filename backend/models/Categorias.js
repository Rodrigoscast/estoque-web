const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Categorias = sequelize.define('Categorias', {
    cod_categoria: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(300), allowNull: false },
}, {
    tableName: 'categorias',
    timestamps: false
});

module.exports = Categorias;
