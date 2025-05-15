const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
    cod_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    },
    ativado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    site: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    app: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
}, {
    tableName: 'usuarios',
    timestamps: false,
    hooks: {
        beforeCreate: async (usuario) => {
            usuario.senha = await bcrypt.hash(usuario.senha, 10);
        }
    }
});

module.exports = Usuario;
