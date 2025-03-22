const Categorias = require('./Categorias');
const Peca = require('./Peca');
const HistoricoCompras = require('../models/HistoricoCompras');
const Projeto = require('../models/Projeto');
const PegouPeca = require('../models/PegouPeca');
const Usuario = require('../models/Usuario');
const Carrinho = require('../models/Carrinho');
const PecaProjeto = require('../models/PecaProjeto');
const CarrinhoApp = require('../models/CarrinhoApp');

Categorias.hasMany(Peca, { foreignKey: 'cod_categoria' });
Peca.belongsTo(Categorias, { foreignKey: 'cod_categoria' });

HistoricoCompras.belongsTo(Peca, { foreignKey: 'cod_peca' });
Peca.hasMany(HistoricoCompras, { foreignKey: 'cod_peca' });

PegouPeca.hasMany(Projeto, { foreignKey: 'cod_projeto' });
Projeto.belongsTo(PegouPeca, { foreignKey: 'cod_projeto' });

PegouPeca.hasMany(Usuario, { foreignKey: 'cod_user' });
Usuario.belongsTo(PegouPeca, { foreignKey: 'cod_user' });

PegouPeca.belongsTo(Carrinho, { foreignKey: 'cod_carrinho' });
Carrinho.hasMany(PegouPeca, { foreignKey: 'cod_carrinho' });

PegouPeca.hasMany(Peca, { foreignKey: 'cod_peca' });
Peca.belongsTo(PegouPeca, { foreignKey: 'cod_peca' });

CarrinhoApp.hasMany(Projeto, { foreignKey: 'cod_projeto' });
Projeto.belongsTo(CarrinhoApp, { foreignKey: 'cod_projeto' });

CarrinhoApp.hasMany(Usuario, { foreignKey: 'cod_user' });
Usuario.belongsTo(CarrinhoApp, { foreignKey: 'cod_user' });

CarrinhoApp.hasMany(Peca, { foreignKey: 'cod_peca' });
Peca.belongsTo(CarrinhoApp, { foreignKey: 'cod_peca' });

// Uma Peça pode estar em vários Projetos e um Projeto pode ter várias Peças
Peca.belongsToMany(Projeto, { through: PecaProjeto, foreignKey: 'cod_peca' });
Projeto.belongsToMany(Peca, { through: PecaProjeto, foreignKey: 'cod_projeto' });

// PecaProjeto pertence a um Projeto e a uma Peça
PecaProjeto.belongsTo(Peca, { foreignKey: 'cod_peca' });
PecaProjeto.belongsTo(Projeto, { foreignKey: 'cod_projeto' });

// Opcional: Se quiser acessar todas as peças associadas a um projeto e vice-versa
Peca.hasMany(PecaProjeto, { foreignKey: 'cod_peca' });
Projeto.hasMany(PecaProjeto, { foreignKey: 'cod_projeto' });

module.exports = { Categorias, Peca, HistoricoCompras, PegouPeca, Usuario, Projeto, Carrinho, PecaProjeto, CarrinhoApp };
