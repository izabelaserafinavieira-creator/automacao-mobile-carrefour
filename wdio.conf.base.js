const fs = require('fs');
const os = require('os');
const path = require('path');

const ALLURE_DIR = path.join(process.cwd(), 'allure-results');
const SCREENSHOT_DIR = path.join(process.cwd(), 'test', 'evidence', 'screenshots');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// environment.properties popula a aba "Environment" do relatório
// Allure. Gravado em onPrepare e regravado em beforeSession pra
// capturar capabilities que o BrowserStack pode renegociar.
function writeEnvironmentProperties(capabilities) {
    ensureDir(ALLURE_DIR);
    const cap = Array.isArray(capabilities) ? capabilities[0] : capabilities;
    const lines = [
        `Platform=${cap?.platformName ?? 'N/A'}`,
        `PlatformVersion=${cap?.['appium:platformVersion'] ?? 'N/A'}`,
        `DeviceName=${cap?.['appium:deviceName'] ?? 'N/A'}`,
        `AutomationDriver=${cap?.['appium:automationName'] ?? 'N/A'}`,
        `Framework=WebDriverIO`,
        `NodeVersion=${process.version}`,
        `OS=${os.type()} ${os.release()}`,
        `ExecutionDate=${new Date().toISOString()}`,
    ];
    fs.writeFileSync(path.join(ALLURE_DIR, 'environment.properties'), lines.join('\n'));
}

// categories.json agrupa as falhas por tipo no Allure (timeout,
// elemento ausente, asserção etc).
function writeCategories() {
    ensureDir(ALLURE_DIR);
    const categories = [
        { name: 'Elemento não encontrado', messageRegex: '.*no such element.*|.*not found.*', matchedStatuses: ['failed', 'broken'] },
        { name: 'Timeout de espera',       messageRegex: '.*timeout.*|.*waitFor.*',           matchedStatuses: ['failed', 'broken'] },
        { name: 'Erro de asserção',        messageRegex: '.*AssertionError.*|.*expected.*',   matchedStatuses: ['failed'] },
        { name: 'Erro de driver / sessão',                                                     matchedStatuses: ['broken'] },
        { name: 'Testes ignorados',                                                            matchedStatuses: ['skipped'] },
    ];
    fs.writeFileSync(path.join(ALLURE_DIR, 'categories.json'), JSON.stringify(categories, null, 2));
}

exports.config = {
    runner: 'local',
    port: 4723,

    specs: ['./test/specs/**/*.spec.js'],
    maxInstances: 1,

    logLevel: 'info',
    bail: 0,
    waitforTimeout: 15000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 90000,
        // 1 retry cobre flaky de animação, popup do SO e latência do
        // BrowserStack. Falha recorrente continua quebrando.
        retries: 1,
    },

    reporters: [
        'spec',
        ['allure', {
            outputDir: 'allure-results',
            disableWebdriverStepsReporting: false,
            disableWebdriverScreenshotsReporting: false,
            addConsoleLogs: true,
        }],
    ],

    onPrepare(_config, capabilities) {
        ensureDir(ALLURE_DIR);
        ensureDir(SCREENSHOT_DIR);
        writeCategories();
        writeEnvironmentProperties(capabilities);
    },

    beforeSession(_config, capabilities) {
        writeEnvironmentProperties(capabilities);
    },

    beforeTest(test) {
        const allure = require('@wdio/allure-reporter').default;
        allure.addLabel('suite', test.parent);
    },

    // Screenshot a cada step que falhar (diferente do afterTest, que
    // dispara só no fim do teste). Ajuda a saber qual asserção
    // estava na tela quando deu ruim.
    afterStep(_step, _scenario, { error, passed }) {
        if (!passed && error) {
            const { captureOnFailure } = require('./test/helpers/ScreenshotHelper');
            captureOnFailure(`step_${Date.now()}`).catch(() => {});
        }
    },

    async afterTest(test, _ctx, { error, passed, duration }) {
        const allure = require('@wdio/allure-reporter').default;
        allure.addArgument('Duração (ms)', String(duration));

        if (!passed) {
            const { captureOnFailure } = require('./test/helpers/ScreenshotHelper');
            await captureOnFailure(test.title);

            if (error) {
                const text = `${error.message}\n\n${error.stack ?? ''}`;
                allure.addAttachment('Erro detalhado', Buffer.from(text), 'text/plain');
            }
        }
    },

    onComplete(_exitCode, _config, _capabilities, results) {
        const total = (results?.passed ?? 0) + (results?.failed ?? 0);
        const passed = results?.passed ?? 0;
        const failed = results?.failed ?? 0;
        const taxa = total ? ((passed / total) * 100).toFixed(1) : '0';

        console.log(`\nResumo: ${passed}/${total} passaram (${taxa}%), ${failed} falharam`);
        console.log(`Relatório: npm run report\n`);
    },
};
