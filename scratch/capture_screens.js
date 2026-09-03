const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUTPUT_DIR = path.resolve(__dirname, '..', 'AgriRide_Gallery_Screens');

const SCREEN_TITLES = [
  "01_Splash_Screen",
  "02_Onboarding",
  "03_Language_Selection",
  "04_Login_Screen",
  "05_Register_Screen",
  "06_OTP_Verification",
  "07_Farmer_Home_Dashboard",
  "08_Equipment_Categories",
  "09_Equipment_Search_and_Filter",
  "10_Equipment_Details",
  "11_Select_Farm_Activity",
  "12_Booking_Details_Form",
  "13_Smart_Scheduling_Weather",
  "14_Booking_Summary",
  "15_Payment_Options",
  "16_Booking_Success",
  "17_My_Bookings",
  "18_Live_Vehicle_Tracking",
  "19_Weather_Dashboard",
  "20_Weather_and_Disaster_Alerts",
  "21_Soil_and_Crop_Recommendation",
  "22_Farmer_Community_Feed",
  "23_Agricultural_Store",
  "24_Owner_Dashboard",
  "25_Add_Equipment_Form",
  "26_Vehicle_Document_Verification",
  "27_Owner_Booking_Requests",
  "28_Owner_Earnings_and_Workers",
  "29_Worker_Dashboard",
  "30_Worker_Tasks_and_Attendance",
  "31_WhatsApp_Chat_Hub"
];

async function captureAll() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Starting screen capture for 31 screens...`);
  console.log(`Output Directory: ${OUTPUT_DIR}`);

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--window-size=1600,1200']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 2 });

  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0' });
  console.log('Page loaded successfully at http://localhost:8080/');

  for (let i = 1; i <= 31; i++) {
    const filename = `${SCREEN_TITLES[i - 1]}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    // Call navigateToScreen(i) directly in the page
    await page.evaluate((screenNum) => {
      window.navigateToScreen(screenNum);
    }, i);

    // Wait for content rendering
    await new Promise(resolve => setTimeout(resolve, 300));

    // Target the phone frame element
    const phoneElement = await page.$('.android-phone-frame');
    if (phoneElement) {
      await phoneElement.screenshot({ path: filepath });
      console.log(`[${i}/31] Saved: ${filename}`);
    } else {
      console.error(`Could not find .android-phone-frame for screen ${i}`);
    }
  }

  await browser.close();
  console.log('Finished capturing all 31 screens!');
}

captureAll().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
