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
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hours}:${mins}`;
  }
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

  // Update Stepper Info
  const stepInfo = document.getElementById('step-info-text');
  if (stepInfo) {
    stepInfo.textContent = `Screen ${screenNumber} / 31: ${getScreenTitle(screenNumber)}`;
  }

  const countBadge = document.getElementById('screen-count-badge');
  if (countBadge) {
    countBadge.textContent = `Screen ${screenNumber} of 31`;
  }

  // Render content
  renderScreen(screenNumber);
}

function prevScreen() {
  if (state.currentScreen > 1) {
    navigateToScreen(state.currentScreen - 1);
  }
}

function nextScreen() {
  if (state.currentScreen < 31) {
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
    // SCREEN 1: SPLASH SCREEN
    // =========================================================================
    case 1:
      return `
        <div style="background: linear-gradient(180deg, #1B5E20 0%, #0d3810 100%); height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; color: #fff; text-align: center; position: relative;">
          <div style="width: 110px; height: 110px; background: rgba(255,255,255,0.12); border: 2px solid var(--secondary-green); border-radius: 30px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 12px 32px rgba(0,0,0,0.3); backdrop-filter: blur(10px);">
            <i class="ri-node-tree-line" style="font-size: 64px; color: var(--accent-yellow);"></i>
          </div>
          <h1 style="font-size: 36px; font-weight: 800; letter-spacing: -1px; margin-bottom: 4px; color: #ffffff;">AgriRide</h1>
          <p style="font-size: 14px; font-weight: 600; color: #a5d6a7; margin-bottom: 8px;">Farm Equipment Booking System</p>
          <div style="background: rgba(249, 168, 37, 0.2); border: 1px solid var(--accent-yellow); color: var(--accent-yellow); font-weight: 700; font-size: 12px; padding: 4px 14px; border-radius: 20px; margin-bottom: 60px;">
            "Smart Farming. Easy Booking."
          </div>

          <div style="position: absolute; bottom: 50px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; border: 3px solid rgba(255,255,255,0.2); border-top-color: var(--accent-yellow); border-radius: 50%; animation: spin 1s infinite linear;"></div>
            <button onclick="navigateToScreen(2)" style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: #fff; padding: 10px 24px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer;">
              Tap to Continue <i class="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
      `;

    // =========================================================================
    // SCREEN 2: ONBOARDING (3 SLIDES)
    // =========================================================================
    case 2:
      const slides = [
        {
          icon: 'ri-truck-line',
          title: 'Book Farm Equipment Easily',
          desc: 'Rent high-performance tractors, harvesters, and sprayers directly from verified local vehicle owners.'
        },
        {
          icon: 'ri-calendar-event-line',
          title: 'Choose the Right Date & Time',
          desc: 'Flexible hourly & acre-based booking slots designed to match your farm schedule.'
        },
        {
          icon: 'ri-sun-cloudy-line',
          title: 'Smart Weather & Live Tracking',
          desc: 'Get AI weather suitability recommendations and track equipment live via GPS right to your field.'
        }
      ];
      const curSlide = slides[state.onboardingSlide || 0];

      return `
        <div style="height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 24px 20px; background: #ffffff;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; font-weight: 700; color: var(--text-secondary);">AgriRide Intro</span>
            <button onclick="navigateToScreen(3)" style="border: none; background: transparent; color: var(--text-secondary); font-weight: 600; font-size: 13px; cursor: pointer;">Skip</button>
          </div>

          <div style="text-align: center; padding: 20px 0;">
            <div style="width: 140px; height: 140px; background: var(--secondary-green-soft); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px auto; border: 4px dashed var(--secondary-green);">
              <i class="${curSlide.icon}" style="font-size: 72px; color: var(--primary-green);"></i>
            </div>
            <h2 style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">${curSlide.title}</h2>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5; padding: 0 10px;">${curSlide.desc}</p>
          </div>

          <div>
            <!-- Indicators -->
            <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 24px;">
              <span style="width: ${state.onboardingSlide === 0 ? '24px' : '8px'}; height: 8px; background: ${state.onboardingSlide === 0 ? 'var(--primary-green)' : '#cfd8dc'}; border-radius: 4px; transition: all 0.3s;"></span>
              <span style="width: ${state.onboardingSlide === 1 ? '24px' : '8px'}; height: 8px; background: ${state.onboardingSlide === 1 ? 'var(--primary-green)' : '#cfd8dc'}; border-radius: 4px; transition: all 0.3s;"></span>
              <span style="width: ${state.onboardingSlide === 2 ? '24px' : '8px'}; height: 8px; background: ${state.onboardingSlide === 2 ? 'var(--primary-green)' : '#cfd8dc'}; border-radius: 4px; transition: all 0.3s;"></span>
            </div>

            <button onclick="handleOnboardingNext()" class="btn-primary">
              ${state.onboardingSlide === 2 ? 'Get Started' : 'Next Step'} <i class="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
      `;

    // =========================================================================
    // SCREEN 3: LANGUAGE SELECTION
    // =========================================================================
    case 3:
      const langs = [
        { name: 'English', native: 'English', sub: 'Default Language' },
        { name: 'Telugu', native: 'తెలుగు', sub: 'ఆంధ్ర ప్రదేశ్ & తెలంగాణ' },
        { name: 'Tamil', native: 'தமிழ்', sub: 'தமிழ்நாடு' },
        { name: 'Hindi', native: 'हिंदी', sub: 'भारत' }
      ];

      return `
        <div style="padding: 24px 20px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; background: var(--bg-app);">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
              <div style="width: 36px; height: 36px; background: var(--primary-green); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff;">
                <i class="ri-global-line"></i>
              </div>
              <div>
                <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Select Language</h2>
                <p style="font-size: 12px; color: var(--text-secondary);">భాషను ఎంచుకోండి / भाषा चुनें</p>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 24px;">
              ${langs.map(l => `
                <div onclick="selectLanguage('${l.name}')" class="agri-card clickable" style="display: flex; align-items: center; justify-content: space-between; border: 2px solid ${state.language === l.name ? 'var(--primary-green)' : 'transparent'}; background: ${state.language === l.name ? 'var(--secondary-green-soft)' : '#fff'};">
                  <div>
                    <h4 style="font-size: 16px; font-weight: 700; color: var(--text-primary);">${l.native}</h4>
                    <p style="font-size: 12px; color: var(--text-secondary);">${l.sub}</p>
                  </div>
                  <div style="width: 22px; height: 22px; border-radius: 50%; border: 2px solid ${state.language === l.name ? 'var(--primary-green)' : '#b0bec5'}; display: flex; align-items: center; justify-content: center;">
                    ${state.language === l.name ? '<div style="width: 12px; height: 12px; background: var(--primary-green); border-radius: 50%;"></div>' : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <button onclick="navigateToScreen(4)" class="btn-primary">
            Continue in ${state.language} <i class="ri-arrow-right-line"></i>
          </button>
        </div>
      `;

    // =========================================================================
    // SCREEN 4: LOGIN SCREEN
    // =========================================================================
    case 4:
      return `
        <div style="padding: 24px 20px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; background: var(--surface-white);">
          <div>
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="width: 64px; height: 64px; background: var(--secondary-green-soft); border-radius: 18px; display: inline-flex; align-items: center; justify-content: center; color: var(--primary-green); font-size: 36px; margin-bottom: 12px;">
                <i class="ri-shield-user-line"></i>
              </div>
              <h2 style="font-size: 22px; font-weight: 800; color: var(--text-primary);">Welcome Back</h2>
              <p style="font-size: 13px; color: var(--text-secondary);">Login to book farm equipment & check weather</p>
            </div>

            <div class="form-group">
              <label><i class="ri-phone-line"></i> Mobile Number / Email</label>
              <input type="text" class="form-control" value="+91 98480 22338" placeholder="Enter 10-digit mobile number">
            </div>

            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="margin-bottom:0;"><i class="ri-lock-password-line"></i> Password</label>
                <a href="#" style="font-size: 12px; color: var(--primary-green); font-weight: 600; text-decoration: none;">Forgot?</a>
              </div>
              <input type="password" class="form-control" value="••••••••" placeholder="Enter password">
            </div>

            <button onclick="navigateToScreen(7)" class="btn-primary" style="margin-top: 10px;">
              Login to AgriRide <i class="ri-login-circle-line"></i>
            </button>

            <div style="text-align: center; margin: 20px 0; font-size: 12px; color: var(--text-secondary); position: relative;">
              <span style="background: #fff; padding: 0 10px; position: relative; z-index: 1;">OR CONTINUE WITH</span>
              <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #e0e0e0; z-index: 0;"></div>
            </div>

            <button class="btn-outline" style="display: flex; align-items: center; justify-content: center; gap: 10px;">
              <i class="ri-google-fill" style="color: #ea4335; font-size: 18px;"></i> Sign in with Google
            </button>
          </div>

          <div style="text-align: center; font-size: 13px; color: var(--text-secondary);">
            Don't have an account? 
            <a onclick="navigateToScreen(5)" style="color: var(--primary-green); font-weight: 700; cursor: pointer; text-decoration: underline;">Create Account</a>
          </div>
        </div>
      `;

    // =========================================================================
    // SCREEN 5: REGISTER SCREEN
    // =========================================================================
    case 5:
      return `
        <div style="padding: 20px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; background: var(--bg-app); overflow-y: auto;">
          <div>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
              <button onclick="navigateToScreen(4)" class="bar-btn" style="border:none; background:#fff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;"><i class="ri-arrow-left-line"></i></button>
              <div>
                <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Create Account</h2>
                <p style="font-size: 12px; color: var(--text-secondary);">Join AgriRide agricultural network</p>
              </div>
            </div>

            <!-- Role Selector -->
            <div style="margin-bottom: 16px;">
              <label style="font-size: 12px; font-weight: 700; color: var(--text-primary); display: block; margin-bottom: 8px;">Select User Role:</label>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                <div onclick="selectRegisterRole('farmer')" style="background: ${state.role === 'farmer' ? 'var(--primary-green)' : '#fff'}; color: ${state.role === 'farmer' ? '#fff' : 'var(--text-primary)'}; padding: 10px 4px; border-radius: 12px; text-align: center; cursor: pointer; border: 1px solid rgba(0,0,0,0.08); font-size: 12px; font-weight: 700;">
                  <i class="ri-user-3-line"></i><br>Farmer
                </div>
                <div onclick="selectRegisterRole('owner')" style="background: ${state.role === 'owner' ? 'var(--primary-green)' : '#fff'}; color: ${state.role === 'owner' ? '#fff' : 'var(--text-primary)'}; padding: 10px 4px; border-radius: 12px; text-align: center; cursor: pointer; border: 1px solid rgba(0,0,0,0.08); font-size: 12px; font-weight: 700;">
                  <i class="ri-truck-line"></i><br>Owner
                </div>
                <div onclick="selectRegisterRole('worker')" style="background: ${state.role === 'worker' ? 'var(--primary-green)' : '#fff'}; color: ${state.role === 'worker' ? '#fff' : 'var(--text-primary)'}; padding: 10px 4px; border-radius: 12px; text-align: center; cursor: pointer; border: 1px solid rgba(0,0,0,0.08); font-size: 12px; font-weight: 700;">
                  <i class="ri-hard-hat-line"></i><br>Worker
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Full Name</label>
              <input type="text" class="form-control" value="Ravi Kumar" placeholder="Enter your full name">
            </div>

            <div class="form-group">
              <label>Mobile Number</label>
              <input type="text" class="form-control" value="+91 98480 22338" placeholder="10-digit mobile number">
            </div>

            <div class="form-group">
              <label>Farm / District Location</label>
              <input type="text" class="form-control" value="Vijayawada, Andhra Pradesh" placeholder="e.g. Vijayawada, AP">
            </div>

            <div class="form-group">
              <label>Create Password</label>
              <input type="password" class="form-control" value="••••••••" placeholder="Create strong password">
            </div>
          </div>

          <button onclick="navigateToScreen(6)" class="btn-primary" style="margin-top: 16px;">
            Send OTP Verification <i class="ri-arrow-right-line"></i>
          </button>
        </div>
      `;

    // =========================================================================
    // SCREEN 6: OTP VERIFICATION
    // =========================================================================
    case 6:
      return `
        <div style="padding: 24px 20px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; background: #fff; text-align: center;">
          <div>
            <div style="width: 72px; height: 72px; background: var(--secondary-green-soft); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: var(--primary-green); font-size: 38px; margin-top: 20px; margin-bottom: 16px;">
              <i class="ri-chat-check-line"></i>
            </div>
            <h2 style="font-size: 22px; font-weight: 800; color: var(--text-primary);">Verify Mobile</h2>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">Enter the 6-digit OTP code sent to<br><b style="color: var(--text-primary);">+91 98480 22338</b></p>

            <!-- 6 PIN BOXES -->
            <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 24px;">
              <input type="text" maxlength="1" value="5" style="width: 44px; height: 50px; text-align: center; font-size: 20px; font-weight: 800; border: 2px solid var(--primary-green); border-radius: 10px; background: #f8faf9;">
              <input type="text" maxlength="1" value="8" style="width: 44px; height: 50px; text-align: center; font-size: 20px; font-weight: 800; border: 2px solid var(--primary-green); border-radius: 10px; background: #f8faf9;">
              <input type="text" maxlength="1" value="2" style="width: 44px; height: 50px; text-align: center; font-size: 20px; font-weight: 800; border: 2px solid var(--primary-green); border-radius: 10px; background: #f8faf9;">
              <input type="text" maxlength="1" value="9" style="width: 44px; height: 50px; text-align: center; font-size: 20px; font-weight: 800; border: 2px solid var(--primary-green); border-radius: 10px; background: #f8faf9;">
              <input type="text" maxlength="1" value="1" style="width: 44px; height: 50px; text-align: center; font-size: 20px; font-weight: 800; border: 2px solid var(--primary-green); border-radius: 10px; background: #f8faf9;">
              <input type="text" maxlength="1" value="4" style="width: 44px; height: 50px; text-align: center; font-size: 20px; font-weight: 800; border: 2px solid var(--primary-green); border-radius: 10px; background: #f8faf9;">
            </div>

            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 10px;">
              Resend OTP in <span style="font-weight: 700; color: var(--accent-yellow);">00:45</span>
            </p>
            <button onclick="showToast('New OTP sent to +91 98480 22338')" style="border: none; background: transparent; color: var(--primary-green); font-weight: 700; font-size: 13px; cursor: pointer;">Resend OTP</button>
          </div>

          <button onclick="handleOTPVerify()" class="btn-primary">
            Verify & Create Account <i class="ri-checkbox-circle-line"></i>
          </button>
        </div>
      `;

    // =========================================================================
    // SCREEN 7: FARMER HOME DASHBOARD
    // =========================================================================
    case 7:
      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <!-- Top App Header -->
          <div style="background: linear-gradient(135deg, var(--primary-green), #0d3810); padding: 16px 20px 24px 20px; color: #fff; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div>
                <p style="font-size: 12px; color: #a5d6a7; font-weight: 600;">Good Morning 👋</p>
                <h3 style="font-size: 19px; font-weight: 800; color: #fff;">Ravi Kumar</h3>
              </div>
              <div style="display: flex; gap: 8px;">
                <div onclick="navigateToScreen(20)" style="width: 36px; height: 36px; background: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative;">
                  <i class="ri-notification-3-line" style="font-size: 18px;"></i>
                  <span style="position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; background: var(--accent-yellow); border-radius: 50%;"></span>
                </div>
              </div>
            </div>

            <!-- Location Chip -->
            <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
              <i class="ri-map-pin-2-fill" style="color: var(--accent-yellow);"></i> Vijayawada, Andhra Pradesh
            </div>
          </div>

          <!-- Content Scroll -->
          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <!-- Weather Card Widget -->
            <div onclick="navigateToScreen(19)" class="agri-card clickable" style="background: linear-gradient(135deg, #2e7d32, #4caf50); color: #fff; margin-top: -30px; position: relative; z-index: 10;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span class="badge" style="background: rgba(255,255,255,0.2); color: #fff; margin-bottom: 6px;"><i class="ri-sun-cloudy-fill"></i> Today's Forecast</span>
                  <h2 style="font-size: 28px; font-weight: 800; margin: 4px 0;">28°C <span style="font-size: 14px; font-weight: 500;">Partly Cloudy</span></h2>
                  <p style="font-size: 12px; opacity: 0.9;">Rainfall probability: 20% • Wind: 14 km/h</p>
                </div>
                <i class="ri-sun-cloudy-line" style="font-size: 52px; color: var(--accent-yellow);"></i>
              </div>
            </div>

            <!-- Search Bar -->
            <div onclick="navigateToScreen(9)" style="background: #fff; padding: 12px 16px; border-radius: 16px; display: flex; align-items: center; gap: 10px; box-shadow: var(--shadow-sm); border: 1px solid #e0e0e0; margin-bottom: 16px; cursor: pointer;">
              <i class="ri-search-line" style="font-size: 18px; color: var(--text-secondary);"></i>
              <span style="font-size: 13px; color: var(--text-secondary);">Search tractors, harvesters, sprayers...</span>
            </div>

            <!-- Quick Actions Grid -->
            <h4 style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px;">Quick Services</h4>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px;">
              <div onclick="navigateToScreen(8)" style="background: #fff; padding: 12px 6px; border-radius: 14px; text-align: center; cursor: pointer; box-shadow: var(--shadow-sm);">
                <div style="width: 40px; height: 40px; background: #e8f5e9; color: var(--primary-green); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px auto; font-size: 20px;"><i class="ri-truck-line"></i></div>
                <span style="font-size: 11px; font-weight: 700; color: var(--text-primary); display: block;">Book Equipment</span>
              </div>
              <div onclick="navigateToScreen(17)" style="background: #fff; padding: 12px 6px; border-radius: 14px; text-align: center; cursor: pointer; box-shadow: var(--shadow-sm);">
                <div style="width: 40px; height: 40px; background: #fffde7; color: var(--warning); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px auto; font-size: 20px;"><i class="ri-file-list-3-line"></i></div>
                <span style="font-size: 11px; font-weight: 700; color: var(--text-primary); display: block;">My Bookings</span>
              </div>
              <div onclick="navigateToScreen(21)" style="background: #fff; padding: 12px 6px; border-radius: 14px; text-align: center; cursor: pointer; box-shadow: var(--shadow-sm);">
                <div style="width: 40px; height: 40px; background: #e3f2fd; color: #1976d2; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px auto; font-size: 20px;"><i class="ri-plant-line"></i></div>
                <span style="font-size: 11px; font-weight: 700; color: var(--text-primary); display: block;">Soil Advisor</span>
              </div>
              <div onclick="navigateToScreen(18)" style="background: #fff; padding: 12px 6px; border-radius: 14px; text-align: center; cursor: pointer; box-shadow: var(--shadow-sm);">
                <div style="width: 40px; height: 40px; background: #f3e5f5; color: #7b1fa2; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px auto; font-size: 20px;"><i class="ri-map-pin-user-line"></i></div>
                <span style="font-size: 11px; font-weight: 700; color: var(--text-primary); display: block;">Live Track</span>
              </div>
            </div>

            <!-- Upcoming Booking Card -->
            <div onclick="navigateToScreen(17)" class="agri-card" style="border-left: 4px solid var(--secondary-green);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Upcoming Booking</span>
                <span class="badge badge-success">Confirmed</span>
              </div>
              <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary);">Mahindra 575 DI Tractor</h4>
              <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">28 Aug 2026 • 7:00 AM – 10:00 AM • Vijayawada Rural</p>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f0f0f0; padding-top: 8px;">
                <span style="font-size: 14px; font-weight: 800; color: var(--primary-green);">₹4,800 Total</span>
                <button onclick="event.stopPropagation(); navigateToScreen(18);" style="background: var(--primary-green); color: #fff; border: none; padding: 6px 14px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer;">Track GPS <i class="ri-navigation-line"></i></button>
              </div>
            </div>

            <!-- Recommended Equipment -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h4 style="font-size: 14px; font-weight: 700; color: var(--text-primary);">Top Nearby Equipment</h4>
              <a onclick="navigateToScreen(9)" style="font-size: 12px; color: var(--primary-green); font-weight: 700; cursor: pointer;">See All</a>
            </div>

            <div onclick="navigateToScreen(10)" class="agri-card clickable" style="display: flex; gap: 12px; align-items: center;">
              <div style="width: 70px; height: 70px; background: #e8f5e9; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--primary-green); font-size: 36px; flex-shrink: 0;">
                <i class="ri-truck-fill"></i>
              </div>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between;">
                  <h4 style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Mahindra 575 DI</h4>
                  <span style="font-size: 12px; font-weight: 700; color: var(--warning);"><i class="ri-star-fill"></i> 4.8</span>
                </div>
                <p style="font-size: 11px; color: var(--text-secondary);">Owner: Ramesh Patel • 3.5 km away</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                  <span style="font-size: 13px; font-weight: 800; color: var(--primary-green);">₹1,200 <small style="font-size:10px; color:var(--text-secondary);">/ acre</small></span>
                  <span class="badge badge-success">Available Today</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Navigation -->
          ${renderBottomNav(7, 'home')}
        </div>
      `;

    // =========================================================================
    // SCREEN 8: EQUIPMENT CATEGORIES
    // =========================================================================
    case 8:
      const cats = [
        { name: 'Tractor', icon: 'ri-truck-line', count: '42 Available', bg: '#e8f5e9', color: '#2e7d32' },
        { name: 'Plough', icon: 'ri-compasses-2-line', count: '18 Available', bg: '#fffde7', color: '#f57f17' },
        { name: 'Sprayer', icon: 'ri-drop-line', count: '25 Available', bg: '#e3f2fd', color: '#1976d2' },
        { name: 'Harvester', icon: 'ri-scissors-2-line', count: '12 Available', bg: '#f3e5f5', color: '#7b1fa2' },
        { name: 'Seeder', icon: 'ri-seedling-line', count: '15 Available', bg: '#e0f2f1', color: '#00695c' },
        { name: 'Cultivator', icon: 'ri-recycle-line', count: '20 Available', bg: '#efebe9', color: '#4e342e' },
        { name: 'Crop Cutter', icon: 'ri-knife-line', count: '10 Available', bg: '#ffebee', color: '#c62828' },
        { name: 'Other Equipment', icon: 'ri-more-fill', count: '30+ Available', bg: '#eceff1', color: '#37474f' }
      ];

      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div class="mobile-app-bar green-header">
            <button onclick="navigateToScreen(7)" class="bar-btn" style="border:none;"><i class="ri-arrow-left-line"></i></button>
            <span class="bar-title">Equipment Categories</span>
            <button onclick="navigateToScreen(9)" class="bar-btn" style="border:none;"><i class="ri-search-line"></i></button>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">Select category to find verified machines near Vijayawada:</p>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;">
              ${cats.map(c => `
                <div onclick="navigateToScreen(9)" class="agri-card clickable" style="text-align: center; padding: 20px 12px; margin-bottom: 0;">
                  <div style="width: 54px; height: 54px; background: ${c.bg}; color: ${c.color}; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto; font-size: 28px;">
                    <i class="${c.icon}"></i>
                  </div>
                  <h4 style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px;">${c.name}</h4>
                  <span style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">${c.count}</span>
                </div>
              `).join('')}
            </div>
          </div>
          ${renderBottomNav(8, 'home')}
        </div>
      `;

    // =========================================================================
    // SCREEN 9: EQUIPMENT SEARCH & FILTER
    // =========================================================================
    case 9:
      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <!-- Top App Bar -->
          <div style="background: #fff; padding: 12px 16px; border-bottom: 1px solid #e0e0e0;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <button onclick="navigateToScreen(7)" style="border:none; background:none; font-size: 20px; cursor:pointer;"><i class="ri-arrow-left-line"></i></button>
              <div style="flex:1; background: #f0f4f1; padding: 8px 14px; border-radius: 20px; display: flex; align-items: center; gap: 8px;">
                <i class="ri-search-line" style="color: var(--text-secondary);"></i>
                <input type="text" value="Tractor" placeholder="Search equipment..." style="border:none; background:transparent; outline:none; font-size: 13px; font-weight:600; width:100%;">
              </div>
            </div>

            <!-- Horizontal Filter Chips -->
            <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
              <span class="badge" style="background: var(--primary-green); color: #fff; flex-shrink:0;">Type: Tractor <i class="ri-close-line"></i></span>
              <span class="badge" style="background: #eef2f5; color: var(--text-primary); flex-shrink:0;">Price <i class="ri-arrow-down-s-line"></i></span>
              <span class="badge" style="background: #eef2f5; color: var(--text-primary); flex-shrink:0;">Distance <i class="ri-arrow-down-s-line"></i></span>
              <span class="badge" style="background: #eef2f5; color: var(--text-primary); flex-shrink:0;">Rating 4.0+</span>
            </div>
          </div>

          <!-- Search Results -->
          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <p style="font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 12px;">Found 14 Available Machines Near Vijayawada</p>

            <!-- Card 1 -->
            <div onclick="navigateToScreen(10)" class="agri-card clickable" style="margin-bottom: 14px;">
              <div style="display: flex; gap: 12px;">
                <div style="width: 80px; height: 80px; background: #e8f5e9; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: var(--primary-green); font-size: 42px; flex-shrink:0;">
                  <i class="ri-truck-line"></i>
                </div>
                <div style="flex: 1;">
                  <div style="display: flex; justify-content: space-between;">
                    <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary);">Mahindra 575 DI Tractor</h4>
                    <span style="font-size: 12px; font-weight: 700; color: var(--warning);"><i class="ri-star-fill"></i> 4.8</span>
                  </div>
                  <p style="font-size: 12px; color: var(--text-secondary);">Owner: Ramesh Patel • Kanchikacherla</p>
                  <p style="font-size: 11px; color: #2e7d32; font-weight: 600; margin-top: 2px;"><i class="ri-map-pin-line"></i> 3.5 km away • Available Today</p>

                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; border-top: 1px solid #f0f0f0; padding-top: 8px;">
                    <span style="font-size: 15px; font-weight: 800; color: var(--primary-green);">₹1,200 <small style="font-size:10px; color:var(--text-secondary);">/ acre</small></span>
                    <button class="btn-primary" style="width: auto; padding: 6px 16px; font-size: 12px;">Book Now</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card 2 -->
            <div onclick="navigateToScreen(10)" class="agri-card clickable" style="margin-bottom: 14px;">
              <div style="display: flex; gap: 12px;">
                <div style="width: 80px; height: 80px; background: #eef2f5; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #1565c0; font-size: 42px; flex-shrink:0;">
                  <i class="ri-truck-line"></i>
                </div>
                <div style="flex: 1;">
                  <div style="display: flex; justify-content: space-between;">
                    <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary);">John Deere 5050D</h4>
                    <span style="font-size: 12px; font-weight: 700; color: var(--warning);"><i class="ri-star-fill"></i> 4.9</span>
                  </div>
                  <p style="font-size: 12px; color: var(--text-secondary);">Owner: Venkatesh Rao • Ibrahimpatnam</p>
                  <p style="font-size: 11px; color: #2e7d32; font-weight: 600; margin-top: 2px;"><i class="ri-map-pin-line"></i> 5.2 km away • Available Today</p>

                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; border-top: 1px solid #f0f0f0; padding-top: 8px;">
                    <span style="font-size: 15px; font-weight: 800; color: var(--primary-green);">₹1,500 <small style="font-size:10px; color:var(--text-secondary);">/ acre</small></span>
                    <button class="btn-primary" style="width: auto; padding: 6px 16px; font-size: 12px;">Book Now</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          ${renderBottomNav(9, 'home')}
        </div>
      `;

    // =========================================================================
    // SCREEN 10: EQUIPMENT DETAILS
    // =========================================================================
    case 10:
      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div style="position: relative; height: 200px; background: linear-gradient(135deg, #1b5e20, #4caf50); display: flex; align-items: center; justify-content: center; color: #fff;">
            <button onclick="navigateToScreen(9)" style="position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.3); border:none; width:36px; height:36px; border-radius:50%; color:#fff; font-size:20px; cursor:pointer;"><i class="ri-arrow-left-line"></i></button>
            <i class="ri-truck-fill" style="font-size: 90px; color: rgba(255,255,255,0.9);"></i>
            <span class="badge badge-success" style="position: absolute; bottom: 12px; right: 12px;">Available Today</span>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div>
                <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary);">Mahindra 575 DI Tractor</h2>
                <p style="font-size: 12px; color: var(--text-secondary);"><i class="ri-map-pin-line"></i> Kanchikacherla, Vijayawada Rural (3.5 km away)</p>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 18px; font-weight: 800; color: var(--primary-green);">₹1,200</span>
                <p style="font-size: 10px; color: var(--text-secondary);">per acre</p>
              </div>
            </div>

            <!-- Owner Info Box -->
            <div class="agri-card" style="display: flex; align-items: center; gap: 12px; background: #fff;">
              <div style="width: 44px; height: 44px; background: var(--secondary-green-soft); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--primary-green); font-weight: 800;">
                RP
              </div>
              <div style="flex: 1;">
                <h4 style="font-size: 13px; font-weight: 800; color: var(--text-primary);">Ramesh Patel</h4>
                <p style="font-size: 11px; color: var(--text-secondary);">Verified Owner • 120+ Completed Bookings</p>
              </div>
              <span style="font-size: 12px; font-weight: 700; color: var(--warning);"><i class="ri-star-fill"></i> 4.8 (42)</span>
            </div>

            <!-- Specs Grid -->
            <h4 style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Specifications</h4>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 14px;">
              <div style="background:#fff; padding:8px 12px; border-radius:10px; font-size:12px;"><i class="ri-dashboard-3-line" style="color:var(--primary-green);"></i> <b>Engine:</b> 50 HP</div>
              <div style="background:#fff; padding:8px 12px; border-radius:10px; font-size:12px;"><i class="ri-oil-line" style="color:var(--primary-green);"></i> <b>Fuel:</b> Included</div>
              <div style="background:#fff; padding:8px 12px; border-radius:10px; font-size:12px;"><i class="ri-user-follow-line" style="color:var(--primary-green);"></i> <b>Driver:</b> Provided</div>
              <div style="background:#fff; padding:8px 12px; border-radius:10px; font-size:12px;"><i class="ri-tools-line" style="color:var(--primary-green);"></i> <b>Attachment:</b> Rotavator</div>
            </div>

            <h4 style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">Description</h4>
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px;">
              Heavy duty 50HP Mahindra tractor equipped with 36-blade rotavator for deep ploughing and wet soil preparation. Driven by experienced worker Suresh.
            </p>
          </div>

          <!-- Bottom Booking Action -->
          <div style="padding: 12px 16px; background: #fff; border-top: 1px solid #e0e0e0;">
            <button onclick="navigateToScreen(11)" class="btn-primary">
              Book Now — Select Farm Activity <i class="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
      `;

    // =========================================================================
    // SCREEN 11: SELECT FARM ACTIVITY
    // =========================================================================
    case 11:
      const activities = [
        { name: 'Ploughing', icon: 'ri-compasses-2-line', desc: 'Deep soil turning & preparation' },
        { name: 'Sowing', icon: 'ri-seedling-line', desc: 'Seed planting & row formation' },
        { name: 'Fertilizer Spraying', icon: 'ri-drop-line', desc: 'Liquid or granule fertilizer application' },
        { name: 'Pesticide Spraying', icon: 'ri-shield-flash-line', desc: 'Crop protection against pests' },
        { name: 'Crop Cutting', icon: 'ri-knife-line', desc: 'Stalk cutting & straw management' },
        { name: 'Harvesting', icon: 'ri-scissors-2-line', desc: 'Paddy or grain threshing & cutting' }
      ];

      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div class="mobile-app-bar green-header">
            <button onclick="navigateToScreen(10)" class="bar-btn" style="border:none;"><i class="ri-arrow-left-line"></i></button>
            <span class="bar-title">Select Activity</span>
            <span></span>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">What work do you need equipment for?</h3>
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">Choose farming activity for Mahindra 575 DI Tractor:</p>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${activities.map(a => `
                <div onclick="selectActivity('${a.name}')" class="agri-card clickable" style="display: flex; align-items: center; gap: 12px; margin-bottom: 0; border: 2px solid ${state.booking.activity === a.name ? 'var(--primary-green)' : 'transparent'}; background: ${state.booking.activity === a.name ? 'var(--secondary-green-soft)' : '#fff'};">
                  <div style="width: 44px; height: 44px; background: ${state.booking.activity === a.name ? 'var(--primary-green)' : '#e8f5e9'}; color: ${state.booking.activity === a.name ? '#fff' : 'var(--primary-green)'}; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px;">
                    <i class="${a.icon}"></i>
                  </div>
                  <div style="flex: 1;">
                    <h4 style="font-size: 14px; font-weight: 800; color: var(--text-primary);">${a.name}</h4>
                    <p style="font-size: 11px; color: var(--text-secondary);">${a.desc}</p>
                  </div>
                  <i class="ri-checkbox-circle-fill" style="font-size: 22px; color: ${state.booking.activity === a.name ? 'var(--primary-green)' : '#cfd8dc'};"></i>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="padding: 12px 16px; background: #fff; border-top: 1px solid #e0e0e0;">
            <button onclick="navigateToScreen(12)" class="btn-primary">
              Continue to Booking Form <i class="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
      `;

    // =========================================================================
    // SCREEN 12: BOOKING DETAILS FORM
    // =========================================================================
    case 12:
      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div class="mobile-app-bar green-header">
            <button onclick="navigateToScreen(11)" class="bar-btn" style="border:none;"><i class="ri-arrow-left-line"></i></button>
            <span class="bar-title">Booking Details</span>
            <span></span>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <div class="form-group">
              <label><i class="ri-map-pin-line"></i> Farm Location / Landmark</label>
              <input type="text" class="form-control" value="${state.booking.location}">
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
              <div class="form-group">
                <label><i class="ri-calendar-line"></i> Date</label>
                <input type="text" class="form-control" value="28 August 2026">
              </div>
              <div class="form-group">
                <label><i class="ri-time-line"></i> Start Time</label>
                <input type="text" class="form-control" value="07:00 AM">
              </div>
            </div>

            <div class="form-group">
              <label><i class="ri-landscape-line"></i> Number of Acres</label>
              <div style="display: flex; align-items: center; gap: 10px; background: #fff; padding: 8px 12px; border-radius: 12px; border: 1.5px solid #cfd8dc;">
                <button onclick="changeAcres(-1)" style="width: 32px; height: 32px; border-radius: 8px; border: none; background: #e0e0e0; font-size: 18px; cursor: pointer;">-</button>
                <span style="flex: 1; text-align: center; font-size: 16px; font-weight: 800; color: var(--text-primary);">${state.booking.acres} Acres</span>
                <button onclick="changeAcres(1)" style="width: 32px; height: 32px; border-radius: 8px; border: none; background: var(--primary-green); color: #fff; font-size: 18px; cursor: pointer;">+</button>
              </div>
            </div>

            <div class="form-group">
              <label><i class="ri-tools-line"></i> Selected Farming Activity</label>
              <input type="text" class="form-control" value="${state.booking.activity}" readonly style="background: #e8f5e9; font-weight: 700; color: var(--primary-green);">
            </div>

            <div class="form-group">
              <label><i class="ri-file-text-line"></i> Additional Instructions to Driver</label>
              <input type="text" class="form-control" placeholder="e.g. Wet clay soil near canal side">
            </div>

            <!-- Price Breakdown Banner -->
            <div class="agri-card" style="background: linear-gradient(135deg, #1b5e20, #2e7d32); color: #fff; margin-top: 10px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; opacity: 0.9;">
                <span>Price per acre: ₹1,200</span>
                <span>Land Size: ${state.booking.acres} Acres</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 8px;">
                <span style="font-size: 13px; font-weight: 600;">Estimated Total Cost:</span>
                <span style="font-size: 20px; font-weight: 800; color: var(--accent-yellow);">₹${state.booking.acres * 1200}</span>
              </div>
            </div>
          </div>

          <div style="padding: 12px 16px; background: #fff; border-top: 1px solid #e0e0e0;">
            <button onclick="navigateToScreen(13)" class="btn-primary">
              Check Smart Weather Availability <i class="ri-sun-cloudy-line"></i>
            </button>
          </div>
        </div>
      `;

    // =========================================================================
    // SCREEN 13: SMART SCHEDULING (AI & WEATHER RECOMMENDATION)
    // =========================================================================
    case 13:
      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div class="mobile-app-bar green-header">
            <button onclick="navigateToScreen(12)" class="bar-btn" style="border:none;"><i class="ri-arrow-left-line"></i></button>
            <span class="bar-title">Smart Scheduling</span>
            <span class="badge" style="background: var(--accent-yellow); color: #000;">AI Weather</span>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <div style="background: #fff; padding: 12px 16px; border-radius: 14px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 11px; color: var(--text-secondary); font-weight: 600;">Selected Date</span>
                <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary);"><i class="ri-calendar-event-line" style="color: var(--primary-green);"></i> 28 August 2026</h4>
              </div>
              <span class="badge badge-info">Vijayawada</span>
            </div>

            <h4 style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px;">Available Booking Time Slots:</h4>

            <!-- SLOT 1: BEST TIME -->
            <div onclick="selectTimeSlot('7:00 AM – 10:00 AM')" class="agri-card clickable" style="border: 2px solid var(--primary-green); background: #f1f8e9;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <span class="badge" style="background: var(--primary-green); color: #fff; margin-bottom: 6px;"><i class="ri-thumb-up-fill"></i> RECOMMENDED TIME</span>
                  <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary);">7:00 AM – 10:00 AM</h3>
                  <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                    <i class="ri-checkbox-circle-fill" style="color: var(--success);"></i> Equipment: Available<br>
                    <i class="ri-sun-fill" style="color: var(--accent-yellow);"></i> Weather: Sunny (10% Rain)
                  </p>
                </div>
                <span class="badge badge-success" style="font-size: 12px; padding: 6px 12px;">BEST TIME</span>
              </div>
            </div>

            <!-- SLOT 2: NOT RECOMMENDED -->
            <div class="agri-card" style="border: 1px solid #ffe0b2; background: #fff8e1; opacity: 0.95;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <span class="badge badge-warning" style="margin-bottom: 6px;"><i class="ri-alert-line"></i> HIGH RAIN RISK</span>
                  <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary);">10:00 AM – 1:00 PM</h3>
                  <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                    <i class="ri-checkbox-circle-fill" style="color: var(--success);"></i> Equipment: Available<br>
                    <i class="ri-rainy-fill" style="color: #1976d2;"></i> Weather: Heavy Rain Expected (75%)
                  </p>
                </div>
                <span class="badge badge-warning">Not Recommended</span>
              </div>
            </div>

            <!-- SLOT 3: BOOKED -->
            <div class="agri-card" style="opacity: 0.5; background: #fafafa;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <h3 style="font-size: 16px; font-weight: 700; color: var(--text-secondary);">2:00 PM – 5:00 PM</h3>
                  <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                    <i class="ri-close-circle-fill" style="color: var(--error);"></i> Equipment: Already Booked
                  </p>
                </div>
                <span class="badge badge-error">Unavailable</span>
              </div>
            </div>

            <!-- Recommendation Reason Box -->
            <div style="background: #e8f5e9; border: 1px solid #a5d6a7; padding: 12px; border-radius: 12px; display: flex; gap: 10px; align-items: center;">
              <i class="ri-lightbulb-flash-line" style="font-size: 24px; color: var(--primary-green);"></i>
              <p style="font-size: 11px; color: #1b5e20; line-weight: 1.4;">
                <b>AgriRide AI Recommendation:</b> 7:00 AM – 10:00 AM is optimal due to low rainfall probability and optimal tractor engine torque in cool morning soil.
              </p>
            </div>
          </div>

          <div style="padding: 12px 16px; background: #fff; border-top: 1px solid #e0e0e0;">
            <button onclick="navigateToScreen(14)" class="btn-primary">
              Select Recommended Time (7:00 AM) <i class="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
      `;

    // =========================================================================
    // SCREEN 14: BOOKING SUMMARY
    // =========================================================================
    case 14:
      const totalAmount = state.booking.acres * 1200;

      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div class="mobile-app-bar green-header">
            <button onclick="navigateToScreen(13)" class="bar-btn" style="border:none;"><i class="ri-arrow-left-line"></i></button>
            <span class="bar-title">Booking Summary</span>
            <span></span>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <div class="agri-card" style="margin-bottom: 14px;">
              <h4 style="font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 12px;">Booking Details</h4>
              
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                <span style="color: var(--text-secondary);">Equipment:</span>
                <span style="font-weight: 700; color: var(--text-primary);">${state.booking.equipment}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                <span style="color: var(--text-secondary);">Vehicle Owner:</span>
                <span style="font-weight: 700; color: var(--text-primary);">${state.booking.owner}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                <span style="color: var(--text-secondary);">Location:</span>
                <span style="font-weight: 700; color: var(--text-primary);">Vijayawada, AP</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                <span style="color: var(--text-secondary);">Activity:</span>
                <span style="font-weight: 700; color: var(--primary-green);">${state.booking.activity}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                <span style="color: var(--text-secondary);">Date & Slot:</span>
                <span style="font-weight: 700; color: var(--text-primary);">28 Aug • 7:00-10:00 AM</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                <span style="color: var(--text-secondary);">Land Size:</span>
                <span style="font-weight: 700; color: var(--text-primary);">${state.booking.acres} Acres</span>
              </div>
            </div>

            <!-- Price Breakdown -->
            <div class="agri-card">
              <h4 style="font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 12px;">Fare Breakdown</h4>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                <span style="color: var(--text-secondary);">Rate (₹1,200 × ${state.booking.acres} Acres):</span>
                <span style="font-weight: 600;">₹${totalAmount}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                <span style="color: var(--text-secondary);">Service Fee:</span>
                <span style="color: var(--text-primary); font-weight: 700;">₹150</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; border-top: 1px dashed #e0e0e0; padding-top: 10px; margin-top: 6px;">
                <span>Total Payable Amount:</span>
                <span style="color: var(--primary-green);">₹4,950</span>
              </div>
            </div>
          </div>

          <div style="padding: 12px 16px; background: #fff; border-top: 1px solid #e0e0e0; display: flex; gap: 10px;">
            <button onclick="navigateToScreen(12)" class="btn-outline" style="width: 40%;">Edit</button>
            <button onclick="navigateToScreen(15)" class="btn-primary" style="flex: 1;">Confirm & Pay <i class="ri-arrow-right-line"></i></button>
          </div>
        </div>
      `;

    // =========================================================================
    // SCREEN 15: PAYMENT OPTIONS
    // =========================================================================
    case 15:
      const payMethods = [
        { id: 'UPI', name: 'UPI (PhonePe / Google Pay / BHIM)', icon: 'ri-qr-code-line', sub: 'Instant payment via UPI ID' },
        { id: 'CARD', name: 'Credit / Debit Card', icon: 'ri-bank-card-line', sub: 'Visa, Mastercard, RuPay' },
        { id: 'NETBANKING', name: 'Net Banking', icon: 'ri-building-line', sub: 'SBI, HDFC, ICICI, Andhra Bank' },
        { id: 'OFFLINE', name: 'Pay Cash on Field', icon: 'ri-hand-coin-line', sub: 'Pay tractor driver after work' }
      ];

      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div class="mobile-app-bar green-header">
            <button onclick="navigateToScreen(14)" class="bar-btn" style="border:none;"><i class="ri-arrow-left-line"></i></button>
            <span class="bar-title">Payment Options</span>
            <span></span>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <!-- Amount Banner -->
            <div style="background: linear-gradient(135deg, #1b5e20, #0d3810); color: #fff; padding: 16px; border-radius: 16px; text-align: center; margin-bottom: 16px;">
              <span style="font-size: 12px; opacity: 0.8;">Total Amount Due</span>
              <h1 style="font-size: 32px; font-weight: 800; color: var(--accent-yellow); margin-top: 2px;">₹4,950</h1>
            </div>

            <h4 style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px;">Select Payment Mode:</h4>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${payMethods.map(p => `
                <div onclick="selectPaymentMethod('${p.id}')" class="agri-card clickable" style="display: flex; align-items: center; gap: 12px; margin-bottom: 0; border: 2px solid ${state.booking.paymentMethod === p.id ? 'var(--primary-green)' : 'transparent'};">
                  <div style="width: 42px; height: 42px; background: #e8f5e9; color: var(--primary-green); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px;">
                    <i class="${p.icon}"></i>
                  </div>
                  <div style="flex: 1;">
                    <h4 style="font-size: 13px; font-weight: 800; color: var(--text-primary);">${p.name}</h4>
                    <p style="font-size: 11px; color: var(--text-secondary);">${p.sub}</p>
                  </div>
                  <div style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid ${state.booking.paymentMethod === p.id ? 'var(--primary-green)' : '#b0bec5'}; display: flex; align-items: center; justify-content: center;">
                    ${state.booking.paymentMethod === p.id ? '<div style="width: 10px; height: 10px; background: var(--primary-green); border-radius: 50%;"></div>' : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="padding: 12px 16px; background: #fff; border-top: 1px solid #e0e0e0;">
            <button onclick="navigateToScreen(16)" class="btn-primary">
              Pay ₹4,950 & Confirm Booking <i class="ri-shield-check-line"></i>
            </button>
          </div>
        </div>
      `;

    // =========================================================================
    // SCREEN 16: BOOKING SUCCESS
    // =========================================================================
    case 16:
      return `
        <div style="padding: 24px 20px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; background: #fff; text-align: center;">
          <div>
            <div style="width: 90px; height: 90px; background: #e8f5e9; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: var(--success); font-size: 54px; margin-top: 20px; margin-bottom: 16px; border: 4px solid #a5d6a7;">
              <i class="ri-checkbox-circle-fill"></i>
            </div>
            <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary);">Booking Confirmed!</h2>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Booking ID: <b style="color: var(--primary-green);">#AR20260825001</b></p>

            <div class="agri-card" style="text-align: left; background: var(--bg-app);">
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                <span style="color: var(--text-secondary);">Equipment:</span>
                <span style="font-weight: 700;">Mahindra 575 DI Tractor</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                <span style="color: var(--text-secondary);">Date & Time:</span>
                <span style="font-weight: 700;">28 Aug 2026 • 7:00 AM</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                <span style="color: var(--text-secondary);">Location:</span>
                <span style="font-weight: 700;">Vijayawada, Andhra Pradesh</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; border-top: 1px solid #e0e0e0; padding-top: 8px; margin-top: 6px;">
                <span>Amount Paid:</span>
                <span style="color: var(--primary-green);">₹4,950</span>
              </div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button onclick="navigateToScreen(18)" class="btn-primary">
              <i class="ri-navigation-line"></i> Track Vehicle Live GPS
            </button>
            <button onclick="navigateToScreen(17)" class="btn-secondary">
              View My Bookings
            </button>
            <button onclick="navigateToScreen(7)" class="btn-outline">
              Back to Home
            </button>
          </div>
        </div>
      `;

    // =========================================================================
    // SCREEN 17: MY BOOKINGS
    // =========================================================================
    case 17:
      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div class="mobile-app-bar green-header">
            <button onclick="navigateToScreen(7)" class="bar-btn" style="border:none;"><i class="ri-arrow-left-line"></i></button>
            <span class="bar-title">My Bookings</span>
            <span></span>
          </div>

          <!-- Tabs -->
          <div style="display: flex; background: #fff; border-bottom: 1px solid #e0e0e0;">
            <div style="flex:1; text-align:center; padding: 10px; font-size:12px; font-weight:700; color:var(--primary-green); border-bottom: 3px solid var(--primary-green);">Upcoming (1)</div>
            <div style="flex:1; text-align:center; padding: 10px; font-size:12px; font-weight:600; color:var(--text-secondary);">Active</div>
            <div style="flex:1; text-align:center; padding: 10px; font-size:12px; font-weight:600; color:var(--text-secondary);">Completed</div>
            <div style="flex:1; text-align:center; padding: 10px; font-size:12px; font-weight:600; color:var(--text-secondary);">Cancelled</div>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <!-- Booking Card 1 -->
            <div class="agri-card" style="margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary);">ID: #AR20260825001</span>
                <span class="badge badge-success">On The Way</span>
              </div>
              <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary);">Mahindra 575 DI Tractor</h4>
              <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;">Activity: Deep Ploughing (4 Acres)</p>
              <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;"><i class="ri-calendar-line"></i> 28 Aug 2026 • 7:00 AM – 10:00 AM</p>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f0f0f0; padding-top: 10px;">
                <span style="font-size: 15px; font-weight: 800; color: var(--primary-green);">₹4,800</span>
                <button onclick="navigateToScreen(18)" class="btn-primary" style="width: auto; padding: 6px 14px; font-size: 11px;">
                  Track Vehicle <i class="ri-navigation-line"></i>
                </button>
              </div>
            </div>

            <!-- Booking Card 2 (Completed) -->
            <div class="agri-card" style="opacity: 0.8;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary);">ID: #AR101902</span>
                <span class="badge badge-info">Completed</span>
              </div>
              <h4 style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Sonalika DI 750 Harvester</h4>
              <p style="font-size: 12px; color: var(--text-secondary);">14 August 2026 • Vijayawada Rural</p>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; border-top: 1px solid #f0f0f0; padding-top: 8px;">
                <span style="font-size: 13px; font-weight: 800;">₹9,600</span>
                <button onclick="showToast('Receipt downloaded!')" class="btn-outline" style="width: auto; padding: 4px 10px; font-size: 11px;">Invoice</button>
              </div>
            </div>
          </div>

          ${renderBottomNav(17, 'bookings')}
        </div>
      `;

    // =========================================================================
    // SCREEN 18: LIVE VEHICLE TRACKING (GPS MAP)
    // =========================================================================
    case 18:
      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: #e5e3df; position: relative;">
          <!-- Vector Map Background Visual -->
          <div style="position: absolute; inset: 0; background-image: radial-gradient(#2e7d32 1px, transparent 1px), radial-gradient(#1565c0 1px, #e5e3df 1px); background-size: 40px 40px; background-position: 0 0, 20px 20px;">
            <!-- Simulated Roads & Fields -->
            <svg width="100%" height="100%" style="position: absolute; inset:0;">
              <path d="M 40 100 Q 180 300 320 600" stroke="#ffffff" stroke-width="12" fill="none" />
              <path d="M 40 100 Q 180 300 320 600" stroke="#4caf50" stroke-width="6" stroke-dasharray="10 6" fill="none" />

              <!-- Farm Destination Marker -->
              <g transform="translate(320, 600)">
                <circle r="18" fill="rgba(27, 94, 32, 0.3)"/>
                <circle r="10" fill="#1b5e20"/>
                <text x="-24" y="28" font-size="11" font-weight="bold" fill="#1b5e20">Ravi's Farm</text>
              </g>

              <!-- Animated Tractor Marker -->
              <g transform="translate(180, 300)" id="tracking-tractor-marker">
                <circle r="22" fill="rgba(249, 168, 37, 0.4)"/>
                <circle r="14" fill="#f9a825"/>
                <text x="0" y="5" text-anchor="middle" font-size="14" fill="#fff">🚜</text>
              </g>
            </svg>
          </div>

          <!-- Top Floating Bar -->
          <div style="position: relative; z-index: 20; padding: 12px 16px;">
            <div style="background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); padding: 10px 14px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 16px rgba(0,0,0,0.15);">
              <button onclick="navigateToScreen(17)" style="border:none; background:none; font-size:20px; cursor:pointer;"><i class="ri-arrow-left-line"></i></button>
              <div style="text-align: center;">
                <span class="badge badge-success">GPS Live Tracking</span>
                <h4 style="font-size: 13px; font-weight: 800; color: var(--text-primary);">Mahindra 575 DI Tractor</h4>
              </div>
              <i class="ri-refresh-line" style="font-size: 18px; color: var(--primary-green);"></i>
            </div>
          </div>

          <!-- Bottom Floating Driver Info Card -->
          <div style="position: absolute; bottom: 0; left: 0; right: 0; z-index: 20; background: #fff; border-top-left-radius: 24px; border-top-right-radius: 24px; padding: 16px 20px; box-shadow: 0 -8px 24px rgba(0,0,0,0.15);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div>
                <span style="font-size: 11px; font-weight: 700; color: var(--primary-green); text-transform: uppercase;">Estimated Arrival</span>
                <h2 style="font-size: 22px; font-weight: 800; color: var(--text-primary);">12 Mins <small style="font-size:13px; font-weight:600; color:var(--text-secondary);">(2.4 km away)</small></h2>
              </div>
              <span class="badge badge-warning" style="font-size: 12px; padding: 6px 12px;">On Schedule</span>
            </div>

            <!-- Driver Row -->
            <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-app); padding: 10px 14px; border-radius: 14px; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 40px; height: 40px; background: var(--primary-green); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800;">
                  RP
                </div>
                <div>
                  <h4 style="font-size: 13px; font-weight: 800; color: var(--text-primary);">Ramesh Patel (Driver)</h4>
                  <p style="font-size: 11px; color: var(--text-secondary);">AP16 BK 4920 • ⭐ 4.9</p>
                </div>
              </div>

              <div style="display: flex; gap: 8px;">
                <button onclick="showToast('Calling Ramesh Patel (+91 98480 22338)...')" style="width: 36px; height: 36px; background: var(--primary-green); color: #fff; border:none; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer;">
                  <i class="ri-phone-fill"></i>
                </button>
                <button onclick="showToast('Opening Chat with Driver...')" style="width: 36px; height: 36px; background: var(--secondary-green-soft); color: var(--primary-green); border:none; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer;">
                  <i class="ri-message-3-fill"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

    // =========================================================================
    // SCREEN 19: WEATHER DASHBOARD
    // =========================================================================
    case 19:
      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div class="mobile-app-bar green-header">
            <button onclick="navigateToScreen(7)" class="bar-btn" style="border:none;"><i class="ri-arrow-left-line"></i></button>
            <span class="bar-title">Agri Weather Radar</span>
            <button onclick="navigateToScreen(20)" class="bar-btn" style="border:none;"><i class="ri-alarm-warning-line"></i></button>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <!-- Main Temp Display -->
            <div style="background: linear-gradient(135deg, #1b5e20, #2e7d32); color: #fff; padding: 20px; border-radius: 20px; text-align: center; margin-bottom: 16px;">
              <span style="font-size: 12px; color: #a5d6a7; font-weight: 600;">Vijayawada • Krishna District</span>
              <h1 style="font-size: 48px; font-weight: 800; margin: 4px 0; color: #fff;">28°C</h1>
              <p style="font-size: 14px; font-weight: 600; color: var(--accent-yellow);">Partly Cloudy • 20% Chance of Rain</p>

              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 16px; background: rgba(255,255,255,0.1); padding: 10px; border-radius: 12px; font-size: 11px;">
                <div><b>Humidity</b><br>72%</div>
                <div><b>Wind</b><br>14 km/h</div>
                <div><b>Sunrise</b><br>06:05 AM</div>
                <div><b>Sunset</b><br>06:38 PM</div>
              </div>
            </div>

            <!-- Farming Suitability Checklist -->
            <h4 style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px;">Farming Activity Suitability Today</h4>

            <div class="agri-card" style="display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; padding-bottom: 6px;">
                <span style="font-size: 13px; font-weight: 700; color: var(--text-primary);"><i class="ri-compasses-2-line" style="color:var(--primary-green);"></i> Ploughing</span>
                <span class="badge badge-success">Highly Suitable</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; padding-bottom: 6px;">
                <span style="font-size: 13px; font-weight: 700; color: var(--text-primary);"><i class="ri-drop-line" style="color:#1976d2;"></i> Chemical Spraying</span>
                <span class="badge badge-warning">Not Recommended (Wind 14km/h)</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 13px; font-weight: 700; color: var(--text-primary);"><i class="ri-scissors-2-line" style="color:#7b1fa2;"></i> Paddy Harvesting</span>
                <span class="badge badge-success">Suitable</span>
              </div>
            </div>

            <!-- 7-Day Forecast Scroll -->
            <h4 style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px;">7-Day Forecast</h4>
            <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 8px;">
              <div style="background: #fff; padding: 12px; border-radius: 14px; min-width: 76px; text-align: center; border: 2px solid var(--primary-green);">
                <span style="font-size: 11px; font-weight: 700;">Wed 28</span>
                <i class="ri-sun-cloudy-line" style="font-size: 24px; color: var(--warning); display: block; margin: 6px 0;"></i>
                <span style="font-size: 13px; font-weight: 800;">28°C</span>
              </div>
              <div style="background: #fff; padding: 12px; border-radius: 14px; min-width: 76px; text-align: center;">
                <span style="font-size: 11px; font-weight: 700;">Thu 29</span>
                <i class="ri-heavy-showers-line" style="font-size: 24px; color: #1976d2; display: block; margin: 6px 0;"></i>
                <span style="font-size: 13px; font-weight: 800;">24°C</span>
              </div>
              <div style="background: #fff; padding: 12px; border-radius: 14px; min-width: 76px; text-align: center;">
                <span style="font-size: 11px; font-weight: 700;">Fri 30</span>
                <i class="ri-sun-line" style="font-size: 24px; color: var(--warning); display: block; margin: 6px 0;"></i>
                <span style="font-size: 13px; font-weight: 800;">30°C</span>
              </div>
            </div>
          </div>

          ${renderBottomNav(19, 'home')}
        </div>
      `;

    // =========================================================================
    // SCREEN 20: WEATHER & DISASTER ALERTS
    // =========================================================================
    case 20:
      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div class="mobile-app-bar" style="background: #d32f2f; color: #fff;">
            <button onclick="navigateToScreen(19)" class="bar-btn" style="border:none; background:rgba(255,255,255,0.2); color:#fff;"><i class="ri-arrow-left-line"></i></button>
            <span class="bar-title">Weather & Disaster Alerts</span>
            <span></span>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <!-- Alert 1 -->
            <div class="agri-card" style="border-left: 4px solid var(--error);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span class="badge badge-error"><i class="ri-alarm-warning-fill"></i> SEVERE WEATHER WARNING</span>
                <span style="font-size: 11px; color: var(--text-secondary);">Issued Today</span>
              </div>
              <h4 style="font-size: 15px; font-weight: 800; color: var(--error);">Heavy Rainfall Expected Tomorrow</h4>
              <p style="font-size: 12px; color: var(--text-secondary); margin: 6px 0;">
                <b>Location:</b> Krishna & Guntur Mandals<br>
                <b>Expected Rainfall:</b> 65mm - 85mm
              </p>
              <div style="background: #ffebee; padding: 10px; border-radius: 8px; font-size: 11px; color: #b71c1c; margin-top: 8px;">
                <b>Recommended Action:</b> Complete grain harvesting and cover harvested crops with tarpaulin sheets before 6:00 PM today.
              </div>
            </div>

            <!-- Alert 2 -->
            <div class="agri-card" style="border-left: 4px solid var(--warning);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span class="badge badge-warning"><i class="ri-windy-line"></i> STRONG WIND ALERT</span>
                <span style="font-size: 11px; color: var(--text-secondary);">Valid Aug 29</span>
              </div>
              <h4 style="font-size: 14px; font-weight: 800; color: var(--text-primary);">High Wind Gusts (28 km/h)</h4>
              <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                Postpone agricultural drone spraying and pesticide application to prevent chemical drift.
              </p>
            </div>
          </div>
          ${renderBottomNav(20, 'home')}
        </div>
      `;

    // =========================================================================
    // SCREEN 21: SOIL & CROP RECOMMENDATION
    // =========================================================================
    case 21:
      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div class="mobile-app-bar green-header">
            <button onclick="navigateToScreen(7)" class="bar-btn" style="border:none;"><i class="ri-arrow-left-line"></i></button>
            <span class="bar-title">Soil & Crop Advisor</span>
            <span></span>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <div style="background: #fff; padding: 14px; border-radius: 16px; margin-bottom: 14px;">
              <h4 style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">Input Your Farm Parameters</h4>

              <div class="form-group">
                <label>Soil Type</label>
                <select class="form-control">
                  <option>Black Cotton Soil (Vijayawada Delta)</option>
                  <option>Red Sandy Soil</option>
                  <option>Alluvial Loam Soil</option>
                </select>
              </div>

              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                <div class="form-group">
                  <label>Soil pH Level</label>
                  <input type="text" class="form-control" value="6.8 (Optimal)">
                </div>
                <div class="form-group">
                  <label>Season</label>
                  <select class="form-control">
                    <option>Kharif (Monsoon)</option>
                    <option>Rabi (Winter)</option>
                  </select>
                </div>
              </div>

              <button onclick="showToast('AI Crop & Fertilizer Analysis Generated!')" class="btn-primary" style="margin-top: 6px;">
                Get AI Recommendation <i class="ri-plant-line"></i>
              </button>
            </div>

            <!-- RESULT CARD -->
            <div class="agri-card" style="border: 2px solid var(--secondary-green); background: #f1f8e9;">
              <span class="badge badge-success" style="margin-bottom: 8px;"><i class="ri-sparkles-line"></i> OPTIMAL CROP MATCH</span>
              <h3 style="font-size: 18px; font-weight: 800; color: var(--primary-green);">Recommended Crop: Paddy (BPT 5204)</h3>
              <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">High yield potential in Black Cotton Soil with pH 6.8</p>

              <div style="background: #fff; padding: 10px 12px; border-radius: 10px; margin-bottom: 10px;">
                <h5 style="font-size: 12px; font-weight: 700; color: var(--text-primary);"><i class="ri-flask-line" style="color:var(--primary-green);"></i> Recommended Fertilizer Blend:</h5>
                <p style="font-size: 12px; color: var(--primary-green); font-weight: 800; margin-top: 2px;">Urea 50kg + DAP 25kg / Acre</p>
              </div>
              <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4;">
                Applying DAP during basal ploughing promotes deep root growth in clay soil.
              </p>
            </div>
          </div>

          ${renderBottomNav(21, 'home')}
        </div>
      `;

    // =========================================================================
    // SCREEN 22: FARMER COMMUNITY FEED
    // =========================================================================
    case 22:
      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div class="mobile-app-bar green-header">
            <button onclick="navigateToScreen(7)" class="bar-btn" style="border:none;"><i class="ri-arrow-left-line"></i></button>
            <span class="bar-title">Farmer Community</span>
            <button onclick="showToast('Opening Create Post Modal...')" class="bar-btn" style="border:none;"><i class="ri-add-line"></i></button>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <!-- Ask Question Bar -->
            <div style="background: #fff; padding: 12px; border-radius: 14px; display: flex; align-items: center; gap: 10px; margin-bottom: 14px; box-shadow: var(--shadow-sm);">
              <div style="width: 36px; height: 36px; background: var(--primary-green); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px;">RK</div>
              <input type="text" placeholder="Ask a farming question or share tip..." style="flex:1; border:none; outline:none; font-size:12px;">
              <button onclick="showToast('Post published!')" style="background: var(--primary-green); color: #fff; border:none; padding: 6px 12px; border-radius: 10px; font-size: 11px; font-weight: 700;">Post</button>
            </div>

            <!-- Post 1 -->
            <div class="agri-card">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <div style="width: 38px; height: 38px; background: #e3f2fd; color: #1976d2; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;">KR</div>
                <div>
                  <h4 style="font-size: 13px; font-weight: 800; color: var(--text-primary);">Kalyan Ram</h4>
                  <p style="font-size: 10px; color: var(--text-secondary);">Guntur • 2 hours ago</p>
                </div>
              </div>
              <p style="font-size: 12px; color: var(--text-primary); line-height: 1.4; margin-bottom: 10px;">
                Which pesticide is best for leaf folder control in Kharif paddy crops this season?
              </p>
              <div style="background: #e8f5e9; padding: 10px; border-radius: 10px; font-size: 11px; color: var(--primary-green); margin-bottom: 10px;">
                <b>Top Answer by Agri Specialist:</b> Apply Virtako 100g/acre diluted in 200L water.
              </div>
              <div style="display: flex; justify-content: space-around; border-top: 1px solid #f0f0f0; padding-top: 8px; font-size: 12px; color: var(--text-secondary);">
                <span><i class="ri-heart-line"></i> 24 Likes</span>
                <span><i class="ri-chat-3-line"></i> 8 Comments</span>
                <span><i class="ri-share-line"></i> Share</span>
              </div>
            </div>
          </div>

          ${renderBottomNav(22, 'community')}
        </div>
      `;

    // =========================================================================
    // SCREEN 23: AGRICULTURAL STORE
    // =========================================================================
    case 23:
      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div class="mobile-app-bar green-header">
            <button onclick="navigateToScreen(7)" class="bar-btn" style="border:none;"><i class="ri-arrow-left-line"></i></button>
            <span class="bar-title">Agri Market Store</span>
            <button onclick="showToast('Cart has 2 items')" class="bar-btn" style="border:none; position:relative;">
              <i class="ri-shopping-cart-2-line"></i>
              <span style="position:absolute; top:2px; right:2px; background:var(--accent-yellow); color:#000; font-size:9px; font-weight:800; border-radius:50%; width:14px; height:14px; display:flex; align-items:center; justify-content:center;">2</span>
            </button>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <!-- Category Scroll -->
            <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px;">
              <span class="badge" style="background: var(--primary-green); color: #fff; padding: 6px 14px;">All Products</span>
              <span class="badge" style="background: #fff; color: var(--text-primary); padding: 6px 14px;">Seeds</span>
              <span class="badge" style="background: #fff; color: var(--text-primary); padding: 6px 14px;">Fertilizers</span>
              <span class="badge" style="background: #fff; color: var(--text-primary); padding: 6px 14px;">Tools</span>
            </div>

            <!-- Product Grid -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
              <div class="agri-card" style="margin-bottom: 0;">
                <div style="height: 90px; background: #e8f5e9; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 40px; color: var(--primary-green); margin-bottom: 8px;">
                  <i class="ri-seedling-line"></i>
                </div>
                <h4 style="font-size: 13px; font-weight: 800; color: var(--text-primary);">Paddy Seeds BPT 5204 (10kg)</h4>
                <p style="font-size: 11px; color: var(--text-secondary); margin: 2px 0;">⭐ 4.8 (120 reviews)</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                  <span style="font-size: 14px; font-weight: 800; color: var(--primary-green);">₹850</span>
                  <button onclick="showToast('Added Seeds to Cart')" class="btn-primary" style="width: auto; padding: 4px 10px; font-size: 11px;">+ Add</button>
                </div>
              </div>

              <div class="agri-card" style="margin-bottom: 0;">
                <div style="height: 90px; background: #fffde7; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 40px; color: var(--warning); margin-bottom: 8px;">
                  <i class="ri-flask-line"></i>
                </div>
                <h4 style="font-size: 13px; font-weight: 800; color: var(--text-primary);">Neem Urea Bag (45kg)</h4>
                <p style="font-size: 11px; color: var(--text-secondary); margin: 2px 0;">⭐ 4.9 (450 reviews)</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                  <span style="font-size: 14px; font-weight: 800; color: var(--primary-green);">₹267</span>
                  <button onclick="showToast('Added Urea to Cart')" class="btn-primary" style="width: auto; padding: 4px 10px; font-size: 11px;">+ Add</button>
                </div>
              </div>
            </div>
          </div>

          ${renderBottomNav(23, 'store')}
        </div>
      `;

    // =========================================================================
    // SCREEN 24: EQUIPMENT OWNER DASHBOARD
    // =========================================================================
    case 24:
      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div style="background: linear-gradient(135deg, #1b5e20, #0d3810); padding: 16px 20px 24px 20px; color: #fff; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div>
                <p style="font-size: 12px; color: #a5d6a7; font-weight: 600;">Equipment Owner Portal 👋</p>
                <h3 style="font-size: 20px; font-weight: 800; color: #fff;">Ramesh Patel</h3>
              </div>
              <span class="badge" style="background: var(--accent-yellow); color: #000; font-size: 11px;">Owner Mode</span>
            </div>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <!-- Stats Grid -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: -30px; margin-bottom: 16px;">
              <div class="agri-card" style="margin-bottom: 0;">
                <span style="font-size: 11px; color: var(--text-secondary); font-weight: 600;">Today's Bookings</span>
                <h2 style="font-size: 22px; font-weight: 800; color: var(--primary-green); margin-top: 2px;">3 Active</h2>
              </div>
              <div class="agri-card" style="margin-bottom: 0;">
                <span style="font-size: 11px; color: var(--text-secondary); font-weight: 600;">Pending Requests</span>
                <h2 style="font-size: 22px; font-weight: 800; color: var(--warning); margin-top: 2px;">2 New</h2>
              </div>
              <div class="agri-card" style="margin-bottom: 0;">
                <span style="font-size: 11px; color: var(--text-secondary); font-weight: 600;">Total Vehicles</span>
                <h2 style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">4 Machines</h2>
              </div>
              <div class="agri-card" style="margin-bottom: 0;">
                <span style="font-size: 11px; color: var(--text-secondary); font-weight: 600;">Monthly Revenue</span>
                <h2 style="font-size: 20px; font-weight: 800; color: var(--primary-green); margin-top: 2px;">₹48,500</h2>
              </div>
            </div>

            <!-- Owner Quick Actions -->
            <h4 style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px;">Quick Management</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <button onclick="navigateToScreen(25)" class="btn-primary" style="justify-content: space-between;">
                <span><i class="ri-add-circle-line"></i> Register New Equipment</span>
                <i class="ri-arrow-right-s-line"></i>
              </button>
              <button onclick="navigateToScreen(26)" class="btn-secondary" style="justify-content: space-between;">
                <span><i class="ri-file-shield-line"></i> Vehicle KYC & Document Verification</span>
                <i class="ri-arrow-right-s-line"></i>
              </button>
              <button onclick="navigateToScreen(27)" class="btn-outline" style="display: flex; justify-content: space-between; align-items: center;">
                <span><i class="ri-inbox-archive-line" style="color:var(--primary-green);"></i> Incoming Booking Requests (2)</span>
                <span class="badge badge-warning">Action Needed</span>
              </button>
              <button onclick="navigateToScreen(28)" class="btn-outline" style="display: flex; justify-content: space-between; align-items: center;">
                <span><i class="ri-line-chart-line" style="color:var(--primary-green);"></i> Earnings & Worker Roster</span>
                <i class="ri-arrow-right-s-line"></i>
              </button>
            </div>
          </div>
        </div>
      `;

    // =========================================================================
    // SCREEN 25: ADD EQUIPMENT FORM
    // =========================================================================
    case 25:
      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div class="mobile-app-bar green-header">
            <button onclick="navigateToScreen(24)" class="bar-btn" style="border:none;"><i class="ri-arrow-left-line"></i></button>
            <span class="bar-title">Add Equipment</span>
            <span></span>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <div class="form-group">
              <label>Equipment / Machine Name</label>
              <input type="text" class="form-control" value="Mahindra 575 DI Tractor">
            </div>

            <div class="form-group">
              <label>Category</label>
              <select class="form-control">
                <option>Tractor</option>
                <option>Harvester</option>
                <option>Sprayer</option>
              </select>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
              <div class="form-group">
                <label>Vehicle Number</label>
                <input type="text" class="form-control" value="AP16 BK 4920">
              </div>
              <div class="form-group">
                <label>Price per Acre (₹)</label>
                <input type="text" class="form-control" value="1200">
              </div>
            </div>

            <div class="form-group">
              <label>Equipment Description & HP</label>
              <input type="text" class="form-control" value="50 HP tractor with rotavator attachment included">
            </div>

            <!-- Upload Dropzone -->
            <div class="form-group">
              <label>Upload Machine Photos</label>
              <div style="border: 2px dashed #a5d6a7; background: #fff; padding: 20px; text-align: center; border-radius: 14px; cursor: pointer;">
                <i class="ri-upload-cloud-2-line" style="font-size: 36px; color: var(--primary-green);"></i>
                <p style="font-size: 12px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">Tap to Upload Tractor Photos</p>
                <span style="font-size: 10px; color: var(--text-secondary);">JPG, PNG up to 10MB</span>
              </div>
            </div>
          </div>

          <div style="padding: 12px 16px; background: #fff; border-top: 1px solid #e0e0e0;">
            <button onclick="navigateToScreen(26)" class="btn-primary">
              Continue to Document Verification <i class="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
      `;

    // =========================================================================
    // SCREEN 26: VEHICLE DOCUMENT VERIFICATION
    // =========================================================================
    case 26:
      const docs = [
        { name: 'Registration Certificate (RC)', status: 'Verified', color: 'badge-success', icon: 'ri-checkbox-circle-line' },
        { name: 'Vehicle Insurance Certificate', status: 'Verified', color: 'badge-success', icon: 'ri-checkbox-circle-line' },
        { name: 'Commercial Permit', status: 'Verified', color: 'badge-success', icon: 'ri-checkbox-circle-line' },
        { name: 'Owner Identity (Aadhaar/PAN)', status: 'Verified', color: 'badge-success', icon: 'ri-checkbox-circle-line' },
        { name: 'Vehicle & Serial Photos', status: 'Pending Review', color: 'badge-warning', icon: 'ri-time-line' }
      ];

      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div class="mobile-app-bar green-header">
            <button onclick="navigateToScreen(25)" class="bar-btn" style="border:none;"><i class="ri-arrow-left-line"></i></button>
            <span class="bar-title">Document Verification</span>
            <span></span>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <div style="background: #e8f5e9; padding: 12px; border-radius: 12px; border: 1px solid #a5d6a7; margin-bottom: 16px;">
              <h4 style="font-size: 13px; font-weight: 800; color: var(--primary-green);"><i class="ri-shield-check-line"></i> KYC Compliance</h4>
              <p style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">Submit valid documents to list your equipment on the AgriRide farmer portal.</p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${docs.map(d => `
                <div class="agri-card" style="margin-bottom: 0; display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <h4 style="font-size: 13px; font-weight: 800; color: var(--text-primary);">${d.name}</h4>
                    <span class="badge ${d.color}" style="margin-top: 4px;"><i class="${d.icon}"></i> ${d.status}</span>
                  </div>
                  <button onclick="showToast('Viewing ${d.name}')" class="btn-outline" style="width: auto; padding: 6px 12px; font-size: 11px;">View</button>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="padding: 12px 16px; background: #fff; border-top: 1px solid #e0e0e0;">
            <button onclick="navigateToScreen(27)" class="btn-primary">
              Submit Verification & View Requests <i class="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
      `;

    // =========================================================================
    // SCREEN 27: OWNER BOOKING REQUESTS
    // =========================================================================
    case 27:
      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div class="mobile-app-bar green-header">
            <button onclick="navigateToScreen(24)" class="bar-btn" style="border:none;"><i class="ri-arrow-left-line"></i></button>
            <span class="bar-title">Incoming Requests</span>
            <span class="badge badge-warning">2 Pending</span>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            ${state.ownerRequests.map((r, idx) => `
              <div class="agri-card" style="border-left: 4px solid var(--warning); margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary);">Booking #${r.id}</span>
                  <span class="badge badge-warning">${r.status}</span>
                </div>
                <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary);">Farmer: ${r.farmer}</h4>
                <p style="font-size: 12px; color: var(--text-secondary); margin: 4px 0;">
                  <b>Activity:</b> ${r.activity} (${r.acres} Acres)<br>
                  <b>Date & Time:</b> ${r.date} • ${r.time}<br>
                  <b>Location:</b> Vijayawada Rural
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f0f0f0; padding-top: 10px; margin-top: 8px;">
                  <span style="font-size: 16px; font-weight: 800; color: var(--primary-green);">Earnings: ₹${r.amount}</span>
                  <div style="display: flex; gap: 8px;">
                    <button onclick="rejectRequest(${idx})" class="btn-outline" style="width: auto; padding: 6px 12px; font-size: 12px; color: var(--error); border-color: var(--error);">Reject</button>
                    <button onclick="acceptRequest(${idx})" class="btn-primary" style="width: auto; padding: 6px 16px; font-size: 12px;">Accept</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    // =========================================================================
    // SCREEN 28: OWNER EARNINGS & WORKERS
    // =========================================================================
    case 28:
      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div class="mobile-app-bar green-header">
            <button onclick="navigateToScreen(24)" class="bar-btn" style="border:none;"><i class="ri-arrow-left-line"></i></button>
            <span class="bar-title">Earnings & Workers</span>
            <span></span>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <!-- Earnings Summary -->
            <div style="background: linear-gradient(135deg, #1b5e20, #2e7d32); color: #fff; padding: 16px; border-radius: 16px; margin-bottom: 16px;">
              <span style="font-size: 12px; opacity: 0.9;">Total Monthly Payout</span>
              <h2 style="font-size: 28px; font-weight: 800; color: var(--accent-yellow); margin: 2px 0;">₹48,500</h2>
              <div style="display: flex; justify-content: space-between; font-size: 11px; opacity: 0.9; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 6px;">
                <span>Today: ₹4,800</span>
                <span>This Week: ₹18,200</span>
              </div>
            </div>

            <!-- Simulated Visual Bar Chart -->
            <h4 style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px;">Weekly Earnings Growth</h4>
            <div class="agri-card" style="display: flex; justify-content: space-between; align-items: flex-end; height: 120px; padding-top: 20px; margin-bottom: 16px;">
              <div style="display:flex; flex-direction:column; align-items:center; gap:4px; height:100%; justify-content:flex-end;">
                <div style="width: 24px; height: 40px; background: var(--secondary-green); border-radius: 4px;"></div>
                <span style="font-size: 10px; font-weight: 700;">Mon</span>
              </div>
              <div style="display:flex; flex-direction:column; align-items:center; gap:4px; height:100%; justify-content:flex-end;">
                <div style="width: 24px; height: 65px; background: var(--secondary-green); border-radius: 4px;"></div>
                <span style="font-size: 10px; font-weight: 700;">Tue</span>
              </div>
              <div style="display:flex; flex-direction:column; align-items:center; gap:4px; height:100%; justify-content:flex-end;">
                <div style="width: 24px; height: 85px; background: var(--primary-green); border-radius: 4px;"></div>
                <span style="font-size: 10px; font-weight: 700;">Wed</span>
              </div>
              <div style="display:flex; flex-direction:column; align-items:center; gap:4px; height:100%; justify-content:flex-end;">
                <div style="width: 24px; height: 30px; background: var(--secondary-green); border-radius: 4px;"></div>
                <span style="font-size: 10px; font-weight: 700;">Thu</span>
              </div>
            </div>

            <!-- Workers Roster -->
            <h4 style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px;">Assigned Worker Roster</h4>

            <div class="agri-card" style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 style="font-size: 13px; font-weight: 800; color: var(--text-primary);">Suresh Kumar (Tractor Driver)</h4>
                <p style="font-size: 11px; color: var(--text-secondary);">Assigned to #AR20260825001 • Vijayawada</p>
                <span class="badge badge-success" style="margin-top: 4px;">Present (06:45 AM)</span>
              </div>
              <button onclick="navigateToScreen(29)" class="btn-outline" style="width: auto; padding: 6px 12px; font-size: 11px;">Worker View</button>
            </div>
          </div>
        </div>
      `;

    // =========================================================================
    // SCREEN 29: WORKER DASHBOARD
    // =========================================================================
    case 29:
      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div style="background: linear-gradient(135deg, #1565c0, #0d47a1); padding: 16px 20px 24px 20px; color: #fff; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div>
                <p style="font-size: 12px; color: #90caf9; font-weight: 600;">Worker Console 👋</p>
                <h3 style="font-size: 20px; font-weight: 800; color: #fff;">Suresh Kumar</h3>
              </div>
              <span class="badge" style="background: #e3f2fd; color: #1565c0;">Worker</span>
            </div>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <!-- Today's Assigned Job -->
            <div class="agri-card" style="margin-top: -24px; border-top: 4px solid #1976d2;">
              <span class="badge badge-info" style="margin-bottom: 8px;"><i class="ri-map-pin-line"></i> TODAY'S ASSIGNMENT</span>
              <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary);">Deep Ploughing Operation</h3>
              <p style="font-size: 12px; color: var(--text-secondary); margin: 6px 0;">
                <b>Farmer:</b> Ravi Kumar (+91 98480 22338)<br>
                <b>Location:</b> Vijayawada Rural (Kanchikacherla)<br>
                <b>Time:</b> 7:00 AM – 10:00 AM • 4 Acres
              </p>

              <div style="display: flex; gap: 8px; margin-top: 12px;">
                <button onclick="navigateToScreen(18)" class="btn-primary" style="flex: 1; background: #1976d2; font-size: 12px;">
                  <i class="ri-navigation-line"></i> View Route Map
                </button>
                <button onclick="navigateToScreen(30)" class="btn-secondary" style="width: auto; font-size: 12px;">
                  Attendance
                </button>
              </div>
            </div>

            <!-- Attendance Quick Card -->
            <div class="agri-card" style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 style="font-size: 13px; font-weight: 800; color: var(--text-primary);">Shift Attendance Status</h4>
                <p style="font-size: 11px; color: var(--text-secondary);">Checked in today at 06:45 AM</p>
              </div>
              <span class="badge badge-success">On Duty</span>
            </div>
          </div>
        </div>
      `;

    // =========================================================================
    // SCREEN 30: WORKER TASKS & ATTENDANCE
    // =========================================================================
    case 30:
      return `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-app);">
          <div class="mobile-app-bar" style="background: #1565c0; color: #fff;">
            <button onclick="navigateToScreen(29)" class="bar-btn" style="border:none; background:rgba(255,255,255,0.2); color:#fff;"><i class="ri-arrow-left-line"></i></button>
            <span class="bar-title">Worker Tasks & Attendance</span>
            <span></span>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 16px;">
            <!-- Check-in / Out Box -->
            <div class="agri-card" style="text-align: center; padding: 20px;">
              <h4 style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">Daily Field Check-In</h4>
              <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">GPS Location Verified: Vijayawada Mandal</p>
              
              <button onclick="toggleWorkerAttendance()" class="btn-primary" style="background: ${state.workerAttendance.checkedIn ? 'var(--error)' : 'var(--primary-green)'}; font-size: 15px;">
                <i class="ri-fingerprint-line"></i> ${state.workerAttendance.checkedIn ? 'Check Out of Field Shift' : 'Check In to Field Shift'}
              </button>
            </div>

            <!-- Attendance History Calendar Stats -->
            <h4 style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px;">Monthly Attendance Record</h4>
            <div class="agri-card" style="display: flex; justify-content: space-around; text-align: center;">
              <div>
                <span style="font-size: 20px; font-weight: 800; color: var(--primary-green);">24</span>
                <p style="font-size: 11px; color: var(--text-secondary);">Days Worked</p>
              </div>
              <div style="border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; padding: 0 20px;">
                <span style="font-size: 20px; font-weight: 800; color: var(--warning);">0</span>
                <p style="font-size: 11px; color: var(--text-secondary);">Absent</p>
              </div>
              <div>
                <span style="font-size: 20px; font-weight: 800; color: #1976d2;">100%</span>
                <p style="font-size: 11px; color: var(--text-secondary);">Punctuality</p>
              </div>
            </div>
          </div>
        </div>
      `;

    // =========================================================================
    // SCREEN 31: AGRIRIDE WHATSAPP CHAT HUB
    // =========================================================================
    case 31:
      const activeId = state.chatState.activeChatId || 'ramesh';
      const activeThread = state.chatState.threads[activeId];
      const threadsList = Object.values(state.chatState.threads);

      const messagesHTML = activeThread.messages.map((m, idx) => {
        const isOut = m.sender === 'me';
        let bubbleContent = '';

        if (m.type === 'text') {
          bubbleContent = `<div>${m.text}</div>`;
        } else if (m.type === 'audio') {
          bubbleContent = `
            <div class="wa-voice-card">
              <button onclick="playVoiceNoteAnim(this)" class="wa-voice-play-btn"><i class="ri-play-fill"></i></button>
              <div class="wa-voice-waveform">
                <span class="wa-wave-bar" style="height:12px;"></span>
                <span class="wa-wave-bar active" style="height:18px;"></span>
                <span class="wa-wave-bar active" style="height:22px;"></span>
                <span class="wa-wave-bar" style="height:14px;"></span>
                <span class="wa-wave-bar active" style="height:20px;"></span>
                <span class="wa-wave-bar" style="height:10px;"></span>
                <span class="wa-wave-bar active" style="height:16px;"></span>
              </div>
              <span style="font-size:11px; font-weight:700; color:#075E54;">${m.duration || '0:15'}</span>
            </div>
            <div style="font-size:10px; color:#546e7a; margin-top:2px;">🎙️ ${m.text}</div>
          `;
        } else if (m.type === 'location') {
          bubbleContent = `
            <div class="wa-location-card">
              <div class="wa-map-preview">
                <i class="ri-map-pin-2-fill wa-map-pin"></i>
                <span style="position:absolute; bottom:6px; left:8px; background:rgba(0,0,0,0.6); color:#fff; font-size:9px; padding:2px 6px; border-radius:4px;">GPS Verified</span>
              </div>
              <div class="wa-location-info">
                <i class="ri-navigation-line"></i> ${m.address}
              </div>
            </div>
          `;
        } else if (m.type === 'quote') {
          const isAccepted = m.status === 'Accepted';
          bubbleContent = `
            <div class="wa-quote-card">
              <div class="wa-quote-header">
                <i class="ri-file-list-3-line"></i> EQUIPMENT RENTAL QUOTE
              </div>
              <div class="wa-quote-detail"><b>Equipment:</b> ${m.equipment}</div>
              <div class="wa-quote-detail"><b>Area:</b> ${m.acres} Acres @ ₹${m.rate}/acre</div>
              <div class="wa-quote-detail" style="font-size:13px; font-weight:800; color:#1b5e20; margin-top:4px;">
                Total Estimate: ₹${m.total.toLocaleString()}
              </div>
              <div class="wa-quote-actions">
                ${isAccepted ? `
                  <div style="background:#e8f5e9; color:#2e7d32; padding:6px; border-radius:6px; font-weight:800; font-size:11px; text-align:center; width:100%;">
                    <i class="ri-checkbox-circle-fill"></i> BOOKING CONFIRMED IN CHAT
                  </div>
                ` : `
                  <button onclick="acceptInChatQuote(${idx})" class="wa-btn-accept"><i class="ri-check-line"></i> Accept & Book</button>
                  <button onclick="showToast('Quote declined')" class="wa-btn-decline"><i class="ri-close-line"></i> Decline</button>
                `}
              </div>
            </div>
          `;
        }

        return `
          <div class="wa-msg ${isOut ? 'out' : 'in'}">
            <div class="wa-bubble">
              ${bubbleContent}
              <div class="wa-meta">
                <span>${m.time}</span>
                ${isOut ? '<i class="ri-check-double-line wa-ticks"></i>' : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="wa-hub-wrapper">
          <!-- WhatsApp Header -->
          <div class="wa-header">
            <div class="wa-user-info">
              <button onclick="navigateToScreen(7)" class="wa-action-btn"><i class="ri-arrow-left-line"></i></button>
              <div class="wa-avatar">
                ${activeThread.avatar}
                ${activeThread.online ? '<span class="wa-online-dot"></span>' : ''}
              </div>
              <div>
                <div class="wa-user-name">${activeThread.name}</div>
                <div class="wa-user-status">${activeThread.roleTag} • ${activeThread.online ? 'Online' : 'Last seen today at 08:30'}</div>
              </div>
            </div>

            <div class="wa-actions">
              <button onclick="showToast('Initiating WhatsApp Voice Call...')" class="wa-action-btn"><i class="ri-phone-fill"></i></button>
              <button onclick="showToast('Initiating Video Inspection Call...')" class="wa-action-btn"><i class="ri-vidicon-fill"></i></button>
              <button onclick="showToast('AgriRide Chat Options')" class="wa-action-btn"><i class="ri-more-2-fill"></i></button>
            </div>
          </div>

          <!-- Thread Switcher Pills -->
          <div class="wa-threads-bar">
            ${threadsList.map(t => `
              <button onclick="switchChatThread('${t.id}')" class="wa-thread-pill ${t.id === activeId ? 'active' : ''}">
                ${t.name.split(' ')[0]} ${t.id === 'support' ? '🆘' : ''}
              </button>
            `).join('')}
          </div>

          <!-- Message Stream -->
          <div class="wa-chat-body" id="wa-chat-body-stream">
            <div class="wa-date-divider">TODAY • AGRIRIDE VERIFIED CHAT</div>
            ${messagesHTML}
          </div>

          <!-- Attachment Drawer Popup -->
          ${state.chatState.attachDrawerOpen ? `
            <div class="wa-attach-drawer">
              <div class="wa-attach-item" onclick="sendLocationMsg()">
                <div class="wa-attach-icon" style="background:#00c853;"><i class="ri-map-pin-2-line"></i></div>
                <span class="wa-attach-label">Field GPS</span>
              </div>
              <div class="wa-attach-item" onclick="sendQuoteMsg()">
                <div class="wa-attach-icon" style="background:#29b6f6;"><i class="ri-file-list-3-line"></i></div>
                <span class="wa-attach-label">Rental Quote</span>
              </div>
              <div class="wa-attach-item" onclick="sendVoiceNoteMsg()">
                <div class="wa-attach-icon" style="background:#ff7043;"><i class="ri-mic-line"></i></div>
                <span class="wa-attach-label">Voice Note</span>
              </div>
              <div class="wa-attach-item" onclick="showToast('Opening Camera Attachment...')">
                <div class="wa-attach-icon" style="background:#ab47bc;"><i class="ri-camera-3-line"></i></div>
                <span class="wa-attach-label">Crop Photo</span>
              </div>
            </div>
          ` : ''}

          <!-- Composer Bar -->
          <div class="wa-composer">
            <button onclick="showToast('Emoji Selector')" style="border:none; background:transparent; font-size:20px; color:#546e7a; cursor:pointer;"><i class="ri-emotion-happy-line"></i></button>
            <button onclick="toggleAttachDrawer()" style="border:none; background:transparent; font-size:20px; color:#546e7a; cursor:pointer;"><i class="ri-attachment-line"></i></button>
            
            <input type="text" id="wa-chat-input" class="wa-input-box" placeholder="Type message or price negotiation..." onkeypress="handleChatKeyPress(event)" />
            
            <button onclick="sendVoiceNoteMsg()" style="border:none; background:transparent; font-size:20px; color:#546e7a; cursor:pointer;" title="Hold to Record Voice Note"><i class="ri-mic-fill"></i></button>
            <button onclick="sendChatMessage()" class="wa-send-btn"><i class="ri-send-plane-fill"></i></button>
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

function handleOTPVerify() {
  showToast('Account verified successfully!');
  if (state.role === 'owner') navigateToScreen(24);
  else if (state.role === 'worker') navigateToScreen(29);
  else navigateToScreen(7);
}

function selectActivity(actName) {
  state.booking.activity = actName;
  renderScreen(11);
}

function changeAcres(delta) {
  if (state.booking.acres + delta >= 1) {
    state.booking.acres += delta;
    renderScreen(12);
  }
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
      <button onclick="navigateToScreen(4)" class="nav-tab">
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

// RENDER ALL 31 SCREENS IN GRID MATRIX
function renderGridMatrix() {
  const matrix = document.getElementById('screens-grid-matrix');
  if (!matrix) return;

  matrix.innerHTML = '';

  for (let i = 1; i <= 31; i++) {
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
