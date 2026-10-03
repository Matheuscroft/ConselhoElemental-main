import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));
  page.on('response', response => {
    if (!response.ok()) {
      console.log('BROWSER_NETWORK_ERROR:', response.url(), response.status());
    }
  });

  try {
    await page.goto('http://localhost:5173/treinos', { waitUntil: 'networkidle2', timeout: 10000 });
    console.log('Page loaded');
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) {
    console.log('Puppeteer goto error:', e.message);
  } finally {
    await browser.close();
  }
})();
