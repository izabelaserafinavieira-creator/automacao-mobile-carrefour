// ============================================================
// Cadastro - Cenários de SUCESSO
// Valida o fluxo positivo de registro de novo usuário.
//
// TCs: TC-002
// ============================================================

const { expect } = require('chai');

const LoginPage  = require('../pages/LoginPage');
const SignUpPage = require('../pages/SignUpPage');
const Allure     = require('../helpers/AllureHelper');
const Screenshot = require('../helpers/ScreenshotHelper');
const TestData   = require('../helpers/TestData');

describe('Cadastro - Validação de Sucesso', () => {

    // O cadastro bem-sucedido abre AlertDialog que precisa ser fechado.
    afterEach(async () => {
        await LoginPage.acceptAlert();
    });

    // ---------------------------------------------------------
    // TC-002: Cadastro positivo
    // ---------------------------------------------------------
    it('TC-002 - cadastro com dados válidos exibe alert de sucesso', async () => {
        Allure.feature('Autenticação');
        Allure.story('Cadastro');
        Allure.severity(Allure.Severity.CRITICAL);
        Allure.description(
            'Verifica que um novo usuário consegue se registrar com dados ' +
            'válidos e recebe a confirmação de sucesso.'
        );

        const { email, password, confirmPassword } = TestData.signupUser();

        await Allure.step('Abrir tela de cadastro', async () => {
            await LoginPage.open();
            await LoginPage.goToSignUp();
        });

        await Allure.step('Preencher formulário e submeter', async () => {
            await SignUpPage.register(email, password, confirmPassword);
        });

        // Mesma estratégia do login: app responde com alert nativo
        // "You successfully signed up!".
        await Allure.step('Verificar alert nativo de sucesso', async () => {
            const alertText = await SignUpPage.waitForAlertText();
            await Screenshot.captureStep('pos-cadastro');
            expect(alertText).to.include('You successfully signed up');
        });
    });
});
