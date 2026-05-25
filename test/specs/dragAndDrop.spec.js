// ============================================================
// Drag and Drop - Puzzle 3x3
// Valida a interação multi-touch mais complexa do app: arrastar
// 9 peças sequencialmente para suas drop zones correspondentes.
//
// TCs: TC-007
// ============================================================

const { expect } = require('chai');

const HomePage   = require('../pages/HomePage');
const DragPage   = require('../pages/DragPage');
const Allure     = require('../helpers/AllureHelper');
const Screenshot = require('../helpers/ScreenshotHelper');

describe('Drag and Drop - Puzzle', () => {

    // ---------------------------------------------------------
    // TC-007: Drag-and-drop completo
    // ---------------------------------------------------------
    it('TC-007 - drag-and-drop monta o puzzle completo', async () => {
        Allure.feature('Interações Mobile');
        Allure.story('Drag and Drop');
        Allure.severity(Allure.Severity.CRITICAL);
        Allure.description(
            'Interação mais complexa do app: 9 gestos de arrastar com ' +
            'hit-testing nas drop zones. Cobre coordenação multi-touch ' +
            'e timing onde bugs costumam aparecer primeiro.'
        );

        await HomePage.navigateTo('drag');
        await DragPage.waitForVisible(await DragPage.screen);

        // completePuzzle faz os 9 drags sequenciais (l1->l1, l2->l2, ...).
        await Allure.step('Arrastar as 9 peças para as posições corretas', async () => {
            await DragPage.completePuzzle();
        });

        // O botão "renew" só aparece quando todas as 9 peças estão
        // corretas. Usamos ele como indicador de sucesso.
        await Allure.step('Verificar que o puzzle foi montado', async () => {
            await Screenshot.captureStep('puzzle-completo');
            const completo = await DragPage.isPuzzleComplete();
            expect(completo, 'Botão Retry deveria estar visível ao fim do puzzle').to.be.true;
        });
    });
});
