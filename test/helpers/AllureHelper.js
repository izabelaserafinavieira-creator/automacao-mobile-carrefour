// ============================================================
// AllureHelper: fachada sobre o plugin @wdio/allure-reporter.
// Existe pra evitar import direto do plugin em cada spec e
// centralizar mudanças se a API do reporter for atualizada.
// ============================================================

const reporter = require('@wdio/allure-reporter').default;

// Severidades aceitas pelo Allure (mantidas como constantes
// pra evitar typo silencioso em strings).
const Severity = Object.freeze({
    BLOCKER:  'blocker',
    CRITICAL: 'critical',
    NORMAL:   'normal',
    MINOR:    'minor',
    TRIVIAL:  'trivial',
});

// Step do Allure: agrupa N comandos em um bloco nomeado dentro
// do relatório. Se o callback lança erro, o step é marcado
// como 'failed' (e o erro é re-propagado pra falhar o teste).
async function step(name, fn) {
    reporter.startStep(name);
    try {
        await fn();
        reporter.endStep('passed');
    } catch (err) {
        reporter.endStep('failed');
        throw err;
    }
}

module.exports = {
    Severity,

    // Adiciona label "feature" ao teste (1º nível do agrupamento Behaviors).
    feature:     (name)        => reporter.addFeature(name),

    // Adiciona label "story" ao teste (2º nível do agrupamento Behaviors).
    story:       (name)        => reporter.addStory(name),

    // Define severidade do teste (vide constante Severity).
    severity:    (level)       => reporter.addSeverity(level),

    // Texto descritivo que aparece no topo do teste no relatório.
    description: (text)        => reporter.addDescription(text, 'text'),

    // Tag livre (ex.: 'data-driven', 'smoke', 'regression').
    tag:         (label)       => reporter.addLabel('tag', label),

    // Parâmetro chave/valor que aparece junto com o teste no
    // relatório (útil em loops data-driven).
    parameter:   (name, value) => reporter.addArgument(name, String(value)),

    step,
};
