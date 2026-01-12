// Test Google OAuth Sign-in Flow
const { chromium } = require('playwright');

(async () => {
  const TARGET_URL = 'https://frontend-omega-eight-86.vercel.app/signin';

  console.log('🔍 Testing Google OAuth flow...');
  console.log('📍 Starting URL:', TARGET_URL);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // Step 1: Navigate to sign-in page
    console.log('\n📖 Step 1: Navigating to sign-in page...');
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

    const title = await page.title();
    console.log('✅ Page loaded:', title);

    // Take screenshot of sign-in page
    await page.screenshot({ path: 'test-results/01-signin-page.png', fullPage: true });
    console.log('📸 Screenshot saved: test-results/01-signin-page.png');

    // Step 2: Check for Google Sign-In button
    console.log('\n🔍 Step 2: Looking for Google Sign-In button...');
    const googleButton = page.locator('text=/Continue with Google/i');

    if (await googleButton.count() > 0) {
      console.log('✅ Google Sign-In button found');

      // Step 3: Click Google Sign-In
      console.log('\n🖱️ Step 3: Clicking Google Sign-In button...');
      await googleButton.click();

      // Wait for navigation or response
      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      console.log('📍 Current URL after click:', currentUrl);

      await page.screenshot({ path: 'test-results/02-after-google-click.png', fullPage: true });
      console.log('📸 Screenshot saved: test-results/02-after-google-click.png');

      // Check if we got a response from the backend
      if (currentUrl.includes('accounts.google.com')) {
        console.log('\n✅ Redirected to Google OAuth page');
        console.log('⚠️  Full OAuth flow requires manual user interaction');
        console.log('📝 The callback URL should be: https://frontend-omega-eight-86.vercel.app/auth/callback/google');

        await page.screenshot({ path: 'test-results/03-google-oauth-page.png', fullPage: true });
        console.log('📸 Screenshot saved: test-results/03-google-oauth-page.png');

      } else if (currentUrl.includes('/auth/callback/google')) {
        console.log('\n✅ Reached callback page');
        console.log('📍 Callback URL:', currentUrl);

        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'test-results/04-callback-page.png', fullPage: true });
        console.log('📸 Screenshot saved: test-results/04-callback-page.png');

        // Check if we reached dashboard
        if (page.url().includes('/dashboard')) {
          console.log('\n✅ SUCCESS: Redirected to dashboard!');
          console.log('📍 Final URL:', page.url());

          await page.screenshot({ path: 'test-results/05-dashboard-success.png', fullPage: true });
          console.log('📸 Screenshot saved: test-results/05-dashboard-success.png');

          // Check if user is authenticated
          const authToken = await page.evaluate(() => localStorage.getItem('auth_token'));
          const user = await page.evaluate(() => localStorage.getItem('user'));

          if (authToken && user) {
            console.log('✅ User authenticated successfully');
            console.log('🔑 Token stored:', authToken ? 'Yes' : 'No');
            console.log('👤 User data:', user ? 'Yes' : 'No');
          }
        } else {
          console.log('\n❌ Did not reach dashboard');
          console.log('📍 Current URL:', page.url());
        }

      } else if (currentUrl.includes('dashboard')) {
        console.log('\n✅ Already on dashboard (user may be logged in)');
        await page.screenshot({ path: 'test-results/05-dashboard-already-logged-in.png', fullPage: true });
        console.log('📸 Screenshot saved: test-results/05-dashboard-already-logged-in.png');

      } else {
        console.log('\n⚠️  Unexpected redirect');
        console.log('📍 Current URL:', currentUrl);

        // Check for errors on page
        const bodyText = await page.textContent('body');
        if (bodyText.includes('404') || bodyText.includes('not found')) {
          console.log('❌ ERROR: 404 Page Not Found!');
        }
      }

    } else {
      console.log('❌ Google Sign-In button NOT found');
      console.log('🔍 Page content preview:');
      const bodyText = await page.textContent('body');
      console.log(bodyText?.substring(0, 500));
    }

  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
    await page.screenshot({ path: 'test-results/error-screenshot.png', fullPage: true });
    console.log('📸 Error screenshot saved: test-results/error-screenshot.png');
  } finally {
    await browser.close();
  }

  console.log('\n✅ Test completed');
})();
