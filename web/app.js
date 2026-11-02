/* ==========================================================================
   AGRIRIDE 2026 — JAVASCRIPT APPLICATION LOGIC & 30-SCREEN MOBILE ENGINE
   ========================================================================== */

// STATE MANAGEMENT
const state = {
  currentScreen: 1,
  viewMode: 'device', // 'device' or 'grid'
  role: 'farmer',     // 'farmer', 'owner', 'worker'
  language: 'English',
  onboardingSlide: 0,
  userProfile: {
    name: 'abb',
    phone: '+91 98480 22338',
    location: 'Mevalurkuppam, Tamil Nadu',
    role: 'Farmer'
  },
  modalRoleSelected: 'farmer',
  booking: {
    equipment: 'Mahindra 575 DI Tractor',
    owner: 'Ramesh Patel',
    activity: 'Ploughing',
    location: 'Vijayawada, Andhra Pradesh',
    date: '28 August 2026',
    time: '7:00 AM – 10:00 AM',
    acres: 4,
    ratePerAcre: 1200,
    bookingId: 'AR20260825001',
    paymentMethod: 'UPI',
    serviceFee: 150
  },
  ownerRequests: [
    { id: 'AR20260825001', farmer: 'Ravi Kumar', activity: 'Ploughing', date: '28 Aug 2026', time: '7:00 AM', acres: 4, amount: 4950, status: 'Pending' },
    { id: 'AR102459', farmer: 'Anil Reddy', activity: 'Harvesting', date: '29 Aug 2026', time: '10:00 AM', acres: 6, amount: 9600, status: 'Pending' }
  ],
  workerAttendance: {
    checkedIn: true,
    checkInTime: '06:45 AM'
  },
  chatState: {
    activeChatId: 'ramesh',
    attachDrawerOpen: false,
    threads: {
      ramesh: {
        id: 'ramesh',
        name: 'Ramesh Patel',
        roleTag: 'Tractor & Harvester Owner',
        avatar: 'RP',
        online: true,
        messages: [
          { sender: 'them', type: 'text', time: '09:15 AM', text: 'Namaste! I have Mahindra 575 DI ready for ploughing near Vijayawada field B.' },
          { sender: 'them', type: 'audio', time: '09:16 AM', duration: '0:22', text: 'Audio Voice Note (Telugu / Hindi)' },
          { sender: 'me', type: 'text', time: '09:18 AM', text: 'Great Ramesh ji! I need ploughing for 4 acres of cotton field tomorrow at 7 AM.' },
          { sender: 'them', type: 'location', time: '09:20 AM', address: 'Vijayawada North Farm Hub, GPS Pin' },
          { sender: 'them', type: 'quote', time: '09:22 AM', equipment: 'Mahindra 575 DI Tractor', acres: 4, rate: 1200, total: 4800, status: 'Pending' }
        ]
      },
      ravi: {
        id: 'ravi',
        name: 'Ravi Kumar',
        roleTag: 'Farmer (Cotton & Paddy)',
        avatar: 'RK',
        online: true,
        messages: [
          { sender: 'them', type: 'text', time: '08:30 AM', text: 'Hello, is John Deere Harvester available for 6 acres paddy harvesting this weekend?' },
          { sender: 'me', type: 'text', time: '08:35 AM', text: 'Yes Ravi ji, harvester is free starting Friday 8 AM. Rate is ₹1,600/acre.' }
        ]
      },
      suresh: {
        id: 'suresh',
        name: 'Suresh Driver',
        roleTag: 'Worker / Operator',
        avatar: 'SD',
        online: false,
        messages: [
          { sender: 'them', type: 'text', time: 'Yesterday', text: 'Completed 5 acres spray work at Farm Plot 4. Attendance checked in at 06:45 AM.' }
        ]
      },
      support: {
        id: 'support',
        name: 'AgriRide Helpline',
        roleTag: 'Official Support Desk',
        avatar: 'AR',
        online: true,
        messages: [
          { sender: 'them', type: 'text', time: '10:00 AM', text: 'Welcome to AgriRide 24/7 Helpline. How can we assist your equipment booking today?' }
        ]
      }
    }
  }
};

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  renderScreen(state.currentScreen);
  updateClock();
  setInterval(updateClock, 1000);
});

