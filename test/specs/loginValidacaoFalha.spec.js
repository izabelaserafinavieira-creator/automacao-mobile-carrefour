// ============================================================
// Login - Cenários de FALHA (validações inline)
// Valida que o app rejeita entradas inválidas no formulário
// de login e exibe as mensagens de erro corretas.
//
// TCs: TC-003, TC-004
// ============================================================

const { expect } = require('chai');

const LoginPage  = require('../pages/LoginPage');
const Allure     = require('../helpers/AllureHelper');
const Screenshot = require('../helpers/ScreenshotHelper');
const TestData   = require('../helpers/TestData');

describe('Login - Validação de Falha', () => {

    // Defensivo: fecha alert se algum teste anterior deixou
    // (não esperado nesse spec, mas seguro).
    afterEach(async () => {
        await LoginPage.acceptAlert();
    });

    // ---------------------------------------------------------
    // TC-003: E-mail mal formatado
    // ---------------------------------------------------------
    it('TC-003 - e-mail mal formatado exibe erro no campo', async () => {
        Allure.feature('Autenticação');
        Allure.story('Validação de Login');
        Allure.severity(Allure.Severity.NORMAL);
        Allure.description(
            'O app deve bloquear login com e-mail em formato inválido ' +
            'e mostrar mensagem clara no campo.'
        );

        const emailInvalido = 'formatoinvalido';
        // Senha válida pra garantir que o erro seja só de e-mail.
        const { password } = TestData.validUser();

        await LoginPage.open();
        await LoginPage.login(emailInvalido, password);

        // Mensagem aparece como TextView inline abaixo do campo.
        const mensagem = await LoginPage.getEmailErrorMessage();
        await Screenshot.captureStep('erro-email-invalido');

        // equal (não include) pra não passar em outras mensagens
        // que por acaso contenham "email".
        expect(mensagem).to.equal('Please enter a valid email address');
    });

    // ---------------------------------------------------------
    // TC-004: Senha com menos de 8 caracteres
    // ---------------------------------------------------------
    it('TC-004 - senha com menos de 8 caracteres exibe erro', async () => {
        Allure.feature('Autenticação');
        Allure.story('Validação de Login');
        Allure.severity(Allure.Severity.NORMAL);
        Allure.description(
            'Política mínima de senha: o app deve rejeitar senhas com ' +
            'menos de 8 caracteres antes de fazer qualquer chamada.'
        );

        // E-mail válido + senha curta força o erro apenas no campo senha.
        const { email } = TestData.validUser();
        await LoginPage.open();
        await LoginPage.login(email, '123');

        const mensagem = await LoginPage.getPasswordErrorMessage();
        await Screenshot.captureStep('erro-senha-curta');

        expect(mensagem).to.equal('Please enter at least 8 characters');
    });
});
