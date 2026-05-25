// ============================================================
// Config WebDriverIO para BrowserStack App Automate (Android).
// Roda os mesmos testes do emulador local em dispositivo real
// hospedado na nuvem do BrowserStack.
// ============================================================

require('dotenv').config();
const { config: baseConfig } = require('./wdio.conf.base');

const BS_USER = process.env.BROWSERSTACK_USERNAME;
const BS_KEY  = process.env.BROWSERSTACK_ACCESS_KEY;

if (!BS_USER || !BS_KEY) {
    throw new Error(
        'Credenciais BrowserStack ausentes. Defina BROWSERSTACK_USERNAME ' +
        'e BROWSERSTACK_ACCESS_KEY no .env ou nas variáveis de ambiente.'
    );
}

if (!process.env.BROWSERSTACK_APP_ANDROID) {
    throw new Error(
        'BROWSERSTACK_APP_ANDROID ausente. Rode "npm run bs:upload:android" ' +
        'ou cole a URL bs:// no .env.'
    );
}

// Build name único por execução pra agrupar no dashboard do BrowserStack.
const buildName = `Build-${new Date().toISOString().slice(0, 16).replace('T', '-')}`;

exports.config = {
    ...baseConfig,

    user: BS_USER,
    key: BS_KEY,
    hostname: 'hub.browserstack.com',
    port: 443,
    protocol: 'https',
    path: '/wd/hub',

    services: [
        ['browserstack', {
            browserstackLocal: false,
        }],
    ],

    capabilities: [{
        platformName: 'Android',
        'appium:deviceName': 'Samsung Galaxy S23',
        'appium:platformVersion': '13.0',
        'appium:automationName': 'UiAutomator2',
        'appium:app': process.env.BROWSERSTACK_APP_ANDROID,
        'bstack:options': {
            projectName: 'Automacao-Mobile-Carrefour',
            buildName,
            sessionName: 'Android - Samsung Galaxy S23',
            debug: true,
            networkLogs: true,
            deviceLogs: true,
        },
    }],
};
