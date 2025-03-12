const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Peca = sequelize.define('Peca', {
    cod_peca: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(300), allowNull: false },
    imagem: { type: DataTypes.STRING(500) },
    quantidade: { type: DataTypes.INTEGER, allowNull: false },
    valor: { type: DataTypes.FLOAT, allowNull: false },
    cod_categoria: { type: DataTypes.INTEGER }
}, {
    tableName: 'pecas',
    timestamps: false
});

module.exports = Peca;
