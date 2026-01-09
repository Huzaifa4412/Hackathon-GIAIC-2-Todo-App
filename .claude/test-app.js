const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Track console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Browser Console Error:', msg.text());
    }
  });

  try {
    console.log('🌐 Navigating to', TARGET_URL);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });

    console.log('📄 Page Title:', await page.title());
    console.log('🔗 Current URL:', page.url());

    // Take screenshot
    await page.screenshot({ path: 'F:\\AI-Development\\Hackathon\\Todo-App\\test-screenshots\\home-page.png', fullPage: true });
    console.log('📸 Screenshot saved');

    // Check if page loaded successfully
    const bodyText = await page.textContent('body');
    if (bodyText.includes('sign') || bodyText.includes('Sign')) {
      console.log('✅ Sign-in page detected');
    }

    // Wait for user to see the result
    console.log('⏳ Waiting 5 seconds for visual inspection...');
    await page.waitForTimeout(5000);

    // Try to navigate to signin
    console.log('🔗 Navigating to /signin');
    await page.goto(`${TARGET_URL}/signin`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: 'F:\\AI-Development\\Hackathon\\Todo-App\\test-screenshots\\signin-page.png', fullPage: true });
    console.log('📸 Sign-in screenshot saved');

    // Check for any error messages
    const errors = await page.locator('.error, [role="alert"]').count();
    if (errors > 0) {
      console.log(`⚠️ Found ${errors} error message(s) on the page`);
    }

    await page.waitForTimeout(3000);

    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