// CLOCK FUNCTION
function updateClock() {
  const clockEl = document.getElementById('status-clock');
  if (clockEl) {
    // Keep 12:16 or real clock
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hours}:${mins}`;
  }
}

// HANDLERS FOR SCREENS 1 - 5
function handleOnboardingNext() {
  if (state.onboardingSlide === undefined) state.onboardingSlide = 0;
  if (state.onboardingSlide < 2) {
    state.onboardingSlide++;
    renderScreen(2);
  } else {
    state.onboardingSlide = 0;
    navigateToScreen(3);
  }
}

function selectLanguage(langId) {
  state.language = langId;
  renderScreen(3);
  showToast(`Language set to ${langId}`);
}

function setLoginRole(role) {
  state.role = role;
  renderScreen(4);
  showToast(`Mode: ${role.toUpperCase()}`);
}

function setRegisterRole(role) {
  state.role = role;
  renderScreen(5);
  showToast(`Role: ${role.toUpperCase()}`);
}

function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btnEl.innerHTML = '<i class="ri-eye-off-line"></i>';
  } else {
    input.type = 'password';
    btnEl.innerHTML = '<i class="ri-eye-line"></i>';
  }
}

function handleLocateMe() {
  const locField = document.getElementById('reg-location');
  if (locField) {
    locField.value = 'Vijayawada, Andhra Pradesh (16.5062° N, 80.6480° E)';
  }
  showToast('📍 GPS Location Detected: Vijayawada, AP');
}

function handleOTPVerify() {
  showToast('✅ Mobile number verified successfully!');
  setTimeout(() => {
    navigateToScreen(7);
  }, 400);
}

function selectActivity(activityName) {
  if (!state.booking) state.booking = {};
  state.booking.activity = activityName;
  renderScreen(11);
  showToast(`Selected Activity: ${activityName}`);
}

function changeAcres(delta) {
  if (!state.booking) state.booking = {};
  if (!state.booking.acres) state.booking.acres = 4.0;
  state.booking.acres = Math.max(1.0, parseFloat((state.booking.acres + delta).toFixed(1)));
  renderScreen(12);
}

function selectTimeSlot(slot) {
  if (!state.booking) state.booking = {};
  state.booking.timeSlot = slot;
  renderScreen(13);
  showToast(`Selected Slot: ${slot}`);
}

function handlePaymentSuccess() {
  showToast('🛡️ Cash on Delivery Confirmed! Booking Placed.');
  setTimeout(() => {
    navigateToScreen(16);
  }, 400);
}

function sendChatMessage() {
  const input = document.getElementById('chatMsgInput');
  if (input && input.value.trim()) {
    showToast(`Message sent: "${input.value.trim()}"`);
    input.value = '';
  } else {
    showToast('Please type a message');
  }
}

const screenTitles = {
  1: 'Splash Screen',
  2: 'Onboarding (3 Slides)',
  3: 'Language Selection',
  4: 'Login Screen',
  5: 'Register Screen',
  6: 'OTP Verification',
  7: 'Farmer Home Dashboard',
  8: 'Equipment Categories',
  9: 'Equipment Search & Filter',
  10: 'Equipment Details',
  11: 'Select Farm Activity',
  12: 'Booking Details Form',
  13: 'Smart Scheduling (Weather)',
  14: 'Booking Summary',
  15: 'Payment Options',
  16: 'Booking Success',
  17: 'My Bookings',
  18: 'Select Farm Location 📍',
  19: 'Agri Weather Radar',
  20: 'Weather & Disaster Alerts',
  21: 'Soil & Crop Advisor',
  22: '🌾 Mevalurkuppam Farmers Circle',
  23: 'Agricultural Store',
  24: 'Equipment Owner Portal',
  25: 'Add Equipment',
  26: 'Document Verification',
  27: 'My Equipment 🚜',
  28: 'Weekly Trends & Earnings',
  29: 'Driver & Operator Console',
  30: 'Worker Earnings & Attendance',
  31: 'AgriRide WhatsApp Chat',
  32: 'Notifications 🔔',
  33: 'Shopping Cart',
  34: 'Machinery Operation Details',
  35: 'My Profile & Settings'
};

function getScreenTitle(num) {
  return screenTitles[num] || `Screen ${num}`;
}

// SCREEN NAVIGATION
function navigateToScreen(screenNumber) {
  state.currentScreen = screenNumber;
  
  // Update sidebar active item
  document.querySelectorAll('.screen-nav-item').forEach((item, index) => {
    if (index + 1 === screenNumber) {
      item.classList.add('active');
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      item.classList.remove('active');
    }
  });

  // Update Web App Top Nav Links active states
  const navBtns = document.querySelectorAll('.webapp-nav-btn');
  if (navBtns && navBtns.length >= 5) {
    navBtns.forEach(btn => btn.classList.remove('active'));
    if (screenNumber === 7) {
      navBtns[0].classList.add('active'); // Dashboard
    } else if (screenNumber >= 8 && screenNumber <= 23) {
      navBtns[1].classList.add('active'); // Machinery Catalog & Booking Flow
    } else if (screenNumber >= 24 && screenNumber <= 28) {
      navBtns[2].classList.add('active'); // Owner Portal
    } else if (screenNumber >= 29 && screenNumber <= 30) {
      navBtns[3].classList.add('active'); // Driver Hub
    } else if (screenNumber === 35) {
      navBtns[4].classList.add('active'); // Profile
    }
  }

  // Sync role-badge-select dropdown if screen implies role
  const roleSelect = document.querySelector('.role-badge-select');
  if (roleSelect) {
    if (screenNumber >= 24 && screenNumber <= 28) {
      state.role = 'owner';
      roleSelect.value = 'owner';
    } else if (screenNumber >= 29 && screenNumber <= 30) {
      state.role = 'worker';
      roleSelect.value = 'worker';
    } else if (screenNumber >= 7 && screenNumber <= 23) {
      state.role = 'farmer';
      roleSelect.value = 'farmer';
    }
  }

  // Update Stepper Info
  const stepInfo = document.getElementById('step-info-text');
  if (stepInfo) {
    stepInfo.textContent = `Screen ${screenNumber} / 35: ${getScreenTitle(screenNumber)}`;
  }

  const countBadge = document.getElementById('screen-count-badge');
  if (countBadge) {
    countBadge.textContent = `Screen ${screenNumber} of 35`;
  }

  // Render content
  renderScreen(screenNumber);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevScreen() {
  if (state.currentScreen > 1) {
    navigateToScreen(state.currentScreen - 1);
  }
}

function nextScreen() {
  if (state.currentScreen < 35) {
    navigateToScreen(state.currentScreen + 1);
  }
}

function switchViewMode(mode) {
  state.viewMode = mode;
  const devView = document.getElementById('device-view-container');
  const gridView = document.getElementById('grid-view-container');
  const btnDev = document.getElementById('btn-view-device');
  const btnGrid = document.getElementById('btn-view-grid');

  if (mode === 'grid') {
    devView.classList.add('hidden');
    gridView.classList.remove('hidden');
    btnDev.classList.remove('active');
    btnGrid.classList.add('active');
    renderGridMatrix();
  } else {
    devView.classList.remove('hidden');
    gridView.classList.add('hidden');
    btnDev.classList.add('active');
    btnGrid.classList.remove('active');
    renderScreen(state.currentScreen);
  }
}

function changeRole(role) {
  state.role = role;
  showToast(`Switched active role to ${role.toUpperCase()}`);
  if (role === 'farmer') navigateToScreen(7);
  else if (role === 'owner') navigateToScreen(24);
  else if (role === 'worker') navigateToScreen(29);
}

function startFlow(flowType) {
  if (flowType === 'farmer') {
    changeRole('farmer');
    navigateToScreen(1);
    showToast('Started Farmer Flow Demo (Screen 1 to 18)');
  } else if (flowType === 'owner') {
    changeRole('owner');
    navigateToScreen(24);
    showToast('Started Owner Flow Demo (Screen 24 to 28)');
  }
}

function getScreenTitle(num) {
  const titles = [
    "Splash Screen", "Onboarding", "Language Selection", "Login Screen", "Register Screen",
    "OTP Verification", "Farmer Home Dashboard", "Equipment Categories", "Equipment Search & Filter", "Equipment Details",
    "Select Farm Activity", "Booking Details Form", "Smart Scheduling", "Booking Summary", "Payment Options",
    "Booking Success", "My Bookings", "Live Vehicle Tracking", "Weather Dashboard", "Weather & Disaster Alerts",
    "Soil & Crop Recommendation", "Farmer Community Feed", "Agricultural Store", "Owner Dashboard", "Add Equipment Form",
    "Vehicle Document Verification", "Owner Booking Requests", "Owner Earnings & Workers", "Worker Dashboard", "Worker Tasks & Attendance",
    "AgriRide WhatsApp Chat Hub"
  ];
  return titles[num - 1] || `Screen ${num}`;
}

function showToast(msg) {
  const toast = document.getElementById('toast-notification');
  const msgEl = document.getElementById('toast-message');
  if (toast && msgEl) {
    msgEl.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
}

// RENDER SCREEN ENGINE
function renderScreen(screenNumber) {
  const container = document.getElementById('phone-screen-body');
  if (!container) return;

  container.innerHTML = generateScreenHTML(screenNumber);
  
  // Custom screen bind triggers
  if (screenNumber === 18) {
    initTrackingAnimation();
  }
}

// GENERATE HTML FOR EACH OF THE 30 SCREENS
function generateScreenHTML(screenNum) {
  switch (screenNum) {

    // =========================================================================
    // SCREEN 1: SPLASH SCREEN (Matches Screenshot 1 exactly)
    // =========================================================================
    case 1:
      // Adjust status bar color for splash
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#12431F';
      }, 0);

      return `
        <div style="background-color: #12431F; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 24px 20px 32px 20px; color: #FFFFFF; text-align: center; position: relative; box-sizing: border-box;">
          
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
            <!-- App Logo Card -->
            <div style="width: 110px; height: 110px; background-color: #175227; border: 2px solid #2E8042; border-radius: 32px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 4px 14px rgba(0,0,0,0.25);">
              <svg width="68" height="68" viewBox="0 0 24 24" fill="none">
                <!-- Chassis / Body -->
                <path fill="#FFFFFF" d="M2,13 L8,13 L8,9 L14,9 L14,7 L17,7 L17,13 L22,13 L22,15 L2,15 Z" />
                <!-- Cabin / Exhaust -->
                <path fill="#FFFFFF" d="M10,6 L12,6 L12,9 L10,9 Z" />
                <!-- Rear Wheel -->
                <circle cx="6" cy="17" r="3.5" fill="#FFFFFF" />
                <circle cx="6" cy="17" r="1.6" fill="#175227" />
                <!-- Front Wheel -->
                <circle cx="18.5" cy="17" r="2" fill="#FFFFFF" />
                <circle cx="18.5" cy="17" r="0.8" fill="#175227" />
              </svg>
            </div>

            <!-- App Name -->
            <h1 style="font-size: 40px; font-weight: 800; letter-spacing: -0.5px; margin: 0 0 6px 0; color: #FFFFFF; font-family: 'Outfit', sans-serif;">AgriRide</h1>
            
            <!-- Subtitle -->
            <p style="font-size: 15px; font-weight: 700; color: #92C79B; margin: 0 0 16px 0;">Farm Equipment Booking System</p>

            <!-- Motto Pill Tag -->
            <div style="border: 1.5px solid #E67E22; color: #E67E22; font-weight: 700; font-size: 13px; padding: 7px 22px; border-radius: 999px; margin-bottom: 28px; display: inline-block;">
              "Smart Farming. Easy Booking."
            </div>

            <!-- Loading Spinner -->
            <div style="width: 26px; height: 26px; border: 2.5px solid rgba(255,255,255,0.15); border-top-color: #F39C12; border-radius: 50%; animation: spin 0.9s infinite linear;"></div>
          </div>

          <!-- Tap to Continue Button Text -->
          <div onclick="navigateToScreen(2)" style="width: 100%; text-align: center; color: #FFFFFF; font-size: 14px; font-weight: 800; letter-spacing: 1px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px 0;">
            TAP TO CONTINUE <span style="font-size: 16px;">➔</span>
          </div>

          <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </div>
      `;

    // =========================================================================
    // SCREEN 2: ONBOARDING (Matches Screenshot 2 exactly)
    // =========================================================================
    case 2:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#0e3e18';
      }, 0);

      const onboardingSlides = [
        {
          title: 'Book Farm Equipment<br>Easily',
          desc: 'Rent high-performance tractors, harvesters, and sprayers directly from verified local vehicle owners.'
        },
        {
          title: 'Smart Scheduling<br>& Weather',
          desc: 'Get AI crop weather suitability recommendations and book flexible hourly and acre-based slots.'
        },
        {
          title: 'Live GPS Field<br>Tracking',
          desc: 'Track farm vehicles and operators en-route right to your farm field coordinates with live ETA.'
        }
      ];
      const curSlide = onboardingSlides[state.onboardingSlide || 0];

      return `
        <div style="background-color: #FFFFFF; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 20px 24px 24px 24px; box-sizing: border-box;">
          
          <!-- Top Row -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 14px; font-weight: 700; color: #5A6B5E;">AgriRide Intro</span>
            <button onclick="navigateToScreen(4)" style="border: none; background: transparent; color: #5A6B5E; font-weight: 700; font-size: 14px; cursor: pointer; padding: 4px 6px;">Skip</button>
          </div>

          <!-- Center Content -->
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 10px 0;">
            <!-- Dashed Circle with Green Truck Icon -->
            <div style="width: 164px; height: 164px; border: 2.5px dashed #164E24; background: #EBF5ED; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 34px;">
              <svg width="74" height="74" viewBox="0 0 24 24" fill="none">
                <path fill="#164E24" d="M18,18.5A1.5,1.5 0,0 1,16.5,17A1.5,1.5 0,0 1,18,15.5A1.5,1.5 0,0 1,19.5,17A1.5,1.5 0,0 1,18,18.5M19.5,9.5H17V12H21.46L19.5,9.5M6,18.5A1.5,1.5 0,0 1,4.5,17A1.5,1.5 0,0 1,6,15.5A1.5,1.5 0,0 1,7.5,17A1.5,1.5 0,0 1,6,18.5M20,8L23.5,12.5V17H21.5A3,3 0,0 1,18.5,20A3,3 0,0 1,15.5,17H8.5A3,3 0,0 1,5.5,20A3,3 0,0 1,2.5,17H1V6C1,4.89 1.89,4 3,4H17V8H20M3,6V15H3.76A3,3 0,0 1,6,14A3,3 0,0 1,8.24,15H15.5V6H3Z" />
              </svg>
            </div>

            <!-- Title -->
            <h2 style="font-size: 24px; font-weight: 800; color: #1A251E; line-height: 1.25; margin: 0 0 14px 0; font-family: 'Outfit', sans-serif;">
              ${curSlide.title}
            </h2>

            <!-- Description -->
            <p style="font-size: 14px; color: #5A6B5E; line-height: 1.55; margin: 0 auto; max-width: 320px;">
              ${curSlide.desc}
            </p>
          </div>

          <!-- Bottom Area: Dots & Button -->
          <div>
            <!-- Indicators: Wide pill + 2 dots -->
            <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 24px;">
              <span style="width: ${state.onboardingSlide === 0 ? '24px' : '8px'}; height: 8px; background-color: ${state.onboardingSlide === 0 ? '#164E24' : '#E5EBE6'}; border-radius: 4px; transition: all 0.3s;"></span>
              <span style="width: ${state.onboardingSlide === 1 ? '24px' : '8px'}; height: 8px; background-color: ${state.onboardingSlide === 1 ? '#164E24' : '#E5EBE6'}; border-radius: 4px; transition: all 0.3s;"></span>
              <span style="width: ${state.onboardingSlide === 2 ? '24px' : '8px'}; height: 8px; background-color: ${state.onboardingSlide === 2 ? '#164E24' : '#E5EBE6'}; border-radius: 4px; transition: all 0.3s;"></span>
            </div>

            <button onclick="handleOnboardingNext()" style="width: 100%; height: 56px; background-color: #164E24; color: #FFFFFF; border: none; border-radius: 16px; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(22, 78, 36, 0.25);">
              ${state.onboardingSlide === 2 ? 'Get Started' : 'Next Step'} <span style="font-size: 16px;">➔</span>
            </button>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 3: SELECT LANGUAGE (Matches Screenshot 3 exactly)
    // =========================================================================
    case 3:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#0e3e18';
      }, 0);

      const langList = [
        { id: 'English', native: 'English', sub: 'Default Language' },
        { id: 'Telugu', native: 'తెలుగు', sub: 'ఆంధ్ర ప్రదేశ్ & తెలంగాణ' },
        { id: 'Tamil', native: 'தமிழ்', sub: 'தமிழ்நாடு' },
        { id: 'Hindi', native: 'हिंदी', sub: 'भारत' }
      ];

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 20px 20px 24px 20px; box-sizing: border-box;">
          
          <div>
            <!-- Header Row -->
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 24px;">
              <div style="width: 48px; height: 48px; background-color: #164E24; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 22px; flex-shrink: 0; box-shadow: 0 2px 8px rgba(22,78,36,0.25);">
                🌐
              </div>
              <div>
                <h2 style="font-size: 20px; font-weight: 800; color: #1A251E; margin: 0; font-family: 'Outfit', sans-serif;">Select Language</h2>
                <p style="font-size: 13px; color: #5A6B5E; margin: 2px 0 0 0;">భాషను ఎంచుకోండి / भाषा चुनें</p>
              </div>
            </div>

            <!-- Radio Cards -->
            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${langList.map(item => {
                const isSelected = state.language === item.id;
                return `
                  <div onclick="selectLanguage('${item.id}')" style="background-color: #FFFFFF; border: ${isSelected ? '2px solid #164E24' : '1.5px solid #E5EBE6'}; border-radius: 18px; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.2s ease; box-shadow: ${isSelected ? '0 3px 10px rgba(22,78,36,0.08)' : 'none'};">
                    <div>
                      <div style="font-size: 17px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">${item.native}</div>
                      <div style="font-size: 13px; color: #5A6B5E; margin-top: 3px;">${item.sub}</div>
                    </div>
                    
                    <!-- Radio Button Indicator -->
                    <div style="width: 24px; height: 24px; border: 2.5px solid ${isSelected ? '#164E24' : '#B0BEC5'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      ${isSelected ? '<div style="width: 12px; height: 12px; background-color: #164E24; border-radius: 50%;"></div>' : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Continue Button -->
          <button onclick="navigateToScreen(4)" style="width: 100%; height: 56px; background-color: #164E24; color: #FFFFFF; border: none; border-radius: 16px; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(22, 78, 36, 0.25);">
            Continue <span style="font-size: 16px;">➔</span>
          </button>

        </div>
      `;

    // =========================================================================
    // SCREEN 4: LOGIN SCREEN (Matches Screenshot 5 exactly)
    // =========================================================================
    case 4:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#0e3e18';
      }, 0);

      return `
        <div style="background-color: #FFFFFF; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 20px 24px 24px 24px; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top Shield User Avatar -->
            <div style="width: 80px; height: 80px; background-color: #EBF5ED; border: 1.5px solid #C8E6C9; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 12px auto 14px auto;">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                <path fill="#164E24" d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,5A3,3 0,0,1 15,8A3,3 0,0,1 12,11A3,3 0,0,1 9,8A3,3 0,0,1 12,5M12,13C14.67,13 18,14.33 18,17V18H6V17C6,14.33 9.33,13 12,13Z" />
              </svg>
            </div>

            <!-- Title & Subtitle -->
            <h2 style="font-size: 26px; font-weight: 800; color: #1A251E; text-align: center; margin: 0 0 6px 0; font-family: 'Outfit', sans-serif;">Welcome Back</h2>
            <p style="font-size: 13.5px; color: #5A6B5E; text-align: center; margin: 0 0 22px 0;">Login to book farm equipment & check weather</p>

            <!-- Role Selector -->
            <div style="font-size: 13px; font-weight: 700; color: #1A251E; margin-bottom: 10px;">👤 Select Login Mode / రోల్ ఎంచుకోండి</div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 20px;">
              <div onclick="setLoginRole('farmer')" style="height: 48px; border-radius: 14px; background-color: ${state.role === 'farmer' ? '#164E24' : '#F4F7F4'}; color: ${state.role === 'farmer' ? '#FFFFFF' : '#1A251E'}; display: flex; align-items: center; justify-content: center; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                🌾 Farmer
              </div>
              <div onclick="setLoginRole('owner')" style="height: 48px; border-radius: 14px; background-color: ${state.role === 'owner' ? '#164E24' : '#F4F7F4'}; color: ${state.role === 'owner' ? '#FFFFFF' : '#1A251E'}; display: flex; align-items: center; justify-content: center; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                🚜 Owner
              </div>
              <div onclick="setLoginRole('worker')" style="height: 48px; border-radius: 14px; background-color: ${state.role === 'worker' ? '#164E24' : '#F4F7F4'}; color: ${state.role === 'worker' ? '#FFFFFF' : '#1A251E'}; display: flex; align-items: center; justify-content: center; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                👷 Worker
              </div>
            </div>

            <!-- Mobile Number / Email Field -->
            <div style="margin-bottom: 18px;">
              <label style="display: block; font-size: 13px; font-weight: 700; color: #1A251E; margin-bottom: 6px;">
                📞 Mobile Number / Email
              </label>
              <input type="text" id="login-identifier" onkeydown="if(event.key === 'Enter') handleLoginSubmit()" value="1234567893@agriride.in" style="width: 100%; height: 50px; border: 1.5px solid #D0D7D1; border-radius: 14px; padding: 0 16px; font-size: 14.5px; color: #1A251E; font-weight: 500; outline: none; box-sizing: border-box; background: #FFFFFF;">
            </div>

            <!-- Password Field with Forgot? -->
            <div style="margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="font-size: 13px; font-weight: 700; color: #1A251E;">🔒 Password</label>
                <a href="javascript:void(0)" onclick="showToast('Password reset link sent to mobile / email')" style="font-size: 13px; color: #164E24; font-weight: 700; text-decoration: none;">Forgot?</a>
              </div>
              <div style="position: relative; width: 100%;">
                <input type="password" id="login-password" onkeydown="if(event.key === 'Enter') handleLoginSubmit()" value="pass1234" placeholder="Enter your password" style="width: 100%; height: 50px; border: 1.5px solid #D0D7D1; border-radius: 14px; padding: 0 46px 0 16px; font-size: 14.5px; color: #1A251E; font-weight: 500; outline: none; box-sizing: border-box; background: #FFFFFF;">
                <span onclick="togglePasswordVisibility('login-password', this)" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #5A6B5E; cursor: pointer; font-size: 18px;">
                  <i class="ri-eye-line"></i>
                </span>
              </div>
            </div>

            <!-- Login Button -->
            <button onclick="handleLoginSubmit()" style="width: 100%; height: 54px; background-color: #164E24; color: #FFFFFF; border: none; border-radius: 16px; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(22, 78, 36, 0.25);">
              Login to AgriRide <span style="font-size: 16px;">➔</span>
            </button>
          </div>

          <!-- Bottom Switch Link -->
          <div style="text-align: center; padding-top: 24px; padding-bottom: 12px; font-size: 13.5px; color: #1A251E;">
            Don't have an account? <a href="javascript:void(0)" onclick="navigateToScreen(5)" style="color: #164E24; font-weight: 800; text-decoration: none; cursor: pointer;">Create Account</a>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 5: CREATE ACCOUNT / REGISTER (Matches Screenshot 4 exactly)
    // =========================================================================
    case 5:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#0e3e18';
      }, 0);

      return `
        <div style="background-color: #FFFFFF; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 20px 24px 24px 24px; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top Header with Back Arrow -->
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
              <button onclick="navigateToScreen(4)" style="border: none; background: transparent; padding: 0; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #1A251E; font-size: 26px;">
                <i class="ri-arrow-go-back-line"></i>
              </button>
              <div>
                <h2 style="font-size: 24px; font-weight: 800; color: #1A251E; margin: 0; font-family: 'Outfit', sans-serif;">Create Account</h2>
                <p style="font-size: 13px; color: #5A6B5E; margin: 2px 0 0 0;">Join AgriRide agricultural network</p>
              </div>
            </div>

            <!-- Role Selection -->
            <div style="font-size: 13px; font-weight: 700; color: #1A251E; margin-bottom: 10px;">Select User Role:</div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 18px;">
              <div onclick="setRegisterRole('farmer')" style="height: 48px; border-radius: 14px; background-color: ${state.role === 'farmer' ? '#164E24' : '#F4F7F4'}; color: ${state.role === 'farmer' ? '#FFFFFF' : '#1A251E'}; display: flex; align-items: center; justify-content: center; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                🌾 Farmer
              </div>
              <div onclick="setRegisterRole('owner')" style="height: 48px; border-radius: 14px; background-color: ${state.role === 'owner' ? '#164E24' : '#F4F7F4'}; color: ${state.role === 'owner' ? '#FFFFFF' : '#1A251E'}; display: flex; align-items: center; justify-content: center; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                🚜 Owner
              </div>
              <div onclick="setRegisterRole('worker')" style="height: 48px; border-radius: 14px; background-color: ${state.role === 'worker' ? '#164E24' : '#F4F7F4'}; color: ${state.role === 'worker' ? '#FFFFFF' : '#1A251E'}; display: flex; align-items: center; justify-content: center; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                👷 Worker
              </div>
            </div>

            <!-- Full Name -->
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 13px; font-weight: 700; color: #1A251E; margin-bottom: 6px;">Full Name</label>
              <input type="text" id="reg-name" value="" placeholder="Enter your full name" style="width: 100%; height: 50px; border: 1.5px solid #D0D7D1; border-radius: 14px; padding: 0 16px; font-size: 14.5px; color: #1A251E; font-weight: 500; outline: none; box-sizing: border-box; background: #FFFFFF;">
            </div>

            <!-- Mobile Number -->
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 13px; font-weight: 700; color: #1A251E; margin-bottom: 6px;">Mobile Number</label>
              <input type="text" id="reg-mobile" value="" placeholder="Enter 10-digit mobile number" style="width: 100%; height: 50px; border: 1.5px solid #D0D7D1; border-radius: 14px; padding: 0 16px; font-size: 14.5px; color: #1A251E; font-weight: 500; outline: none; box-sizing: border-box; background: #FFFFFF;">
            </div>

            <!-- Farm / District Location -->
            <div style="margin-bottom: 8px;">
              <label style="display: block; font-size: 13px; font-weight: 700; color: #1A251E; margin-bottom: 6px;">Farm / District Location</label>
              <input type="text" id="reg-location" value="" placeholder="e.g. Vijayawada, Andhra Pradesh" style="width: 100%; height: 50px; border: 1.5px solid #D0D7D1; border-radius: 14px; padding: 0 16px; font-size: 14.5px; color: #1A251E; font-weight: 500; outline: none; box-sizing: border-box; background: #FFFFFF;">
            </div>

            <!-- LOCATE ME (USE GPS LOCATION) -->
            <div style="margin-bottom: 16px;">
              <button type="button" onclick="handleLocateMe()" style="border: none; background: transparent; padding: 0; font-size: 12.5px; font-weight: 800; color: #164E24; cursor: pointer; display: flex; align-items: center; gap: 4px; letter-spacing: 0.3px;">
                📍 LOCATE ME (USE GPS LOCATION)
              </button>
            </div>

            <!-- Create Password -->
            <div style="margin-bottom: 24px;">
              <label style="display: block; font-size: 13px; font-weight: 700; color: #1A251E; margin-bottom: 6px;">Create Password</label>
              <div style="position: relative; width: 100%;">
                <input type="password" id="reg-password" placeholder="Create strong password" style="width: 100%; height: 50px; border: 1.5px solid #D0D7D1; border-radius: 14px; padding: 0 46px 0 16px; font-size: 14.5px; color: #1A251E; font-weight: 500; outline: none; box-sizing: border-box; background: #FFFFFF;">
                <span onclick="togglePasswordVisibility('reg-password', this)" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #5A6B5E; cursor: pointer; font-size: 18px;">
                  <i class="ri-eye-line"></i>
                </span>
              </div>
            </div>

            <!-- Create Account Button -->
            <button onclick="handleRegisterSubmit()" style="width: 100%; height: 54px; background-color: #164E24; color: #FFFFFF; border: none; border-radius: 16px; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(22, 78, 36, 0.25);">
              Create Account <span style="font-size: 16px;">➔</span>
            </button>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 6: OTP VERIFICATION (Bypassed directly to Dashboard to match mobile app LoginActivity)
    // =========================================================================
    case 6:
      setTimeout(() => {
        if (state.role === 'owner') navigateToScreen(24);
        else if (state.role === 'worker') navigateToScreen(29);
        else navigateToScreen(7);
      }, 0);
      return ``;

    // =========================================================================
    // SCREEN 7: FARMER HOME DASHBOARD (Matches Screenshot 7 exactly)
    // =========================================================================
    case 7:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      const hourNow = new Date().getHours();
      const greetingNow = hourNow < 12 ? 'Good Morning 👋' : (hourNow < 17 ? 'Good Afternoon 👋' : 'Good Evening 👋');

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow: hidden;">
          
          <div style="flex: 1; overflow-y: auto;">
            <!-- Top App Profile Header (Interactive & Editable) -->
            <div style="background-color: #164E24; padding: 14px 20px 20px 20px; color: #FFFFFF;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                
                <!-- Clickable Profile Details Section -->
                <div onclick="openEditProfileModal()" title="Click to edit profile details" style="display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 4px 8px; border-radius: 14px; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='transparent'">
                  <!-- Avatar -->
                  <div style="width: 52px; height: 52px; background-color: #2E7D32; border: 2.5px solid #81C784; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 26px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                    👨‍🌾
                  </div>
                  <div>
                    <div style="font-size: 12.5px; color: #FFE082; font-weight: 700;">${greetingNow}</div>
                    <div style="font-size: 20px; font-weight: 800; color: #FFFFFF; font-family: 'Outfit', sans-serif; display: flex; align-items: center; gap: 6px;">
                      <span>${state.userProfile ? state.userProfile.name : 'abb'}</span>
                      <i class="ri-edit-2-fill" style="font-size: 14px; color: #81C784; opacity: 0.85;"></i>
                    </div>
                    <div style="font-size: 12px; color: #F39C12; font-weight: 700; margin-top: 2px;">📍 ${state.userProfile ? state.userProfile.location : 'Mevalurkuppam, Tamil Nadu'}</div>
                  </div>
                </div>

                <!-- 3 Top Right Action Buttons -->
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div onclick="navigateToScreen(20)" title="Disaster & Weather Alerts" style="width: 38px; height: 38px; background: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative;">
                    🔔
                    <span style="position: absolute; top: 4px; right: 4px; width: 7px; height: 7px; background: #F39C12; border-radius: 50%;"></span>
                  </div>
                  <div onclick="openEditProfileModal()" title="Edit Profile Details" style="width: 38px; height: 38px; background: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px;">
                    ✏️
                  </div>
                  <div onclick="navigateToScreen(4)" title="Logout" style="width: 38px; height: 38px; background: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    🚪
                  </div>
                </div>

              </div>
            </div>

            <!-- Weather Forecast Widget Card -->
            <div style="margin: 16px 18px 0 18px; background-color: #1F6330; border-radius: 18px; padding: 16px 18px; color: #FFFFFF; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(22,78,36,0.18);">
              <div>
                <div style="font-size: 12px; color: #C8E6C9; font-weight: 700; margin-bottom: 4px;">☁️ Weather in Mevalurkuppam, Tamil Nadu</div>
                <div style="font-size: 22px; font-weight: 800; font-family: 'Outfit', sans-serif;">28°C • Partly Cloudy</div>
                <div style="font-size: 12px; color: #E8F5E9; margin-top: 4px;">Rainfall: 20% • Wind: 14 km/h</div>
              </div>
              <div style="font-size: 48px; opacity: 0.95;">
                ☁️
              </div>
            </div>

            <!-- Search Bar Card -->
            <div onclick="navigateToScreen(9)" style="margin: 14px 18px 0 18px; background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 16px; height: 50px; display: flex; align-items: center; padding: 0 16px; gap: 12px; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
              <span style="font-size: 16px;">🔍</span>
              <span style="font-size: 13.5px; color: #8B9B8E; font-weight: 500;">Search tractors, harvesters, sprayers...</span>
            </div>

            <!-- Quick Services Heading -->
            <div style="margin: 20px 18px 10px 18px; font-size: 16px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">
              Quick Services
            </div>

            <!-- Quick Services 4 Icons Row -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 0 18px 20px 18px;">
              <!-- 1. Book -->
              <div onclick="navigateToScreen(8)" style="background: #FFFFFF; border: 1px solid #E5EBE6; border-radius: 16px; padding: 14px 4px; text-align: center; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
                <div style="width: 44px; height: 44px; background: #EBF5ED; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px auto; font-size: 20px;">
                  🚜
                </div>
                <span style="font-size: 12px; font-weight: 700; color: #1A251E;">Book</span>
              </div>

              <!-- 2. My Bookings -->
              <div onclick="navigateToScreen(17)" style="background: #FFFFFF; border: 1px solid #E5EBE6; border-radius: 16px; padding: 14px 4px; text-align: center; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
                <div style="width: 44px; height: 44px; background: #FFFDE7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px auto; font-size: 20px;">
                  📋
                </div>
                <span style="font-size: 12px; font-weight: 700; color: #1A251E;">My Bookings</span>
              </div>

              <!-- 3. Soil AI -->
              <div onclick="navigateToScreen(21)" style="background: #FFFFFF; border: 1px solid #E5EBE6; border-radius: 16px; padding: 14px 4px; text-align: center; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
                <div style="width: 44px; height: 44px; background: #E3F2FD; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px auto; font-size: 20px;">
                  🌱
                </div>
                <span style="font-size: 12px; font-weight: 700; color: #1A251E;">Soil AI</span>
              </div>

              <!-- 4. Live Map -->
              <div onclick="navigateToScreen(18)" style="background: #FFFFFF; border: 1px solid #E5EBE6; border-radius: 16px; padding: 14px 4px; text-align: center; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
                <div style="width: 44px; height: 44px; background: #FCE4EC; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px auto; font-size: 20px;">
                  📍
                </div>
                <span style="font-size: 12px; font-weight: 700; color: #1A251E;">Live Map</span>
              </div>
            </div>

            <!-- Top Nearby Equipment Heading -->
            <div style="margin: 0 18px 12px 18px; font-size: 16px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">
              Top Nearby Equipment
            </div>

            <!-- Equipment Card 1: Claas Crop Tiger 30 -->
            <div onclick="navigateToScreen(10)" style="margin: 0 18px 14px 18px; background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 14px; display: flex; gap: 12px; align-items: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
              <img src="assets/img_sonalika_harvester.jpg" style="width: 86px; height: 86px; border-radius: 14px; object-fit: cover; flex-shrink: 0;" alt="Claas Crop Tiger">
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <h4 style="font-size: 15px; font-weight: 800; color: #1A251E; margin: 0; font-family: 'Outfit', sans-serif;">Claas Crop Tiger 30</h4>
                  <span style="font-size: 12px; font-weight: 700; color: #F39C12;">⭐ 4.8 (14)</span>
                </div>
                <div style="font-size: 12px; color: #5A6B5E; margin-top: 2px;">Owner: greeshma • Mevalurkuppam</div>
                <div style="font-size: 11px; color: #2E7D32; font-weight: 600; margin-top: 2px;">📍 390.6 km away • Available Today</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                  <span style="font-size: 14.5px; font-weight: 800; color: #164E24;">₹2400 / acre</span>
                  <button onclick="event.stopPropagation(); navigateToScreen(10);" style="background-color: #164E24; color: #FFFFFF; border: none; border-radius: 10px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer;">Book Now</button>
                </div>
              </div>
            </div>

            <!-- Equipment Card 2: Garuda Kisan Drone 16L -->
            <div onclick="navigateToScreen(10)" style="margin: 0 18px 14px 18px; background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 14px; display: flex; gap: 12px; align-items: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
              <img src="assets/img_kisan_drone.jpg" style="width: 86px; height: 86px; border-radius: 14px; object-fit: cover; flex-shrink: 0;" alt="Garuda Drone">
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <h4 style="font-size: 15px; font-weight: 800; color: #1A251E; margin: 0; font-family: 'Outfit', sans-serif;">Garuda Kisan Drone 16L</h4>
                  <span style="font-size: 12px; font-weight: 700; color: #F39C12;">⭐ 5.0 (22)</span>
                </div>
                <div style="font-size: 12px; color: #5A6B5E; margin-top: 2px;">Owner: greeshma • Mevalurkuppam</div>
                <div style="font-size: 11px; color: #2E7D32; font-weight: 600; margin-top: 2px;">📍 390.6 km away • Available Today</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                  <span style="font-size: 14.5px; font-weight: 800; color: #164E24;">₹650 / acre</span>
                  <button onclick="event.stopPropagation(); navigateToScreen(10);" style="background-color: #164E24; color: #FFFFFF; border: none; border-radius: 10px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer;">Book Now</button>
                </div>
              </div>
            </div>

            <!-- Equipment Card 3: mahindra 575 -->
            <div onclick="navigateToScreen(10)" style="margin: 0 18px 24px 18px; background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 14px; display: flex; gap: 12px; align-items: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
              <img src="assets/img_mahindra_tractor.jpg" style="width: 86px; height: 86px; border-radius: 14px; object-fit: cover; flex-shrink: 0;" alt="Mahindra 575">
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <h4 style="font-size: 15px; font-weight: 800; color: #1A251E; margin: 0; font-family: 'Outfit', sans-serif;">mahindra 575</h4>
                  <span style="font-size: 12px; font-weight: 700; color: #F39C12;">⭐ 4.9 (8)</span>
                </div>
                <div style="font-size: 12px; color: #5A6B5E; margin-top: 2px;">Owner: greeshma • Mevalurkuppam</div>
                <div style="font-size: 11px; color: #2E7D32; font-weight: 600; margin-top: 2px;">📍 0.7 km away • Available Today</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                  <span style="font-size: 14.5px; font-weight: 800; color: #164E24;">₹1200 / acre</span>
                  <button onclick="event.stopPropagation(); navigateToScreen(10);" style="background-color: #164E24; color: #FFFFFF; border: none; border-radius: 10px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer;">Book Now</button>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Navigation Bar (Home active) -->
          <div style="background-color: #FFFFFF; border-top: 1px solid #E5EBE6; padding: 8px 16px; display: flex; justify-content: space-around; align-items: center; flex-shrink: 0;">
            <div onclick="navigateToScreen(7)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div style="background-color: #3B424B; color: #81C784; padding: 4px 18px; border-radius: 20px; font-size: 16px;">
                🏠
              </div>
              <span style="font-size: 11px; font-weight: 800; color: #164E24; margin-top: 2px;">Home</span>
            </div>

            <div onclick="navigateToScreen(17)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; color: #5A6B5E;">
              <span style="font-size: 18px;">📅</span>
              <span style="font-size: 11px; font-weight: 600; margin-top: 2px;">Bookings</span>
            </div>

            <div onclick="navigateToScreen(31)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; color: #5A6B5E;">
              <span style="font-size: 18px;">👤</span>
              <span style="font-size: 11px; font-weight: 600; margin-top: 2px;">Profile</span>
            </div>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 8: EQUIPMENT CATEGORIES (Matches Screenshot 8 exactly)
    // =========================================================================
    case 8:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; box-sizing: border-box; overflow-y: auto;">
          
          <!-- Top App Bar -->
          <div style="background-color: #164E24; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; color: #FFFFFF;">
            <button onclick="navigateToScreen(7)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <i class="ri-arrow-left-line"></i>
            </button>
            <h3 style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin: 0; font-family: 'Outfit', sans-serif;">Equipment Categories</h3>
            <button onclick="navigateToScreen(9)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <i class="ri-search-line"></i>
            </button>
          </div>

          <div style="flex: 1; padding: 16px 18px;">
            <p style="font-size: 13px; color: #5A6B5E; margin: 0 0 16px 0; font-weight: 500;">Select category to find verified machines near your location:</p>

            <!-- 2-Column Grid of 4 Categories -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 18px;">
              <!-- 1. Tractor -->
              <div onclick="navigateToScreen(9)" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 22px 14px; text-align: center; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="width: 58px; height: 58px; background: #EBF5ED; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto; font-size: 28px;">
                  🚚
                </div>
                <div style="font-size: 15px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">Tractor</div>
                <div style="font-size: 12px; color: #8B9B8E; font-weight: 500; margin-top: 2px;">42 Available</div>
              </div>

              <!-- 2. Plough -->
              <div onclick="navigateToScreen(9)" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 22px 14px; text-align: center; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="width: 58px; height: 58px; background: #FFFDE7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto; font-size: 28px;">
                  🔨
                </div>
                <div style="font-size: 15px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">Plough</div>
                <div style="font-size: 12px; color: #8B9B8E; font-weight: 500; margin-top: 2px;">18 Available</div>
              </div>

              <!-- 3. Sprayer -->
              <div onclick="navigateToScreen(9)" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 22px 14px; text-align: center; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="width: 58px; height: 58px; background: #E1F5FE; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto; font-size: 28px;">
                  💧
                </div>
                <div style="font-size: 15px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">Sprayer</div>
                <div style="font-size: 12px; color: #8B9B8E; font-weight: 500; margin-top: 2px;">25 Available</div>
              </div>

              <!-- 4. Harvester -->
              <div onclick="navigateToScreen(9)" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 22px 14px; text-align: center; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="width: 58px; height: 58px; background: #FCE4EC; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto; font-size: 28px;">
                  ✂️
                </div>
                <div style="font-size: 15px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">Harvester</div>
                <div style="font-size: 12px; color: #8B9B8E; font-weight: 500; margin-top: 2px;">12 Available</div>
              </div>
            </div>

            <!-- Rich Category Cards with Images (Matching Screenshot 8 bottom row) -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;">
              <!-- Seeder Card -->
              <div onclick="navigateToScreen(10)" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 12px; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <img src="assets/img_mahindra_tractor.jpg" style="width: 100%; height: 92px; border-radius: 14px; object-fit: cover; margin-bottom: 8px;" alt="Seeder">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="font-size: 14px; font-weight: 800; color: #1A251E;">🌱 Seeder</div>
                  <span style="font-size: 11px; color: #F39C12; font-weight: 700;">⭐ 4.8</span>
                </div>
                <div style="font-size: 11px; color: #5A6B5E; margin: 4px 0;">Tap to view available Seeder machines</div>
                <div style="font-size: 10.5px; color: #2E7D32; font-weight: 600; margin-bottom: 8px;">📍 3.5 km away • Available Today</div>
                <button onclick="event.stopPropagation(); navigateToScreen(10);" style="width: 100%; background: #164E24; color: #fff; border: none; border-radius: 10px; padding: 6px; font-size: 12px; font-weight: 700; cursor: pointer;">Book Now</button>
              </div>

              <!-- Cultivator Card -->
              <div onclick="navigateToScreen(10)" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 12px; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <img src="assets/img_rotavator.jpg" style="width: 100%; height: 92px; border-radius: 14px; object-fit: cover; margin-bottom: 8px;" alt="Cultivator">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="font-size: 14px; font-weight: 800; color: #1A251E;">🌿 Cultivator</div>
                  <span style="font-size: 11px; color: #F39C12; font-weight: 700;">⭐ 4.8</span>
                </div>
                <div style="font-size: 11px; color: #5A6B5E; margin: 4px 0;">Tap to view available Cultivator machines</div>
                <div style="font-size: 10.5px; color: #2E7D32; font-weight: 600; margin-bottom: 8px;">📍 3.5 km away • Available Today</div>
                <button onclick="event.stopPropagation(); navigateToScreen(10);" style="width: 100%; background: #164E24; color: #fff; border: none; border-radius: 10px; padding: 6px; font-size: 12px; font-weight: 700; cursor: pointer;">Book Now</button>
              </div>
            </div>

          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 9: BOOK FARM MACHINERY / SEARCH & FILTER (Matches Screenshot 9 exactly)
    // =========================================================================
    case 9:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#0e3e18';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; box-sizing: border-box; overflow-y: auto;">
          
          <!-- Top App Bar -->
          <div style="background-color: #FFFFFF; padding: 14px 18px; display: flex; align-items: center; gap: 14px; border-bottom: 1px solid #E5EBE6;">
            <button onclick="navigateToScreen(8)" style="border: none; background: transparent; padding: 0; cursor: pointer; display: flex; align-items: center; font-size: 24px; color: #1A251E;">
              <i class="ri-arrow-go-back-line"></i>
            </button>
            <div>
              <h3 style="font-size: 17px; font-weight: 800; color: #1A251E; margin: 0; font-family: 'Outfit', sans-serif;">🚜 Book Farm Machinery</h3>
              <div style="font-size: 12px; color: #164E24; font-weight: 700; margin-top: 2px;">📍 Real Nearby Vehicles (వ్యవసాయ యంత్రాలు)</div>
            </div>
          </div>

          <!-- Horizontal Filter Chips Row -->
          <div style="background-color: #FFFFFF; padding: 10px 18px; display: flex; gap: 8px; overflow-x: auto; border-bottom: 1px solid #E5EBE6; scrollbar-width: none;">
            <div style="background: #EBF5ED; border: 1.5px solid #164E24; color: #164E24; border-radius: 20px; padding: 6px 14px; font-size: 12.5px; font-weight: 700; white-space: nowrap; cursor: pointer;">
              🌾 All Machines
            </div>
            <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; color: #1A251E; border-radius: 20px; padding: 6px 14px; font-size: 12.5px; font-weight: 600; white-space: nowrap; cursor: pointer;">
              🚜 Tractors
            </div>
            <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; color: #1A251E; border-radius: 20px; padding: 6px 14px; font-size: 12.5px; font-weight: 600; white-space: nowrap; cursor: pointer;">
              🌾 Harvesters
            </div>
            <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; color: #1A251E; border-radius: 20px; padding: 6px 14px; font-size: 12.5px; font-weight: 600; white-space: nowrap; cursor: pointer;">
              🚁 Spray Drones
            </div>
          </div>

          <!-- Secondary Filters Row (Distance / Rating) -->
          <div style="padding: 10px 18px 6px 18px; display: flex; gap: 10px;">
            <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 20px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #1A251E; display: flex; align-items: center; gap: 4px; cursor: pointer;">
              📍 Distance: Nearest ⌵
            </div>
            <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 20px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #1A251E; display: flex; align-items: center; gap: 4px; cursor: pointer;">
              ⭐ Rating: All ⌵
            </div>
          </div>

          <!-- Result Count Banner -->
          <div style="padding: 6px 18px 12px 18px; font-size: 12.5px; color: #1A251E; font-weight: 600;">
            📍 Found 6 Verified Farm Machines Nearby (0.8 - 5.0 km)
          </div>

          <!-- Machinery List -->
          <div style="flex: 1; padding: 0 18px 24px 18px; display: flex; flex-direction: column; gap: 12px;">
            
            <!-- Item 1: mahindra 575 -->
            <div onclick="navigateToScreen(10)" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 14px; display: flex; gap: 12px; align-items: center; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
              <img src="assets/img_sonalika_harvester.jpg" style="width: 86px; height: 86px; border-radius: 14px; object-fit: cover; flex-shrink: 0;" alt="Mahindra 575">
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <h4 style="font-size: 15px; font-weight: 800; color: #1A251E; margin: 0; font-family: 'Outfit', sans-serif;">mahindra 575</h4>
                  <span style="font-size: 12px; font-weight: 700; color: #F39C12;">⭐ 4.9 (8)</span>
                </div>
                <div style="font-size: 12px; color: #5A6B5E; margin-top: 2px;">Owner: greeshma • Mevalurkuppam</div>
                <div style="font-size: 11px; color: #2E7D32; font-weight: 600; margin-top: 2px;">📍 0.7 km away • Available Today</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                  <span style="font-size: 14.5px; font-weight: 800; color: #164E24;">₹1200 / acre</span>
                  <button onclick="event.stopPropagation(); navigateToScreen(10);" style="background-color: #164E24; color: #FFFFFF; border: none; border-radius: 10px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer;">Book Now</button>
                </div>
              </div>
            </div>

            <!-- Item 2: Claas Crop Tiger 30 -->
            <div onclick="navigateToScreen(10)" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 14px; display: flex; gap: 12px; align-items: center; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
              <img src="assets/img_sonalika_harvester.jpg" style="width: 86px; height: 86px; border-radius: 14px; object-fit: cover; flex-shrink: 0;" alt="Claas Crop Tiger 30">
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <h4 style="font-size: 15px; font-weight: 800; color: #1A251E; margin: 0; font-family: 'Outfit', sans-serif;">Claas Crop Tiger 30</h4>
                  <span style="font-size: 12px; font-weight: 700; color: #F39C12;">⭐ 4.8 (14)</span>
                </div>
                <div style="font-size: 12px; color: #5A6B5E; margin-top: 2px;">Owner: greeshma • Mevalurkuppam</div>
                <div style="font-size: 11px; color: #2E7D32; font-weight: 600; margin-top: 2px;">📍 0.7 km away • Available Today</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                  <span style="font-size: 14.5px; font-weight: 800; color: #164E24;">₹2400 / acre</span>
                  <button onclick="event.stopPropagation(); navigateToScreen(10);" style="background-color: #164E24; color: #FFFFFF; border: none; border-radius: 10px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer;">Book Now</button>
                </div>
              </div>
            </div>

            <!-- Item 3: John Deere 5310 4WD -->
            <div onclick="navigateToScreen(10)" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 14px; display: flex; gap: 12px; align-items: center; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
              <img src="assets/img_paddy_transplanter.jpg" style="width: 86px; height: 86px; border-radius: 14px; object-fit: cover; flex-shrink: 0;" alt="John Deere 5310">
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <h4 style="font-size: 15px; font-weight: 800; color: #1A251E; margin: 0; font-family: 'Outfit', sans-serif;">John Deere 5310 4WD</h4>
                  <span style="font-size: 12px; font-weight: 700; color: #F39C12;">⭐ 4.9 (18)</span>
                </div>
                <div style="font-size: 12px; color: #5A6B5E; margin-top: 2px;">Owner: greeshma • Mevalurkuppam</div>
                <div style="font-size: 11px; color: #2E7D32; font-weight: 600; margin-top: 2px;">📍 0.7 km away • Available Today</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                  <span style="font-size: 14.5px; font-weight: 800; color: #164E24;">₹1400 / acre</span>
                  <button onclick="event.stopPropagation(); navigateToScreen(10);" style="background-color: #164E24; color: #FFFFFF; border: none; border-radius: 10px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer;">Book Now</button>
                </div>
              </div>
            </div>

            <!-- Item 4: Garuda Kisan Drone 16L -->
            <div onclick="navigateToScreen(10)" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 14px; display: flex; gap: 12px; align-items: center; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
              <img src="assets/img_kisan_drone.jpg" style="width: 86px; height: 86px; border-radius: 14px; object-fit: cover; flex-shrink: 0;" alt="Garuda Kisan Drone">
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <h4 style="font-size: 15px; font-weight: 800; color: #1A251E; margin: 0; font-family: 'Outfit', sans-serif;">Garuda Kisan Drone 16L</h4>
                  <span style="font-size: 12px; font-weight: 700; color: #F39C12;">⭐ 5.0 (22)</span>
                </div>
                <div style="font-size: 12px; color: #5A6B5E; margin-top: 2px;">Owner: greeshma • Mevalurkuppam</div>
                <div style="font-size: 11px; color: #2E7D32; font-weight: 600; margin-top: 2px;">📍 0.7 km away • Available Today</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                  <span style="font-size: 14.5px; font-weight: 800; color: #164E24;">₹650 / acre</span>
                  <button onclick="event.stopPropagation(); navigateToScreen(10);" style="background-color: #164E24; color: #FFFFFF; border: none; border-radius: 10px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer;">Book Now</button>
                </div>
              </div>
            </div>

          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 10: EQUIPMENT DETAILS (Matches Screenshot 10 exactly)
    // =========================================================================
    case 10:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top App Bar (Exact Match) -->
            <div style="background-color: #164E24; padding: 14px 18px; display: flex; align-items: center; color: #FFFFFF;">
              <button onclick="navigateToScreen(9)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 12px;">
                <i class="ri-arrow-left-line"></i>
              </button>
              <h3 style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin: 0 auto 0 0; font-family: 'Outfit', sans-serif;">Equipment Details</h3>
            </div>

            <!-- Hero Image with Available Today badge -->
            <div style="position: relative; width: 100%; height: 230px;">
              <img src="assets/img_mahindra_tractor.jpg" style="width: 100%; height: 100%; object-fit: cover; display: block;" alt="Mahindra Tractor">
              <span style="position: absolute; bottom: 14px; right: 14px; background: #FFFFFF; color: #164E24; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                Available Today
              </span>
            </div>

            <div style="padding: 18px 20px;">
              <!-- Title & Price -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <h2 style="font-size: 20px; font-weight: 800; color: #1A251E; margin: 0 0 4px 0; font-family: 'Outfit', sans-serif;">Mahindra 575 DI Tractor</h2>
                  <div style="font-size: 12.5px; color: #5A6B5E;">📍 Kanchikacherla, Vijayawada Rural (3.5 km away)</div>
                </div>
                <div style="text-align: right; flex-shrink: 0;">
                  <div style="font-size: 22px; font-weight: 800; color: #164E24; font-family: 'Outfit', sans-serif;">₹1,200</div>
                  <div style="font-size: 12px; color: #5A6B5E;">per acre</div>
                </div>
              </div>

              <!-- Owner Info Card -->
              <div style="margin-top: 18px; background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 14px 16px; display: flex; align-items: center; gap: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="width: 48px; height: 48px; background: #EBF5ED; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #164E24; font-size: 16px; font-weight: 800; flex-shrink: 0;">
                  RP
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 15px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">Ramesh Patel</div>
                  <div style="font-size: 12px; color: #5A6B5E; margin-top: 2px;">Verified Owner • 120+ Completed Bookings</div>
                </div>
                <div style="font-size: 13px; font-weight: 700; color: #F39C12; white-space: nowrap;">
                  ⭐ 4.8 (42)
                </div>
              </div>

              <!-- Specifications Heading & Description -->
              <div style="margin-top: 22px; font-size: 16px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif; margin-bottom: 8px;">
                Specifications
              </div>
              <p style="font-size: 13.5px; color: #5A6B5E; line-height: 1.55; margin: 0;">
                Heavy duty 50HP Mahindra tractor equipped with 36-blade rotavator for deep ploughing and wet soil preparation. Driven by experienced worker Ramesh.
              </p>
            </div>
          </div>

          <!-- Bottom Book Button -->
          <div style="padding: 16px 20px 24px 20px; background: #FFFFFF; border-top: 1px solid #E5EBE6;">
            <button onclick="navigateToScreen(11)" style="width: 100%; height: 56px; background-color: #164E24; color: #FFFFFF; border: none; border-radius: 16px; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(22, 78, 36, 0.25);">
              Book Now — Select Farm Activity <span style="font-size: 16px;">➔</span>
            </button>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 11: SELECT ACTIVITY (Matches Screenshot 11 exactly)
    // =========================================================================
    case 11:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top App Bar -->
            <div style="background-color: #164E24; padding: 14px 18px; display: flex; align-items: center; color: #FFFFFF;">
              <button onclick="navigateToScreen(10)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 12px;">
                <i class="ri-arrow-left-line"></i>
              </button>
              <h3 style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin: 0 auto 0 0; font-family: 'Outfit', sans-serif;">Select Activity</h3>
            </div>

            <div style="padding: 20px 18px;">
              <h2 style="font-size: 18px; font-weight: 800; color: #1A251E; margin: 0 0 4px 0; font-family: 'Outfit', sans-serif;">What work do you need equipment for?</h2>
              <p style="font-size: 13px; color: #5A6B5E; margin: 0 0 20px 0;">Choose farming activity for Selected Vehicle:</p>

              <!-- Activity 1: Ploughing (Selected) -->
              <div onclick="selectActivity('Ploughing')" style="background: #FFFFFF; border: 2px solid #164E24; border-radius: 18px; padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; cursor: pointer; box-shadow: 0 2px 8px rgba(22,78,36,0.06);">
                <div style="display: flex; align-items: center; gap: 14px;">
                  <div style="width: 48px; height: 48px; background: #FFFDE7; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                    🔨
                  </div>
                  <div>
                    <div style="font-size: 16px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">Ploughing</div>
                    <div style="font-size: 12.5px; color: #5A6B5E; margin-top: 2px;">Deep soil turning & preparation</div>
                  </div>
                </div>
                <!-- Checkmark badge -->
                <div style="width: 28px; height: 28px; background: #164E24; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 16px; font-weight: bold;">
                  ✓
                </div>
              </div>

              <!-- Activity 2: Sowing -->
              <div onclick="selectActivity('Sowing')" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 14px;">
                  <div style="width: 48px; height: 48px; background: #E8F5E9; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                    🌱
                  </div>
                  <div>
                    <div style="font-size: 16px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">Sowing</div>
                    <div style="font-size: 12.5px; color: #5A6B5E; margin-top: 2px;">Seed planting & row formation</div>
                  </div>
                </div>
                <div style="width: 28px; height: 28px; background: #F0F4F1; border-radius: 50%;"></div>
              </div>

              <!-- Activity 3: Fertilizer Spraying -->
              <div onclick="selectActivity('Fertilizer Spraying')" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 14px;">
                  <div style="width: 48px; height: 48px; background: #E1F5FE; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                    💧
                  </div>
                  <div>
                    <div style="font-size: 16px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">Fertilizer Spraying</div>
                    <div style="font-size: 12.5px; color: #5A6B5E; margin-top: 2px;">Liquid or granule fertilizer application</div>
                  </div>
                </div>
                <div style="width: 28px; height: 28px; background: #F0F4F1; border-radius: 50%;"></div>
              </div>

            </div>
          </div>

          <!-- Fixed Bottom Action Button -->
          <div style="padding: 16px 20px 24px 20px; background: #F8FAF8;">
            <button onclick="navigateToScreen(12)" style="width: 100%; height: 56px; background-color: #164E24; color: #FFFFFF; border: none; border-radius: 16px; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(22, 78, 36, 0.25);">
              Continue to Booking Form <span style="font-size: 16px;">➔</span>
            </button>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 12: BOOKING DETAILS (Matches Screenshot 12 exactly)
    // =========================================================================
    case 12:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top App Bar -->
            <div style="background-color: #164E24; padding: 14px 18px; display: flex; align-items: center; color: #FFFFFF;">
              <button onclick="navigateToScreen(11)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 12px;">
                <i class="ri-arrow-left-line"></i>
              </button>
              <h3 style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin: 0 auto 0 0; font-family: 'Outfit', sans-serif;">Booking Details</h3>
            </div>

            <div style="padding: 18px 20px;">
              <!-- Equipment Summary Card -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 14px; display: flex; align-items: center; gap: 14px; margin-bottom: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <img src="assets/img_mahindra_tractor.jpg" style="width: 74px; height: 74px; border-radius: 14px; object-fit: cover; flex-shrink: 0;" alt="Farm Machinery">
                <div>
                  <h4 style="font-size: 16px; font-weight: 800; color: #1A251E; margin: 0; font-family: 'Outfit', sans-serif;">Farm Machinery</h4>
                  <div style="font-size: 12.5px; color: #5A6B5E; margin-top: 2px;">Owner: Registered Owner</div>
                  <div style="font-size: 12px; color: #2E7D32; font-weight: 700; margin-top: 4px;">Standard Rate • Available</div>
                </div>
              </div>

              <!-- Farm Location / Landmark -->
              <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 13px; font-weight: 700; color: #1A251E; margin-bottom: 6px;">📍 Farm Location / Landmark</label>
                <div style="height: 50px; background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 14px; padding: 0 16px; display: flex; align-items: center; font-size: 14px; color: #1A251E; font-weight: 500;">
                  Mevalurkuppam, Tamil Nadu
                </div>
              </div>

              <!-- Date & Start Time (2 Cols) -->
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 700; color: #1A251E; margin-bottom: 6px;">📅 Date</label>
                  <div style="height: 50px; background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 14px; padding: 0 14px; display: flex; align-items: center; font-size: 13.5px; color: #1A251E; font-weight: 600;">
                    28 August 2026
                  </div>
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 700; color: #1A251E; margin-bottom: 6px;">🕒 Start Time</label>
                  <div style="height: 50px; background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 14px; padding: 0 14px; display: flex; align-items: center; font-size: 13.5px; color: #1A251E; font-weight: 600;">
                    07:00 AM
                  </div>
                </div>
              </div>

              <!-- Number of Acres Stepper -->
              <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 13px; font-weight: 700; color: #1A251E; margin-bottom: 6px;">📐 Number of Acres</label>
                <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 16px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between;">
                  <button onclick="changeAcres(-1)" style="width: 44px; height: 44px; background: #E8EBE8; border: none; border-radius: 12px; font-size: 20px; font-weight: bold; color: #1A251E; cursor: pointer;">-</button>
                  <span style="font-size: 16px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">${state.booking.acres || 4.0} Acres</span>
                  <button onclick="changeAcres(1)" style="width: 44px; height: 44px; background: #164E24; border: none; border-radius: 12px; font-size: 20px; font-weight: bold; color: #FFFFFF; cursor: pointer;">+</button>
                </div>
              </div>

              <!-- Selected Farming Activity -->
              <div style="margin-bottom: 6px;">
                <label style="display: block; font-size: 13px; font-weight: 700; color: #1A251E; margin-bottom: 6px;">✂️ Selected Farming Activity</label>
                <div style="background: #EBF5ED; border: 1.5px solid #C8E6C9; border-radius: 14px; padding: 14px 16px; font-size: 15px; font-weight: 800; color: #164E24; font-family: 'Outfit', sans-serif;">
                  Ploughing
                </div>
              </div>

              <div style="font-size: 12px; color: #5A6B5E; margin-top: 6px;">
                Estimated Machine Cost: ₹0 (₹0/acre × 4.0 acres)
              </div>

            </div>
          </div>

          <!-- Fixed Bottom Action Button -->
          <div style="padding: 16px 20px 24px 20px; background: #F8FAF8;">
            <button onclick="navigateToScreen(13)" style="width: 100%; height: 56px; background-color: #164E24; color: #FFFFFF; border: none; border-radius: 16px; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(22, 78, 36, 0.25);">
              Check Smart Weather Availability <span style="font-size: 16px;">☁️</span>
            </button>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 13: SMART SCHEDULING (Matches Screenshot 13 exactly)
    // =========================================================================
    case 13:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top App Bar with AI Weather Pill -->
            <div style="background-color: #164E24; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; color: #FFFFFF;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <button onclick="navigateToScreen(12)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                  <i class="ri-arrow-left-line"></i>
                </button>
                <h3 style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin: 0; font-family: 'Outfit', sans-serif;">Smart Scheduling</h3>
              </div>
              <div style="background: rgba(255,255,255,0.1); border: 1.5px solid #E67E22; color: #E67E22; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 700;">
                AI Weather
              </div>
            </div>

            <div style="padding: 18px 20px;">
              <!-- Selected Date Card -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div>
                  <div style="font-size: 12px; color: #8B9B8E; font-weight: 500;">Selected Date</div>
                  <div style="font-size: 16px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif; margin-top: 2px;">
                    📅 28 August 2026
                  </div>
                </div>
                <div style="background: #EBF5ED; color: #164E24; border-radius: 14px; padding: 6px 12px; font-size: 12px; font-weight: 700;">
                  Mevalurkuppam, AP
                </div>
              </div>

              <!-- Available Booking Time Slots Heading -->
              <div style="font-size: 14.5px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif; margin-bottom: 12px;">
                Available Booking Time Slots:
              </div>

              <!-- Slot 1: Recommended Time (Selected) -->
              <div onclick="selectTimeSlot('7:00 AM – 10:00 AM')" style="background: #FFFFFF; border: 2px solid #164E24; border-radius: 18px; padding: 16px 18px; margin-bottom: 14px; cursor: pointer; box-shadow: 0 2px 8px rgba(22,78,36,0.06);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <div style="background: #164E24; color: #FFFFFF; border-radius: 12px; padding: 4px 10px; font-size: 11px; font-weight: 800;">
                    👍 RECOMMENDED TIME
                  </div>
                  <div style="font-size: 12px; font-weight: 700; color: #2E7D32;">
                    BEST TIME
                  </div>
                </div>
                <div style="font-size: 18px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif; margin-bottom: 6px;">
                  7:00 AM – 10:00 AM
                </div>
                <div style="font-size: 13px; color: #2E7D32; font-weight: 700;">
                  ✔ Equipment: Available
                </div>
                <div style="font-size: 13px; color: #5A6B5E; margin-top: 2px;">
                  🔆 Weather: Clear / Mild (1% rain)
                </div>
              </div>

              <!-- Slot 2: Rain Risk Slot (Unselected) -->
              <div onclick="selectTimeSlot('10:00 AM – 1:00 PM')" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 18px; cursor: pointer;">
                <div style="margin-bottom: 8px;">
                  <span style="background: #FFF3E0; color: #E67E22; border-radius: 12px; padding: 4px 10px; font-size: 11px; font-weight: 800;">
                    ⚠️ RAIN RISK SLOT
                  </span>
                </div>
                <div style="font-size: 18px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif; margin-bottom: 6px;">
                  10:00 AM – 1:00 PM
                </div>
                <div style="font-size: 13px; color: #2E7D32; font-weight: 700;">
                  ✔ Equipment: Available
                </div>
                <div style="font-size: 13px; color: #E67E22; margin-top: 2px;">
                  🌧 Weather: Clear / Mild (1% rain)
                </div>
              </div>

            </div>
          </div>

          <!-- Fixed Bottom Action Button -->
          <div style="padding: 16px 20px 24px 20px; background: #F8FAF8;">
            <button onclick="navigateToScreen(14)" style="width: 100%; height: 56px; background-color: #164E24; color: #FFFFFF; border: none; border-radius: 16px; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(22, 78, 36, 0.25);">
              Select Recommended Time (7:00 AM) <span style="font-size: 16px;">➔</span>
            </button>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 14: BOOKING SUMMARY (Matches Screenshot 14 exactly)
    // =========================================================================
    case 14:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top App Bar -->
            <div style="background-color: #164E24; padding: 14px 18px; display: flex; align-items: center; color: #FFFFFF;">
              <button onclick="navigateToScreen(13)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 12px;">
                <i class="ri-arrow-left-line"></i>
              </button>
              <h3 style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin: 0 auto 0 0; font-family: 'Outfit', sans-serif;">Booking Summary</h3>
            </div>

            <div style="padding: 18px 20px;">
              <!-- Booking Details Card -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 18px; margin-bottom: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="font-size: 11px; font-weight: 800; color: #8B9B8E; letter-spacing: 0.5px; margin-bottom: 14px;">
                  BOOKING DETAILS
                </div>
                
                <!-- Vehicle Header Row -->
                <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
                  <img src="assets/img_mahindra_tractor.jpg" style="width: 64px; height: 64px; border-radius: 14px; object-fit: cover; flex-shrink: 0;" alt="Mahindra 575">
                  <div>
                    <div style="font-size: 12px; color: #8B9B8E;">Equipment</div>
                    <div style="font-size: 15px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif; margin-top: 2px;">Mahindra 575 DI Tractor</div>
                  </div>
                </div>

                <!-- Info Table -->
                <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13.5px;">
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #5A6B5E;">Vehicle Owner:</span>
                    <span style="font-weight: 700; color: #1A251E;">Ramesh Patel</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #5A6B5E;">Location:</span>
                    <span style="font-weight: 700; color: #1A251E;">Mevalurkuppam, Tamil Nadu</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #5A6B5E;">Activity:</span>
                    <span style="font-weight: 700; color: #164E24;">Ploughing</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #5A6B5E;">Date & Slot:</span>
                    <span style="font-weight: 700; color: #1A251E;">28 Aug • 7:00 AM – 10:00 AM</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #5A6B5E;">Land Size:</span>
                    <span style="font-weight: 700; color: #1A251E;">1 Acres</span>
                  </div>
                </div>
              </div>

              <!-- Fare Breakdown Card -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="font-size: 11px; font-weight: 800; color: #8B9B8E; letter-spacing: 0.5px; margin-bottom: 14px;">
                  FARE BREAKDOWN
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13.5px; margin-bottom: 10px;">
                  <span style="color: #5A6B5E;">Rate (₹1200 × 1 Acres):</span>
                  <span style="font-weight: 800; color: #1A251E;">₹1200</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13.5px;">
                  <span style="color: #5A6B5E;">Service Fee:</span>
                  <span style="font-weight: 800; color: #1A251E;">₹150</span>
                </div>
              </div>

            </div>
          </div>

          <!-- Bottom Actions (Edit / Confirm & Pay) -->
          <div style="padding: 16px 20px 24px 20px; background: #F8FAF8; display: flex; align-items: center; gap: 14px;">
            <button onclick="navigateToScreen(12)" style="background: transparent; border: none; font-size: 15px; font-weight: 800; color: #5A6B5E; cursor: pointer; padding: 0 10px;">
              EDIT
            </button>
            <button onclick="navigateToScreen(15)" style="flex: 1; height: 54px; background-color: #164E24; color: #FFFFFF; border: none; border-radius: 16px; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(22, 78, 36, 0.25);">
              Confirm & Pay <span style="font-size: 16px;">➔</span>
            </button>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 15: PAYMENT OPTIONS (Matches Screenshot 15 exactly)
    // =========================================================================
    case 15:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top App Bar -->
            <div style="background-color: #164E24; padding: 14px 18px; display: flex; align-items: center; color: #FFFFFF;">
              <button onclick="navigateToScreen(14)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 12px;">
                <i class="ri-arrow-left-line"></i>
              </button>
              <h3 style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin: 0 auto 0 0; font-family: 'Outfit', sans-serif;">Payment Options</h3>
            </div>

            <div style="padding: 20px 18px;">
              <!-- Total Amount Due Banner -->
              <div style="background-color: #164E24; border-radius: 18px; padding: 24px 18px; text-align: center; color: #FFFFFF; box-shadow: 0 4px 14px rgba(22,78,36,0.18); margin-bottom: 24px;">
                <div style="font-size: 13px; color: #C8E6C9; font-weight: 600;">Total Amount Due</div>
                <div style="font-size: 38px; font-weight: 800; color: #F39C12; font-family: 'Outfit', sans-serif; margin-top: 4px;">
                  ₹1350
                </div>
              </div>

              <!-- Select Payment Mode Heading -->
              <div style="font-size: 14.5px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif; margin-bottom: 12px;">
                Select Payment Mode:
              </div>

              <!-- Cash Option (Active / Selected) -->
              <div style="background: #FFFFFF; border: 2px solid #164E24; border-radius: 18px; padding: 18px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(22,78,36,0.06); cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 14px;">
                  <div style="width: 48px; height: 48px; background: #EBF5ED; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                    💵
                  </div>
                  <div>
                    <div style="font-size: 15px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">Cash / Pay After Service</div>
                    <div style="font-size: 12px; color: #5A6B5E; margin-top: 2px;">Pay cash directly after farm work</div>
                  </div>
                </div>

                <!-- Green Badge -->
                <div style="width: 26px; height: 26px; background: #164E24; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 14px;">
                  ⚙️
                </div>
              </div>

            </div>
          </div>

          <!-- Fixed Bottom Action Button -->
          <div style="padding: 16px 20px 24px 20px; background: #F8FAF8;">
            <button onclick="handlePaymentSuccess()" style="width: 100%; height: 56px; background-color: #164E24; color: #FFFFFF; border: none; border-radius: 16px; font-size: 15.5px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(22, 78, 36, 0.25);">
              Confirm Booking (CASH PAYMENT) 🛡️
            </button>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 16: BOOKING CONFIRMED! (Matches Screenshot 16 exactly)
    // =========================================================================
    case 16:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#0e3e18';
      }, 0);

      return `
        <div style="background-color: #FFFFFF; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 24px 22px 28px 22px; box-sizing: border-box; text-align: center;">
          
          <div style="padding-top: 20px;">
            <!-- Outer & Inner Check Badge -->
            <div style="width: 110px; height: 110px; background-color: #EBF5ED; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;">
              <div style="width: 74px; height: 74px; background-color: #164E24; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 38px; font-weight: bold;">
                ✓
              </div>
            </div>

            <!-- Title & Booking ID -->
            <h2 style="font-size: 24px; font-weight: 800; color: #1A251E; margin: 0 0 6px 0; font-family: 'Outfit', sans-serif;">Booking Confirmed!</h2>
            <div style="font-size: 14px; font-weight: 800; color: #164E24; margin-bottom: 24px;">Booking ID: #AR20260825001</div>

            <!-- Booking Details Card -->
            <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 18px 20px; text-align: left; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
              <div style="display: flex; justify-content: space-between; font-size: 13.5px; margin-bottom: 12px;">
                <span style="color: #8B9B8E;">Equipment:</span>
                <span style="font-weight: 800; color: #1A251E;">Mahindra 575 DI Tractor</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13.5px; margin-bottom: 12px;">
                <span style="color: #8B9B8E;">Date & Time:</span>
                <span style="font-weight: 700; color: #1A251E;">28 Aug 2026 • 7:00 AM – 10:00 AM</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13.5px; margin-bottom: 16px;">
                <span style="color: #8B9B8E;">Location:</span>
                <span style="font-weight: 700; color: #1A251E;">Mevalurkuppam, Tamil Nadu</span>
              </div>

              <!-- Divider -->
              <div style="border-top: 1px solid #E5EBE6; padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 14.5px; font-weight: 800; color: #1A251E;">Amount Paid:</span>
                <span style="font-size: 18px; font-weight: 800; color: #164E24; font-family: 'Outfit', sans-serif;">₹4950</span>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button onclick="navigateToScreen(17)" style="width: 100%; height: 54px; background-color: #164E24; color: #FFFFFF; border: none; border-radius: 16px; font-size: 15.5px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(22, 78, 36, 0.25);">
              View Booking Status
            </button>
            <button onclick="navigateToScreen(17)" style="width: 100%; height: 54px; background-color: #EBF5ED; color: #164E24; border: 1.5px solid #C8E6C9; border-radius: 16px; font-size: 14.5px; font-weight: 800; cursor: pointer; letter-spacing: 0.5px;">
              VIEW MY BOOKINGS
            </button>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 17: MY BOOKINGS
    // =========================================================================
    case 17:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: #F8FAF8;">
          <div style="background-color: #164E24; padding: 14px 18px; display: flex; align-items: center; color: #FFFFFF;">
            <button onclick="navigateToScreen(7)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 12px;">
              <i class="ri-arrow-left-line"></i>
            </button>
            <h3 style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin: 0 auto 0 0; font-family: 'Outfit', sans-serif;">My Bookings</h3>
          </div>

          <!-- Tabs -->
          <div style="display: flex; background: #fff; border-bottom: 1px solid #e0e0e0;">
            <div style="flex:1; text-align:center; padding: 12px; font-size:12.5px; font-weight:800; color:#164E24; border-bottom: 3px solid #164E24;">Upcoming (1)</div>
            <div style="flex:1; text-align:center; padding: 12px; font-size:12.5px; font-weight:600; color:#5A6B5E;">Active</div>
            <div style="flex:1; text-align:center; padding: 12px; font-size:12.5px; font-weight:600; color:#5A6B5E;">Completed</div>
            <div style="flex:1; text-align:center; padding: 12px; font-size:12.5px; font-weight:600; color:#5A6B5E;">Cancelled</div>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <!-- Booking Card 1 -->
            <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px; margin-bottom: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 11px; font-weight: 700; color: #8B9B8E;">ID: #AR20260825001</span>
                <span style="background: #EBF5ED; color: #164E24; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 12px;">On The Way</span>
              </div>
              <h4 style="font-size: 15px; font-weight: 800; color: #1A251E; margin: 0 0 4px 0; font-family: 'Outfit', sans-serif;">Mahindra 575 DI Tractor</h4>
              <p style="font-size: 12px; color: #5A6B5E; margin: 0 0 4px 0;">Activity: Deep Ploughing (4 Acres)</p>
              <p style="font-size: 12px; color: #5A6B5E; margin: 0 0 10px 0;">📅 28 Aug 2026 • 7:00 AM – 10:00 AM</p>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F0F4F1; padding-top: 10px;">
                <span style="font-size: 15px; font-weight: 800; color: #164E24;">₹4,800</span>
                <button onclick="navigateToScreen(18)" style="background: #164E24; color: #FFFFFF; border: none; border-radius: 10px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer;">
                  Track Vehicle ➔
                </button>
              </div>
            </div>
          </div>

          <!-- 4-Tab Bottom Nav -->
          <div style="background-color: #FFFFFF; border-top: 1px solid #E5EBE6; padding: 8px 16px; display: flex; justify-content: space-around; align-items: center; flex-shrink: 0;">
            <div onclick="navigateToScreen(7)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; color: #5A6B5E;">
              <span style="font-size: 18px;">🏠</span>
              <span style="font-size: 11px; font-weight: 600; margin-top: 2px;">Home</span>
            </div>
            <div onclick="navigateToScreen(17)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; color: #164E24;">
              <span style="font-size: 18px;">📅</span>
              <span style="font-size: 11px; font-weight: 800; margin-top: 2px;">Bookings</span>
            </div>
            <div onclick="navigateToScreen(31)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; color: #5A6B5E;">
              <span style="font-size: 18px;">👥</span>
              <span style="font-size: 11px; font-weight: 600; margin-top: 2px;">Community</span>
            </div>
            <div onclick="navigateToScreen(31)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; color: #5A6B5E;">
              <span style="font-size: 18px;">👤</span>
              <span style="font-size: 11px; font-weight: 600; margin-top: 2px;">Profile</span>
            </div>
          </div>
        </div>
      `;

    // =========================================================================
    // SCREEN 18: SELECT FARM LOCATION 📍 (Matches Screenshot 18 exactly)
    // =========================================================================
    case 18:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      return `
        <div style="height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; background: #F2EFE9; position: relative;">
          
          <!-- Top App Bar -->
          <div style="background-color: #164E24; padding: 14px 18px; display: flex; align-items: center; color: #FFFFFF; z-index: 10;">
            <button onclick="navigateToScreen(7)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 12px;">
              <i class="ri-arrow-left-line"></i>
            </button>
            <h3 style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin: 0; font-family: 'Outfit', sans-serif;">Select Farm Location 📍</h3>
          </div>

          <!-- Map Simulation Canvas -->
          <div style="flex: 1; position: relative; overflow: hidden; background: #F2EFE9;">
            <!-- Subtle Map Roads SVG -->
            <svg width="100%" height="100%" style="position: absolute; inset: 0;">
              <!-- Minor roads -->
              <line x1="0" y1="120" x2="400" y2="180" stroke="#FFFFFF" stroke-width="8" />
              <line x1="120" y1="0" x2="160" y2="700" stroke="#FFFFFF" stroke-width="10" />
              <line x1="0" y1="420" x2="400" y2="360" stroke="#FFFFFF" stroke-width="7" />
              <line x1="280" y1="0" x2="260" y2="700" stroke="#FFFFFF" stroke-width="8" />
              <!-- Water body/canal -->
              <path d="M 40,0 Q 80,300 220,700" stroke="#E3F2FD" stroke-width="16" fill="none" />
              <!-- Primary highway -->
              <line x1="0" y1="280" x2="400" y2="290" stroke="#FFEAA7" stroke-width="12" />
              <!-- Green farm parcels -->
              <rect x="180" y="80" width="80" height="90" fill="#E8F5E9" opacity="0.6" rx="8" />
              <rect x="30" y="320" width="110" height="80" fill="#E8F5E9" opacity="0.6" rx="8" />
              <rect x="200" y="380" width="120" height="110" fill="#E8F5E9" opacity="0.7" rx="8" />
            </svg>

            <!-- Center Pin -->
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); text-align: center; pointer-events: none;">
              <div style="font-size: 38px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); animation: bounce 1.5s infinite;">📍</div>
              <div style="background: #164E24; color: #FFFFFF; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; white-space: nowrap; margin-top: -6px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                Mevalurkuppam Farm
              </div>
            </div>

            <!-- Bottom Left: Google Watermark -->
            <div style="position: absolute; bottom: 12px; left: 14px; font-size: 14px; font-weight: 800; color: #757575; font-family: sans-serif; letter-spacing: -0.5px; opacity: 0.85;">
              <span style="color: #4285F4;">G</span><span style="color: #EA4335;">o</span><span style="color: #FBBC05;">o</span><span style="color: #4285F4;">g</span><span style="color: #34A853;">l</span><span style="color: #EA4335;">e</span>
            </div>

            <!-- Bottom Right: Map Zoom Controls -->
            <div style="position: absolute; bottom: 12px; right: 14px; display: flex; flex-direction: column; background: #FFFFFF; border: 1px solid #D0D7D1; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
              <div onclick="showToast('Zoomed in')" style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; color: #555; cursor: pointer; border-bottom: 1px solid #E5EBE6;">+</div>
              <div onclick="showToast('Zoomed out')" style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; color: #555; cursor: pointer;">−</div>
            </div>
          </div>

          <!-- Fixed Bottom Confirm Button -->
          <div style="padding: 14px 18px 20px 18px; background: #FFFFFF; border-top: 1px solid #E5EBE6; z-index: 10;">
            <button onclick="showToast('📍 Farm location selected: Mevalurkuppam!'); navigateToScreen(12);" style="width: 100%; height: 54px; background-color: #164E24; color: #FFFFFF; border: none; border-radius: 16px; font-size: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(22, 78, 36, 0.25);">
              Confirm Farm Location 📍
            </button>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 19: AGRI WEATHER RADAR (Matches Screenshot 17 exactly)
    // =========================================================================
    case 19:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top App Bar -->
            <div style="background-color: #164E24; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; color: #FFFFFF;">
              <button onclick="navigateToScreen(7)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                <i class="ri-arrow-left-line"></i>
              </button>
              <h3 style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin: 0; font-family: 'Outfit', sans-serif;">Agri Weather Radar</h3>
              <button onclick="navigateToScreen(20)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                🔔
              </button>
            </div>

            <div style="padding: 18px 20px;">
              <!-- Main Weather Radar Card (Exact Match) -->
              <div style="background-color: #1F6330; border-radius: 22px; padding: 22px 18px; color: #FFFFFF; text-align: center; box-shadow: 0 4px 14px rgba(22,78,36,0.18); margin-bottom: 22px;">
                <div style="font-size: 13px; color: #C8E6C9; font-weight: 600;">Mevalurkuppam, Tamil Nadu</div>
                <div style="font-size: 52px; font-weight: 800; font-family: 'Outfit', sans-serif; margin: 4px 0;">
                  34°C
                </div>
                <div style="font-size: 13.5px; color: #FFE082; font-weight: 700; margin-bottom: 18px;">
                  Partly Cloudy ⛅ • 8% Chance of Rain
                </div>

                <!-- 4 Metrics Row -->
                <div style="background: rgba(255,255,255,0.12); border-radius: 16px; padding: 12px 6px; display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; font-size: 11.5px;">
                  <div>
                    <div style="color: #C8E6C9;">Humidity</div>
                    <div style="font-weight: 800; font-size: 13.5px; margin-top: 3px;">81%</div>
                  </div>
                  <div>
                    <div style="color: #C8E6C9;">Wind</div>
                    <div style="font-weight: 800; font-size: 13.5px; margin-top: 3px;">7 km/h</div>
                  </div>
                  <div>
                    <div style="color: #C8E6C9;">Sunrise</div>
                    <div style="font-weight: 800; font-size: 13.5px; margin-top: 3px;">06:05 AM</div>
                  </div>
                  <div>
                    <div style="color: #C8E6C9;">Sunset</div>
                    <div style="font-weight: 800; font-size: 13.5px; margin-top: 3px;">06:38 PM</div>
                  </div>
                </div>
              </div>

              <!-- Farming Activity Suitability Today Heading -->
              <div style="font-size: 15px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif; margin-bottom: 12px;">
                Farming Activity Suitability Today
              </div>

              <!-- Suitability Card 1: Ploughing -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 18px;">🌾</span>
                  <span style="font-size: 15px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">Ploughing</span>
                </div>
                <span style="background: #EBF5ED; color: #164E24; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 16px;">
                  Highly Suitable
                </span>
              </div>

              <!-- Suitability Card 2: Chemical Spraying -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 18px;">💧</span>
                  <span style="font-size: 15px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">Chemical Spraying</span>
                </div>
                <span style="background: #FFF3E0; color: #E67E22; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 16px;">
                  Not Recommended (Wind 14 km/h)
                </span>
              </div>

            </div>
          </div>

          <!-- 4-Tab Bottom Nav -->
          <div style="background-color: #FFFFFF; border-top: 1px solid #E5EBE6; padding: 8px 16px; display: flex; justify-content: space-around; align-items: center; flex-shrink: 0;">
            <div onclick="navigateToScreen(7)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; color: #164E24;">
              <span style="font-size: 18px;">🏠</span>
              <span style="font-size: 11px; font-weight: 800; margin-top: 2px;">Home</span>
            </div>
            <div onclick="navigateToScreen(17)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; color: #5A6B5E;">
              <span style="font-size: 18px;">📅</span>
              <span style="font-size: 11px; font-weight: 600; margin-top: 2px;">Bookings</span>
            </div>
            <div onclick="navigateToScreen(31)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; color: #5A6B5E;">
              <span style="font-size: 18px;">👥</span>
              <span style="font-size: 11px; font-weight: 600; margin-top: 2px;">Community</span>
            </div>
            <div onclick="navigateToScreen(31)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; color: #5A6B5E;">
              <span style="font-size: 18px;">👤</span>
              <span style="font-size: 11px; font-weight: 600; margin-top: 2px;">Profile</span>
            </div>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 20: WEATHER & DISASTER ALERTS (Matches Screenshot 19 exactly)
    // =========================================================================
    case 20:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#C62828';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top App Bar (Red Header) -->
            <div style="background-color: #C62828; padding: 14px 18px; display: flex; align-items: center; color: #FFFFFF;">
              <button onclick="navigateToScreen(19)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.2); border: none; border-radius: 50%; color: #FFFFFF; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 12px;">
                <i class="ri-arrow-left-line"></i>
              </button>
              <h3 style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin: 0 auto 0 0; font-family: 'Outfit', sans-serif;">Weather & Disaster Alerts</h3>
            </div>

            <div style="padding: 18px 20px;">
              <!-- Alert Card 1: Severe Weather Warning -->
              <div style="background: #FFFFFF; border: 1.5px solid #FFCDD2; border-left: 5px solid #C62828; border-radius: 18px; padding: 18px; margin-bottom: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="background: #FFEBEE; color: #C62828; font-size: 10.5px; font-weight: 800; padding: 4px 10px; border-radius: 12px;">
                    🏛 SEVERE WEATHER WARNING
                  </span>
                  <span style="font-size: 11.5px; color: #8B9B8E;">Issued Today</span>
                </div>
                <h4 style="font-size: 15.5px; font-weight: 800; color: #C62828; margin: 0 0 6px 0; font-family: 'Outfit', sans-serif;">
                  Heavy Rainfall Expected Tomorrow
                </h4>
                <div style="font-size: 12.5px; color: #5A6B5E; line-height: 1.4;">
                  Location: Krishna & Guntur Mandals<br>
                  Expected Rainfall: 65mm - 85mm
                </div>

                <!-- Action Box -->
                <div style="background: #FFEBEE; border-radius: 14px; padding: 12px 14px; font-size: 12px; font-weight: 700; color: #C62828; margin-top: 12px; line-height: 1.45;">
                  Recommended Action: Complete grain harvesting and cover harvested crops with tarpaulin sheets before 6:00 PM today.
                </div>
              </div>

              <!-- Alert Card 2: Strong Wind Alert -->
              <div style="background: #FFFFFF; border: 1.5px solid #FFF9C4; border-left: 5px solid #F57F17; border-radius: 18px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="background: #FFFDE7; color: #F57F17; font-size: 10.5px; font-weight: 800; padding: 4px 10px; border-radius: 12px;">
                    ⚡ STRONG WIND ALERT
                  </span>
                  <span style="font-size: 11.5px; color: #8B9B8E;">Valid Aug 29</span>
                </div>
                <h4 style="font-size: 15.5px; font-weight: 800; color: #1A251E; margin: 0 0 6px 0; font-family: 'Outfit', sans-serif;">
                  High Wind Gusts (28 km/h)
                </h4>
                <div style="font-size: 12.5px; color: #5A6B5E; line-height: 1.45;">
                  Postpone agricultural drone spraying and pesticide application to prevent chemical drift.
                </div>
              </div>

            </div>
          </div>

          <!-- 4-Tab Bottom Nav -->
          <div style="background-color: #FFFFFF; border-top: 1px solid #E5EBE6; padding: 8px 16px; display: flex; justify-content: space-around; align-items: center; flex-shrink: 0;">
            <div onclick="navigateToScreen(7)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; color: #164E24;">
              <span style="font-size: 18px;">🏠</span>
              <span style="font-size: 11px; font-weight: 800; margin-top: 2px;">Home</span>
            </div>
            <div onclick="navigateToScreen(17)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; color: #5A6B5E;">
              <span style="font-size: 18px;">📅</span>
              <span style="font-size: 11px; font-weight: 600; margin-top: 2px;">Bookings</span>
            </div>
            <div onclick="navigateToScreen(31)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; color: #5A6B5E;">
              <span style="font-size: 18px;">👥</span>
              <span style="font-size: 11px; font-weight: 600; margin-top: 2px;">Community</span>
            </div>
            <div onclick="navigateToScreen(31)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; color: #5A6B5E;">
              <span style="font-size: 18px;">👤</span>
              <span style="font-size: 11px; font-weight: 600; margin-top: 2px;">Profile</span>
            </div>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 21: SOIL & CROP ADVISOR (Matches Screenshot 20 exactly)
    // =========================================================================
    case 21:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top App Bar -->
            <div style="background-color: #164E24; padding: 14px 18px; display: flex; align-items: center; color: #FFFFFF;">
              <button onclick="navigateToScreen(7)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 12px;">
                <i class="ri-arrow-left-line"></i>
              </button>
              <h3 style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin: 0 auto 0 0; font-family: 'Outfit', sans-serif;">Soil & Crop Advisor</h3>
            </div>

            <div style="padding: 16px 18px;">
              <!-- Location Card -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div>
                  <div style="font-size: 11px; color: #8B9B8E; font-weight: 500;">Live Farm Location</div>
                  <div style="font-size: 13.5px; font-weight: 800; color: #1A251E; margin-top: 2px;">
                    📍 Mevalurkuppam, Andhra Pradesh (GPS active)
                  </div>
                </div>
                <button onclick="showToast('📍 GPS Location Synced!')" style="background: transparent; border: 1px solid #CFD8DC; border-radius: 8px; padding: 5px 10px; font-size: 11.5px; font-weight: 700; color: #5A6B5E; cursor: pointer;">
                  🔄 GPS
                </button>
              </div>

              <!-- Farm Soil & Season Parameters Card -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 18px; margin-bottom: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="font-size: 15px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif; margin-bottom: 12px;">
                  Farm Soil & Season Parameters
                </div>

                <!-- Soil Type Dropdown -->
                <div style="margin-bottom: 14px;">
                  <label style="display: block; font-size: 12.5px; color: #5A6B5E; margin-bottom: 6px;">Soil Type</label>
                  <div style="height: 48px; background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 14px; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; font-size: 14px; font-weight: 700; color: #1A251E; cursor: pointer;">
                    <span>Black Cotton Soil</span>
                    <span style="font-size: 12px; color: #8B9B8E;">▼</span>
                  </div>
                </div>

                <!-- Current Crop Season -->
                <div style="background: #EBF5ED; border: 1.5px solid #C8E6C9; border-radius: 14px; padding: 14px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 12px; font-weight: 800; color: #2E7D32;">Current Crop Season</span>
                    <span style="background: #164E24; color: #FFFFFF; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 10px;">⚡ Auto-Chosen</span>
                  </div>
                  <div style="font-size: 15px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">
                    Kharif Season (Monsoon)
                  </div>
                  <div style="font-size: 11.5px; color: #5A6B5E; margin-top: 2px;">
                    Monsoon Crop Cycle • June to October • Ideal for Paddy, Cotton, Chilli
                  </div>
                </div>

                <!-- Advisory Button -->
                <button onclick="showToast('🌾 AI Advisory Generated for Black Cotton Soil!')" style="width: 100%; height: 50px; background-color: #164E24; color: #FFFFFF; border: none; border-radius: 14px; font-size: 14.5px; font-weight: 700; cursor: pointer; margin-top: 16px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  Get AI Crop & Soil Advisory 🌾
                </button>
              </div>

              <!-- Best Recommended Crop Card -->
              <div style="background: #FFFFFF; border: 2px solid #164E24; border-radius: 18px; padding: 18px; box-shadow: 0 2px 8px rgba(22,78,36,0.06);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 11px; font-weight: 800; color: #2E7D32;">⭐ BEST RECOMMENDED CROP</span>
                  <span style="background: #164E24; color: #FFFFFF; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 12px;">96% Match</span>
                </div>
                <h3 style="font-size: 17px; font-weight: 800; color: #1A251E; margin: 0 0 4px 0; font-family: 'Outfit', sans-serif;">
                  Paddy (BPT 5204 / Sona Masuri)
                </h3>
                <p style="font-size: 12.5px; color: #5A6B5E; margin: 0 0 12px 0; line-height: 1.4;">
                  High water retention in fertile Black Cotton with optimal monsoon rainfall.
                </p>

                <!-- 2 Stats Columns -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 12px;">
                  <div style="background: #F8FAF8; border: 1px solid #E5EBE6; border-radius: 12px; padding: 10px 12px;">
                    <div style="font-size: 11px; color: #8B9B8E;">🌾 Expected Yield</div>
                    <div style="font-size: 12.5px; font-weight: 800; color: #1A251E; margin-top: 2px;">30 - 35 Bags / Acre (75kg bags)</div>
                  </div>
                  <div style="background: #F8FAF8; border: 1px solid #E5EBE6; border-radius: 12px; padding: 10px 12px;">
                    <div style="font-size: 11px; color: #8B9B8E;">💰 Est. Net Profit</div>
                    <div style="font-size: 12.5px; font-weight: 800; color: #2E7D32; margin-top: 2px;">₹45,000 - ₹58,000 / Acre</div>
                  </div>
                </div>

                <div style="font-size: 11.5px; color: #5A6B5E; margin-bottom: 12px; line-height: 1.4;">
                  📅 Duration: 135 - 145 Days • 💧 Water: High (Canal / Flooded Irrigation • 1200mm - 1400mm)
                </div>

                <!-- Fertilizer Schedule -->
                <div style="font-size: 13.5px; font-weight: 800; color: #1A251E; margin-bottom: 4px;">
                  Fertilizer & Nutrients Schedule
                </div>
                <p style="font-size: 12px; color: #5A6B5E; margin: 0 0 10px 0; line-height: 1.45;">
                  Basal: DAP 50kg + MOP 25kg / Acre. Tillering (30 days): Neem Coated Urea 35kg + Zinc 10kg. Panicle: Urea 25kg + Potash 15kg.
                </p>

                <!-- Pest Advisory -->
                <div style="font-size: 13.5px; font-weight: 800; color: #1A251E; margin-bottom: 4px;">
                  Pest & Disease Advisory
                </div>
                <p style="font-size: 12px; color: #5A6B5E; margin: 0; line-height: 1.45;">
                  Monitor for Stem Borer & Blast disease. Spray Cartap Hydrochloride 50 SP (2g/L) if required.
                </p>
              </div>

            </div>
          </div>

          <!-- 4-Tab Bottom Nav -->
          <div style="background-color: #FFFFFF; border-top: 1px solid #E5EBE6; padding: 8px 16px; display: flex; justify-content: space-around; align-items: center; flex-shrink: 0;">
            <div onclick="navigateToScreen(7)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; color: #164E24;">
              <span style="font-size: 18px;">🏠</span>
              <span style="font-size: 11px; font-weight: 800; margin-top: 2px;">Home</span>
            </div>
            <div onclick="navigateToScreen(17)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; color: #5A6B5E;">
              <span style="font-size: 18px;">📅</span>
              <span style="font-size: 11px; font-weight: 600; margin-top: 2px;">Bookings</span>
            </div>
            <div onclick="navigateToScreen(31)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; color: #5A6B5E;">
              <span style="font-size: 18px;">👥</span>
              <span style="font-size: 11px; font-weight: 600; margin-top: 2px;">Community</span>
            </div>
            <div onclick="navigateToScreen(31)" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; color: #5A6B5E;">
              <span style="font-size: 18px;">👤</span>
              <span style="font-size: 11px; font-weight: 600; margin-top: 2px;">Profile</span>
            </div>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 22: MEVALURKUPPAM FARMERS CIRCLE (Matches Screenshot 1 exactly)
    // =========================================================================
    case 22:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      return `
        <div style="background-color: #EFEAE2; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
          
          <!-- Top App Bar (WhatsApp Group Style) -->
          <div style="background-color: #164E24; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; color: #FFFFFF; flex-shrink: 0;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <button onclick="navigateToScreen(7)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                <i class="ri-arrow-left-line"></i>
              </button>
              
              <!-- Group Avatar -->
              <div style="width: 42px; height: 42px; background: #235F30; border: 1.5px solid #FFFFFF; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                🌾
              </div>

              <!-- Group Title & Member count -->
              <div>
                <div style="font-size: 15.5px; font-weight: 800; color: #FFFFFF; font-family: 'Outfit', sans-serif;">
                  🌾 Mevalurkuppam Farmers Circle
                </div>
                <div style="font-size: 11px; color: #C8E6C9; margin-top: 1px;">
                  👥 5 members • Tap for details
                </div>
              </div>
            </div>

            <!-- + Add Button -->
            <button onclick="showToast('Add Member modal opened')" style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.4); border-radius: 16px; padding: 6px 14px; color: #FFFFFF; font-size: 12px; font-weight: 700; cursor: pointer;">
              + Add
            </button>
          </div>

          <!-- Chat Canvas Messages -->
          <div style="flex: 1; overflow-y: auto; padding: 16px 14px; display: flex; flex-direction: column; gap: 12px; justify-content: flex-end;">
            
            <!-- Message 1 -->
            <div style="background: #FFFFFF; border-radius: 16px; border-top-left-radius: 4px; padding: 10px 14px; max-width: 85%; align-self: flex-start; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
              <div style="font-size: 12px; font-weight: 800; color: #164E24; margin-bottom: 2px;">
                Kalyan Ram (+91 94401 55667)
              </div>
              <div style="font-size: 13px; color: #1A251E; line-height: 1.4;">
                Hello everyone! How is the paddy crop standing after the light drizzle?
              </div>
              <div style="font-size: 10px; color: #8B9B8E; text-align: right; margin-top: 4px;">
                3:21 PM
              </div>
            </div>

            <!-- Message 2 -->
            <div style="background: #FFFFFF; border-radius: 16px; border-top-left-radius: 4px; padding: 10px 14px; max-width: 85%; align-self: flex-start; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
              <div style="font-size: 12px; font-weight: 800; color: #164E24; margin-bottom: 2px;">
                Srinivas Rao (+91 98492 11223)
              </div>
              <div style="font-size: 13px; color: #1A251E; line-height: 1.4;">
                Soil moisture is good! Need drone spraying for pest control by tomorrow morning.
              </div>
              <div style="font-size: 10px; color: #8B9B8E; text-align: right; margin-top: 4px;">
                3:51 PM
              </div>
            </div>

            <!-- Message 3 -->
            <div style="background: #FFFFFF; border-radius: 16px; border-top-left-radius: 4px; padding: 10px 14px; max-width: 85%; align-self: flex-start; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
              <div style="font-size: 12px; font-weight: 800; color: #164E24; margin-bottom: 2px;">
                Kalyan Ram (+91 94401 55667)
              </div>
              <div style="font-size: 13px; color: #1A251E; line-height: 1.4;">
                Tractor & Drone sprayers available for paddy field today!
              </div>
              <div style="font-size: 10px; color: #8B9B8E; text-align: right; margin-top: 4px;">
                4:06 PM
              </div>
            </div>

          </div>

          <!-- Bottom Message Input Bar -->
          <div style="padding: 10px 14px 14px 14px; background: #EFEAE2; display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
            <input type="text" id="chatMsgInput" placeholder="Type a farming message..." style="flex: 1; height: 48px; background: #FFFFFF; border: none; border-radius: 24px; padding: 0 18px; font-size: 13.5px; outline: none; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
            <button onclick="sendChatMessage()" style="width: 48px; height: 48px; background-color: #164E24; border: none; border-radius: 50%; color: #FFFFFF; font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; box-shadow: 0 2px 6px rgba(22,78,36,0.3);">
              ➤
            </button>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 23: AGRICULTURAL STORE (Removed as requested)
    // =========================================================================
    case 23:
      setTimeout(() => navigateToScreen(7), 0);
      return '';

    // =========================================================================
    // SCREEN 24: EQUIPMENT OWNER PORTAL (Matches Screenshot 3 exactly)
    // =========================================================================
    case 24:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top App Bar / Header -->
            <div style="background-color: #164E24; padding: 16px 18px; color: #FFFFFF; display: flex; align-items: center; justify-content: space-between;">
              <div onclick="openEditProfileModal()" style="cursor: pointer;" title="Click to edit owner profile">
                <div style="font-size: 11.5px; color: #C8E6C9; font-weight: 500;">Equipment Owner Portal 👋</div>
                <div style="font-size: 22px; font-weight: 800; color: #FFFFFF; font-family: 'Outfit', sans-serif; margin-top: 2px; display: flex; align-items: center; gap: 6px;">
                  <span>${state.userProfile ? state.userProfile.name : 'abb'}</span>
                  <i class="ri-edit-2-fill" style="font-size: 15px; color: #81C784;"></i>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 10px;">
                <!-- Notification Bell with red dot -->
                <div onclick="navigateToScreen(32)" style="width: 38px; height: 38px; background: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; position: relative; cursor: pointer;">
                  🔔
                  <div style="position: absolute; top: 6px; right: 6px; width: 7px; height: 7px; background-color: #FF5252; border-radius: 50%;"></div>
                </div>

                <!-- Owner Mode Badge -->
                <div style="background-color: #FFA000; color: #FFFFFF; font-size: 11.5px; font-weight: 800; padding: 6px 14px; border-radius: 16px; font-family: 'Outfit', sans-serif;">
                  Owner Mode
                </div>
              </div>
            </div>

            <div style="padding: 18px 18px 24px 18px;">
              
              <!-- 2x2 Stats Grid -->
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 12px;">
                <!-- Card 1: Today's Bookings -->
                <div onclick="navigateToScreen(32)" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); cursor: pointer;">
                  <div style="font-size: 11.5px; color: #8B9B8E; font-weight: 600;">Today's Bookings</div>
                  <div style="font-size: 20px; font-weight: 800; color: #164E24; font-family: 'Outfit', sans-serif; margin-top: 6px;">
                    0 Active
                  </div>
                </div>

                <!-- Card 2: Pending Requests -->
                <div onclick="navigateToScreen(32)" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); cursor: pointer;">
                  <div style="font-size: 11.5px; color: #8B9B8E; font-weight: 600;">Pending Requests</div>
                  <div style="font-size: 20px; font-weight: 800; color: #F57C00; font-family: 'Outfit', sans-serif; margin-top: 6px;">
                    0 New
                  </div>
                </div>

                <!-- Card 3: Total Vehicles -->
                <div onclick="navigateToScreen(27)" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); cursor: pointer;">
                  <div style="font-size: 11.5px; color: #8B9B8E; font-weight: 600;">Total Vehicles</div>
                  <div style="font-size: 20px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif; margin-top: 6px;">
                    6 Machines
                  </div>
                </div>

                <!-- Card 4: Monthly Revenue -->
                <div onclick="navigateToScreen(28)" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); cursor: pointer;">
                  <div style="font-size: 11.5px; color: #8B9B8E; font-weight: 600;">Monthly Revenue</div>
                  <div style="font-size: 20px; font-weight: 800; color: #164E24; font-family: 'Outfit', sans-serif; margin-top: 6px;">
                    ₹0
                  </div>
                </div>
              </div>

              <!-- Completed Works Full Card -->
              <div onclick="navigateToScreen(28)" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); cursor: pointer;">
                <div>
                  <div style="font-size: 11.5px; color: #8B9B8E; font-weight: 600;">Completed Works</div>
                  <div style="font-size: 18px; font-weight: 800; color: #164E24; font-family: 'Outfit', sans-serif; margin-top: 4px;">
                    1 Completed
                  </div>
                </div>
                <div style="width: 28px; height: 28px; background: #EBF5ED; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #164E24;">
                  ✅
                </div>
              </div>

              <!-- Quick Management Section -->
              <div style="font-size: 15px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif; margin-bottom: 12px;">
                Quick Management
              </div>

              <div style="display: flex; flex-direction: column; gap: 12px;">
                <!-- 1. Register New Equipment -->
                <button onclick="navigateToScreen(25)" style="width: 100%; height: 52px; background-color: #164E24; color: #FFFFFF; border: none; border-radius: 16px; padding: 0 18px; font-size: 14.5px; font-weight: 700; display: flex; align-items: center; justify-content: space-between; cursor: pointer; box-shadow: 0 4px 12px rgba(22,78,36,0.2);">
                  <span>⊕ Register New Equipment</span>
                  <span style="font-size: 16px;">➔</span>
                </button>

                <!-- 2. Manage My Equipment Fleet -->
                <button onclick="navigateToScreen(27)" style="width: 100%; height: 52px; background-color: #F4FAF5; color: #164E24; border: 1.5px solid #C8E6C9; border-radius: 16px; padding: 0 18px; font-size: 14.5px; font-weight: 700; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                  <span>🚜 Manage My Equipment Fleet</span>
                  <span style="font-size: 16px;">➔</span>
                </button>

                <!-- 3. Incoming Booking Requests -->
                <div onclick="navigateToScreen(32)" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 16px; padding: 0 18px; height: 52px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                  <span style="font-size: 14px; font-weight: 700; color: #1A251E;">📥 Incoming Booking Requests</span>
                  <span style="background: #FFF3E0; color: #E65100; font-size: 11.5px; font-weight: 800; padding: 4px 10px; border-radius: 12px;">
                    View All
                  </span>
                </div>

                <!-- 4. Manage Fleet Drivers & Operators -->
                <div onclick="navigateToScreen(29)" style="background: #EBF3FC; border: 1.5px solid #BBDEFB; border-radius: 16px; padding: 0 18px; height: 52px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                  <span style="font-size: 14px; font-weight: 700; color: #1565C0;">👷 Manage Fleet Drivers & Operators</span>
                  <span style="background: #D0E6FA; color: #1565C0; font-size: 11.5px; font-weight: 800; padding: 4px 10px; border-radius: 12px;">
                    5 Active
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 25: ADD EQUIPMENT (Matches Screenshot 4 exactly)
    // =========================================================================
    case 25:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top App Bar -->
            <div style="background-color: #164E24; padding: 14px 18px; display: flex; align-items: center; color: #FFFFFF;">
              <button onclick="navigateToScreen(24)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 12px;">
                <i class="ri-arrow-left-line"></i>
              </button>
              <h3 style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin: 0 auto 0 0; font-family: 'Outfit', sans-serif;">Add Equipment</h3>
            </div>

            <div style="padding: 18px 20px;">
              <!-- Vehicle Photo Upload Box -->
              <div style="margin-bottom: 16px;">
                <div style="font-size: 13px; font-weight: 700; color: #1A251E; margin-bottom: 8px;">Vehicle Photo (వాహనం ఫోటో)</div>
                <div onclick="showToast('Select image picker opened')" style="height: 160px; background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                  <div style="font-size: 38px; color: #8B9B8E; margin-bottom: 6px;">📷</div>
                  <div style="font-size: 12px; color: #8B9B8E; font-weight: 600;">
                    Tap to select vehicle photo / ఫోటో ఎంచుకోండి
                  </div>
                </div>
              </div>

              <!-- Equipment / Machine Name -->
              <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 13px; font-weight: 700; color: #1A251E; margin-bottom: 6px;">Equipment / Machine Name</label>
                <input type="text" placeholder="e.g. Mahindra 575 DI Tractor" style="width: 100%; height: 48px; background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 14px; padding: 0 16px; font-size: 13.5px; box-sizing: border-box; outline: none;">
              </div>

              <!-- Category Dropdown -->
              <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 13px; font-weight: 700; color: #1A251E; margin-bottom: 6px;">Category</label>
                <div style="height: 48px; background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 14px; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; font-size: 14px; font-weight: 600; color: #8B9B8E; cursor: pointer;">
                  <span>Tractor</span>
                  <span style="font-size: 12px;">▼</span>
                </div>
              </div>

              <!-- Vehicle Number & Price Row -->
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 700; color: #1A251E; margin-bottom: 6px;">Vehicle Number</label>
                  <input type="text" placeholder="e.g. AP16 BK 4920" style="width: 100%; height: 48px; background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 14px; padding: 0 14px; font-size: 13.5px; box-sizing: border-box; outline: none;">
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 700; color: #1A251E; margin-bottom: 6px;">Price per Acre (₹)</label>
                  <input type="text" placeholder="1200" style="width: 100%; height: 48px; background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 14px; padding: 0 14px; font-size: 13.5px; box-sizing: border-box; outline: none;">
                </div>
              </div>

              <!-- Equipment Description & HP -->
              <div style="margin-bottom: 24px;">
                <label style="display: block; font-size: 13px; font-weight: 700; color: #1A251E; margin-bottom: 6px;">Equipment Description & HP</label>
                <textarea placeholder="50 HP tractor with rotavator attachment" style="width: 100%; height: 74px; background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 14px; padding: 12px 16px; font-size: 13px; box-sizing: border-box; outline: none; resize: none; font-family: inherit;"></textarea>
              </div>

            </div>
          </div>

          <!-- Bottom Action Button -->
          <div style="padding: 16px 20px 24px 20px; background: #F8FAF8;">
            <button onclick="navigateToScreen(26)" style="width: 100%; height: 54px; background-color: #164E24; color: #FFFFFF; border: none; border-radius: 16px; font-size: 15.5px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(22, 78, 36, 0.25);">
              Register Equipment & Go Live
            </button>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 26: DOCUMENT VERIFICATION (Matches Screenshot 5 exactly)
    // =========================================================================
    case 26:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top App Bar -->
            <div style="background-color: #164E24; padding: 14px 18px; display: flex; align-items: center; color: #FFFFFF;">
              <button onclick="navigateToScreen(25)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 12px;">
                <i class="ri-arrow-left-line"></i>
              </button>
              <h3 style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin: 0 auto 0 0; font-family: 'Outfit', sans-serif;">Document Verification</h3>
            </div>

            <div style="padding: 18px 20px;">
              <!-- KYC Compliance Banner -->
              <div style="background: #F4FAF5; border: 1.5px solid #C8E6C9; border-radius: 16px; padding: 14px 16px; margin-bottom: 18px;">
                <div style="font-size: 13px; font-weight: 800; color: #164E24; display: flex; align-items: center; gap: 6px;">
                  <span>🛡️</span> KYC Compliance
                </div>
                <div style="font-size: 12px; color: #5A6B5E; margin-top: 4px; line-height: 1.4;">
                  Submit valid documents to list your equipment on the AgriRide farmer portal.
                </div>
              </div>

              <!-- Document 1: RC -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div>
                  <div style="font-size: 14.5px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">
                    Registration Certificate (RC)
                  </div>
                  <div style="font-size: 12px; font-weight: 700; color: #164E24; margin-top: 4px;">
                    ✔ Verified
                  </div>
                </div>
                <button onclick="showToast('Viewing RC Document')" style="background: transparent; border: 1px solid #D0D7D1; border-radius: 10px; padding: 6px 18px; font-size: 12px; font-weight: 700; color: #1A251E; cursor: pointer;">
                  VIEW
                </button>
              </div>

              <!-- Document 2: Insurance -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div>
                  <div style="font-size: 14.5px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">
                    Vehicle Insurance Certificate
                  </div>
                  <div style="font-size: 12px; font-weight: 700; color: #164E24; margin-top: 4px;">
                    ✔ Verified
                  </div>
                </div>
                <button onclick="showToast('Viewing Insurance Certificate')" style="background: transparent; border: 1px solid #D0D7D1; border-radius: 10px; padding: 6px 18px; font-size: 12px; font-weight: 700; color: #1A251E; cursor: pointer;">
                  VIEW
                </button>
              </div>

              <!-- Document 3: Commercial Permit -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div>
                  <div style="font-size: 14.5px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">
                    Commercial Permit
                  </div>
                  <div style="font-size: 12px; font-weight: 700; color: #164E24; margin-top: 4px;">
                    ✔ Verified
                  </div>
                </div>
                <button onclick="showToast('Viewing Commercial Permit')" style="background: transparent; border: 1px solid #D0D7D1; border-radius: 10px; padding: 6px 18px; font-size: 12px; font-weight: 700; color: #1A251E; cursor: pointer;">
                  VIEW
                </button>
              </div>

            </div>
          </div>

          <!-- Bottom Fixed Action Button -->
          <div style="padding: 16px 20px 24px 20px; background: #F8FAF8;">
            <button onclick="showToast('✅ Documents submitted! Directing to incoming requests...'); navigateToScreen(27);" style="width: 100%; height: 54px; background-color: #164E24; color: #FFFFFF; border: none; border-radius: 16px; font-size: 15.5px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(22, 78, 36, 0.25);">
              Submit Verification & View Requests
            </button>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 27: MY EQUIPMENT 🚜 (Matches Screenshot 5 exactly)
    // =========================================================================
    case 27:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top App Bar -->
            <div style="background-color: #FFFFFF; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E5EBE6;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <button onclick="navigateToScreen(24)" style="width: 36px; height: 36px; background: #F0F4F1; border: none; border-radius: 50%; color: #164E24; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                  <i class="ri-arrow-left-line"></i>
                </button>
                <h3 style="font-size: 19px; font-weight: 800; color: #1A251E; margin: 0; font-family: 'Outfit', sans-serif;">My Equipment 🚜</h3>
              </div>
              <button onclick="navigateToScreen(25)" style="background-color: #164E24; color: #FFFFFF; border: none; border-radius: 16px; padding: 8px 16px; font-size: 12.5px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(22,78,36,0.2);">
                + Add Equipment
              </button>
            </div>

            <div style="padding: 16px 18px 24px 18px; display: flex; flex-direction: column; gap: 18px;">
              
              <!-- Equipment Card 1: Mahindra 575 -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 20px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.03);">
                <img src="assets/img_mahindra_tractor.jpg" alt="Mahindra 575 DI" style="width: 100%; height: 180px; object-fit: cover; display: block;" onerror="this.src='../assets/img_mahindra_tractor.jpg'">
                <div style="padding: 16px 18px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <h4 style="font-size: 17px; font-weight: 800; color: #1A251E; margin: 0; font-family: 'Outfit', sans-serif;">🚜 mahindra 575</h4>
                    <span style="background: #EBF5ED; color: #2E7D32; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 12px;">AVAILABLE</span>
                  </div>
                  <div style="font-size: 12.5px; color: #5A6B5E; margin-bottom: 6px;">Category: Tractor</div>
                  <div style="font-size: 16.5px; font-weight: 800; color: #164E24; font-family: 'Outfit', sans-serif; margin-bottom: 4px;">₹1200 / acre</div>
                  <div style="font-size: 12px; color: #5A6B5E; margin-bottom: 14px;">📍 Mevalurkuppam, Tamil Nadu</div>

                  <div style="display: flex; gap: 10px;">
                    <button onclick="showToast('Availability status toggled!')" style="flex: 1; height: 42px; background: #FFFFFF; border: 1.5px solid #CFD8DC; border-radius: 12px; font-size: 12px; font-weight: 700; color: #164E24; cursor: pointer;">
                      TOGGLE AVAILABILITY
                    </button>
                    <button onclick="showToast('Delete requested for mahindra 575')" style="flex: 1; height: 42px; background: #FFFFFF; border: 1.5px solid #FFCDD2; border-radius: 12px; font-size: 12px; font-weight: 700; color: #C62828; cursor: pointer;">
                      DELETE
                    </button>
                  </div>
                </div>
              </div>

              <!-- Equipment Card 2: Claas Crop Tiger 30 -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 20px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.03);">
                <img src="assets/img_sonalika_harvester.jpg" alt="Claas Crop Tiger 30" style="width: 100%; height: 180px; object-fit: cover; display: block;" onerror="this.src='../assets/img_sonalika_harvester.jpg'">
                <div style="padding: 16px 18px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <h4 style="font-size: 17px; font-weight: 800; color: #1A251E; margin: 0; font-family: 'Outfit', sans-serif;">🚜 Claas Crop Tiger 30</h4>
                    <span style="background: #EBF5ED; color: #2E7D32; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 12px;">AVAILABLE</span>
                  </div>
                  <div style="font-size: 12.5px; color: #5A6B5E; margin-bottom: 6px;">Category: Harvester</div>
                  <div style="font-size: 16.5px; font-weight: 800; color: #164E24; font-family: 'Outfit', sans-serif; margin-bottom: 4px;">₹2400 / acre</div>
                  <div style="font-size: 12px; color: #5A6B5E; margin-bottom: 14px;">📍 Mevalurkuppam, Tamil Nadu</div>

                  <div style="display: flex; gap: 10px;">
                    <button onclick="showToast('Availability status toggled!')" style="flex: 1; height: 42px; background: #FFFFFF; border: 1.5px solid #CFD8DC; border-radius: 12px; font-size: 12px; font-weight: 700; color: #164E24; cursor: pointer;">
                      TOGGLE AVAILABILITY
                    </button>
                    <button onclick="showToast('Delete requested for Claas Crop Tiger 30')" style="flex: 1; height: 42px; background: #FFFFFF; border: 1.5px solid #FFCDD2; border-radius: 12px; font-size: 12px; font-weight: 700; color: #C62828; cursor: pointer;">
                      DELETE
                    </button>
                  </div>
                </div>
              </div>

              <!-- Equipment Card 3: John Deere 5050 D -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 20px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.03);">
                <img src="assets/img_john_deere_tractor.jpg" alt="John Deere Tractor" style="width: 100%; height: 180px; object-fit: cover; display: block;" onerror="this.src='../assets/img_john_deere_tractor.jpg'">
                <div style="padding: 16px 18px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <h4 style="font-size: 17px; font-weight: 800; color: #1A251E; margin: 0; font-family: 'Outfit', sans-serif;">🚜 John Deere 5050 D</h4>
                    <span style="background: #EBF5ED; color: #2E7D32; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 12px;">AVAILABLE</span>
                  </div>
                  <div style="font-size: 12.5px; color: #5A6B5E; margin-bottom: 6px;">Category: Tractor</div>
                  <div style="font-size: 16.5px; font-weight: 800; color: #164E24; font-family: 'Outfit', sans-serif; margin-bottom: 4px;">₹1500 / acre</div>
                  <div style="font-size: 12px; color: #5A6B5E; margin-bottom: 14px;">📍 Mevalurkuppam, Tamil Nadu</div>

                  <div style="display: flex; gap: 10px;">
                    <button onclick="showToast('Availability status toggled!')" style="flex: 1; height: 42px; background: #FFFFFF; border: 1.5px solid #CFD8DC; border-radius: 12px; font-size: 12px; font-weight: 700; color: #164E24; cursor: pointer;">
                      TOGGLE AVAILABILITY
                    </button>
                    <button onclick="showToast('Delete requested')" style="flex: 1; height: 42px; background: #FFFFFF; border: 1.5px solid #FFCDD2; border-radius: 12px; font-size: 12px; font-weight: 700; color: #C62828; cursor: pointer;">
                      DELETE
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 28: WEEKLY TRENDS & EARNINGS (Matches Screenshot 1 exactly)
    // =========================================================================
    case 28:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top App Bar -->
            <div style="background-color: #164E24; padding: 14px 18px; display: flex; align-items: center; color: #FFFFFF;">
              <button onclick="navigateToScreen(24)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 12px;">
                <i class="ri-arrow-left-line"></i>
              </button>
              <h3 style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin: 0 auto 0 0; font-family: 'Outfit', sans-serif;">Weekly Trends & Earnings</h3>
            </div>

            <div style="padding: 16px 18px 24px 18px;">
              <!-- Enter Daily Earnings Button -->
              <div onclick="showToast('Daily Earnings entry form opened')" style="background: #FFFFFF; border: 1.5px solid #164E24; border-radius: 16px; height: 46px; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 800; color: #164E24; cursor: pointer; box-shadow: 0 2px 6px rgba(22,78,36,0.06); margin-bottom: 16px;">
                ✏️ ENTER DAILY EARNINGS / ఆదాయాన్ని నమోదు చేయండి
              </div>

              <!-- This Week's Revenue Card -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 18px; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="font-size: 11.5px; color: #8B9B8E; font-weight: 600;">THIS WEEK'S FLEET REVENUE / వారాంతపు ఆదాయం</div>
                <div style="font-size: 38px; font-weight: 800; color: #164E24; font-family: 'Outfit', sans-serif; margin: 4px 0 14px 0;">
                  ₹0
                </div>

                <div style="border-top: 1px solid #E5EBE6; padding-top: 12px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 14px;">
                  <div>
                    <div style="font-size: 11.5px; color: #8B9B8E;">Fuel & Maintenance</div>
                    <div style="font-size: 16px; font-weight: 800; color: #1A251E; margin-top: 2px;">₹0</div>
                  </div>
                  <div>
                    <div style="font-size: 11.5px; color: #8B9B8E;">Driver Wages Paid</div>
                    <div style="font-size: 16px; font-weight: 800; color: #1A251E; margin-top: 2px;">₹0</div>
                  </div>
                </div>

                <!-- Net Weekly Profit Box -->
                <div style="background: #EBF5ED; border-radius: 14px; padding: 12px 14px;">
                  <div style="font-size: 11px; font-weight: 800; color: #2E7D32;">NET WEEKLY PROFIT / నికర లాభం</div>
                  <div style="font-size: 22px; font-weight: 800; color: #164E24; font-family: 'Outfit', sans-serif; margin-top: 2px;">₹0</div>
                </div>
              </div>

              <!-- Daily Revenue Breakdown Heading -->
              <div style="font-size: 14.5px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                <span>📈</span> Daily Revenue Breakdown
              </div>

              <!-- Days Bar Chart Card -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 18px; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 14px;">
                ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => `
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="width: 36px; font-size: 12.5px; font-weight: 700; color: #1A251E;">${day}</span>
                    <div style="flex: 1; height: 14px; background: linear-gradient(180deg, #757575 0%, #424242 100%); border-radius: 7px; margin: 0 16px;"></div>
                    <span style="width: 30px; text-align: right; font-size: 12.5px; font-weight: 800; color: #1A251E;">₹0</span>
                  </div>
                `).join('')}
              </div>

              <!-- Operations by Activity Type Heading -->
              <div style="font-size: 14.5px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                <span>🚜</span> Operations by Activity Type
              </div>

              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 18px; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); line-height: 2;">
                <div style="font-size: 13px; color: #1A251E; font-weight: 600;">• Ploughing (దున్నడం): 1 Operations</div>
                <div style="font-size: 13px; color: #5A6B5E;">• Harvesting (కోత పనులు): 0 Operations</div>
                <div style="font-size: 13px; color: #5A6B5E;">• Drone Spraying (మందుల పిచికారీ): 0 Operations</div>
                <div style="font-size: 13px; color: #5A6B5E;">• Others: 0 Operations</div>
              </div>

              <!-- Best Performing Machinery -->
              <div style="font-size: 14.5px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif; display: flex; align-items: center; gap: 6px;">
                <span>⭐</span> Best Performing Machinery
              </div>

            </div>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 29: DRIVER & OPERATOR (Matches Screenshot 2 exactly)
    // =========================================================================
    case 29:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#0D47A1';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top App Bar (Blue) -->
            <div style="background-color: #0D47A1; padding: 16px 18px; color: #FFFFFF; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <button onclick="navigateToScreen(24)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                  <i class="ri-arrow-left-line"></i>
                </button>
                <div>
                  <div style="font-size: 11px; color: #BBDEFB; font-weight: 500;">👷 AgriRide Driver & Operator</div>
                  <div style="font-size: 20px; font-weight: 800; color: #FFFFFF; font-family: 'Outfit', sans-serif; margin-top: 2px;">
                    Suresh Kumar
                  </div>
                  <div style="font-size: 11px; color: #E3F2FD; margin-top: 2px;">
                    DL: AP21 20180004921 • Heavy Agri Machinery
                  </div>
                </div>
              </div>

              <!-- Switch Role Button -->
              <button onclick="navigateToScreen(24)" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); color: #FFFFFF; border-radius: 16px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer;">
                Switch Role
              </button>
            </div>

            <div style="padding: 16px 18px 24px 18px;">
              
              <!-- Duty Shift Attendance Card -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div>
                  <div style="font-size: 15px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">
                    Duty Shift Attendance
                  </div>
                  <div style="font-size: 11.5px; color: #8B9B8E; margin-top: 3px;">
                    Checked in today at 06:45 AM • Tap to toggle
                  </div>
                </div>
                <span style="background: #EBF5ED; color: #2E7D32; font-size: 12px; font-weight: 800; padding: 6px 12px; border-radius: 14px;">
                  🟢 On Duty
                </span>
              </div>

              <!-- 3 Stats Columns -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 10px; display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; margin-bottom: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="border-right: 1px solid #E5EBE6;">
                  <div style="font-size: 22px; font-weight: 800; color: #1565C0; font-family: 'Outfit', sans-serif;">2</div>
                  <div style="font-size: 11px; color: #5A6B5E; margin-top: 2px;">Tasks Today</div>
                </div>
                <div style="border-right: 1px solid #E5EBE6;">
                  <div style="font-size: 20px; font-weight: 800; color: #2E7D32; font-family: 'Outfit', sans-serif;">6.5 Ac</div>
                  <div style="font-size: 11px; color: #5A6B5E; margin-top: 2px;">Area Covered</div>
                </div>
                <div>
                  <div style="font-size: 20px; font-weight: 800; color: #E65100; font-family: 'Outfit', sans-serif;">₹1,200</div>
                  <div style="font-size: 11px; color: #5A6B5E; margin-top: 2px;">Today's Wage</div>
                </div>
              </div>

              <!-- Active Machinery Operation Heading -->
              <div style="font-size: 14.5px; font-weight: 800; color: #1565C0; font-family: 'Outfit', sans-serif; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                <span>📍</span> Active Machinery Operation
              </div>

              <!-- No Active Machinery Job Card -->
              <div style="background: #FFFFFF; border: 1.5px solid #BBDEFB; border-radius: 18px; padding: 18px; margin-bottom: 18px; box-shadow: 0 2px 6px rgba(21,101,192,0.06);">
                <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                  <span style="background: #E0E0E0; color: #424242; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px;">
                    🚜 No Assigned Work
                  </span>
                  <span style="background: #E3F2FD; color: #1565C0; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px;">
                    💤 Idle
                  </span>
                </div>
                <h4 style="font-size: 16px; font-weight: 800; color: #1A251E; margin: 0 0 6px 0; font-family: 'Outfit', sans-serif;">
                  No Active Machinery Job
                </h4>
                <p style="font-size: 12.5px; color: #5A6B5E; line-height: 1.45; margin: 0;">
                  You will see job details here once the fleet owner confirms a booking and assigns it to you.
                </p>
              </div>

              <!-- Next Scheduled Operation Heading -->
              <div style="font-size: 14.5px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                <span>🕒</span> Next Scheduled Operation
              </div>

              <!-- Scheduled Job Card -->
              <div onclick="navigateToScreen(34)" style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 18px; margin-bottom: 24px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); cursor: pointer;">
                <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                  <span style="background: #FFFDE7; color: #F57F17; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px;">
                    🌾 Claas Crop Tiger 30
                  </span>
                  <span style="background: #EDE7F6; color: #512DA8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px;">
                    ⏳ Scheduled 2:00 PM
                  </span>
                </div>
                <h4 style="font-size: 15.5px; font-weight: 800; color: #1A251E; margin: 0 0 6px 0; font-family: 'Outfit', sans-serif;">
                  Paddy Harvesting & Threshing
                </h4>
                <div style="font-size: 12.5px; color: #5A6B5E; line-height: 1.5;">
                  🧑‍🌾 Farmer: Kalyan Ram (+91 94401 55667)<br>
                  📍 Location: Palanjur North Field #2 • 2.5 Acres
                </div>
              </div>

            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div style="padding: 14px 18px 20px 18px; background: #FFFFFF; border-top: 1px solid #E5EBE6; display: flex; gap: 12px;">
            <button onclick="navigateToScreen(30)" style="flex: 1; height: 48px; background: #FFFFFF; border: 1.5px solid #90CAF9; border-radius: 14px; font-size: 12.5px; font-weight: 800; color: #1565C0; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
              💰 EARNINGS & ATTENDANCE
            </button>
            <button onclick="showToast('Calling Fleet Owner (+91 98480 22338)...')" style="flex: 1; height: 48px; background: #FFFFFF; border: 1.5px solid #FFCDD2; border-radius: 14px; font-size: 12.5px; font-weight: 800; color: #C62828; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
              📞 CALL OWNER
            </button>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 30: WORKER EARNINGS & ATTENDANCE (Matches Screenshot 3 exactly)
    // =========================================================================
    case 30:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#0D47A1';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top App Bar (Blue) -->
            <div style="background-color: #0D47A1; padding: 16px 18px; color: #FFFFFF; display: flex; align-items: center;">
              <button onclick="navigateToScreen(29)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 12px;">
                <i class="ri-arrow-left-line"></i>
              </button>
              <div>
                <h3 style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin: 0; font-family: 'Outfit', sans-serif;">Worker Earnings & Attendance</h3>
                <div style="font-size: 11px; color: #BBDEFB; margin-top: 1px;">డ్రైవర్ సంపాదన & హాజరు వివరాలు</div>
              </div>
            </div>

            <div style="padding: 16px 18px 24px 18px;">
              
              <!-- Total Month Earnings Hero Card -->
              <div style="background: #1976D2; border-radius: 22px; padding: 20px 18px; color: #FFFFFF; box-shadow: 0 4px 16px rgba(25,118,210,0.25); margin-bottom: 18px;">
                <div style="font-size: 12px; color: #BBDEFB; font-weight: 600;">Total Month Earnings / ఈ నెల సంపాదన</div>
                <div style="font-size: 38px; font-weight: 800; color: #FFD54F; font-family: 'Outfit', sans-serif; margin: 4px 0;">
                  ₹28,800
                </div>
                <div style="font-size: 11.5px; color: #E3F2FD; margin-bottom: 16px;">
                  Base Shift Wage: ₹600/day • Acre Bonus: ₹150/acre
                </div>

                <!-- 3 Mini Stats -->
                <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 12px; display: grid; grid-template-columns: repeat(3, 1fr); text-align: center;">
                  <div>
                    <div style="font-size: 11px; color: #BBDEFB;">Today's Wage</div>
                    <div style="font-size: 15px; font-weight: 800; margin-top: 2px;">₹1,200</div>
                  </div>
                  <div style="border-left: 1px solid rgba(255,255,255,0.2); border-right: 1px solid rgba(255,255,255,0.2);">
                    <div style="font-size: 11px; color: #BBDEFB;">Completed</div>
                    <div style="font-size: 15px; font-weight: 800; margin-top: 2px;">24 Works</div>
                  </div>
                  <div>
                    <div style="font-size: 11px; color: #BBDEFB;">Pending Payout</div>
                    <div style="font-size: 15px; font-weight: 800; margin-top: 2px;">₹1,200</div>
                  </div>
                </div>
              </div>

              <!-- Daily Shift Attendance Card -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 18px; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <div style="font-size: 15px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">
                    Daily Shift Attendance
                  </div>
                  <span style="background: #EBF5ED; color: #2E7D32; font-size: 11.5px; font-weight: 800; padding: 4px 10px; border-radius: 12px;">
                    🟢 On Duty
                  </span>
                </div>
                <div style="font-size: 11.5px; color: #8B9B8E; margin-bottom: 16px;">
                  GPS Verified: Vijayawada / Palanjur Agri Zone • Checked in 06:45 AM
                </div>

                <!-- 3 Metric Columns -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; margin-bottom: 16px;">
                  <div>
                    <div style="font-size: 20px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif;">24</div>
                    <div style="font-size: 11px; color: #5A6B5E; margin-top: 2px;">Days Worked</div>
                  </div>
                  <div style="border-left: 1px solid #E5EBE6; border-right: 1px solid #E5EBE6;">
                    <div style="font-size: 20px; font-weight: 800; color: #F57C00; font-family: 'Outfit', sans-serif;">0</div>
                    <div style="font-size: 11px; color: #5A6B5E; margin-top: 2px;">Absent</div>
                  </div>
                  <div>
                    <div style="font-size: 20px; font-weight: 800; color: #1565C0; font-family: 'Outfit', sans-serif;">100%</div>
                    <div style="font-size: 11px; color: #5A6B5E; margin-top: 2px;">Punctuality</div>
                  </div>
                </div>

                <!-- Toggle / Check Out of Shift Button -->
                <button onclick="toggleWorkerAttendance()" style="width: 100%; height: 48px; background-color: #C62828; color: #FFFFFF; border: none; border-radius: 14px; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(198,40,40,0.25);">
                  🔘 Toggle / Check Out of Shift
                </button>
              </div>

              <!-- Completed Field Tasks & Wages Earned Heading -->
              <div style="font-size: 14.5px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                <span>📋</span> Completed Field Tasks & Wages Earned
              </div>

              <!-- Tasks List -->
              <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
                <!-- Task 1 -->
                <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 14.5px; font-weight: 800; color: #1A251E;">🚜 Deep Field Ploughing</span>
                    <span style="font-size: 14px; font-weight: 800; color: #2E7D32;">+₹600 Wage</span>
                  </div>
                  <div style="font-size: 12px; color: #5A6B5E; margin-bottom: 8px;">
                    Farmer: Ravi Kumar (+91 98480 22338) • Mevalurkuppam Field #4 • 4.0 Acres
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <span style="background: #EBF5ED; color: #2E7D32; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 8px;">Completed Today ✅</span>
                    <span style="background: #FFF8E1; color: #F57F17; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 8px;">Paid by Owner 💰</span>
                  </div>
                </div>

                <!-- Task 2 -->
                <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 14.5px; font-weight: 800; color: #1A251E;">🌾 Paddy Harvesting & Threshing</span>
                    <span style="font-size: 14px; font-weight: 800; color: #E65100;">+₹500 Wage</span>
                  </div>
                  <div style="font-size: 12px; color: #5A6B5E; margin-bottom: 8px;">
                    Farmer: Kalyan Ram (+91 94401 55667) • Palanjur North Field #2 • 2.5 Acres
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <span style="background: #FFF8E1; color: #F57F17; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 8px;">Scheduled 2:00 PM ⏳</span>
                    <span style="background: #FFF3E0; color: #E65100; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 8px;">Pending Settlement ⏳</span>
                  </div>
                </div>

                <!-- Task 3 -->
                <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 14.5px; font-weight: 800; color: #1A251E;">🌱 Disc Harrowing & Soil Prep</span>
                    <span style="font-size: 14px; font-weight: 800; color: #2E7D32;">+₹750 Wage</span>
                  </div>
                  <div style="font-size: 12px; color: #5A6B5E; margin-bottom: 8px;">
                    Farmer: Venkat • Poonamallee Farm #7 • 5.0 Acres
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <span style="background: #EBF5ED; color: #2E7D32; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 8px;">Completed Yesterday ✅</span>
                    <span style="background: #FFF8E1; color: #F57F17; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 8px;">Paid by Owner 💰</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div style="padding: 14px 18px 20px 18px; background: #FFFFFF; border-top: 1px solid #E5EBE6; display: flex; gap: 12px;">
            <button onclick="showToast('Advance payment request of ₹2,000 sent to Fleet Owner!')" style="flex: 1; height: 50px; background: #1565C0; color: #FFFFFF; border: none; border-radius: 14px; font-size: 13.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 12px rgba(21,101,192,0.25);">
              💵 Request Advance
            </button>
            <button onclick="showToast('Calling Fleet Owner (+91 98480 22338)...')" style="flex: 1; height: 50px; background: #FFFFFF; border: 1.5px solid #FFCDD2; border-radius: 14px; font-size: 13.5px; font-weight: 800; color: #C62828; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
              📞 CALL OWNER
            </button>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 32: NOTIFICATIONS 🔔 (Matches Screenshot 4 exactly)
    // =========================================================================
    case 32:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top App Bar -->
            <div style="background-color: #FFFFFF; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E5EBE6;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <button onclick="navigateToScreen(24)" style="width: 36px; height: 36px; background: #F0F4F1; border: none; border-radius: 50%; color: #164E24; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                  <i class="ri-arrow-left-line"></i>
                </button>
                <h3 style="font-size: 19px; font-weight: 800; color: #1A251E; margin: 0; font-family: 'Outfit', sans-serif;">Notifications 🔔</h3>
              </div>
              <button onclick="showToast('All notifications marked as read!')" style="background: transparent; border: none; font-size: 12px; font-weight: 800; color: #164E24; cursor: pointer;">
                MARK ALL AS READ
              </button>
            </div>

            <div style="padding: 16px 18px 24px 18px; display: flex; flex-direction: column; gap: 14px;">
              
              <!-- Notification 1 -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <div style="font-size: 14px; font-weight: 800; color: #1A251E; display: flex; align-items: center; gap: 6px;">
                    <span>🔔</span> New Booking Request
                  </div>
                  <div style="width: 9px; height: 9px; background-color: #E53935; border-radius: 2px;"></div>
                </div>
                <div style="font-size: 12.5px; color: #5A6B5E; line-height: 1.5; margin-bottom: 12px;">
                  Farmer booked your Claas Crop Tiger 30.<br>
                  📍 Farm: Palanjur<br>
                  🌾 Activity: Ploughing<br>
                  📐 Area: 6.0 acres<br>
                  📅 Date: 2 September 2026<br>
                  ⏰ Time: 7:00 AM – 10:00 AM<br>
                  💰 Amount: ₹14550<br>
                  🌧 Weather: SUITABLE
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F0F4F1; padding-top: 10px;">
                  <span style="font-size: 11.5px; color: #8B9B8E;">Just now</span>
                  <span onclick="showToast('Marked as read')" style="font-size: 11.5px; font-weight: 800; color: #164E24; cursor: pointer;">MARK AS READ</span>
                </div>
              </div>

              <!-- Notification 2 -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <div style="font-size: 14px; font-weight: 800; color: #1A251E; display: flex; align-items: center; gap: 6px;">
                    <span>🔔</span> 💵 Driver Advance Request / అడ్వాన్స్ అభ్యర్థన
                  </div>
                  <div style="width: 9px; height: 9px; background-color: #E53935; border-radius: 2px;"></div>
                </div>
                <div style="font-size: 12.5px; color: #5A6B5E; line-height: 1.5; margin-bottom: 12px;">
                  Driver Suresh Kumar requested wage advance of ₹2000.
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F0F4F1; padding-top: 10px;">
                  <span style="font-size: 11.5px; color: #8B9B8E;">Just now</span>
                  <span onclick="showToast('Marked as read')" style="font-size: 11.5px; font-weight: 800; color: #164E24; cursor: pointer;">MARK AS READ</span>
                </div>
              </div>

              <!-- Notification 3 -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <div style="font-size: 14px; font-weight: 800; color: #1A251E; display: flex; align-items: center; gap: 6px;">
                    <span>🔔</span> 💰 Wage Disbursed / వేతనం అందింది
                  </div>
                  <div style="width: 9px; height: 9px; background-color: #E53935; border-radius: 2px;"></div>
                </div>
                <div style="font-size: 12.5px; color: #5A6B5E; line-height: 1.5; margin-bottom: 12px;">
                  Fleet Owner paid ₹1200 via UPI Transfer (Google Pay / PhonePe) for field operations.
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F0F4F1; padding-top: 10px;">
                  <span style="font-size: 11.5px; color: #8B9B8E;">Just now</span>
                  <span onclick="showToast('Marked as read')" style="font-size: 11.5px; font-weight: 800; color: #164E24; cursor: pointer;">MARK AS READ</span>
                </div>
              </div>

              <!-- Notification 4 -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <div style="font-size: 14px; font-weight: 800; color: #1A251E; display: flex; align-items: center; gap: 6px;">
                    <span>🔔</span> New Booking Request
                  </div>
                  <div style="width: 9px; height: 9px; background-color: #E53935; border-radius: 2px;"></div>
                </div>
                <div style="font-size: 12.5px; color: #5A6B5E; line-height: 1.5; margin-bottom: 12px;">
                  Farmer booked your mahindra 575.<br>
                  📍 Farm: Palanjur<br>
                  🌾 Activity: Ploughing<br>
                  📐 Area: 4.0 acres<br>
                  📅 Date: 28 August 2026<br>
                  ⏰ Time: 7:00 AM – 10:00 AM<br>
                  💰 Amount: ₹4950<br>
                  🌧 Weather: SUITABLE
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F0F4F1; padding-top: 10px;">
                  <span style="font-size: 11.5px; color: #8B9B8E;">Just now</span>
                  <span onclick="showToast('Marked as read')" style="font-size: 11.5px; font-weight: 800; color: #164E24; cursor: pointer;">MARK AS READ</span>
                </div>
              </div>

              <!-- Notification 5 -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="font-size: 14px; font-weight: 800; color: #1A251E; display: flex; align-items: center; gap: 6px;">
                    <span>🔔</span> Work Completed by Farmer! 🎉
                  </div>
                  <div style="width: 9px; height: 9px; background-color: #E53935; border-radius: 2px;"></div>
                </div>
              </div>

            </div>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 31: (DELETED - REDIRECTS TO DASHBOARD)
    // =========================================================================
    case 31:
      setTimeout(() => navigateToScreen(7), 0);
      return '';

    // =========================================================================
    // SCREEN 33: SHOPPING CART (Removed as requested)
    // =========================================================================
    case 33:
      setTimeout(() => navigateToScreen(7), 0);
      return '';

    // =========================================================================
    // SCREEN 34: MACHINERY OPERATION DETAILS (Matches Screenshot 4 exactly)
    // =========================================================================
    case 34:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#0D47A1';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top App Bar (Royal Blue) -->
            <div style="background-color: #0D47A1; padding: 16px 18px; color: #FFFFFF; display: flex; align-items: center;">
              <button onclick="navigateToScreen(29)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: #FFFFFF; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 12px;">
                <i class="ri-arrow-left-line"></i>
              </button>
              <h3 style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin: 0; font-family: 'Outfit', sans-serif;">Machinery Operation Details</h3>
            </div>

            <div style="padding: 16px 18px 24px 18px; display: flex; flex-direction: column; gap: 14px;">
              
              <!-- Card 1: Assigned Machinery -->
              <div style="background: #FFFFFF; border: 1.5px solid #BBDEFB; border-radius: 18px; padding: 16px 18px; box-shadow: 0 2px 6px rgba(21,101,192,0.04);">
                <span style="background: #E3F2FD; color: #1565C0; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 12px; display: inline-block;">
                  🚜 ASSIGNED MACHINERY
                </span>
                <div style="font-size: 17px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif; margin: 8px 0 4px 0;">
                  John Deere 5310 4WD (55 HP)
                </div>
                <div style="font-size: 12px; color: #5A6B5E;">
                  Reg: AP 21 TC 4589 • Implement: Heavy Disc Plough
                </div>
              </div>

              <!-- Card 2: Farmer & Field Location -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="font-size: 13px; font-weight: 800; color: #164E24; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                  <span>🧑‍🌾</span> Farmer & Field Location
                </div>
                <div style="font-size: 15px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif; margin-bottom: 2px;">
                  Farmer: Ravi Kumar
                </div>
                <div style="font-size: 12px; color: #5A6B5E; margin-bottom: 2px;">
                  Mobile: +91 98480 22338
                </div>
                <div style="font-size: 12px; color: #5A6B5E; margin-bottom: 8px;">
                  Location: Mevalurkuppam Field #4 (Near Canal Road)
                </div>
                <div style="font-size: 12.5px; font-weight: 800; color: #164E24;">
                  Field Area: 4.0 Acres • Soil: Red Sandy Loam
                </div>
              </div>

              <!-- Card 3: Field Operation Checklist -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 16px 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="font-size: 13px; font-weight: 800; color: #1A251E; display: flex; align-items: center; gap: 6px; margin-bottom: 10px;">
                  <span>📋</span> Field Operation Checklist
                </div>
                <div style="font-size: 12.5px; color: #5A6B5E; line-height: 1.6;">
                  <div>✓ 1. Diesel fuel tank checked (65L capacity)</div>
                  <div style="margin-top: 4px;">✓ 2. Hydraulic pressure & disc alignment inspected</div>
                  <div style="margin-top: 4px;">✓ 3. Field stones & sprinkler lines verified</div>
                  <div style="margin-top: 4px;">✓ 4. Ploughing depth maintained at 9–12 inches</div>
                </div>
              </div>

              <!-- Card 4: Status Card -->
              <div style="background: #FFFFFF; border: 1.5px solid #E5EBE6; border-radius: 18px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div>
                  <div style="font-size: 11px; color: #8B9B8E;">Status</div>
                  <div style="font-size: 14px; font-weight: 800; color: #E65100; margin-top: 2px;">
                    ⚙️ In Progress
                  </div>
                </div>
                <div style="font-size: 12px; color: #8B9B8E; font-weight: 600;">
                  Booking #BK8821
                </div>
              </div>

            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div style="padding: 14px 18px 24px 18px; background: #F8FAF8; display: flex; flex-direction: column; gap: 10px;">
            <button onclick="showToast('✅ Operation Marked as Completed! Details sent to Fleet Owner.'); setTimeout(() => navigateToScreen(29), 1000);" style="width: 100%; height: 52px; background-color: #164E24; color: #FFFFFF; border: none; border-radius: 16px; font-size: 14.5px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(22, 78, 36, 0.25);">
              Mark Operation Completed ✅
            </button>
            <button onclick="showToast('Calling Farmer Ravi Kumar (+91 98480 22338)...')" style="width: 100%; height: 48px; background-color: #EBF5ED; color: #164E24; border: 1.5px solid #C8E6C9; border-radius: 16px; font-size: 13.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
              📞 CALL FARMER RAVI KUMAR
            </button>
          </div>

        </div>
      `;

    // =========================================================================
    // SCREEN 35: MY PROFILE & SETTINGS (Matches Screenshot 5 exactly)
    // =========================================================================
    case 35:
      setTimeout(() => {
        const bar = document.getElementById('android-status-bar');
        if (bar) bar.style.backgroundColor = '#164E24';
      }, 0);

      return `
        <div style="background-color: #F8FAF8; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow-y: auto;">
          
          <div>
            <!-- Top App Bar -->
            <div style="background-color: #FFFFFF; padding: 14px 18px; display: flex; align-items: center; border-bottom: 1px solid #E5EBE6;">
              <button onclick="navigateToScreen(7)" style="width: 36px; height: 36px; background: #F0F4F1; border: none; border-radius: 50%; color: #164E24; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 12px;">
                <i class="ri-arrow-left-line"></i>
              </button>
              <h3 style="font-size: 20px; font-weight: 800; color: #1A251E; margin: 0; font-family: 'Outfit', sans-serif;">My Profile & Settings</h3>
            </div>

            <div style="padding: 18px 18px 24px 18px;">
              
              <!-- Profile Summary Card -->
              <div style="background: #FFFFFF; border: 1.5px solid #5A6B5E; border-radius: 20px; padding: 18px; display: flex; align-items: center; gap: 16px; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); cursor: pointer;" onclick="openEditProfileModal()">
                <!-- Tractor Avatar -->
                <div style="width: 64px; height: 64px; border: 1.5px solid #164E24; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; background: #F4FAF5; flex-shrink: 0;">
                  🚜
                </div>
                <div>
                  <div style="font-size: 19px; font-weight: 800; color: #1A251E; font-family: 'Outfit', sans-serif; display: flex; align-items: center; gap: 6px;">
                    <span>${state.userProfile ? state.userProfile.name : 'abb'}</span> 👋
                    <i class="ri-edit-2-fill" style="font-size: 15px; color: #164E24;"></i>
                  </div>
                  <div style="font-size: 11.5px; color: #5A6B5E; margin: 3px 0 5px 0;">
                    ${state.userProfile ? state.userProfile.phone : '+91 98480 22338'} • ${state.userProfile ? state.userProfile.location : 'Mevalurkuppam, Tamil Nadu'}
                  </div>
                  <div style="font-size: 11.5px; font-weight: 800; color: #164E24;">
                    Role: ${(state.role || 'farmer').toUpperCase()}
                  </div>
                </div>
              </div>

              <!-- Buttons Stack -->
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <!-- 1. Edit Profile Details -->
                <button onclick="openEditProfileModal()" style="width: 100%; height: 48px; background-color: #164E24; color: #FFFFFF; border: none; border-radius: 14px; font-size: 13px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 3px 8px rgba(22,78,36,0.2);">
                  ✏️ EDIT PROFILE DETAILS
                </button>

                <!-- 2. Switch Role / Mode -->
                <button onclick="showToast('Switched to Farmer/Owner mode'); navigateToScreen(24);" style="width: 100%; height: 48px; background-color: #FF9800; color: #FFFFFF; border: none; border-radius: 14px; font-size: 12.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 3px 8px rgba(255,152,0,0.25);">
                  🔄 SWITCH ROLE / MODE (FARMER / OWNER / WORKER)
                </button>

                <!-- 3. Set / Update Farm Location -->
                <button onclick="navigateToScreen(18)" style="width: 100%; height: 48px; background-color: #FFFFFF; color: #164E24; border: 1.5px solid #164E24; border-radius: 14px; font-size: 13px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  📍 SET / UPDATE FARM LOCATION
                </button>

                <!-- 4. Change Language -->
                <button onclick="navigateToScreen(3)" style="width: 100%; height: 48px; background-color: #FFFFFF; color: #1A251E; border: 1.5px solid #CFD8DC; border-radius: 14px; font-size: 13px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  🌐 CHANGE LANGUAGE / భాష
                </button>

                <!-- 5. Help & Owner Support -->
                <button onclick="showToast('AgriRide Support: Calling Helpline 1800-425-2026')" style="width: 100%; height: 48px; background-color: #FFFFFF; color: #1A251E; border: 1.5px solid #CFD8DC; border-radius: 14px; font-size: 13px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  ❓ HELP & OWNER PARTNER SUPPORT
                </button>

                <!-- 6. Notifications & Alerts -->
                <button onclick="navigateToScreen(32)" style="width: 100%; height: 48px; background-color: #FFFFFF; color: #1A251E; border: 1.5px solid #CFD8DC; border-radius: 14px; font-size: 13px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  🔔 NOTIFICATIONS & ALERTS
                </button>

                <!-- 7. Logout Account -->
                <button onclick="showToast('Logged out of account'); navigateToScreen(4);" style="width: 100%; height: 48px; background-color: #FFEBEE; color: #C62828; border: 1.5px solid #FFCDD2; border-radius: 14px; font-size: 13.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 6px;">
                  🚪 Logout Account
                </button>
              </div>

            </div>
          </div>

        </div>
      `;

    default:
      return `<div style="padding: 20px; text-align: center;">Screen ${screenNum} content coming soon...</div>`;
  }
}

// HELPER ACTIONS & HANDLERS
function handleOnboardingNext() {
  if (state.onboardingSlide < 2) {
    state.onboardingSlide++;
    renderScreen(2);
  } else {
    state.onboardingSlide = 0;
    navigateToScreen(3);
  }
}

function selectLanguage(lang) {
  state.language = lang;
  renderScreen(3);
}

function selectRegisterRole(role) {
  state.role = role;
  renderScreen(5);
}

function setLoginRole(role) {
  state.role = role;
  renderScreen(4);
}

// =========================================================================
// FIREBASE LIVE BACKEND INTEGRATION HELPERS (MATCHING ANDROID APP SCHEMA)
// =========================================================================
let liveFirebaseEquipment = [];
let liveFirebaseBookings = [];
let liveFirebaseWorkers = [];

function initFirebaseListeners() {
  if (typeof fbDB !== 'undefined' && fbDB) {
    try {
      // 1. Listen to Equipment Fleet
      fbDB.ref('equipment').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
          liveFirebaseEquipment = Object.keys(data).map(k => ({
            id: k,
            equipmentId: k,
            ...data[k]
          }));
          console.log(`🔥 [Firebase] Synced ${liveFirebaseEquipment.length} equipment items with Android app!`);
          if (state.currentScreen === 7 || state.currentScreen === 8 || state.currentScreen === 27) {
            renderScreen(state.currentScreen);
          }
        }
      });

      // 2. Listen to Bookings
      fbDB.ref('bookings').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
          liveFirebaseBookings = Object.keys(data).map(k => ({
            id: k,
            bookingId: k,
            ...data[k]
          }));
          console.log(`🔥 [Firebase] Synced ${liveFirebaseBookings.length} bookings with Android app!`);
          
          // Compute owner stats matching Android
          const pending = liveFirebaseBookings.filter(b => b.status === 'PENDING' || b.bookingStatus === 'PENDING').length;
          const completed = liveFirebaseBookings.filter(b => b.status === 'COMPLETED' || b.bookingStatus === 'COMPLETED').length;
          const revenue = liveFirebaseBookings.filter(b => b.status === 'COMPLETED' || b.bookingStatus === 'COMPLETED')
                                            .reduce((sum, b) => sum + (Number(b.totalAmount || b.amount) || 0), 0);
          
          state.livePendingRequests = pending;
          state.liveCompletedWorks = completed;
          state.liveTotalRevenue = revenue;

          if (state.currentScreen === 17 || state.currentScreen === 24 || state.currentScreen === 26 || state.currentScreen === 28) {
            renderScreen(state.currentScreen);
          }
        }
      });

      // 3. Listen to Workers (Suresh Kumar)
      fbDB.ref('workers').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
          liveFirebaseWorkers = Object.keys(data).map(k => ({
            id: k,
            ...data[k]
          }));
          console.log(`🔥 [Firebase] Synced ${liveFirebaseWorkers.length} workers with Android app!`);
        }
      });
    } catch (e) {
      console.warn('Firebase realtime listener warning:', e);
    }
  }
}

// Automatically start listeners
setTimeout(initFirebaseListeners, 500);

function syncBookingToFirebase(bookingData) {
  if (typeof fbDB !== 'undefined' && fbDB) {
    try {
      const bId = 'AR' + Math.floor(1000000 + Math.random() * 9000000);
      const now = Date.now();
      const acres = Number(bookingData.acres) || 4;
      const rate = Number(bookingData.ratePerAcre) || 1200;
      const equipCost = acres * rate;
      const fee = 150;
      const total = equipCost + fee;

      const payload = {
        id: bId,
        bookingId: bId,
        equipmentId: bookingData.equipmentId || 'EQ_1787990939545',
        equipmentName: bookingData.equipment || 'mahindra 575',
        farmerId: 'SVEMaMyfKIc6R1wv8Sdx8oyToNn1',
        farmerName: 'greeshma',
        farmerPhone: '8328178677',
        ownerId: 'SVEMaMyfKIc6R1wv8Sdx8oyToNn1',
        ownerName: 'greeshma',
        ownerPhone: '8328178677',
        activity: bookingData.activity || 'Ploughing',
        acres: acres,
        ratePerAcre: rate,
        equipmentCost: equipCost,
        serviceFee: fee,
        amount: equipCost,
        totalAmount: total,
        location: bookingData.location || 'Mevalurkuppam, Tamil Nadu',
        farmLocation: 'Mevalurkuppam, Tamil Nadu',
        farmVillage: 'Mevalurkuppam',
        farmDistrict: 'Krishna',
        villageName: 'Mevalurkuppam',
        district: 'Krishna',
        date: bookingData.date || '28 August 2026',
        startTime: '7:00 AM',
        endTime: '10:00 AM',
        timeSlot: bookingData.time || '7:00 AM - 10:00 AM',
        paymentMethod: 'CASH',
        paymentStatus: 'CASH_PENDING',
        status: 'PENDING',
        bookingStatus: 'PENDING',
        weatherStatus: 'SUITABLE',
        weatherSummary: 'Suitable weather for agricultural operations.',
        createdAt: now,
        updatedAt: now
      };

      // 1. Save to bookings
      fbDB.ref('bookings/' + bId).set(payload);

      // 2. Save to owner_notifications
      const notifId = 'NOTIF_' + now;
      fbDB.ref('owner_notifications/' + notifId).set({
        id: notifId,
        notificationId: notifId,
        bookingId: bId,
        ownerId: 'SVEMaMyfKIc6R1wv8Sdx8oyToNn1',
        title: 'New Machinery Booking Received!',
        message: `Farmer greeshma booked ${payload.equipmentName} for ${acres} Acres (${payload.activity}). Total: ₹${total}`,
        type: 'BOOKING_REQUEST',
        timestamp: now,
        isRead: false
      });

      // 3. Save to payments
      fbDB.ref('payments/PAY_' + bId).set({
        paymentId: 'PAY_' + bId,
        bookingId: bId,
        amount: total,
        paymentMethod: 'CASH',
        paymentStatus: 'CASH_PENDING',
        timestamp: now
      });

      console.log('✅ Realtime Booking synced to Firebase RTDB:', bId);
    } catch (err) {
      console.warn('Firebase booking sync error:', err);
    }
  }
}

function syncUserToFirebase(identifier, role) {
  if (typeof fbDB !== 'undefined' && fbDB) {
    try {
      const safeKey = (identifier || 'greeshma').replace(/[^a-zA-Z0-9]/g, '_');
      const now = Date.now();
      
      fbDB.ref('users/' + safeKey).update({
        uid: safeKey,
        id: safeKey,
        name: identifier || 'greeshma',
        phone: '8328178677',
        role: role === 'owner' ? 'Equipment Owner' : (role === 'worker' ? 'Worker' : 'FARMER'),
        location: 'Mevalurkuppam, Tamil Nadu',
        villageName: 'Mevalurkuppam',
        district: 'Krishna',
        updatedAt: now
      });

      if (role === 'owner') {
        fbDB.ref('owners/' + safeKey).update({
          id: safeKey,
          userId: safeKey,
          name: identifier || 'greeshma',
          phone: '8328178677',
          location: 'Mevalurkuppam, Tamil Nadu',
          verificationStatus: 'VERIFIED',
          totalEquipment: 6
        });
      } else if (role === 'worker') {
        fbDB.ref('workers/' + safeKey).update({
          id: safeKey,
          userId: safeKey,
          name: identifier || 'Suresh Kumar',
          phone: '+91 98480 33445',
          status: 'On Duty',
          availability: 'AVAILABLE'
        });
      } else {
        fbDB.ref('farmers/' + safeKey).update({
          id: safeKey,
          userId: safeKey,
          name: identifier || 'greeshma',
          phone: '8328178677',
          location: 'Mevalurkuppam, Tamil Nadu'
        });
      }

      console.log('✅ User recorded in Firebase RTDB matching Android schema:', identifier);
    } catch (err) {
      console.warn('Firebase user sync notice:', err);
    }
  }
}

function syncEquipmentToFirebase(equipmentData) {
  if (typeof fbDB !== 'undefined' && fbDB) {
    try {
      const eqId = 'EQ_' + Date.now();
      const now = Date.now();
      const payload = {
        id: eqId,
        equipmentId: eqId,
        name: equipmentData.name || 'New Farm Vehicle',
        category: equipmentData.category || 'Tractor',
        type: equipmentData.type || 'Tractor',
        vehicleNumber: equipmentData.vehicleNumber || 'TN 21 AB 1234',
        ownerId: 'SVEMaMyfKIc6R1wv8Sdx8oyToNn1',
        ownerName: 'greeshma',
        ownerPhone: '8328178677',
        pricePerAcre: Number(equipmentData.pricePerAcre) || 1200,
        villageName: 'Mevalurkuppam',
        district: 'Tamil Nadu',
        location: 'Mevalurkuppam, Tamil Nadu',
        latitude: 13.0264116,
        longitude: 80.0171944,
        rating: 5.0,
        reviewCount: 0,
        available: true,
        isAvailableFlag: true,
        availability: 'AVAILABLE',
        hpRating: 50,
        description: equipmentData.description || 'Verified agricultural machinery.',
        verificationStatus: 'VERIFIED',
        createdAt: now,
        updatedAt: now
      };

      fbDB.ref('equipment/' + eqId).set(payload);
      console.log('✅ Equipment registered in Firebase matching Android schema:', eqId);
      showToast('🚜 Vehicle registered in live Firebase fleet!');
    } catch (err) {
      console.warn('Firebase equipment sync notice:', err);
    }
  }
}

function updateFirebaseBookingStatus(bookingId, newStatus) {
  if (typeof fbDB !== 'undefined' && fbDB && bookingId) {
    try {
      const now = Date.now();
      fbDB.ref('bookings/' + bookingId).update({
        status: newStatus,
        bookingStatus: newStatus,
        confirmedAt: newStatus === 'CONFIRMED' ? now : 0,
        completedAt: newStatus === 'COMPLETED' ? now : 0,
        updatedAt: now
      });
      
      const notifId = 'NOTIF_FARMER_' + now;
      fbDB.ref('farmer_notifications/' + notifId).set({
        id: notifId,
        notificationId: notifId,
        bookingId: bookingId,
        title: `Booking #${bookingId} ${newStatus}`,
        message: `Your booking status has been updated to ${newStatus} by owner greeshma.`,
        timestamp: now,
        isRead: false
      });

      console.log(`✅ Booking #${bookingId} status updated to ${newStatus} in Firebase`);
    } catch (e) {
      console.warn('Booking status update error:', e);
    }
  }
}

