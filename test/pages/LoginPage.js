// ============================================================
// LoginPage: tela de Login + sub-aba Sign Up.
// A tela tem duas sub-abas (Login e Sign Up) que compartilham
// alguns inputs. open() força a aba Login pra começar limpo.
// ============================================================

const BasePage = require('./BasePage');
const HomePage = require('./HomePage');

class LoginPage extends BasePage {

    // Campos de input do formulário de login.
    get emailInput()    { return $('~input-email'); }
    get passwordInput() { return $('~input-password'); }

    // Botão "LOGIN" (submete o formulário de login).
    get loginButton()   { return $('~button-LOGIN'); }

    // Sub-abas internas da tela: "Login" e "Sign up".
    get loginTab()      { return $('~button-login-container'); }
    get signUpButton()  { return $('~button-sign-up-container'); }

    // Mensagens de erro: o native-demo-app renderiza como texto
    // puro abaixo dos campos, sem accessibility id próprio.
    // Buscamos via UiSelector.textContains usando trecho único
    // e estável de cada mensagem.
    get emailError()    { return $('android=new UiSelector().textContains("valid email")'); }
    get passwordError() { return $('android=new UiSelector().textContains("at least 8")'); }

    // Navega pra tela Login e garante que a sub-aba ativa é
    // a Login (não a Sign Up, que pode ter ficado ativa de
    // um teste anterior).
    async open() {
        await HomePage.navigateTo('login');
        const tab = await this.loginTab;
        if (await tab.isExisting()) {
            await this.tap(tab);
        }
        await this.waitForVisible(await this.loginButton);
    }

    // Verifica se a tela Login está pronta pra interação.
    // Usa input-email porque ele existe nas duas sub-abas
    // (Login e Sign Up), evitando falso negativo se outro
    // teste deixou a sub-aba SignUp ativa.
    async isReady() {
        return this.isVisible(await this.emailInput);
    }

    // Preenche email + senha, fecha teclado, clica em LOGIN.
    // hideKeyboard é necessário porque o teclado pode cobrir
    // o botão LOGIN em telas menores.
    async login(email, password) {
        await this.type(await this.emailInput, email);
        await this.type(await this.passwordInput, password);
        await this.hideKeyboard();
        await this.tap(await this.loginButton);
    }

    // Alterna pra sub-aba Sign Up. Usado em TC-002 e TC-005.
    async goToSignUp() {
        await this.tap(await this.signUpButton);
    }

    // Retorna a mensagem de erro do campo email (texto puro).
    async getEmailErrorMessage() {
        return this.getText(await this.emailError);
    }

    // Retorna a mensagem de erro do campo senha (texto puro).
    async getPasswordErrorMessage() {
        return this.getText(await this.passwordError);
    }
}

module.exports = new LoginPage();
