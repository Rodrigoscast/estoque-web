const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
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
    hooks: {
        beforeCreate: async (usuario) => {
            usuario.senha = await bcrypt.hash(usuario.senha, 10);
        }
    }
});

module.exports = Usuario;
