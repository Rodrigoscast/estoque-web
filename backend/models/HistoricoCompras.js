const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Peca = require('./Peca');

const HistoricoCompras = sequelize.define('HistoricoCompras', {
    cod_historico: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cod_peca: { type: DataTypes.INTEGER, allowNull: false },
    quantidade: { type: DataTypes.INTEGER, allowNull: false },
    valor: { type: DataTypes.FLOAT, allowNull: false },
    data_compra: { type: DataTypes.DATE, allowNull: false },
}, {
    tableName: 'historico_compras',
    timestamps: false
});

module.exports = HistoricoCompras;
