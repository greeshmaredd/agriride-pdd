/**
 * ============================================================================
 * AgriRide 2026 - Selenium E2E Functional Test Suite for Web Frontend Login
 * File: selenium-tests/tests/login-tests.js
 * Target: AgriRide 2026 Web Portal (Screen 4: Login Screen & Flows)
 * Framework: Selenium WebDriver (JavaScript / Node.js)
 * ============================================================================
 */

const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');
const fs = require('fs');

function resolveWebAppUrl() {
  if (process.env.AGRIRIDE_URL) return process.env.AGRIRIDE_URL;
  const candidates = [
    path.resolve(__dirname, '../../web/index.html'),
    path.resolve(__dirname, '../../AgriRide 2026/web/index.html'),
    path.resolve(__dirname, '../web/index.html'),
    path.resolve(process.cwd(), 'web/index.html'),
    path.resolve(process.cwd(), 'AgriRide 2026/web/index.html')
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return `file://${candidate.replace(/\\/g, '/')}`;
    }
  }
  return `file://${candidates[0].replace(/\\/g, '/')}`;
}

// --- Configuration & Environment Setup ---
const CONFIG = {
  webAppUrl: resolveWebAppUrl(),
  headless: process.env.HEADLESS !== 'false', // default headless for CI/Actions
  implicitTimeout: 8000,
  explicitTimeout: 10000,
  defaultRole: 'farmer',
  demoCredentials: {
    farmer: { identifier: '1234567893@agriride.in', password: 'pass1234', expectedScreen: 7 },
    owner: { identifier: 'owner@agriride.in', password: 'ownerpass123', expectedScreen: 24 },
    worker: { identifier: 'worker@agriride.in', password: 'workerpass123', expectedScreen: 29 }
  }
};

// --- Page Object Model (POM) for AgriRide Login Screen ---
class AgriRideLoginPage {
  /**
   * @param {import('selenium-webdriver').WebDriver} driver
   */
  constructor(driver) {
    this.driver = driver;
  }

  // Locators
  get locators() {
    return {
      headerBrand: By.css('.webapp-brand'),
      brandTitle: By.css('.webapp-brand h1'),
      navLinks: By.css('.webapp-nav-links'),
      phoneScreenBody: By.id('phone-screen-body'),
      
      // Screen 4 Login Elements
      loginTitle: By.xpath("//h2[contains(text(), 'Welcome Back')]"),
      loginSubtitle: By.xpath("//p[contains(text(), 'Login to book farm equipment')]"),
      
      // Role Switcher Pills
      rolePillFarmer: By.xpath("//div[contains(text(), 'Farmer') and contains(@onclick, 'setLoginRole')]"),
      rolePillOwner: By.xpath("//div[contains(text(), 'Owner') and contains(@onclick, 'setLoginRole')]"),
      rolePillWorker: By.xpath("//div[contains(text(), 'Worker') and contains(@onclick, 'setLoginRole')]"),
      
      // Input Fields
      identifierInput: By.id('login-identifier'),
      passwordInput: By.id('login-password'),
      passwordToggleIcon: By.xpath("//span[contains(@onclick, 'togglePasswordVisibility')]"),
      
      // Buttons & Links
      loginSubmitBtn: By.xpath("//button[contains(@onclick, 'handleLoginSubmit')]"),
      forgotPasswordLink: By.xpath("//a[contains(@onclick, 'showToast') and contains(text(), 'Forgot?')]"),
      createAccountLink: By.xpath("//a[contains(@onclick, 'navigateToScreen(5)')]"),
      
      // Feedback & Toast
      toastNotification: By.id('toast-notification'),
      toastMessage: By.id('toast-message'),
      
      // Screen 5 (Registration) Back Button
      regBackBtn: By.xpath("//button[contains(@onclick, 'navigateToScreen(4)')]")
    };
  }

  // Page Actions
  async navigateToLoginPage() {
    await this.driver.get(CONFIG.webAppUrl);
    await this.driver.wait(until.elementLocated(this.locators.phoneScreenBody), CONFIG.explicitTimeout);
    
    // Ensure on Screen 4
    await this.driver.executeScript("if (typeof navigateToScreen === 'function') navigateToScreen(4);");
    await this.driver.wait(until.elementLocated(this.locators.identifierInput), CONFIG.explicitTimeout);
  }

  async getIdentifierValue() {
    const elem = await this.driver.findElement(this.locators.identifierInput);
    return await elem.getAttribute('value');
  }