function handlePaymentSuccess() {
  syncBookingToFirebase(state.booking);
  showToast('Booking confirmed & saved to Firebase! 🎉');
  setTimeout(() => {
    navigateToScreen(16);
  }, 300);
}

function handleLoginSubmit() {
  const ident = document.getElementById('login-identifier');
  const pass = document.getElementById('login-password');
  const roleName = state.role ? (state.role === 'owner' ? 'Equipment Owner' : (state.role === 'worker' ? 'Worker' : 'Farmer')) : 'Farmer';
  syncUserToFirebase(ident ? ident.value : 'greeshma', state.role);
  showToast(`Welcome! Logged in as ${roleName}.`);
  setTimeout(() => {
    if (state.role === 'owner') navigateToScreen(24);
    else if (state.role === 'worker') navigateToScreen(29);
    else navigateToScreen(7);
  }, 250);
}

function handleRegisterSubmit() {
  const name = document.getElementById('reg-name');
  const roleName = state.role ? (state.role === 'owner' ? 'Equipment Owner' : (state.role === 'worker' ? 'Worker' : 'Farmer')) : 'Farmer';
  syncUserToFirebase(name ? name.value : 'greeshma', state.role);
  showToast(`Account created successfully! Logged in as ${roleName}.`);
  setTimeout(() => {
    if (state.role === 'owner') navigateToScreen(24);
    else if (state.role === 'worker') navigateToScreen(29);
    else navigateToScreen(7);
  }, 250);
}

