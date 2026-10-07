const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const cookies = JSON.parse(fs.readFileSync('cookies_ayoub__solutions.json'));
  await page.setCookie(...cookies);
  
  await page.goto('https://www.instagram.com/direct/inbox/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));
  
  // dismiss modal
  await page.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const notNow = btns.find(b => b.textContent.trim().toLowerCase() === 'not now' || b.textContent.trim().toLowerCase() === 'plus tard');
     if (notNow) notNow.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'test-ig2-1-inbox.png' });
  
  // Click "New Message" pencil icon or blue "Send message" button
  await page.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('div[role="button"], button'));
     const sendMsg = btns.find(b => b.textContent.trim().toLowerCase() === 'send message' || b.textContent.trim().toLowerCase() === 'envoyer un message');
     if (sendMsg) {
       sendMsg.click();
       return;
     }
     // find the SVG for new message (pencil)
     const svg = document.querySelector('svg[aria-label="New message"], svg[aria-label="Nouveau message"]');
     if (svg) {
       svg.closest('div[role="button"]').click();
     }
  });
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'test-ig2-2-modal.png' });
  
  await page.type('input[placeholder*="Search" i], input[placeholder*="Rechercher" i], input[name="queryBox"]', 'h2b.car', { delay: 100 });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: 'test-ig2-3-search.png' });
  
  // click the first result
  await page.evaluate(() => {
     // The results usually have a circle or checkbox
     const circles = Array.from(document.querySelectorAll('input[type="checkbox"], div[role="checkbox"]'));
     if (circles.length > 0) {
       circles[0].click();
     } else {
       // just click the first row
       const rows = Array.from(document.querySelectorAll('div[role="button"]'));
       const row = rows.find(r => r.textContent.includes('h2b.car'));
       if (row) row.click();
     }
  });
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'test-ig2-4-selected.png' });
  
  // click chat
  await page.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('div[role="button"]'));
     const chatBtn = btns.find(b => b.textContent.trim().toLowerCase() === 'chat' || b.textContent.trim().toLowerCase() === 'discuter');
     if (chatBtn) chatBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: 'test-ig2-5-chatbox.png' });
  
  await browser.close();
})();
