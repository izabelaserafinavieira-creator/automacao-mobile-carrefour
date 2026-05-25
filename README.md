# Automação de Testes — Mobile Android

[![Mobile Tests](https://github.com/izabelaserafinavieira-creator/automacao-mobile-carrefour/actions/workflows/mobile-tests.yml/badge.svg)](https://github.com/izabelaserafinavieira-creator/automacao-mobile-carrefour/actions/workflows/mobile-tests.yml)

Projeto de automação mobile do app [native-demo-app](https://github.com/webdriverio/native-demo-app), cobrindo login, cadastro, validações de formulário, navegação por abas, gestos (drag-and-drop e swipe) e componentes (switch, dropdown). Roda em emulador Android local e em dispositivo Android real via BrowserStack.

---

## O que cada ferramenta faz neste projeto

### WebDriverIO

WebDriverIO é o framework de automação que orquestra os testes em JavaScript.

Neste projeto o WebDriverIO é responsável por:

- Executar os arquivos `*.spec.js` da pasta `test/specs/`
- Carregar três configurações separadas por ambiente: base, emulador local e BrowserStack
- Disparar hooks globais (`afterStep`, `afterTest`) que capturam screenshots em falhas
- Integrar os reporters Spec (terminal) e Allure (HTML)
- Aplicar 1 retry em cenário falho via `mochaOpts.retries`

### Appium

Appium é o servidor de automação mobile que traduz comandos WebDriver em ações no Android.

Neste projeto o Appium é responsável por:

- Subir junto da suíte via `@wdio/appium-service` e encerrar ao final
- Instalar o APK no emulador/dispositivo e iniciar a sessão
- Encaminhar comandos ao driver UiAutomator2 (motor oficial do Google para Android)
- Expor seletores nativos: accessibility id (`~Login`), UiSelector e XPath
- Executar gestos via `mobile: swipeGesture`, `mobile: dragGesture` e `mobile: scrollGesture`

### Mocha

Mocha é o test framework BDD que estrutura os testes.

Neste projeto o Mocha é responsável por:

- Organizar os cenários em `describe` e `it`
- Executar hooks `before`, `beforeEach`, `after`, `afterEach` para reset de estado entre testes
- Permitir testes data-driven iterando sobre os arquivos JSON em `test/data/`
- Integrar com o WebDriverIO através do `@wdio/mocha-framework`

### Chai

Chai é a biblioteca de asserções BDD usada para validar comportamento.

Neste projeto o Chai é responsável por:

- Validar texto de elementos visíveis (`expect(text).to.equal(...)`)
- Verificar estado de componentes (selected, displayed, enabled)
- Confirmar mensagens em AlertDialogs nativos do Android
- Comparar resultados de gestos (peças encaixadas no puzzle, cards do carrossel)

### Allure Report

Allure é o motor de relatórios HTML que consolida os resultados.

Neste projeto o Allure é responsável por:

- Coletar dados via `@wdio/allure-reporter` em `allure-results/`
- Gerar relatório HTML em `allure-report/` com `npm run report`
- Agrupar testes por Feature/Story e exibir uma Timeline
- Anexar screenshots e logs de erro a cada falha automaticamente
- Classificar falhas em categorias (timeout, elemento ausente, asserção) via `categories.json`

### BrowserStack App Automate

BrowserStack é o cloud usado para rodar a suíte em dispositivo Android real.

Neste projeto o BrowserStack é responsável por:

- Hospedar o APK enviado pelo script `scripts/bs-upload.js`
- Fornecer dispositivos Android reais (Samsung, Pixel, OnePlus etc.)
- Aplicar as capabilities definidas em `wdio.conf.browserstack.js` via `@wdio/browserstack-service`
- Disponibilizar vídeo da execução, logs de rede e logs do device no dashboard

### GitHub Actions

GitHub Actions é o orquestrador de CI; GitHub Pages publica o relatório.

Neste projeto o GitHub Actions é responsável por:

- Disparar a pipeline em `push`, `pull_request` e `workflow_dispatch`
- Executar `install` → `upload-android` → `test-android` → `report` → `publish`
- Reaproveitar a URL `bs://` quando `BROWSERSTACK_APP_ANDROID` já está setado (pula o upload)
- Publicar o Allure no GitHub Pages em `main`/`master`

---

## Estrutura de Pastas

```
automacao-mobile-carrefour/
├── .github/
│   └── workflows/
│       └── mobile-tests.yml                  # Pipeline GitHub Actions
├── apps/
│   └── Android-NativeDemoApp.apk             # APK do app de teste
├── scripts/
│   └── bs-upload.js                          # Upload do APK para o BrowserStack
├── test/
│   ├── specs/
│   │   ├── loginValidacaoSucesso.spec.js     # TC-001
│   │   ├── loginValidacaoFalha.spec.js       # TC-003, TC-004
│   │   ├── cadastroValidacaoSucesso.spec.js  # TC-002
│   │   ├── cadastroValidacaoFalha.spec.js    # TC-005
│   │   ├── navegacaoAbas.spec.js             # TC-006
│   │   ├── dragAndDrop.spec.js               # TC-007
│   │   ├── formulariosComponentes.spec.js    # TC-008, TC-009
│   │   └── carrosselSwipe.spec.js            # TC-010
│   ├── pages/                                # Page Objects (1 classe por tela)
│   │   ├── BasePage.js                       # tap, type, swipe, espera, alert
│   │   ├── HomePage.js                       # tab bar + verificação de conteúdo
│   │   ├── LoginPage.js
│   │   ├── SignUpPage.js
│   │   ├── FormsPage.js
│   │   ├── SwipePage.js
│   │   └── DragPage.js
│   ├── data/
│   │   ├── users.json                        # Cenários de cadastro
│   │   └── forms.json                        # Opções do dropdown
│   ├── helpers/
│   │   ├── TestData.js                       # Leitura de credenciais do .env
│   │   ├── AllureHelper.js                   # Fachada sobre @wdio/allure-reporter
│   │   └── ScreenshotHelper.js               # Captura e anexa ao Allure
│   └── evidence/
│       └── screenshots/                      # PNGs gerados na execução
├── wdio.conf.base.js                         # Config compartilhada
├── wdio.conf.android.js                      # Emulador Android local
├── wdio.conf.browserstack.js                 # Dispositivo Android real
├── .env.example
├── package.json
└── README.md
```

Cada tela tem uma classe em `test/pages/`. Os seletores ficam em getters, as ações em métodos. `BasePage` concentra utilidades comuns: tap, type, swipe, espera de elemento e leitura de AlertDialog. Credenciais ficam no `.env` e são lidas via `TestData.js` — nunca direto no spec.

---

## Casos de Teste Cobertos

### Login

| ID | Cenário | Resultado Esperado |
|---|---|---|
| TC-001 | Login com credenciais válidas | AlertDialog "You are logged in" |
| TC-003 | E-mail mal formatado | Erro inline no campo de e-mail |
| TC-004 | Senha com menos de 8 caracteres | Erro inline no campo de senha |

### Cadastro

| ID | Cenário | Resultado Esperado |
|---|---|---|
| TC-002 | Cadastro com dados válidos | AlertDialog "You successfully signed up" |
| TC-005 | Senha e confirmação divergentes | Erro de confirmação de senha |

### Navegação

| ID | Cenário | Resultado Esperado |
|---|---|---|
| TC-006 | Iterar por todas as abas da tab bar com reset entre iterações | Conteúdo correto em cada aba |

### Gestos

| ID | Cenário | Resultado Esperado |
|---|---|---|
| TC-007 | Drag-and-drop monta o puzzle completo (9 peças) | Puzzle finalizado e mensagem de sucesso |
| TC-010 | Swipe esquerda/direita navega entre cards do carrossel | Card ativo muda na direção do gesto |

### Componentes de Formulário

| ID | Cenário | Resultado Esperado |
|---|---|---|
| TC-008 | Switch alterna estado e retorna ao original | Estado refletido corretamente |
| TC-009 | Dropdown seleciona cada opção (data-driven em `forms.json`) | Opção selecionada lida do elemento |

---

## Configuração do Ambiente

**Pré-requisitos:** Node.js 18+, Java JDK 17, Android Studio + SDK (API 33+), Git.

### Java JDK 17

Instala o [Temurin JDK 17 LTS — Windows x64](https://adoptium.net/temurin/releases/?version=17&package=jdk&os=windows&arch=x64). No instalador, marca **Set JAVA_HOME variable** e **Add to PATH**.

Se esqueceu de marcar `JAVA_HOME`:

```powershell
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\caminho\para\jdk-17", "User")
```

### Android Studio + SDK

Instala o [Android Studio](https://developer.android.com/studio). Na primeira abertura, deixa o Setup Wizard baixar SDK, build-tools, emulator e platform-tools.

Variáveis de ambiente (PowerShell):

```powershell
$sdk = "$env:LOCALAPPDATA\Android\Sdk"
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdk, "User")
[Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $sdk, "User")

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
foreach ($p in "$sdk\platform-tools", "$sdk\emulator", "$sdk\cmdline-tools\latest\bin") {
    if ($userPath -notlike "*$p*") { $userPath = "$userPath;$p" }
}
[Environment]::SetEnvironmentVariable("Path", $userPath, "User")
```

Se `sdkmanager` ou `avdmanager` não aparecerem no PATH:

```powershell
$url = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
Invoke-WebRequest $url -OutFile "$env:TEMP\ct.zip" -UseBasicParsing
Expand-Archive "$env:TEMP\ct.zip" "$env:TEMP\ct"
New-Item -ItemType Directory "$env:ANDROID_HOME\cmdline-tools\latest" -Force | Out-Null
Move-Item "$env:TEMP\ct\cmdline-tools\*" "$env:ANDROID_HOME\cmdline-tools\latest"
```

### Criar o AVD

```bash
sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-33" "system-images;android-33;google_apis;x86_64"
avdmanager create avd -n Pixel_6_API_33 -k "system-images;android-33;google_apis;x86_64" -d pixel_6
emulator -avd Pixel_6_API_33
```

Em outro terminal, `adb devices` deve listar `emulator-5554   device`.

### Clonar e instalar

```bash
git clone https://github.com/izabelaserafinavieira-creator/automacao-mobile-carrefour.git
cd automacao-mobile-carrefour
npm install
cp .env.example .env
```

Edita o `.env` com as credenciais de teste e (se for usar) as do BrowserStack.

### APK do app

Baixa em [native-demo-app releases](https://github.com/webdriverio/native-demo-app/releases) o `android.wdio.native.app.vX.Y.Z.apk` e renomeia para `apps/Android-NativeDemoApp.apk`.

---

## Como Executar os Testes

### Emulador Android local

```bash
npm test
```

### Dispositivo Android real (BrowserStack)

Antes da primeira execução, sobe o APK:

```bash
npm run bs:upload:android
```

O script imprime a URL `bs://...`. Cola no `.env` como `BROWSERSTACK_APP_ANDROID` e roda:

```bash
npm run test:browserstack
```

### Um spec específico

```bash
npx wdio run wdio.conf.android.js --spec test/specs/loginValidacaoSucesso.spec.js
```

### Relatório Allure

```bash
npm run report
```

Gera o HTML em `allure-report/` a partir do `allure-results/` e abre no navegador.

---

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm test` | Alias de `test:android` |
| `npm run test:android` | Suíte completa no emulador Android local |
| `npm run test:browserstack` | Suíte completa em dispositivo Android real no BrowserStack |
| `npm run report` | Gera e abre o relatório Allure |
| `npm run bs:upload:android` | Sobe o APK para o BrowserStack |

---

## Variáveis de Ambiente

Template em `.env.example`. O `.env` real não é versionado.

| Variável | Padrão | Uso |
|---|---|---|
| `ANDROID_DEVICE_NAME` | `emulator-5554` | ID do device em `adb devices` |
| `ANDROID_PLATFORM_VERSION` | `13.0` | Versão do Android |
| `ANDROID_AVD_NAME` | `Pixel_6_API_33` | Nome do AVD |
| `TEST_USER_EMAIL` | — | E-mail usado em TC-001 / TC-003 / TC-004 |
| `TEST_USER_PASSWORD` | — | Senha usada em TC-001 / TC-003 |
| `TEST_SIGNUP_EMAIL` | — | E-mail usado em TC-002 |
| `TEST_SIGNUP_PASSWORD` | — | Senha usada em TC-002 |
| `BROWSERSTACK_USERNAME` | — | Credencial BrowserStack |
| `BROWSERSTACK_ACCESS_KEY` | — | Credencial BrowserStack |
| `BROWSERSTACK_APP_ANDROID` | — | URL `bs://` do APK enviado |

---

## Pipeline de CI (GitHub Actions)

O arquivo `.github/workflows/mobile-tests.yml` executa automaticamente em `push`, `pull_request` e `workflow_dispatch`:

1. Instala dependências com `npm ci`
2. Envia o APK ao BrowserStack (pula se `BROWSERSTACK_APP_ANDROID` já estiver setado)
3. Executa `npm run test:browserstack`
4. Gera o relatório Allure
5. Publica o relatório no GitHub Pages (somente `main`/`master`)

Em **Settings > Secrets and variables > Actions**, configura:

- Secrets: `BROWSERSTACK_USERNAME`, `BROWSERSTACK_ACCESS_KEY`
- Variable (opcional): `BROWSERSTACK_APP_ANDROID` — URL `bs://` do APK

Para o GitHub Pages, em **Settings > Pages > Source**, seleciona **GitHub Actions**. URL final: `https://<owner>.github.io/<repo>`.

---

## Referências

- [WebDriverIO](https://webdriver.io/docs/gettingstarted) — framework de automação
- [Appium](https://appium.io/docs/en/latest/) — servidor de automação mobile
- [Appium UiAutomator2 Driver](https://github.com/appium/appium-uiautomator2-driver) — driver Android
- [Mocha](https://mochajs.org/) — test framework
- [Chai](https://www.chaijs.com/api/bdd/) — biblioteca de asserções
- [Allure Report](https://allurereport.org/docs/) — relatório HTML
- [BrowserStack App Automate](https://www.browserstack.com/docs/app-automate) — cloud de devices reais
- [Native Demo App](https://github.com/webdriverio/native-demo-app) — app de teste usado pelo projeto
- [Appium Inspector](https://github.com/appium/appium-inspector) — GUI para inspecionar elementos
- [Page Object Model — Martin Fowler](https://martinfowler.com/bliki/PageObject.html) — padrão usado em `test/pages/`
