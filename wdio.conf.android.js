require('dotenv').config();
const path = require('path');
const { config: baseConfig } = require('./wdio.conf.base');

exports.config = {
    ...baseConfig,

    services: ['appium'],

    capabilities: [{
        platformName: 'Android',
        'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'emulator-5554',
        'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || '13.0',
        'appium:automationName': 'UiAutomator2',
        'appium:app': path.join(process.cwd(), 'apps', 'Android-NativeDemoApp.apk'),
        'appium:appPackage': 'com.wdiodemoapp',
        'appium:appActivity': 'com.wdiodemoapp.MainActivity',
        // newCommandTimeout alto evita o Appium encerrar a sessão por
        // inatividade entre comandos quando um teste tem muitos steps.
        'appium:newCommandTimeout': 240,
        'appium:autoGrantPermissions': true,
        'appium:noReset': false,
        'appium:fullReset': false,
        'appium:avd': process.env.ANDROID_AVD_NAME || 'Pixel_6_API_33',
        'appium:avdLaunchTimeout': 60000,
    }],
};
