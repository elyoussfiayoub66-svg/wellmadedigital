const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const cookies = JSON.parse(fs.readFileSync('cookies_ayoub__solutions.json'));
  await page.setCookie(...cookies);
  
  await page.goto('https://www.instagram.com/direct/inbox/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));
  
  await page.evaluate(() => {
     const notNow = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Not Now'));
     if(notNow) notNow.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
     const svg = document.querySelector('svg[aria-label="New message"], svg[aria-label="Nouveau message"]');
     if (svg) svg.closest('div[role="button"]').click();
  });
  
  await page.waitForSelector('input[name="queryBox"]', { timeout: 10000 });
  await page.type('input[name="queryBox"]', 'one_luxury.car', { delay: 100 });
  await new Promise(r => setTimeout(r, 3000));
  
  const html = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync('modal-dom.html', html);
  
  await browser.close();
})();
