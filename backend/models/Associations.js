const Categorias = require('./Categorias');
const Peca = require('./Peca');
const HistoricoCompras = require('../models/HistoricoCompras');
const Projeto = require('../models/Projeto');
const PegouPeca = require('../models/PegouPeca');
const Usuario = require('../models/Usuario');

Categorias.hasMany(Peca, { foreignKey: 'cod_categoria' });
Peca.belongsTo(Categorias, { foreignKey: 'cod_categoria' });

HistoricoCompras.belongsTo(Peca, { foreignKey: 'cod_peca' });
Peca.hasMany(HistoricoCompras, { foreignKey: 'cod_peca' });

PegouPeca.hasMany(Projeto, { foreignKey: 'cod_projeto' });
Projeto.belongsTo(PegouPeca, { foreignKey: 'cod_projeto' });

PegouPeca.hasMany(Usuario, { foreignKey: 'cod_user' });
Usuario.belongsTo(PegouPeca, { foreignKey: 'cod_user' });

PegouPeca.hasMany(Peca, { foreignKey: 'cod_peca' });
Peca.belongsTo(PegouPeca, { foreignKey: 'cod_peca' });

module.exports = { Categorias, Peca, HistoricoCompras, PegouPeca, Usuario, Projeto };
