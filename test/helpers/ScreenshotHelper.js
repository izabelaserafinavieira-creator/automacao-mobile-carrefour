// ============================================================
// ScreenshotHelper: captura screenshot do device, salva em
// disco e anexa ao relatório Allure como evidência.
//
// Usado em três situações:
//  1. Hook afterStep — quando um step do Mocha falha
//  2. Hook afterTest — quando o teste todo falha
//  3. Chamada manual Screenshot.captureStep('nome') no spec
// ============================================================

const fs = require('fs');
const path = require('path');

// Caminho do diretório resolvido pelo __dirname (relativo ao
// arquivo), não pelo process.cwd(). Em workers do WDIO o cwd
// pode estar em local diferente do projeto, e isso faria os
// PNGs caírem em pasta errada.
const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'evidence', 'screenshots');

// Garante que a pasta de destino existe antes de gravar.
function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Limpa caracteres inválidos pra nome de arquivo (Windows é
// restritivo: nada de /, \, :, *, ?, ", <, >, |). Limita 80
// chars pra não estourar limite do filesystem.
function sanitize(name) {
    return name.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 80);
}

// Captura screenshot, salva como PNG em disco e anexa ao Allure.
// O try em volta do addAttachment cobre o caso da captura ser
// chamada fora do contexto de teste (ex: durante onPrepare,
// antes do reporter estar pronto).
async function capture(label) {
    ensureDir(SCREENSHOT_DIR);

    const filename = `${sanitize(label)}_${Date.now()}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);

    const base64 = await browser.takeScreenshot();
    const buffer = Buffer.from(base64, 'base64');
    fs.writeFileSync(filepath, buffer);

    try {
        const reporter = require('@wdio/allure-reporter').default;
        reporter.addAttachment(label, buffer, 'image/png');
    } catch { /* reporter indisponível */ }

    return filepath;
}

module.exports = {
    // API base: chamar diretamente passando o label livre.
    capture,

    // Atalho usado nos hooks de falha (afterStep/afterTest).
    // Prefixa "FALHA:" pra agrupar visualmente no diretório.
    captureOnFailure: (testTitle) => capture(`FALHA: ${testTitle}`),

    // Atalho usado em pontos intermediários dos testes
    // (verificações manuais de evidência).
    captureStep:      (description) => capture(`PASSO: ${description}`),
};
