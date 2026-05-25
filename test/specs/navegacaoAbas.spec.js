// ============================================================
// Navegação - Menu inferior (tab bar)
// Valida que todas as abas do menu inferior abrem as telas
// corretas e que o conteúdo carrega.
//
// TCs: TC-006
// ============================================================

const { expect } = require('chai');

const HomePage   = require('../pages/HomePage');
const LoginPage  = require('../pages/LoginPage');
const FormsPage  = require('../pages/FormsPage');
const SwipePage  = require('../pages/SwipePage');
const DragPage   = require('../pages/DragPage');
const Allure     = require('../helpers/AllureHelper');
const Screenshot = require('../helpers/ScreenshotHelper');

describe('Navegação - Menu Inferior', () => {

    // ---------------------------------------------------------
    // TC-006: Navegação por todas as abas
    // ---------------------------------------------------------
    it('TC-006 - navega entre todas as abas do menu inferior', async () => {
        Allure.feature('Navegação');
        Allure.story('Menu Inferior');
        Allure.severity(Allure.Severity.BLOCKER);
        Allure.description(
            'Sem navegação funcional, nenhum outro recurso do app fica ' +
            'acessível. Cada aba é validada pelo conteúdo próprio da tela.'
        );

        // Cada item da lista verifica um elemento exclusivo da tela
        // de destino. Não verificar pelo botão da aba (que sempre está
        // visível) evita falso positivo de "navegação não ocorreu".
        const abas = [
            { id: 'webview', verificar: () => HomePage.isWebViewContentVisible() },
            { id: 'login',   verificar: () => LoginPage.isReady() },
            { id: 'forms',   verificar: () => FormsPage.isReady() },
            { id: 'swipe',   verificar: () => SwipePage.isReady() },
            { id: 'drag',    verificar: () => DragPage.isReady() },
        ];

        // Inicia na Home pra estado conhecido. Entre cada aba volta
        // pra Home, evitando que estado residual cause falso positivo.
        await HomePage.navigateTo('home');

        for (const aba of abas) {
            await Allure.step(`Aba: ${aba.id}`, async () => {
                await HomePage.navigateTo(aba.id);
                await Screenshot.captureStep(`aba-${aba.id}`);
                const ok = await aba.verificar();
                expect(ok, `Aba "${aba.id}" não exibiu o conteúdo esperado`).to.be.true;
                await HomePage.navigateTo('home');
            });
        }
    });
});