function togglePasswordVisibility(fieldId, iconElem) {
  const field = document.getElementById(fieldId);
  if (field) {
    if (field.type === 'password') {
      field.type = 'text';
      if (iconElem) iconElem.innerHTML = '<i class="ri-eye-off-line"></i>';
    } else {
      field.type = 'password';
      if (iconElem) iconElem.innerHTML = '<i class="ri-eye-line"></i>';
    }
  }
}

function handleOTPVerify() {
  syncUserToFirebase('verified_farmer', state.role);
  showToast('✅ Account verified with Firebase! Welcome to AgriRide');
  setTimeout(() => {
    if (state.role === 'owner') navigateToScreen(24);
    else if (state.role === 'worker') navigateToScreen(29);
    else navigateToScreen(7);
  }, 400);
}

function selectActivity(actName) {
  if (!state.booking) state.booking = {};
  state.booking.activity = actName;
  renderScreen(11);
  showToast(`Selected Activity: ${actName}`);
}

function changeAcres(delta) {
  if (!state.booking) state.booking = {};
  if (!state.booking.acres) state.booking.acres = 4.0;
  state.booking.acres = Math.max(1.0, parseFloat((state.booking.acres + delta).toFixed(1)));
  renderScreen(12);
}

function selectTimeSlot(slot) {
  state.booking.time = slot;
  showToast(`Selected time slot: ${slot}`);
  navigateToScreen(14);
}

