// ============================================================
// TestData: centraliza acesso a dados de teste.
//
// - Credenciais válidas vêm do .env (não versionado), via
//   process.env. Nunca aparecem em arquivo versionado.
// - Payloads inválidos (cenários de erro) ficam aqui mesmo,
//   porque não são credenciais reais — são strings escolhidas
//   pra disparar validações específicas do app.
// ============================================================

require('dotenv').config();

// Lê uma variável de ambiente obrigatória. Falha cedo com
// mensagem clara se não estiver definida (evita erro confuso
// de "undefined" lá na frente).
function required(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(
            `Variável "${key}" não definida no .env. ` +
            `Copie .env.example pra .env e preencha.`
        );
    }
    return value;
}

module.exports = {
    // Credenciais válidas usadas em TC-001, TC-003 (e-mail
    // inválido + senha válida) e TC-004 (e-mail válido +
    // senha inválida). Vêm do .env.
    validUser: () => ({
        email:    required('TEST_USER_EMAIL'),
        password: required('TEST_USER_PASSWORD'),
    }),

    // Credenciais válidas pra cadastro (TC-002). Senha e
    // confirmPassword são o mesmo valor pra passar na
    // validação "same password".
    signupUser: () => {
        const password = required('TEST_SIGNUP_PASSWORD');
        return {
            email:           required('TEST_SIGNUP_EMAIL'),
            password,
            confirmPassword: password,
        };
    },

    // Payload com senhas DIFERENTES de propósito, usado em
    // TC-005 pra disparar o erro "Please enter the same
    // password". Não é credencial real, é uma fixture inválida.
    mismatchUser: () => ({
        email:           'mismatch-test@example.com',
        password:        'FirstPass1!',
        confirmPassword: 'SecondPass1!',
    }),
};
