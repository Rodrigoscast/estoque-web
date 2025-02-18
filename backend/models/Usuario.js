const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
    cod_user: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true }
}, {
    tableName: 'usuarios',  // Evita que o Sequelize tente pluralizar o nome da tabela
    timestamps: false       // Desativa createdAt e updatedAt
});

module.exports = Usuario;