function selectPaymentMethod(pm) {
  state.booking.paymentMethod = pm;
  renderScreen(15);
}

function acceptRequest(idx) {
  state.ownerRequests[idx].status = 'Accepted';
  showToast(`Accepted booking #${state.ownerRequests[idx].id}`);
  renderScreen(27);
}

function rejectRequest(idx) {
  state.ownerRequests[idx].status = 'Rejected';
  showToast(`Rejected booking #${state.ownerRequests[idx].id}`);
  renderScreen(27);
}

function toggleWorkerAttendance() {
  state.workerAttendance.checkedIn = !state.workerAttendance.checkedIn;
  showToast(state.workerAttendance.checkedIn ? 'Checked in to field shift' : 'Checked out of field shift');
  renderScreen(30);
}

function initTrackingAnimation() {
  setTimeout(() => {
    const tractorMarker = document.getElementById('tracking-tractor-marker');
    if (tractorMarker) {
      tractorMarker.style.transition = 'transform 6s ease-in-out';
      tractorMarker.setAttribute('transform', 'translate(280, 520)');
    }
  }, 500);
}

// BOTTOM NAVIGATION HELPER
function renderBottomNav(currentScreen, activeTab) {
  return `
    <div class="mobile-bottom-nav">
      <button onclick="navigateToScreen(7)" class="nav-tab ${activeTab === 'home' ? 'active' : ''}">
        <i class="ri-home-5-line"></i>
        <span>Home</span>
      </button>
      <button onclick="navigateToScreen(17)" class="nav-tab ${activeTab === 'bookings' ? 'active' : ''}">
        <i class="ri-calendar-check-line"></i>
        <span>Bookings</span>
      </button>
      <button onclick="navigateToScreen(22)" class="nav-tab ${activeTab === 'community' ? 'active' : ''}">
        <i class="ri-team-line"></i>
        <span>Community</span>
      </button>
      <button onclick="navigateToScreen(23)" class="nav-tab ${activeTab === 'store' ? 'active' : ''}">
        <i class="ri-shopping-bag-3-line"></i>
        <span>Store</span>
      </button>
      <button onclick="navigateToScreen(35)" class="nav-tab ${activeTab === 'profile' ? 'active' : ''}">
        <i class="ri-user-3-line"></i>
        <span>Profile</span>
      </button>
    </div>
  `;
}

