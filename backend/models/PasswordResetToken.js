// models/PasswordResetToken.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PasswordResetToken = sequelize.define('PasswordResetToken', {
    cod_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'cod_user' }, // Associa ao usuário
        onDelete: 'CASCADE',
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    expires: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = PasswordResetToken;
