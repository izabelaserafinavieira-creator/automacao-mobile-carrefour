// ============================================================
// SignUpPage: sub-aba "Sign Up" da tela Login. Cobre o fluxo
// de cadastro com 3 inputs (email, senha, confirmar senha) e
// suas respectivas mensagens de validação inline.
// ============================================================

const BasePage = require('./BasePage');

class SignUpPage extends BasePage {

    // Campos do formulário de cadastro.
    get emailInput()           { return $('~input-email'); }
    get passwordInput()        { return $('~input-password'); }
    get confirmPasswordInput() { return $('~input-repeat-password'); }

    // Botão "SIGN UP" (submete o formulário).
    get signUpButton()         { return $('~button-SIGN UP'); }

    // Erros aparecem como texto puro abaixo dos campos (sem id próprio).
    // Cada selector busca um trecho único e estável de cada mensagem.
    get emailError()           { return $('android=new UiSelector().textContains("valid email")'); }
    get passwordError()        { return $('android=new UiSelector().textContains("at least 8")'); }
    get confirmPasswordError() { return $('android=new UiSelector().textContains("same password")'); }

    // Verifica se a sub-aba Sign Up está pronta (botão visível).
    async isReady() {
        return this.isVisible(await this.signUpButton);
    }

    // Preenche os 3 campos, fecha teclado e clica em SIGN UP.
    async register(email, password, confirmPassword) {
        await this.type(await this.emailInput, email);
        await this.type(await this.passwordInput, password);
        await this.type(await this.confirmPasswordInput, confirmPassword);
        await this.hideKeyboard();
        await this.tap(await this.signUpButton);
    }

    // Retorna mensagem de erro do campo email.
    async getEmailErrorMessage() {
        return this.getText(await this.emailError);
    }

    // Retorna mensagem de erro do campo senha.
    async getPasswordErrorMessage() {
        return this.getText(await this.passwordError);
    }

    // Retorna mensagem "Please enter the same password" (TC-005).
    async getConfirmPasswordError() {
        return this.getText(await this.confirmPasswordError);
    }
}

module.exports = new SignUpPage();