// WHATSAPP CHAT HANDLERS
function switchChatThread(threadId) {
  state.chatState.activeChatId = threadId;
  state.chatState.attachDrawerOpen = false;
  renderScreen(31);
}

function sendChatMessage() {
  const input = document.getElementById('wa-chat-input');
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  const activeId = state.chatState.activeChatId || 'ramesh';
  const thread = state.chatState.threads[activeId];

  const now = new Date();
  const hours = now.getHours() % 12 || 12;
  const mins = String(now.getMinutes()).padStart(2, '0');
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  const timeStr = `${hours}:${mins} ${ampm}`;

  thread.messages.push({
    sender: 'me',
    type: 'text',
    time: timeStr,
    text: text
  });

  input.value = '';
  state.chatState.attachDrawerOpen = false;
  renderScreen(31);

  // Auto scroll chat to bottom
  setTimeout(() => {
    const stream = document.getElementById('wa-chat-body-stream');
    if (stream) stream.scrollTop = stream.scrollHeight;
  }, 50);

  // Mock response after 1.5s
  setTimeout(() => {
    let replyText = 'Understood! I will reach your field location as scheduled.';
    if (activeId === 'ramesh') replyText = 'Ji Ramesh here, 4 acres ploughing slot is locked for tomorrow morning!';
    else if (activeId === 'ravi') replyText = 'Thanks brother! Send driver contact details once tractor departs.';
    else if (activeId === 'support') replyText = 'AgriRide Agent: Your query has been logged (Ticket #AR-8831).';

    thread.messages.push({
      sender: 'them',
      type: 'text',
      time: timeStr,
      text: replyText
    });
    renderScreen(31);
    showToast(`New reply from ${thread.name.split(' ')[0]}`);
  }, 1500);
}

