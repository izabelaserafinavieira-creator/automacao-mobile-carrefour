// ============================================================
// Formulários - Componentes de UI
// Valida componentes interativos da tela "Forms":
//   - Switch toggle (estado liga/desliga)
//   - Dropdown picker (seleção de opções)
//
// TCs: TC-008, TC-009
// ============================================================

const { expect } = require('chai');

const HomePage   = require('../pages/HomePage');
const FormsPage  = require('../pages/FormsPage');
const Allure     = require('../helpers/AllureHelper');
const Screenshot = require('../helpers/ScreenshotHelper');

// Dados data-driven para o dropdown.
const forms = require('../data/forms.json');

describe('Formulários - Componentes', () => {

    // ---------------------------------------------------------
    // TC-008: Switch alterna entre ligado/desligado
    // ---------------------------------------------------------
    it('TC-008 - switch alterna entre estados ligado/desligado', async () => {
        Allure.feature('Formulários');
        Allure.story('Switch');
        Allure.severity(Allure.Severity.MINOR);

        await HomePage.navigateTo('forms');

        // isSwitchOn lê o atributo "checked" do switch e retorna
        // boolean. A comparação é feita pelo boolean, não pelo
        // atributo cru.
        const estadoInicial = await FormsPage.isSwitchOn();
        await FormsPage.toggleSwitch();
        const estadoApos = await FormsPage.isSwitchOn();

        await Screenshot.captureStep('switch-apos-toggle');
        expect(estadoApos).to.not.equal(estadoInicial);

        // Volta ao estado original pra não poluir a próxima execução
        // (importante porque noReset:false não reseta o estado da UI).
        await FormsPage.toggleSwitch();
        expect(await FormsPage.isSwitchOn()).to.equal(estadoInicial);
    });

    // ---------------------------------------------------------
    // TC-009: Dropdown data-driven (3 opções)
    // ---------------------------------------------------------
    it('TC-009 - dropdown exibe a opção selecionada (data-driven)', async () => {
        Allure.feature('Formulários');
        Allure.story('Dropdown');
        Allure.severity(Allure.Severity.NORMAL);
        Allure.tag('data-driven');

        await HomePage.navigateTo('forms');

        // Itera sobre as 3 opções definidas em forms.json. Cada
        // iteração é um sub-step no Allure pra rastreabilidade.
        for (const optionText of forms.dropdownOptions) {
            await Allure.step(`Opção: ${optionText}`, async () => {
                await FormsPage.selectDropdownOption(optionText);
                await Screenshot.captureStep(`dropdown-${optionText.replace(/[^a-z0-9]/gi, '-')}`);

                // Verifica diretamente se o texto da opção aparece
                // na tela após a seleção (mais robusto que ler o
                // conteúdo do container do Dropdown).
                const selecionado = await FormsPage.isOptionSelected(optionText);
                expect(selecionado, `Opção "${optionText}" não aparece após seleção`).to.be.true;
            });
        }
    });
});
