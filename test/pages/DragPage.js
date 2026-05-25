// ============================================================
// DragPage: tela "Drag" do app. Puzzle 3x3 onde 9 peças
// precisam ser arrastadas pra suas posições correspondentes.
// É a interação mais complexa do app (multi-touch coordenado).
//
// Importante: os IDs do app v2.2.0 são minúsculos (drag-l1,
// drop-l1, não L1). Validados via uiautomator dump.
// ============================================================

const BasePage = require('./BasePage');

class DragPage extends BasePage {

    // Container da tela (validado via dump como Drag-drop-screen).
    get screen() { return $('~Drag-drop-screen'); }

    // Botão "renew" (ícone refresh) que aparece junto com a
    // mensagem de sucesso ao completar o puzzle. Usamos ele
    // como indicador determinístico de conclusão.
    get retryButton() { return $('~renew'); }

    // Selector dinâmico para uma peça arrastável.
    // Posições válidas: l1, l2, l3, c1, c2, c3, r1, r2, r3.
    piece(id)  { return $(`~drag-${id.toLowerCase()}`); }

    // Selector dinâmico para a área de destino correspondente.
    target(id) { return $(`~drop-${id.toLowerCase()}`); }

    // Verifica se a tela Drag está pronta.
    async isReady() {
        return this.isVisible(await this.screen);
    }

    // Arrasta uma peça da origem pro destino.
    // Usa 'mobile: dragGesture' do UiAutomator2 em vez da W3C
    // Actions API: a Actions API falha em devices BrowserStack
    // ("Couldn't find element for pointerMove action sequence" e
    // "actions DELETE unknown command"). dragGesture funciona em
    // ambos os ambientes (emulador local e dispositivo real).
    async dragPiece(sourceId, targetId) {
        const source = await this.piece(sourceId);
        const target = await this.target(targetId);
        await source.waitForDisplayed({ timeout: 15000 });
        await target.waitForDisplayed({ timeout: 15000 });

        const targetLoc  = await target.getLocation();
        const targetSize = await target.getSize();
        const endX = Math.round(targetLoc.x + targetSize.width / 2);
        const endY = Math.round(targetLoc.y + targetSize.height / 2);

        await driver.execute('mobile: dragGesture', {
            elementId: source.elementId,
            endX,
            endY,
            speed: 2500,
        });
        await driver.pause(400);
    }

    // Resolve o puzzle inteiro: cada peça arrasta pra sua
    // posição correspondente (l1->l1, l2->l2, ...).
    async completePuzzle() {
        const positions = ['l1', 'l2', 'l3', 'c1', 'c2', 'c3', 'r1', 'r2', 'r3'];
        for (const pos of positions) {
            await this.dragPiece(pos, pos);
        }
    }

    // Indicador booleano de conclusão: o botão "renew" só
    // aparece quando todas as 9 peças estão nas posições
    // corretas.
    async isPuzzleComplete() {
        return this.isVisible(await this.retryButton);
    }
}

module.exports = new DragPage();
