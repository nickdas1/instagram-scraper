const puppeteer = require('puppeteer');
const secrets = require('./secrets');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://instagram.com');

    await page.waitForSelector('input');

    const inputs = await page.$$('input');
    await inputs[0].type(secrets.username);
    await inputs[1].type(secrets.password);

    const logInButton = (await page.$$('button'))[1];
    await logInButton.click();

    await page.waitForNavigation();

    const USERNAME = 'champagnepapi';
    await page.goto(`https://www.instagram.com/${USERNAME}`);

    await page.waitForSelector('article a');
    await (await page.$('article a')).click();

    await page.waitForTimeout(1000);
    await (await page.$$('button'))[7].click();

    //   await browser.close();
})();