// ============================================================
// Login - Cenários de SUCESSO
// Valida o fluxo positivo de autenticação no app.
//
// TCs: TC-001
// ============================================================

const { expect } = require('chai');

const LoginPage  = require('../pages/LoginPage');
const Allure     = require('../helpers/AllureHelper');
const Screenshot = require('../helpers/ScreenshotHelper');
const TestData   = require('../helpers/TestData');

describe('Login - Validação de Sucesso', () => {

    // O login bem-sucedido abre AlertDialog que precisa ser fechado
    // pra não vazar pro próximo teste.
    afterEach(async () => {
        await LoginPage.acceptAlert();
    });

    // ---------------------------------------------------------
    // TC-001: Login positivo
    // ---------------------------------------------------------
    it('TC-001 - login com credenciais válidas exibe alert de sucesso', async () => {
        Allure.feature('Autenticação');
        Allure.story('Login');
        Allure.severity(Allure.Severity.CRITICAL);
        Allure.description(
            'Garante que o fluxo principal de autenticação está funcional. ' +
            'Em caso de falha, nenhum usuário consegue entrar no app.'
        );

        // Credenciais vêm do .env, não hardcoded.
        const { email, password } = TestData.validUser();

        // O app não troca de tela após login: mostra alert nativo
        // "You are logged in!". Validamos pelo texto do alert.
        await Allure.step('Abrir tela de login e autenticar', async () => {
            await LoginPage.open();
            await LoginPage.login(email, password);
        });

        await Allure.step('Verificar alert nativo de sucesso', async () => {
            const alertText = await LoginPage.waitForAlertText();
            await Screenshot.captureStep('pos-login');
            // Texto específico evita falso positivo com alerts de erro.
            expect(alertText).to.include('You are logged in');
        });
    });
});
