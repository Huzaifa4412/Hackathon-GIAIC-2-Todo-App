// Test Google OAuth Sign-in Flow - Detailed
const { chromium } = require('playwright');

(async () => {
  const TARGET_URL = 'https://frontend-omega-eight-86.vercel.app/signin';

  console.log('🔍 Testing Google OAuth flow with detailed logging...');
  console.log('📍 Starting URL:', TARGET_URL);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Log all console messages
  page.on('console', msg => {
    console.log(`   Browser Console [${msg.type()}]:`, msg.text());
  });

  // Log all network requests
  page.on('request', request => {
    console.log(`   📤 Request: ${request.method()} ${request.url()}`);
  });

  page.on('response', response => {
    console.log(`   📥 Response: ${response.status()} ${response.url()}`);
  });

  try {
    console.log('\n📖 Navigating to sign-in page...');
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

    console.log('✅ Page loaded');

    // Wait for the Google button and click it
    console.log('\n🔍 Looking for Google Sign-In button...');

    // Try to find the button with different selectors
    const selectors = [
      'text=/Continue with Google/i',
      'button:has-text("Google")',
      '[class*="google"]',
      'button[class*="chrome"]'
    ];

    let googleButton = null;
    for (const selector of selectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ Found button with selector: ${selector}`);
          googleButton = element;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (googleButton) {
      console.log('\n🖱️ Clicking Google Sign-In button...');

      // Click and wait for navigation
      await Promise.all([
        page.waitForTimeout(5000),
        googleButton.click()
      ]);

      const currentUrl = page.url();
      console.log('\n📍 Final URL:', currentUrl);

      await page.screenshot({ path: 'test-results/final-state.png', fullPage: true });
      console.log('📸 Screenshot saved: test-results/final-state.png');

    } else {
      console.log('❌ Google Sign-In button NOT found');
      console.log('🔍 Available buttons:');

      const buttons = await page.locator('button').all();
      for (const btn of buttons) {
        const text = await btn.textContent();
        const classes = await btn.getAttribute('class');
        console.log(`   - "${text?.trim()}" [class: ${classes}]`);
      }
    }

  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
    await page.screenshot({ path: 'test-results/error-screenshot.png', fullPage: true });
  } finally {
    // Keep browser open for 10 seconds for inspection
    console.log('\n⏳ Keeping browser open for 10 seconds for inspection...');
    await page.waitForTimeout(10000);
    await browser.close();
  }

  console.log('\n✅ Test completed');
})();