function handleChatKeyPress(e) {
  if (e.key === 'Enter') {
    sendChatMessage();
  }
}

function toggleAttachDrawer() {
  state.chatState.attachDrawerOpen = !state.chatState.attachDrawerOpen;
  renderScreen(31);
}

function sendVoiceNoteMsg() {
  const activeId = state.chatState.activeChatId || 'ramesh';
  const thread = state.chatState.threads[activeId];

  const now = new Date();
  const hours = now.getHours() % 12 || 12;
  const mins = String(now.getMinutes()).padStart(2, '0');
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  const timeStr = `${hours}:${mins} ${ampm}`;

  thread.messages.push({
    sender: 'me',
    type: 'audio',
    time: timeStr,
    duration: '0:18',
    text: 'Voice message: Agreed on ₹1,200/acre. Please confirm dispatch time.'
  });

  state.chatState.attachDrawerOpen = false;
  renderScreen(31);
  showToast('🎙️ Audio Voice Note sent in regional language!');
}

function sendLocationMsg() {
  const activeId = state.chatState.activeChatId || 'ramesh';
  const thread = state.chatState.threads[activeId];

  const now = new Date();
  const hours = now.getHours() % 12 || 12;
  const mins = String(now.getMinutes()).padStart(2, '0');
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  const timeStr = `${hours}:${mins} ${ampm}`;

  thread.messages.push({
    sender: 'me',
    type: 'location',
    time: timeStr,
    address: 'Kanchikacherla Farm Field 4, Plot 12 (16.5442° N, 80.3921° E)'
  });

  state.chatState.attachDrawerOpen = false;
  renderScreen(31);
  showToast('📍 Live Field GPS Pin shared in chat!');
}

