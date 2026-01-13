// Test Complete Google OAuth Flow (with manual credentials)
const { chromium } = require('playwright');

(async () => {
  const TARGET_URL = 'https://frontend-omega-eight-86.vercel.app/signin';

  console.log('🔍 Testing Google OAuth complete flow...');
  console.log('📍 Starting URL:', TARGET_URL);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 200
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Log network requests
  page.on('request', request => {
    if (request.url().includes('auth') || request.url().includes('tasks')) {
      console.log(`   📤 ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('auth') || response.url().includes('tasks')) {
      console.log(`   📥 ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('\n📖 Step 1: Navigating to sign-in page...');
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    console.log('✅ Page loaded');

    // Look for Google button
    console.log('\n🔍 Step 2: Looking for Google Sign-In button...');
    const googleButton = page.locator('text=/Continue with Google/i');

    if (await googleButton.count() > 0) {
      console.log('✅ Google Sign-In button found');

      console.log('\n🖱️  Step 3: Clicking Google Sign-In button...');
      await googleButton.click();

      console.log('\n⏳ Waiting for Google OAuth page...');
      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      console.log('📍 Current URL:', currentUrl);

      if (currentUrl.includes('accounts.google.com')) {
        console.log('\n✅ Successfully redirected to Google OAuth');
        console.log('\n⚠️  MANUAL ACTION REQUIRED:');
        console.log('   Please complete the Google sign-in flow in the browser.');
        console.log('   After completion, the script will verify the redirect to dashboard.');

        console.log('\n⏳ Waiting 60 seconds for manual OAuth completion...');
        console.log('   (Script will continue when /dashboard is reached)');

        // Wait for redirect to dashboard (up to 60 seconds)
        await page.waitForURL('**/dashboard**', { timeout: 60000 }).catch(() => {
          console.log('\n❌ Timeout: Did not reach dashboard within 60 seconds');
        });

        const finalUrl = page.url();
        console.log('\n📍 Final URL:', finalUrl);

        if (finalUrl.includes('/dashboard')) {
          console.log('\n✅ SUCCESS: Reached dashboard!');

          // Wait a bit for the page to load
          await page.waitForTimeout(2000);

          // Check if user is authenticated
          const authToken = await page.evaluate(() => localStorage.getItem('auth_token'));
          const user = await page.evaluate(() => localStorage.getItem('user'));

          if (authToken) {
            console.log('✅ Token stored in localStorage');
            console.log('   Token length:', authToken.length, 'characters');
          } else {
            console.log('❌ No token found in localStorage');
          }

          if (user) {
            console.log('✅ User data stored in localStorage');
          } else {
            console.log('❌ No user data found in localStorage');
          }

          // Check for any console errors
          const hasErrors = await page.evaluate(() => {
            let errors = [];
            const originalError = console.error;
            console.error = function(...args) {
              errors.push(args.join(' '));
              originalError.apply(console, args);
            };
            return errors;
          });

          if (hasErrors.length > 0) {
            console.log('\n⚠️  Console errors:', hasErrors);
          } else {
            console.log('\n✅ No console errors detected');
          }

          // Take screenshot
          await page.screenshot({ path: 'test-results/dashboard-success.png', fullPage: true });
          console.log('\n📸 Screenshot saved: test-results/dashboard-success.png');

        } else {
          console.log('\n❌ Failed: Not on dashboard');
          console.log('   Current URL:', finalUrl);

          await page.screenshot({ path: 'test-results/failure-screenshot.png', fullPage: true });
          console.log('📸 Failure screenshot saved');
        }

      } else {
        console.log('\n⚠️  Unexpected redirect');
        console.log('   Current URL:', currentUrl);
      }

    } else {
      console.log('❌ Google Sign-In button NOT found');
    }

  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
    await page.screenshot({ path: 'test-results/error-screenshot.png', fullPage: true });
  } finally {
    console.log('\n⏳ Keeping browser open for 10 seconds for inspection...');
    await page.waitForTimeout(10000);
    await browser.close();
  }

  console.log('\n✅ Test completed');
})();
