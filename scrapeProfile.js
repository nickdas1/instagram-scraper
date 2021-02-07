const puppeteer = require('puppeteer');
const secrets = require('./secrets'); // add in IG credentials
const Sheet = require('./sheet');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://instagram.com');

    await page.waitForSelector('input');

    const inputs = await page.$$('input');
    await inputs[0].type(secrets.username);
    await inputs[1].type(secrets.password);

    const logInButton = (await page.$$('button'))[1];
    await logInButton.click();

    await page.waitForNavigation();

    const sheet = new Sheet();
    await sheet.load();

    const USERNAMES = (await sheet.getRows(0)).map(row => row.username);

    const profiles = [];
    for (let USERNAME of USERNAMES) {
        await page.goto(`https://www.instagram.com/${USERNAME}`);
        await page.waitForSelector('img');
        const imgSrc = await page.$eval('img', el => el.getAttribute('src'));
        const headerData = await page.$$eval('header li', els => els.map(el => el.textContent));
        const name = await page.$eval('header h1', el => el.textContent).catch(err => true);
        const bio = await page.$eval('.-vDIg span', els => els.textContent).catch(err => true);
        const link = await page.$eval('.-vDIg a', els => els.textContent).catch(err => true);
        const profile = { imgSrc, name, bio, link, username: USERNAME };
        for (let header of headerData) {
            // x posts, x followers, x following
            const [count, name] = header.split(' ');
            profile[name] = count;
        }
        profiles.push(profile);
    }

    const oldProfiles = await sheet.getRows(1);
    for (let oldProfile of oldProfiles) {
        if (USERNAMES.includes(oldProfile.username)) {
            await oldProfile.delete();
        }
    }

    await sheet.addRows(profiles, 1);

    await browser.close();
})();