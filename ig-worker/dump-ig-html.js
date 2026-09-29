const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });
  const html = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync('ig-login.html', html, 'utf-8');
  await browser.close();
})();
