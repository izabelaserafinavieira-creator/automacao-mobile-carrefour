// ============================================================
// Cadastro - Cenários de FALHA (validações inline)
// Valida que o app detecta entradas inválidas no formulário
// de cadastro e exibe mensagens de erro adequadas.
//
// TCs: TC-005
// ============================================================

const { expect } = require('chai');

const LoginPage  = require('../pages/LoginPage');
const SignUpPage = require('../pages/SignUpPage');
const Allure     = require('../helpers/AllureHelper');
const Screenshot = require('../helpers/ScreenshotHelper');
const TestData   = require('../helpers/TestData');

describe('Cadastro - Validação de Falha', () => {

    // Defensivo: fecha alert pendente caso haja.
    afterEach(async () => {
        await LoginPage.acceptAlert();
    });

    // ---------------------------------------------------------
    // TC-005: Senhas divergentes no cadastro
    // ---------------------------------------------------------
    it('TC-005 - cadastro com senhas divergentes exibe erro', async () => {
        Allure.feature('Autenticação');
        Allure.story('Validação de Cadastro');
        Allure.severity(Allure.Severity.NORMAL);
        Allure.description(
            'Confirmação de senha previne erros de digitação. O app deve ' +
            'detectar antes de tentar cadastrar.'
        );

        // Payload com senhas diferentes de propósito (vem do helper,
        // não são credenciais reais).
        const { email, password, confirmPassword } = TestData.mismatchUser();

        await LoginPage.open();
        await LoginPage.goToSignUp();
        await SignUpPage.register(email, password, confirmPassword);

        const mensagem = await SignUpPage.getConfirmPasswordError();
        await Screenshot.captureStep('erro-senhas-divergentes');

        // include porque o texto exato do app é "Please enter the
        // same password", mas pode variar entre versões. "same
        // password" é o trecho determinístico.
        expect(mensagem).to.include('same password');
    });
});
