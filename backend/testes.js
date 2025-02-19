const Usuario = require('./models/Usuario');

(async () => {
    try {
        const usuario = await Usuario.create({
            nome: 'Teste',
            email: 'teste3@email.com',
            senha: '123456'
        });
        console.log('✅ Usuário salvo:', usuario.toJSON());
    } catch (error) {
        console.error('❌ Erro ao salvar usuário:', error);
    }
})();