  async setIdentifier(value) {
    const elem = await this.driver.findElement(this.locators.identifierInput);
    await elem.clear();
    // Select all and backspace to guarantee clean input
    await elem.sendKeys(Key.chord(Key.CONTROL, 'a'), Key.BACK_SPACE);
    if (value !== '') {
      await elem.sendKeys(value);
    }
  }

  async getPasswordValue() {
    const elem = await this.driver.findElement(this.locators.passwordInput);
    return await elem.getAttribute('value');
  }

  async getPasswordType() {
    const elem = await this.driver.findElement(this.locators.passwordInput);
    return await elem.getAttribute('type');
  }

  async setPassword(value) {
    const elem = await this.driver.findElement(this.locators.passwordInput);
    await elem.clear();
    await elem.sendKeys(Key.chord(Key.CONTROL, 'a'), Key.BACK_SPACE);
    if (value !== '') {
      await elem.sendKeys(value);
    }
  }

  async togglePasswordVisibility() {
    const toggle = await this.driver.findElement(this.locators.passwordToggleIcon);
    await toggle.click();
    await this.driver.sleep(150);
  }

  async selectRole(role) {
    await this.driver.executeScript(`if (typeof setLoginRole === 'function') setLoginRole('${role}');`);
    await this.driver.sleep(200);
  }

  async getSelectedRoleFromState() {
    return await this.driver.executeScript("return typeof state !== 'undefined' ? state.role : null;");
  }

  async submitLogin() {
    const btn = await this.driver.findElement(this.locators.loginSubmitBtn);
    await btn.click();
  }

  async submitViaEnterOnPassword() {
    const pass = await this.driver.findElement(this.locators.passwordInput);
    await pass.sendKeys(Key.ENTER);
  }

  async clickForgotPassword() {
    const link = await this.driver.findElement(this.locators.forgotPasswordLink);
    await link.click();
  }

  async clickCreateAccount() {
    const link = await this.driver.findElement(this.locators.createAccountLink);
    await link.click();
    await this.driver.sleep(250);
  }

  async clickRegBackToLogin() {
    const btn = await this.driver.findElement(this.locators.regBackBtn);
    await btn.click();
    await this.driver.sleep(250);
  }

  async getToastText() {
    try {
      const toast = await this.driver.findElement(this.locators.toastMessage);
      await this.driver.wait(until.elementIsVisible(toast), 3000);
      return await toast.getText();
    } catch {
      return null;
    }
  }

  async getCurrentScreenNum() {
    return await this.driver.executeScript("return typeof state !== 'undefined' ? state.currentScreen : null;");
  }
}

// --- Test Suite Execution & Assertion Engine ---
class AgriRideTestRunner {
  constructor() {
    this.results = [];
    this.driver = null;
    this.page = null;
  }

  async initializeDriver() {
    const chromeOptions = new chrome.Options();
    if (CONFIG.headless) {
      chromeOptions.addArguments('--headless=new');
    }
    chromeOptions.addArguments('--no-sandbox');
    chromeOptions.addArguments('--disable-dev-shm-usage');
    chromeOptions.addArguments('--disable-gpu');
    chromeOptions.addArguments('--window-size=1280,900');
    chromeOptions.addArguments('--allow-file-access-from-files');

    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

    await this.driver.manage().setTimeouts({
      implicit: CONFIG.implicitTimeout,
      pageLoad: 15000,
      script: 10000
    });

    this.page = new AgriRideLoginPage(this.driver);
  }

  async recordResult(id, module, description, priority, testFn) {
    const startTime = Date.now();
    let status = 'PASS';
    let actual = '';
    let expected = '';
    let errorMsg = null;

    try {
      const res = await testFn();
      expected = res?.expected || 'Action succeeded as expected';
      actual = res?.actual || 'Observed expected behavior';
    } catch (err) {
      status = 'FAIL';
      errorMsg = err.message;
      actual = `Exception: ${err.message}`;
    }

    const duration = Date.now() - startTime;
    this.results.push({
      id,
      module,
      description,
      priority,
      status,
      expected,
      actual,
      errorMsg,
      duration
    });

    const statusSymbol = status === 'PASS' ? '✅' : '❌';
    console.log(`[${statusSymbol} ${status}] ${id} - ${description} (${duration}ms)`);
  }

  // =========================================================================
  // CORE TEST SUITES (Executed via Selenium WebDriver)
  // =========================================================================

