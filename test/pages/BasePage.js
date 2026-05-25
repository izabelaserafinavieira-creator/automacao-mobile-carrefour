// ============================================================
// BasePage: classe abstrata herdada por todas as Page Objects.
// Concentra utilidades de baixo nível (tap, type, swipe, alert)
// pra que cada page foque só nas regras da sua tela.
// ============================================================

class BasePage {

    // Espera explícita por elemento visível. Usar antes de
    // qualquer leitura de texto.
    async waitForVisible(element, timeout = 15000) {
        await element.waitForDisplayed({ timeout });
    }

    // Tap em elemento. waitForClickable não existe em apps
    // nativos no WebDriverIO 9; usamos waitForDisplayed que é
    // a abordagem correta pra mobile native.
    async tap(element) {
        await element.waitForDisplayed({ timeout: 15000 });
        await element.click();
    }

    // Limpa o campo e digita texto. clearValue garante que
    // não fica sobrando valor anterior em data-driven loops.
    async type(element, text) {
        await this.waitForVisible(element);
        await element.clearValue();
        await element.setValue(text);
    }

    // Lê o texto de um elemento depois de garantir que está visível.
    async getText(element) {
        await this.waitForVisible(element);
        return element.getText();
    }

    // Versão tolerante de isDisplayed: retorna false em vez de
    // lançar exceção quando o elemento não existe. Só usar em
    // verificações de presença (ex.: a tela X carregou?).
    // Não usar em fluxo crítico: o catch esconde erros de driver.
    async isVisible(element) {
        try {
            return await element.isDisplayed();
        } catch {
            return false;
        }
    }

    // Fecha o teclado virtual quando aberto. Ignora erro caso
    // o teclado já esteja fechado (comum após hideKeyboard
    // duplicado em sequência).
    async hideKeyboard() {
        try { await driver.hideKeyboard(); } catch { /* já tava fechado */ }
    }

    // Espera o AlertDialog aparecer e retorna o texto da mensagem.
    // O native-demo-app usa AlertDialog Material (não alert W3C),
    // então driver.getAlertText não enxerga. Buscamos pelo TextView
    // interno via resource-id="android:id/message".
    async waitForAlertText(timeout = 5000) {
        const messageEl = await $('//*[@resource-id="android:id/message"]');
        await messageEl.waitForDisplayed({ timeout });
        return messageEl.getText();
    }

    // Fecha o AlertDialog clicando no botão OK. Não falha se não
    // houver alert. Necessário no afterEach pra não vazar alert
    // entre testes.
    // android:id/button1 é o "positive button" do AlertDialog
    // (botão da direita, geralmente OK/Sim/Confirmar).
    async acceptAlert() {
        try {
            const okBtn = await $('//*[@resource-id="android:id/button1"]');
            if (await okBtn.isExisting()) {
                await okBtn.click();
                await driver.pause(500);
            }
        } catch { /* sem alert */ }
    }

    // Gesto de swipe horizontal genérico no meio da tela.
    // Usa 'mobile: swipeGesture' (UiAutomator2) em vez da W3C
    // Actions API porque a chamada DELETE /actions (releaseActions)
    // não é suportada por todos os devices da BrowserStack.
    //
    // Pages que precisem swipear em uma região específica (ex.: o
    // carrossel da SwipePage, que muda de altura por device) devem
    // sobrescrever esse método com lógica calibrada.
    async swipe(direction = 'left') {
        const { width, height } = await driver.getWindowSize();
        await driver.execute('mobile: swipeGesture', {
            left: Math.round(width * 0.05),
            top: Math.round(height * 0.4),
            width: Math.round(width * 0.9),
            height: Math.round(height * 0.2),
            direction,
            percent: 1.0,
            speed: 3000,
        });
        await driver.pause(800);
    }

    // Scroll vertical via 'mobile: scrollGesture' (UiAutomator2).
    // Mesma razão do swipe: evita a Actions API.
    async scrollDown() {
        const { width, height } = await driver.getWindowSize();
        await driver.execute('mobile: scrollGesture', {
            left: Math.round(width * 0.1),
            top: Math.round(height * 0.2),
            width: Math.round(width * 0.8),
            height: Math.round(height * 0.6),
            direction: 'down',
            percent: 1.0,
            speed: 1500,
        });
    }
}

module.exports = BasePage;
