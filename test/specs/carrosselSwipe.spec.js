// ============================================================
// Carrossel - Gesto de Swipe Horizontal
// Valida que o carrossel de cards responde corretamente a
// swipes horizontais (esquerda avança, direita volta).
//
// TCs: TC-010
// ============================================================

const { expect } = require('chai');

const HomePage   = require('../pages/HomePage');
const SwipePage  = require('../pages/SwipePage');
const Allure     = require('../helpers/AllureHelper');
const Screenshot = require('../helpers/ScreenshotHelper');

describe('Carrossel - Swipe Horizontal', () => {

    // ---------------------------------------------------------
    // TC-010: Swipe esquerda/direita navega entre cards
    // ---------------------------------------------------------
    it('TC-010 - swipe horizontal navega entre cards do carrossel', async () => {
        Allure.feature('Navegação');
        Allure.story('Swipe');
        Allure.severity(Allure.Severity.NORMAL);

        await HomePage.navigateTo('swipe');

        // getVisibleCardTitle pega o título do card visível agora,
        // não o primeiro card do DOM (que pode estar offscreen).
        const tituloInicial = await SwipePage.getVisibleCardTitle();

        // Swipe pra esquerda avança o carrossel.
        await SwipePage.swipeLeft();
        const tituloApos = await SwipePage.getVisibleCardTitle();
        await Screenshot.captureStep('swipe-esquerda');
        expect(tituloApos).to.not.equal(tituloInicial);

        // Swipe pra direita volta. Validamos retorno ao card original.
        await SwipePage.swipeRight();
        const tituloFinal = await SwipePage.getVisibleCardTitle();
        await Screenshot.captureStep('swipe-direita');
        expect(tituloFinal).to.equal(tituloInicial);
    });
});