  async runAllSuites() {
    console.log('===============================================================');
    console.log('🚀 AgriRide 2026 - Selenium Web E2E Login Functional Test Suite');
    console.log(`Target: ${CONFIG.webAppUrl}`);
    console.log(`Headless Mode: ${CONFIG.headless}`);
    console.log('===============================================================\n');

    await this.initializeDriver();

    try {
      // -------------------------------------------------------------
      // SUITE 1: Page Load & Visual Branding Elements Verification
      // -------------------------------------------------------------
      await this.recordResult('TC_LGN_001', 'UI Elements', 'Verify portal loads and page title is correct', 'P1 - Critical', async () => {
        await this.page.navigateToLoginPage();
        const title = await this.driver.getTitle();
        const expected = 'AgriRide 2026 – Smart Farm Machinery Web Portal';
        if (!title.includes('AgriRide 2026')) throw new Error(`Unexpected page title: "${title}"`);
        return { expected, actual: title };
      });

      await this.recordResult('TC_LGN_002', 'UI Elements', 'Verify top header brand title and icon are displayed', 'P2 - High', async () => {
        const brand = await this.driver.findElement(this.page.locators.brandTitle);
        const text = await brand.getText();
        if (!text.includes('AgriRide')) throw new Error(`Brand text missing: ${text}`);
        return { expected: 'AgriRide 2026', actual: text };
      });

      await this.recordResult('TC_LGN_003', 'UI Elements', 'Verify Screen 4 Welcome Back heading is rendered', 'P1 - Critical', async () => {
        const heading = await this.driver.findElement(this.page.locators.loginTitle);
        const text = await heading.getText();
        if (text !== 'Welcome Back') throw new Error(`Header mismatch: ${text}`);
        return { expected: 'Welcome Back', actual: text };
      });

      await this.recordResult('TC_LGN_004', 'UI Elements', 'Verify Login Subtitle text is displayed', 'P3 - Medium', async () => {
        const sub = await this.driver.findElement(this.page.locators.loginSubtitle);
        const text = await sub.getText();
        if (!text.includes('farm equipment')) throw new Error(`Subtitle mismatch: ${text}`);
        return { expected: 'Login to book farm equipment & check weather', actual: text };
      });

      await this.recordResult('TC_LGN_005', 'UI Elements', 'Verify Mobile/Email identifier input field is present and visible', 'P1 - Critical', async () => {
        const input = await this.driver.findElement(this.page.locators.identifierInput);
        const isDisplayed = await input.isDisplayed();
        if (!isDisplayed) throw new Error('Identifier input is not visible');
        return { expected: 'Visible', actual: 'Visible' };
      });

      await this.recordResult('TC_LGN_006', 'UI Elements', 'Verify Password input field is present and masked by default', 'P1 - Critical', async () => {
        const type = await this.page.getPasswordType();
        if (type !== 'password') throw new Error(`Expected input type="password", got "${type}"`);
        return { expected: 'type="password"', actual: `type="${type}"` };
      });

      await this.recordResult('TC_LGN_007', 'UI Elements', 'Verify Login submit button is present with correct label', 'P1 - Critical', async () => {
        const btn = await this.driver.findElement(this.page.locators.loginSubmitBtn);
        const text = await btn.getText();
        if (!text.includes('Login to AgriRide')) throw new Error(`Button text mismatch: ${text}`);
        return { expected: 'Login to AgriRide ➔', actual: text };
      });

      await this.recordResult('TC_LGN_008', 'UI Elements', 'Verify Forgot Password link is displayed', 'P2 - High', async () => {
        const forgot = await this.driver.findElement(this.page.locators.forgotPasswordLink);
        const isDisplayed = await forgot.isDisplayed();
        if (!isDisplayed) throw new Error('Forgot link not visible');
        return { expected: 'Visible', actual: 'Visible' };
      });

      await this.recordResult('TC_LGN_009', 'UI Elements', 'Verify Create Account registration switch link is displayed', 'P2 - High', async () => {
        const createLink = await this.driver.findElement(this.page.locators.createAccountLink);
        const text = await createLink.getText();
        if (!text.includes('Create Account')) throw new Error(`Text mismatch: ${text}`);
        return { expected: 'Create Account', actual: text };
      });

      // -------------------------------------------------------------
      // SUITE 2: Role Switcher Persona Validation
      // -------------------------------------------------------------
      await this.recordResult('TC_LGN_010', 'Role Switcher', 'Verify default active role is Farmer', 'P1 - Critical', async () => {
        await this.page.navigateToLoginPage();
        const role = await this.page.getSelectedRoleFromState();
        if (role !== 'farmer') throw new Error(`Default role is ${role}`);
        return { expected: 'farmer', actual: role };
      });

      await this.recordResult('TC_LGN_011', 'Role Switcher', 'Verify switching role to Owner updates state', 'P1 - Critical', async () => {
        await this.page.selectRole('owner');
        const role = await this.page.getSelectedRoleFromState();
        if (role !== 'owner') throw new Error(`Role failed to switch to owner, found ${role}`);
        return { expected: 'owner', actual: role };
      });

      await this.recordResult('TC_LGN_012', 'Role Switcher', 'Verify switching role to Worker updates state', 'P1 - Critical', async () => {
        await this.page.selectRole('worker');
        const role = await this.page.getSelectedRoleFromState();
        if (role !== 'worker') throw new Error(`Role failed to switch to worker, found ${role}`);
        return { expected: 'worker', actual: role };
      });

      await this.recordResult('TC_LGN_013', 'Role Switcher', 'Verify switching role back to Farmer from Worker', 'P2 - High', async () => {
        await this.page.selectRole('farmer');
        const role = await this.page.getSelectedRoleFromState();
        if (role !== 'farmer') throw new Error(`Role failed to switch to farmer, found ${role}`);
        return { expected: 'farmer', actual: role };
      });

      // -------------------------------------------------------------
      // SUITE 3: Password Masking & Eye Icon Toggle
      // -------------------------------------------------------------
      await this.recordResult('TC_LGN_014', 'Password Visibility', 'Verify password toggle switches input type from password to text', 'P1 - Critical', async () => {
        await this.page.navigateToLoginPage();
        await this.page.togglePasswordVisibility();
        const type = await this.page.getPasswordType();
        if (type !== 'text') throw new Error(`Expected type="text" after toggle, got "${type}"`);
        return { expected: 'type="text"', actual: `type="${type}"` };
      });

      await this.recordResult('TC_LGN_015', 'Password Visibility', 'Verify second click reverts password input type back to password', 'P1 - Critical', async () => {
        await this.page.togglePasswordVisibility(); // second click
        const type = await this.page.getPasswordType();
        if (type !== 'password') throw new Error(`Expected type="password" after 2nd toggle, got "${type}"`);
        return { expected: 'type="password"', actual: `type="${type}"` };
      });

      // -------------------------------------------------------------
      // SUITE 4: Forgot Password Interaction
      // -------------------------------------------------------------
      await this.recordResult('TC_LGN_016', 'Feedback', 'Verify clicking Forgot? triggers toast notification', 'P2 - High', async () => {
        await this.page.clickForgotPassword();
        const toast = await this.page.getToastText();
        if (!toast || !toast.includes('Password reset link sent')) {
          throw new Error(`Toast mismatch: got "${toast}"`);
        }
        return { expected: 'Password reset link sent to mobile / email', actual: toast };
      });

      // -------------------------------------------------------------
      // SUITE 5: Navigation Between Login & Registration
      // -------------------------------------------------------------
      await this.recordResult('TC_LGN_017', 'Navigation', 'Verify clicking Create Account navigates to Screen 5', 'P1 - Critical', async () => {
        await this.page.clickCreateAccount();
        const screen = await this.page.getCurrentScreenNum();
        if (screen !== 5) throw new Error(`Expected screen 5, got screen ${screen}`);
        return { expected: 'Screen 5', actual: `Screen ${screen}` };
      });

      await this.recordResult('TC_LGN_018', 'Navigation', 'Verify back button on Screen 5 returns to Screen 4 Login', 'P1 - Critical', async () => {
        await this.page.clickRegBackToLogin();
        const screen = await this.page.getCurrentScreenNum();
        if (screen !== 4) throw new Error(`Expected screen 4, got screen ${screen}`);
        return { expected: 'Screen 4', actual: `Screen ${screen}` };
      });

      // -------------------------------------------------------------
      // SUITE 6: Login Submission & Redirection for Farmer Flow
      // -------------------------------------------------------------
      await this.recordResult('TC_LGN_019', 'Authentication', 'Verify Farmer login submits and redirects to Screen 7 (Dashboard)', 'P1 - Critical', async () => {
        await this.page.navigateToLoginPage();
        await this.page.selectRole('farmer');
        await this.page.setIdentifier('1234567893@agriride.in');
        await this.page.setPassword('pass1234');
        await this.page.submitLogin();
        await this.driver.sleep(600); // Allow navigation transition
        const screen = await this.page.getCurrentScreenNum();
        if (screen !== 7) throw new Error(`Expected redirect to screen 7, got ${screen}`);
        return { expected: 'Screen 7 (Dashboard)', actual: `Screen ${screen}` };
      });

      // -------------------------------------------------------------
      // SUITE 7: Login Submission & Redirection for Owner Flow
      // -------------------------------------------------------------
      await this.recordResult('TC_LGN_020', 'Authentication', 'Verify Owner login submits and redirects to Screen 24 (Owner Portal)', 'P1 - Critical', async () => {
        await this.page.navigateToLoginPage();
        await this.page.selectRole('owner');
        await this.page.setIdentifier('owner@agriride.in');
        await this.page.setPassword('ownerpass123');
        await this.page.submitLogin();
        await this.driver.sleep(600);
        const screen = await this.page.getCurrentScreenNum();
        if (screen !== 24) throw new Error(`Expected redirect to screen 24, got ${screen}`);
        return { expected: 'Screen 24 (Owner Portal)', actual: `Screen ${screen}` };
      });

      // -------------------------------------------------------------
      // SUITE 8: Login Submission & Redirection for Worker Flow
      // -------------------------------------------------------------
      await this.recordResult('TC_LGN_021', 'Authentication', 'Verify Worker login submits and redirects to Screen 29 (Driver Hub)', 'P1 - Critical', async () => {
        await this.page.navigateToLoginPage();
        await this.page.selectRole('worker');
        await this.page.setIdentifier('worker@agriride.in');
        await this.page.setPassword('workerpass123');
        await this.page.submitLogin();
        await this.driver.sleep(600);
        const screen = await this.page.getCurrentScreenNum();
        if (screen !== 29) throw new Error(`Expected redirect to screen 29, got ${screen}`);
        return { expected: 'Screen 29 (Driver Hub)', actual: `Screen ${screen}` };
      });

      // -------------------------------------------------------------
      // SUITE 9: Keyboard Navigation & Enter Key Trigger
      // -------------------------------------------------------------
      await this.recordResult('TC_LGN_022', 'Authentication', 'Verify pressing Enter key on password input triggers form submit', 'P2 - High', async () => {
        await this.page.navigateToLoginPage();
        await this.page.selectRole('farmer');
        await this.page.setIdentifier('keyboard_user@agriride.in');
        await this.page.setPassword('pass1234');
        await this.page.submitViaEnterOnPassword();
        await this.driver.sleep(600);
        const screen = await this.page.getCurrentScreenNum();
        if (screen !== 7) throw new Error(`Expected redirect to screen 7, got ${screen}`);
        return { expected: 'Screen 7 via Enter Key', actual: `Screen ${screen}` };
      });

      // -------------------------------------------------------------
      // SUITE 10: Viewport Responsiveness
      // -------------------------------------------------------------
      await this.recordResult('TC_LGN_023', 'Responsive Design', 'Verify login layout renders correctly on Tablet viewport (768x1024)', 'P3 - Medium', async () => {
        await this.driver.manage().window().setRect({ width: 768, height: 1024 });
        await this.page.navigateToLoginPage();
        const input = await this.driver.findElement(this.page.locators.identifierInput);
        const displayed = await input.isDisplayed();
        if (!displayed) throw new Error('Input not visible in tablet view');
        return { expected: 'Responsive & Visible', actual: 'Visible at 768x1024' };
      });

      await this.recordResult('TC_LGN_024', 'Responsive Design', 'Verify login layout renders correctly on Mobile viewport (375x667)', 'P3 - Medium', async () => {
        await this.driver.manage().window().setRect({ width: 375, height: 667 });
        await this.page.navigateToLoginPage();
        const btn = await this.driver.findElement(this.page.locators.loginSubmitBtn);
        const displayed = await btn.isDisplayed();
        if (!displayed) throw new Error('Submit button not visible in mobile view');
        return { expected: 'Responsive & Visible', actual: 'Visible at 375x667' };
      });

      // Reset window size
      await this.driver.manage().window().setRect({ width: 1280, height: 900 });

    } finally {
      if (this.driver) {
        await this.driver.quit();
      }
    }

    console.log('\n===============================================================');
    console.log(`Execution Completed: ${this.results.length} Core Selenium E2E Tests Executed`);
    console.log(`Passed: ${this.results.filter(r => r.status === 'PASS').length}`);
    console.log(`Failed: ${this.results.filter(r => r.status === 'FAIL').length}`);
    console.log('===============================================================\n');

    return this.results;
  }
}

// Module export for custom runners & CLI execution
module.exports = {
  AgriRideLoginPage,
  AgriRideTestRunner,
  CONFIG
};

// Direct script execution
if (require.main === module) {
  const runner = new AgriRideTestRunner();
  runner.runAllSuites().catch(err => {
    console.error('Test execution error:', err);
    process.exit(1);
  });
}
