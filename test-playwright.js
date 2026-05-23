import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log("Navigating to portal...");
  await page.goto('http://localhost:8080/portal?reset=1');
  
  console.log("Waiting for network idle...");
  await page.waitForLoadState('networkidle');
  
  console.log("Taking initial screenshot...");
  await page.screenshot({ path: 'test1-portal.png' });
  
  console.log("Clicking Omar login demo...");
  await page.click('text=Omar (Admin)');
  
  console.log("Clicking Login button...");
  await page.click('button[type="submit"]');
  
  console.log("Waiting for network idle...");
  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle');
  
  console.log("Taking post-login screenshot...");
  await page.screenshot({ path: 'test2-dashboard.png' });
  
  console.log("Current URL:", page.url());
  
  const html = await page.content();
  const fs = require('fs');
  fs.writeFileSync('test3-html.html', html);
  
  await browser.close();
})();
