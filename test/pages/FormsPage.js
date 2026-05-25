// ============================================================
// FormsPage: tela "Forms" do app, com 3 componentes nativos
// independentes: input de texto, switch e dropdown.
// Cada componente tem sua sequência própria de interação.
// ============================================================

const BasePage = require('./BasePage');

class FormsPage extends BasePage {

    // Input de texto + resultado refletido na tela.
    get inputField()   { return $('~text-input'); }
    get inputResult()  { return $('~input-text-result'); }

    // Switch toggle + label que reflete estado (On/Off).
    get switchToggle() { return $('~switch'); }
    get switchResult() { return $('~switch-text'); }

    // Dropdown (Picker nativo Android).
    get dropdown()     { return $('~Dropdown'); }

    // Verifica se a tela Forms carregou (input visível).
    async isReady() {
        return this.isVisible(await this.inputField);
    }

    // Digita texto no input e fecha o teclado.
    async typeInInput(text) {
        await this.type(await this.inputField, text);
        await this.hideKeyboard();
    }

    // Retorna o texto refletido abaixo do input (espelha o que
    // foi digitado em tempo real no native-demo-app).
    async getInputResult() {
        return this.getText(await this.inputResult);
    }

    // Toca no switch e espera a animação concluir.
    // Sem o pause de 300ms, isSwitchOn() pode ler estado
    // intermediário durante a transição.
    async toggleSwitch() {
        await this.tap(await this.switchToggle);
        await driver.pause(300);
    }

    // Verifica se o switch está ligado.
    // No Android (UiAutomator2), o atributo "checked" retorna
    // "true" ou "false". Retornamos boolean direto.
    async isSwitchOn() {
        const toggle = await this.switchToggle;
        return (await toggle.getAttribute('checked')) === 'true';
    }

    // Abre o dropdown e seleciona uma opção pelo texto.
    // O native-demo-app abre um BottomSheet com 3 opções, que
    // são TextViews sem accessibility id (só texto identifica).
    async selectDropdownOption(optionText) {
        await this.tap(await this.dropdown);
        await driver.pause(500);
        const option = await $(`android=new UiSelector().text("${optionText}")`);
        await this.tap(option);
        await driver.pause(500);
    }

    // Verifica se a opção selecionada aparece visível na tela.
    // Estratégia robusta: busca o texto exato no DOM após o
    // tap, em vez de tentar ler o conteúdo do container Dropdown
    // (que tem múltiplos TextViews internos confundindo a leitura).
    async isOptionSelected(optionText) {
        const el = await $(`android=new UiSelector().text("${optionText}")`);
        return this.isVisible(el);
    }
}

module.exports = new FormsPage();