function sendQuoteMsg() {
  const activeId = state.chatState.activeChatId || 'ramesh';
  const thread = state.chatState.threads[activeId];

  const now = new Date();
  const hours = now.getHours() % 12 || 12;
  const mins = String(now.getMinutes()).padStart(2, '0');
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  const timeStr = `${hours}:${mins} ${ampm}`;

  thread.messages.push({
    sender: 'me',
    type: 'quote',
    time: timeStr,
    equipment: 'Mahindra 575 DI Tractor',
    acres: 4,
    rate: 1200,
    total: 4800,
    status: 'Pending'
  });

  state.chatState.attachDrawerOpen = false;
  renderScreen(31);
  showToast('📄 Rental quote card sent in chat!');
}

function acceptInChatQuote(index) {
  const activeId = state.chatState.activeChatId || 'ramesh';
  const thread = state.chatState.threads[activeId];
  if (thread.messages[index]) {
    thread.messages[index].status = 'Accepted';
    renderScreen(31);
    showToast('🎉 Booking confirmed directly in WhatsApp Chat!');
  }
}

function playVoiceNoteAnim(btn) {
  btn.innerHTML = '<i class="ri-pause-fill"></i>';
  showToast('▶️ Playing Agri Audio Voice Note...');
  setTimeout(() => {
    btn.innerHTML = '<i class="ri-play-fill"></i>';
  }, 2500);
}

// RENDER ALL 35 SCREENS IN GRID MATRIX
function renderGridMatrix() {
  const matrix = document.getElementById('screens-grid-matrix');
  if (!matrix) return;

  matrix.innerHTML = '';

  for (let i = 1; i <= 35; i++) {
    const card = document.createElement('div');
    card.className = 'grid-screen-card';
    card.onclick = () => {
      switchViewMode('device');
      navigateToScreen(i);
    };

    card.innerHTML = `
      <div class="grid-card-meta">
        <span class="grid-card-num">Screen ${i}</span>
        <span class="grid-card-title">${getScreenTitle(i)}</span>
      </div>
      <div class="grid-mini-phone">
        ${generateScreenHTML(i)}
      </div>
    `;

    matrix.appendChild(card);
  }
}

// VIEW MODE & FLOW SWITCHERS
function switchViewMode(mode) {
  const deviceContainer = document.getElementById('device-view-container');
  const gridContainer = document.getElementById('grid-view-container');
  const btnDevice = document.getElementById('btn-view-device');
  const btnGrid = document.getElementById('btn-view-grid');

  if (mode === 'grid') {
    if (deviceContainer) deviceContainer.classList.add('hidden');
    if (gridContainer) gridContainer.classList.remove('hidden');
    if (btnDevice) btnDevice.classList.remove('active');
    if (btnGrid) btnGrid.classList.add('active');
    renderGridMatrix();
  } else {
    if (gridContainer) gridContainer.classList.add('hidden');
    if (deviceContainer) deviceContainer.classList.remove('hidden');
    if (btnGrid) btnGrid.classList.remove('active');
    if (btnDevice) btnDevice.classList.add('active');
    renderScreen(state.currentScreen || 1);
  }
}

function changeRole(role) {
  state.role = role;
  const roleSelect = document.getElementById('role-select');
  if (roleSelect) roleSelect.value = role;

  if (role === 'owner') {
    showToast('Switched to Equipment Owner Mode 🚜');
    navigateToScreen(24);
  } else if (role === 'worker') {
    showToast('Switched to Driver Suresh Kumar Console 👷');
    navigateToScreen(29);
  } else {
    showToast('Switched to Farmer Mode 🌾');
    navigateToScreen(7);
  }
}

function startFlow(flowType) {
  if (flowType === 'owner') {
    state.role = 'owner';
    showToast('Starting Equipment Owner Journey');
    navigateToScreen(24);
  } else {
    state.role = 'farmer';
    showToast('Starting Farmer Booking Journey');
    navigateToScreen(4); // Start at login
  }
}

// =========================================================================
// INTERACTIVE PROFILE EDITING MODAL HANDLERS
// =========================================================================
function openEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  if (!modal) return;
  
  const nameInput = document.getElementById('modal-profile-name');
  const phoneInput = document.getElementById('modal-profile-phone');
  const locInput = document.getElementById('modal-profile-location');
  
  if (nameInput) nameInput.value = state.userProfile ? state.userProfile.name : 'abb';
  if (phoneInput) phoneInput.value = state.userProfile ? state.userProfile.phone : '+91 98480 22338';
  if (locInput) locInput.value = state.userProfile ? state.userProfile.location : 'Mevalurkuppam, Tamil Nadu';
  
  setModalProfileRole(state.role || 'farmer');
  modal.classList.remove('hidden');
}

function closeEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  if (modal) modal.classList.add('hidden');
}

function setModalProfileRole(role) {
  state.modalRoleSelected = role;
  ['farmer', 'owner', 'worker'].forEach(r => {
    const pill = document.getElementById(`role-pill-${r}`);
    if (pill) {
      if (r === role) pill.classList.add('active');
      else pill.classList.remove('active');
    }
  });
}

function useCurrentGpsLocationForProfile() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const locStr = `Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)} (Mevalurkuppam, Tamil Nadu)`;
        const locInput = document.getElementById('modal-profile-location');
        if (locInput) locInput.value = locStr;
        showToast('📍 GPS Location detected!');
      },
      (err) => {
        const locInput = document.getElementById('modal-profile-location');
        if (locInput) locInput.value = 'Mevalurkuppam, Tamil Nadu';
        showToast('📍 Location set to Mevalurkuppam, Tamil Nadu');
      }
    );
  } else {
    showToast('📍 Location set to Mevalurkuppam, Tamil Nadu');
  }
}

function saveProfileDetails() {
  const nameInput = document.getElementById('modal-profile-name');
  const phoneInput = document.getElementById('modal-profile-phone');
  const locInput = document.getElementById('modal-profile-location');
  
  const newName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'abb';
  const newPhone = phoneInput && phoneInput.value.trim() ? phoneInput.value.trim() : '+91 98480 22338';
  const newLocation = locInput && locInput.value.trim() ? locInput.value.trim() : 'Mevalurkuppam, Tamil Nadu';
  const newRole = state.modalRoleSelected || state.role || 'farmer';
  
  if (!state.userProfile) state.userProfile = {};
  state.userProfile.name = newName;
  state.userProfile.phone = newPhone;
  state.userProfile.location = newLocation;
  state.role = newRole;
  
  // Save directly to Firebase Realtime Database
  if (typeof fbDB !== 'undefined' && fbDB) {
    try {
      const safeKey = newName.replace(/[^a-zA-Z0-9]/g, '_');
      const now = Date.now();
      fbDB.ref('users/' + safeKey).update({
        uid: safeKey,
        name: newName,
        phone: newPhone,
        location: newLocation,
        role: newRole === 'owner' ? 'Equipment Owner' : (newRole === 'worker' ? 'Worker' : 'FARMER'),
        updatedAt: now
      });
      if (newRole === 'owner') {
        fbDB.ref('owners/' + safeKey).update({ id: safeKey, name: newName, phone: newPhone, location: newLocation });
      } else if (newRole === 'worker') {
        fbDB.ref('workers/' + safeKey).update({ id: safeKey, name: newName, phone: newPhone });
      } else {
        fbDB.ref('farmers/' + safeKey).update({ id: safeKey, name: newName, phone: newPhone, location: newLocation });
      }
      console.log('✅ Profile details saved to Firebase:', newName);
    } catch (e) {
      console.warn('Firebase profile save notice:', e);
    }
  }
  
  closeEditProfileModal();
  showToast(`✅ Profile details updated: ${newName}`);
  renderScreen(state.currentScreen);
}