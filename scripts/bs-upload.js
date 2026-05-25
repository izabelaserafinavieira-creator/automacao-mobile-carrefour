#!/usr/bin/env node
// ============================================================
// Sobe o APK Android ao BrowserStack App Automate e imprime a
// URL bs:// retornada. Chamado pelo script npm bs:upload:android.
//
// Usamos Node em vez de curl pra rodar igual em Windows e
// Linux/Mac e pra ler o .env automaticamente.
// ============================================================

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

const platform = process.argv[2];

if (platform !== 'android') {
    console.error(`[ERRO] Uso: node scripts/bs-upload.js android`);
    process.exit(1);
}

const APK_PATH = 'apps/Android-NativeDemoApp.apk';

function fail(msg) {
    console.error(`[ERRO] ${msg}`);
    process.exit(1);
}

const { BROWSERSTACK_USERNAME: user, BROWSERSTACK_ACCESS_KEY: key } = process.env;
if (!user || !key) {
    fail('Defina BROWSERSTACK_USERNAME e BROWSERSTACK_ACCESS_KEY no .env');
}

const filePath = path.resolve(APK_PATH);
if (!fs.existsSync(filePath)) {
    fail(`Arquivo não encontrado: ${filePath}`);
}

// Monta o body multipart/form-data manualmente.
const boundary = `----bs-upload-${Date.now()}`;
const fileBuffer = fs.readFileSync(filePath);
const fileName = path.basename(filePath);

const head = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
    `Content-Type: application/octet-stream\r\n\r\n`,
    'utf8'
);
const tail = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
const body = Buffer.concat([head, fileBuffer, tail]);

const auth = Buffer.from(`${user}:${key}`).toString('base64');
const req = https.request({
    hostname: 'api-cloud.browserstack.com',
    path: '/app-automate/upload',
    method: 'POST',
    headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
    },
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.app_url) {
                console.log(`Upload concluido: ${json.app_url}`);
                console.log(`\nAtualize seu .env com:`);
                console.log(`BROWSERSTACK_APP_ANDROID=${json.app_url}`);
            } else {
                fail(`Resposta inesperada: ${data}`);
            }
        } catch {
            fail(`Resposta inválida: ${data}`);
        }
    });
});

req.on('error', (err) => fail(`Falha na requisição: ${err.message}`));
console.log(`Enviando ${fileName} (${(body.length / 1024 / 1024).toFixed(1)} MB) ao BrowserStack...`);
req.write(body);
req.end();
