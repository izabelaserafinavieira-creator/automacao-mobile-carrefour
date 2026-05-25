// ============================================================
// SwipePage: tela "Swipe" do app. Carrossel horizontal de cards
// com títulos em CAIXA ALTA. Usada no TC-010 pra testar gesto
// horizontal entre cards.
// ============================================================

const BasePage = require('./BasePage');

class SwipePage extends BasePage {

    // Elemento exclusivo da tela Swipe (container do carrossel).
    get screen() { return $('~Swipe-screen'); }

    // Verifica se a tela Swipe carregou.
    async isReady() {
        return this.isVisible(await this.screen);
    }

    // Encontra o elemento do título do card ativo. "Ativo" = aquele
    // cujo centro horizontal está mais próximo do centro da tela.
    //
    // Em devices grandes (Samsung S23 real, etc.), mais de um card
    // fica "displayed" ao mesmo tempo — o anterior continua
    // parcialmente visível na borda. Filtrar por "primeiro do DOM"
    // retornaria sempre o mesmo título; por isso medimos posição.
    async _findActiveCardTitleElement() {
        const { width } = await driver.getWindowSize();
        const screenCenterX = width / 2;

        const textViews = await $$('android=new UiSelector().className("android.widget.TextView")');
        let best = { el: null, distance: Infinity };

        for (const el of textViews) {
            if (!await el.isDisplayed()) continue;
            const text = (await el.getText() || '').trim();
            if (text.length < 4 || !/^[A-Z][A-Z\s]+$/.test(text)) continue;

            const loc  = await el.getLocation();
            const size = await el.getSize();
            const centerX = loc.x + size.width / 2;
            const distance = Math.abs(centerX - screenCenterX);

            if (distance < best.distance) {
                best = { el, distance };
            }
        }
        return best.el;
    }

    // Retorna o texto do título do card ativo no carrossel.
    async getVisibleCardTitle() {
        const el = await this._findActiveCardTitleElement();
        if (!el) return '';
        return (await el.getText() || '').trim();
    }

    // Swipe horizontal calibrado pela posição real do carrossel.
    // O carrossel não fica na mesma altura em todo device:
    // - Pixel 6 (emulador, 2400px): carrossel ~y=1200 (50% da tela)
    // - Samsung S23 (real, 2115px): carrossel ~y=1673 (79% da tela)
    //
    // Coordenada fixa funciona em um e quebra no outro. A solução
    // é ler a Y do card visível antes de cada swipe e fazer o gesto
    // numa banda de 400px centrada nessa Y.
    //
    // IMPORTANTE: a banda horizontal precisa ficar longe das bordas
    // (left=15%, width=70% → swipe entre x=15% e x=85%). No Android
    // 13+ com navegação por gestos, swipes que começam nos primeiros
    // ~80px de qualquer borda são interpretados como "voltar" e tiram
    // o app de foco. Por isso o swipeRight estava saindo do app.
    async _swipeCarousel(direction) {
        const titleEl = await this._findActiveCardTitleElement();
        const { width, height } = await driver.getWindowSize();

        const cardY = titleEl
            ? (await titleEl.getLocation()).y
            : Math.round(height / 2);

        await driver.execute('mobile: swipeGesture', {
            left: Math.round(width * 0.15),
            top: Math.max(0, cardY - 200),
            width: Math.round(width * 0.7),
            height: 400,
            direction,
            percent: 1.0,
            speed: 3000,
        });
        await driver.pause(800);
    }

    // Swipe pra esquerda: avança o carrossel pro próximo card.
    async swipeLeft() {
        await this._swipeCarousel('left');
    }

    // Swipe pra direita: volta pro card anterior.
    async swipeRight() {
        await this._swipeCarousel('right');
    }
}

module.exports = new SwipePage();
