const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Projeto = require('./Projeto'); // Importando o modelo Projeto
const Peca = require('./Peca'); // Importando o modelo Peca
const Usuario = require('./Usuario'); // Importando o modelo Peca

const PegouPeca = sequelize.define('PegouPeca', {
    cod_pegou_peca: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cod_user: { type: DataTypes.INTEGER },
    cod_projeto: { type: DataTypes.INTEGER },
    cod_peca: { type: DataTypes.INTEGER },
    quantidade: { type: DataTypes.INTEGER, allowNull: false },
    data_pegou: { type: DataTypes.DATE }
}, {
    tableName: 'pegou_peca',  // Evita que o Sequelize tente pluralizar o nome da tabela
    timestamps: false       // Desativa createdAt e updatedAt
});

PegouPeca.belongsTo(Usuario, { foreignKey: 'cod_user' });
PegouPeca.belongsTo(Projeto, { foreignKey: 'cod_projeto' });
PegouPeca.belongsTo(Peca, { foreignKey: 'cod_peca', as: 'peca' });

module.exports = PegouPeca;