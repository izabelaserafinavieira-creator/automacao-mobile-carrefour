// ============================================================
// HomePage: tela inicial + tab bar inferior do app.
// Centraliza a navegação entre todas as telas. Outros Page
// Objects chamam HomePage.navigateTo() para abrir suas telas.
// ============================================================

const BasePage = require('./BasePage');

// Mapa de tabs do native-demo-app v2.2.0.
// Importante: "Webview" tem 'v' minúsculo (não "WebView").
const TABS = {
    home:    '~Home',
    webview: '~Webview',
    login:   '~Login',
    forms:   '~Forms',
    swipe:   '~Swipe',
    drag:    '~Drag',
};

class HomePage extends BasePage {

    // Elemento exclusivo da tela Home (logo central com link).
    get homeContent() { return $('~Home-screen'); }

    // A WebView do app carrega webdriver.io. Os elementos da página
    // aparecem como accessibility ids no dump nativo (sem precisar
    // trocar de context). "WebdriverIO" é o link no header do site.
    get webViewContent() { return $('~WebdriverIO'); }

    // Navega pra uma aba do menu inferior. tabName é case-insensitive.
    // Lança erro com lista de abas válidas se passar nome errado.
    async navigateTo(tabName) {
        const id = tabName.toLowerCase();
        const selector = TABS[id];
        if (!selector) {
            throw new Error(`Aba "${tabName}" inválida. Válidas: ${Object.keys(TABS).join(', ')}`);
        }
        await this.tap(await $(selector));
        // Pequena pausa pra animação de transição da aba concluir.
        await driver.pause(500);
    }

    // Confirma que a Home está renderizada (logo visível).
    async isHomeContentVisible() {
        return this.isVisible(await this.homeContent);
    }

    // Confirma que a WebView carregou conteúdo de webdriver.io.
    // O pause de 2s cobre o tempo de fetch + render do HTML.
    async isWebViewContentVisible() {
        await driver.pause(2000);
        return this.isVisible(await this.webViewContent);
    }
}

module.exports = new HomePage();
