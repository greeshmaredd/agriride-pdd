/**
 * AgriRide 2026 - Appium Tests Entry Point
 */
const { AgriRideAppiumRunner, APPIUM_CONFIG } = require('./tests/login-tests.js');

if (require.main === module) {
  const runner = new AgriRideAppiumRunner();
  runner.runAllSuites().catch(err => {
    console.error('Appium execution failed:', err);
    process.exit(1);
  });
}

module.exports = { AgriRideAppiumRunner, APPIUM_CONFIG };
