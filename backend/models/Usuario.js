const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
    cod_user: {  // Define a chave primária correta
        type: DataTypes.INTEGER,
        primaryKey: true,  // Indica que esta é a chave primária
        autoIncrement: true // Se for auto incremento
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    tableName: 'usuarios',  // Define o nome exato da tabela
    timestamps: false,      // Desativa os campos createdAt e updatedAt
    hooks: {
        beforeCreate: async (usuario) => {
            usuario.senha = await bcrypt.hash(usuario.senha, 10);
        }
    }
});

module.exports = Usuario;
