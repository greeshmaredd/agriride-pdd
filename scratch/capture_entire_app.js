const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const DEVICE_ID = "RZCXA11GLJT";
const LOCAL_DIR = path.resolve(__dirname, '..', 'Entire_App_Real_Screens');

if (!fs.existsSync(LOCAL_DIR)) {
  fs.mkdirSync(LOCAL_DIR, { recursive: true });
}

// Ensure phone directories exist
try {
  execSync(`adb -s ${DEVICE_ID} shell "mkdir -p /sdcard/Pictures/AgriRide_Entire_App"`);
  execSync(`adb -s ${DEVICE_ID} shell "mkdir -p /sdcard/DCIM/AgriRide_Entire_App"`);
} catch (e) {}

const SCREENS = [
  { num: "01", name: "Splash_Screen", activity: ".activities.SplashActivity" },
  { num: "02", name: "Onboarding_Intro", activity: ".activities.OnboardingActivity" },
  { num: "03", name: "Language_Selection", activity: ".activities.LanguageSelectionActivity" },
  { num: "04", name: "Login_Screen", activity: ".activities.LoginActivity" },
  { num: "05", name: "Register_Create_Account", activity: ".activities.RegisterActivity" },
  { num: "06", name: "OTP_Verification", activity: ".activities.OtpVerificationActivity" },
  { num: "07", name: "Farmer_Home_Dashboard", activity: ".activities.FarmerMainActivity" },
  { num: "08", name: "Equipment_Categories", activity: ".activities.EquipmentCategoriesActivity" },
  { num: "09", name: "Equipment_Search_and_Filter", activity: ".activities.EquipmentSearchActivity" },
  { num: "10", name: "Equipment_Details", activity: ".activities.EquipmentDetailsActivity" },
  { num: "11", name: "Select_Farming_Activity", activity: ".activities.FarmingActivityActivity" },
  { num: "12", name: "Booking_Details_Form", activity: ".activities.BookingDetailsActivity" },
  { num: "13", name: "Smart_Scheduling_Weather", activity: ".activities.SmartSchedulingActivity" },
  { num: "14", name: "Booking_Summary", activity: ".activities.BookingSummaryActivity" },
  { num: "15", name: "Payment_Options", activity: ".activities.PaymentActivity" },
  { num: "16", name: "Booking_Success", activity: ".activities.BookingSuccessActivity" },
  { num: "17", name: "Weather_Dashboard", activity: ".activities.WeatherActivity" },
  { num: "18", name: "Disaster_and_Weather_Alerts", activity: ".activities.DisasterAlertsActivity" },
  { num: "19", name: "Soil_and_Crop_AI_Recommendation", activity: ".activities.SoilCropRecommendationActivity" },
  { num: "20", name: "Crop_Dam_Live_Map", activity: ".activities.CropDamMapActivity" },
  { num: "21", name: "Farmer_Community_Group_Chat", activity: ".activities.CommunityGroupChatActivity" },
  { num: "22", name: "Equipment_Owner_Dashboard", activity: ".activities.OwnerMainActivity" },
  { num: "23", name: "Add_New_Equipment_Form", activity: ".activities.AddEquipmentActivity" },
  { num: "24", name: "Vehicle_Document_Verification", activity: ".activities.DocumentVerificationActivity" },
  { num: "25", name: "Owner_Booking_Requests", activity: ".activities.OwnerBookingRequestsActivity" },
  { num: "26", name: "Owner_Earnings_and_Workers", activity: ".activities.OwnerEarningsWorkersActivity" },
  { num: "27", name: "Owner_Weekly_Trends", activity: ".activities.OwnerWeeklyTrendsActivity" },
  { num: "28", name: "Owner_Equipment_Fleet", activity: ".activities.OwnerEquipmentActivity" },
  { num: "29", name: "Owner_Notifications", activity: ".activities.OwnerNotificationsActivity" },
  { num: "30", name: "Worker_Dashboard", activity: ".activities.WorkerMainActivity" },
  { num: "31", name: "Worker_Tasks_and_Attendance", activity: ".activities.WorkerTasksAttendanceActivity" },
  { num: "32", name: "Worker_Task_Details", activity: ".activities.TaskDetailsActivity" },
  { num: "33", name: "AgriStore_Cart", activity: ".activities.CartActivity" },
  { num: "34", name: "User_Profile_and_Settings", activity: ".activities.ProfileActivity" },
  { num: "35", name: "Admin_Control_Center", activity: ".activities.AdminMainActivity" }
];

console.log(`Starting real device screen capture for all ${SCREENS.length} app activities...`);

for (let i = 0; i < SCREENS.length; i++) {
  const item = SCREENS[i];
  const filename = `${item.num}_${item.name}.png`;
  const localFilePath = path.join(LOCAL_DIR, filename);
  const deviceRemotePath = `/sdcard/Pictures/AgriRide_Entire_App/${filename}`;
  const deviceDcimPath = `/sdcard/DCIM/AgriRide_Entire_App/${filename}`;

  console.log(`[${i + 1}/${SCREENS.length}] Launching: ${item.activity} -> ${filename}`);

  try {
    // Launch activity on device
    execSync(`adb -s ${DEVICE_ID} shell am start -n com.agriride.app/${item.activity}`, { stdio: 'ignore' });
    
    // Sleep 1200ms to allow layout inflation, animations and rendering
    execSync(`powershell -Command "Start-Sleep -Milliseconds 1200"`, { stdio: 'ignore' });

    // Capture screen directly to phone gallery
    execSync(`adb -s ${DEVICE_ID} shell screencap -p ${deviceRemotePath}`);

    // Also copy to DCIM for gallery indexers
    execSync(`adb -s ${DEVICE_ID} shell cp ${deviceRemotePath} ${deviceDcimPath}`);

    // Pull to PC folder
    execSync(`adb -s ${DEVICE_ID} pull ${deviceRemotePath} "${localFilePath}"`, { stdio: 'ignore' });

    // Trigger MediaScanner for this image
    execSync(`adb -s ${DEVICE_ID} shell "am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file://${deviceRemotePath}"`, { stdio: 'ignore' });
    execSync(`adb -s ${DEVICE_ID} shell "am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file://${deviceDcimPath}"`, { stdio: 'ignore' });

    console.log(`  -> Successfully captured & scanned ${filename}`);
  } catch (err) {
    console.error(`  -> Failed for ${item.name}:`, err.message);
  }
}

console.log("\n========================================================");
console.log(`COMPLETED! All real app screens stored in Phone Gallery!`);
console.log(`Phone Album: AgriRide_Entire_App`);
console.log(`Local Directory: ${LOCAL_DIR}`);
console.log("========================================================");
