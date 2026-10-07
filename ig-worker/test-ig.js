const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const cookies = JSON.parse(fs.readFileSync('cookies_ayoub__solutions.json'));
  await page.setCookie(...cookies);
  
  await page.goto('https://www.instagram.com/direct/new/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: 'test-ig-3-new-message.png' });
  
  // type in search box
  await page.type('input', 'h2b.car', { delay: 100 });
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: 'test-ig-4-search-results.png' });
  
  await browser.close();
})();
