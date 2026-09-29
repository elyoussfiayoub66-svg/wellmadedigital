const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser to check IG login page...");
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'ig-debug.png' });
  console.log("Screenshot saved to ig-debug.png");
  await browser.close();
})();
