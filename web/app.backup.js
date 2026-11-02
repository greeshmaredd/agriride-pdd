/* ==========================================
   AGRIRIDE 2026 - MAIN APP LOGIC FILE
   Multi-Role SPA Simulation with LocalStorage DB
   ========================================== */

// --- 1. MOCK DATABASE INITIALIZATION ---
const DEFAULT_MACHINERY = [
  {
    id: "EQ_FIXED_JD5310",
    name: "John Deere 5310 4WD",
    category: "Tractor",
    type: "Tractor",
    vehicleNumber: "TN 21 JD 5310",
    ownerId: "owner_primary",
    ownerName: "Ramesh Reddy",
    ownerPhone: "+91 98480 11223",
    pricePerAcre: 1400.0,
    description: "55 HP 4-Wheel Drive Tractor with heavy-duty dual clutch, ideal for deep tillage, haulage, and rotavator operations.",
    villageName: "Mevalurkuppam",
    district: "Kanchipuram",
    location: "Mevalurkuppam, Tamil Nadu",
    latitude: 13.0180,
    longitude: 79.9880,
    rating: 4.9,
    reviewCount: 18,
    availability: "AVAILABLE",
    isVerified: true
  },
  {
    id: "EQ_FIXED_CLAAS30",
    name: "Claas Crop Tiger 30",
    category: "Harvester",
    type: "Harvester",
    vehicleNumber: "TN 21 CT 3030",
    ownerId: "owner_primary",
    ownerName: "Ramesh Reddy",
    ownerPhone: "+91 98480 11223",
    pricePerAcre: 2400.0,
    description: "High efficiency combine harvester for paddy and grain harvesting with built-in straw chopper and large grain tank.",
    villageName: "Mevalurkuppam",
    district: "Kanchipuram",
    location: "Mevalurkuppam, Tamil Nadu",
    latitude: 13.0210,
    longitude: 79.9900,
    rating: 4.8,
    reviewCount: 14,
    availability: "AVAILABLE",
    isVerified: true
  },
  {
    id: "EQ_FIXED_SHAKTIMAN",
    name: "Shaktiman Rotary Tiller",
    category: "Rotavator",
    type: "Rotavator",
    vehicleNumber: "TN 21 RT 7007",
    ownerId: "owner_primary",
    ownerName: "Ramesh Reddy",
    ownerPhone: "+91 98480 11223",
    pricePerAcre: 950.0,
    description: "Heavy duty multi-speed 7-foot rotary tiller with boron steel blades for smooth seedbed preparation and weeding.",
    villageName: "Mevalurkuppam",
    district: "Kanchipuram",
    location: "Mevalurkuppam, Tamil Nadu",
    latitude: 13.0160,
    longitude: 79.9920,
    rating: 4.7,
    reviewCount: 9,
    availability: "AVAILABLE",
    isVerified: true
  },
  {
    id: "EQ_FIXED_GARUDA",
    name: "Garuda Kisan Drone 16L",
    category: "Drone",
    type: "Drone",
    vehicleNumber: "UAV-TN-KD16",
    ownerId: "owner_primary",
    ownerName: "Ramesh Reddy",
    ownerPhone: "+91 98480 11223",
    pricePerAcre: 650.0,
    description: "16-Litre precision agriculture drone for ultra-low volume pesticide spraying, nano-urea & liquid fertilizer application.",
    villageName: "Mevalurkuppam",
    district: "Kanchipuram",
    location: "Mevalurkuppam, Tamil Nadu",
    latitude: 13.0190,
    longitude: 79.9850,
    rating: 5.0,
    reviewCount: 22,
    availability: "AVAILABLE",
    isVerified: true
  },
  {
    id: "EQ_FIXED_KUBOTA",
    name: "Kubota NSP-4W Transplanter",
    category: "Transplanter",
    type: "Transplanter",
    vehicleNumber: "TN 21 PT 4004",
    ownerId: "owner_primary",
    ownerName: "Ramesh Reddy",
    ownerPhone: "+91 98480 11223",
    pricePerAcre: 1800.0,
    description: "4-row walk-behind paddy transplanter ensuring uniform hill spacing, shallow depth, and quick seedling root establishment.",
    villageName: "Mevalurkuppam",
    district: "Kanchipuram",
    location: "Mevalurkuppam, Tamil Nadu",
    latitude: 13.0140,
    longitude: 79.9870,
    rating: 4.8,
    reviewCount: 11,
    availability: "AVAILABLE",
    isVerified: true
  }
];

const DEFAULT_PRODUCTS = [
  { id: "PRD101", name: "Paddy Seeds BPT 5204 (10kg Bag)", category: "Seeds", price: 850.0, rating: 4.8, description: "High-yield certified Samba Masuri Paddy Seeds.", stock: 50, icon: "grain" },
  { id: "PRD102", name: "Neem Coated Urea Bag (45kg)", category: "Fertilizers", price: 267.0, rating: 4.6, description: "Government regulated slow-release nitrogen fertilizer.", stock: 120, icon: "eco" },
  { id: "PRD103", name: "Phosphatic Fertilizer DAP (50kg)", category: "Fertilizers", price: 1350.0, rating: 4.7, description: "Diammonium Phosphate for root development.", stock: 40, icon: "layers" },
  { id: "PRD104", name: "Organic Neem Oil Pesticide (1L)", category: "Pesticides", price: 450.0, rating: 4.9, description: "Pure cold-pressed bio-pesticide for insect control.", stock: 65, icon: "pest_control" },
  { id: "PRD105", name: "Hybrid Maize Seeds (5kg)", category: "Seeds", price: 620.0, rating: 4.5, description: "Drought resistant high starch content maize kernels.", stock: 35, icon: "grain" }
];

const DEFAULT_POSTS = [
  { postId: "POST101", authorName: "Kalyan Ram", location: "Guntur", timestamp: "2 hours ago", question: "Which pesticide is best for leaf folder control in Kharif paddy?", likesCount: 24, commentsCount: 8, isLiked: false },
  { postId: "POST102", authorName: "Venkatesh M.", location: "Vijayawada", timestamp: "Yesterday", question: "What is the current rental rate for Harvesters in Krishna delta?", likesCount: 15, commentsCount: 3, isLiked: false }
];

const DEFAULT_DAMS = [
  { damId: "DAM101", damName: "Prakasam Barrage", district: "NTR Krishna", reservoirCapacityTmc: 3.07, currentWaterLevelFt: 57.0, waterLevelPercentage: 85.0, status: "NORMAL" },
  { damId: "DAM102", damName: "Nagarjuna Sagar Dam", district: "Palnadu / Guntur", reservoirCapacityTmc: 312.0, currentWaterLevelFt: 585.0, waterLevelPercentage: 92.0, status: "NORMAL" },
  { damId: "DAM103", damName: "Srisailam Reservoir", district: "Kurnool Nandyal", reservoirCapacityTmc: 215.8, currentWaterLevelFt: 881.0, waterLevelPercentage: 96.0, status: "CAUTION" }
];

const DEFAULT_WORKERS = [
  { id: "WRK_1", name: "Subba Rao", phone: "98480 99881", skill: "Tractor Operator", dailyWage: 600.0, status: "Available", checkInTime: "" },
  { id: "WRK_2", name: "Rambabu Naidu", phone: "98480 99882", skill: "Drone Pilot", dailyWage: 800.0, status: "Available", checkInTime: "" }
];

// Initialize local DB
function initializeLocalStorageDB() {
  if (!localStorage.getItem("agriride_machinery")) {
    localStorage.setItem("agriride_machinery", JSON.stringify(DEFAULT_MACHINERY));
  }
  if (!localStorage.getItem("agriride_products")) {
    localStorage.setItem("agriride_products", JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem("agriride_posts")) {
    localStorage.setItem("agriride_posts", JSON.stringify(DEFAULT_POSTS));
  }
  if (!localStorage.getItem("agriride_dams")) {
    localStorage.setItem("agriride_dams", JSON.stringify(DEFAULT_DAMS));
  }
  if (!localStorage.getItem("agriride_workers")) {
    localStorage.setItem("agriride_workers", JSON.stringify(DEFAULT_WORKERS));
  }
  if (!localStorage.getItem("agriride_bookings")) {
    localStorage.setItem("agriride_bookings", JSON.stringify([]));
  }
  if (!localStorage.getItem("agriride_cart")) {
    localStorage.setItem("agriride_cart", JSON.stringify([]));
  }
}

// Helper methods to read/write DB
const db = {
  getMachinery: () => JSON.parse(localStorage.getItem("agriride_machinery")),
  setMachinery: (data) => localStorage.setItem("agriride_machinery", JSON.stringify(data)),
  getProducts: () => JSON.parse(localStorage.getItem("agriride_products")),
  getPosts: () => JSON.parse(localStorage.getItem("agriride_posts")),
  setPosts: (data) => localStorage.setItem("agriride_posts", JSON.stringify(data)),
  getDams: () => JSON.parse(localStorage.getItem("agriride_dams")),
  getWorkers: () => JSON.parse(localStorage.getItem("agriride_workers")),
  setWorkers: (data) => localStorage.setItem("agriride_workers", JSON.stringify(data)),
  getBookings: () => JSON.parse(localStorage.getItem("agriride_bookings")),
  setBookings: (data) => localStorage.setItem("agriride_bookings", JSON.stringify(data)),
  getCart: () => JSON.parse(localStorage.getItem("agriride_cart")),
  setCart: (data) => localStorage.setItem("agriride_cart", JSON.stringify(data))
};

// --- 2. THEME & USER STATE MANAGEMENT ---
let currentRole = "FARMER";
let currentLang = "English";
let currentView = "home";
let activeBookingTrackId = ""; // Track map details

const USER_PROFILES = {
  FARMER: { name: "Ravi Kumar", phone: "+91 98480 22338", location: "Kanchikacherla, Andhra Pradesh", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop" },
  OWNER: { name: "Greeshma", phone: "+91 98480 55667", location: "Mevalurkuppam, Tamil Nadu", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop" },
  WORKER: { name: "Subba Rao", phone: "+91 98480 99881", location: "Vijayawada, Andhra Pradesh", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop" },
  ADMIN: { name: "System Admin", phone: "+91 99999 11111", location: "Command Center, AP", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop" }
};

// Weather Advisory Database Lookups
const CURRENT_WEATHER = {
  temp: 28,
  condition: "Partly Cloudy",
  humidity: 72,
  windSpeed: 14,
  rainProb: 20,
  ploughing: "SUITABLE",
  spraying: "CAUTION", // Due to moderate wind
  harvesting: "SUITABLE"
};

// Page load hook
document.addEventListener("DOMContentLoaded", () => {
  initializeLocalStorageDB();
  setupEventListeners();
  loadRole("FARMER");
});

// Setup primary layout trigger hooks
function setupEventListeners() {
  // Theme Toggle Selector
  const themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    themeToggle.querySelector("span").textContent = nextTheme === "dark" ? "light_mode" : "dark_mode";
  });

  // Persona switch dropdown simulator
  const roleSelect = document.getElementById("role-simulator");
  roleSelect.addEventListener("change", (e) => {
    loadRole(e.target.value);
  });

  // Language switcher
  const langSelect = document.getElementById("language-selector");
  langSelect.addEventListener("change", (e) => {
    currentLang = e.target.value;
    alert(`Language switched to: ${currentLang}`);
    renderView();
  });

  // Logout trigger
  document.getElementById("btn-logout").addEventListener("click", () => {
    if(confirm("Log out of AgriRide?")) {
      alert("Demo System: Switched back to Farmer Role.");
      roleSelect.value = "FARMER";
      loadRole("FARMER");
    }
  });
}

// Load views specific to role
function loadRole(roleKey) {
  currentRole = roleKey;
  const profile = USER_PROFILES[roleKey];
  
  // Header profile bar rendering
  document.getElementById("header-username").textContent = profile.name;
  document.getElementById("header-role-badge").textContent = roleKey.charAt(0) + roleKey.slice(1).toLowerCase();
  document.getElementById("header-avatar").src = profile.avatar;
  
  // Sidebar navigation rendering
  renderSidebarNav();
  
  // Default views routing
  currentView = "home";
  renderView();
}

function renderSidebarNav() {
  const listEl = document.getElementById("sidebar-menu-list");
  listEl.innerHTML = ""; // Clear existing

  let navItems = [];
  if (currentRole === "FARMER") {
    navItems = [
      { id: "home", label: "Dashboard", icon: "dashboard" },
      { id: "search", label: "Book Fleet", icon: "search" },
      { id: "bookings", label: "My Bookings", icon: "calendar_month" },
      { id: "store", label: "Agri-Store", icon: "store" },
      { id: "soil", label: "Soil Advisor", icon: "grass" },
      { id: "community", label: "Community Forum", icon: "forum" },
      { id: "dams", label: "Dam & Weather Alerts", icon: "warning" }
    ];
  } else if (currentRole === "OWNER") {
    navItems = [
      { id: "home", label: "Overview Dashboard", icon: "dashboard" },
      { id: "machinery", label: "My Machinery Fleet", icon: "agriculture" },
      { id: "requests", label: "Booking Requests", icon: "pending_actions" },
      { id: "workers", label: "Manage Operators", icon: "badge" }
    ];
  } else if (currentRole === "WORKER") {
    navItems = [
      { id: "home", label: "Operator Home", icon: "dashboard" },
      { id: "tasks", label: "My Assigned Jobs", icon: "assignment" }
    ];
  } else if (currentRole === "ADMIN") {
    navItems = [
      { id: "home", label: "Admin Core Stats", icon: "dashboard" },
      { id: "verification", label: "Verify Fleet Documents", icon: "fact_check" }
    ];
  }

  navItems.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = `sidebar-nav-item ${currentView === item.id ? 'active' : ''}`;
    li.innerHTML = `
      <button onclick="switchView('${item.id}', this)">
        <span class="material-symbols-outlined">${item.icon}</span>
        <span>${item.label}</span>
      </button>
    `;
    listEl.appendChild(li);
  });
}

function switchView(viewId, clickedBtn = null) {
  currentView = viewId;
  if(clickedBtn) {
    document.querySelectorAll(".sidebar-nav-item").forEach(item => item.classList.remove("active"));
    clickedBtn.parentElement.classList.add("active");
  }
  renderView();
}

// --- 3. DYNAMIC HTML RENDER ENGINE ---
function renderView() {
  const viewport = document.getElementById("main-view-viewport");
  viewport.scrollTop = 0;
  
  if (currentRole === "FARMER") {
    if (currentView === "home") renderFarmerHome(viewport);
    else if (currentView === "search") renderFarmerSearch(viewport);
    else if (currentView === "bookings") renderFarmerBookings(viewport);
    else if (currentView === "store") renderFarmerStore(viewport);
    else if (currentView === "soil") renderFarmerSoil(viewport);
    else if (currentView === "community") renderFarmerCommunity(viewport);
    else if (currentView === "dams") renderFarmerDams(viewport);
  } else if (currentRole === "OWNER") {
    if (currentView === "home") renderOwnerHome(viewport);
    else if (currentView === "machinery") renderOwnerMachinery(viewport);
    else if (currentView === "requests") renderOwnerRequests(viewport);
    else if (currentView === "workers") renderOwnerWorkers(viewport);
  } else if (currentRole === "WORKER") {
    if (currentView === "home") renderWorkerHome(viewport);
    else if (currentView === "tasks") renderWorkerTasks(viewport);
  } else if (currentRole === "ADMIN") {
    if (currentView === "home") renderAdminHome(viewport);
    else if (currentView === "verification") renderAdminVerification(viewport);
  }
}

// ==================== FARMER VIEW RENDERERS ====================

function renderFarmerHome(el) {
  const profile = USER_PROFILES.FARMER;
  const machinery = db.getMachinery().filter(eq => eq.isVerified);
  
  el.innerHTML = `
    <div class="view-header">
      <div class="view-header-title">
        <h2>Welcome Back, ${profile.name} 👋</h2>
        <p>Current Farm Field: 📍 ${profile.location}</p>
      </div>
      <button class="btn primary" onclick="switchView('search')">
        <span class="material-symbols-outlined">add_circle</span>
        <span>Quick Reserve Machinery</span>
      </button>
    </div>

    <div class="farmer-home-layout">
      <!-- Left Major Column -->
      <div>
        <!-- Quick Action Tiles -->
        <div class="quick-actions-bar">
          <div class="action-tile glass" onclick="switchView('search')">
            <span class="material-symbols-outlined">agriculture</span>
            <h4>Find Tractors</h4>
          </div>
          <div class="action-tile glass" onclick="switchView('soil')">
            <span class="material-symbols-outlined">grass</span>
            <h4>Soil Advisor</h4>
          </div>
          <div class="action-tile glass" onclick="switchView('dams')">
            <span class="material-symbols-outlined">tsunami</span>
            <h4>Dam Levels</h4>
          </div>
          <div class="action-tile glass" onclick="switchView('store')">
            <span class="material-symbols-outlined">local_mall</span>
            <h4>Buy Seeds/Urea</h4>
          </div>
        </div>

        <!-- Weather Suitability Widget -->
        <div class="weather-card glass" onclick="switchView('dams')">
          <div class="weather-main">
            <div class="weather-city">
              <h3>☁️ Weather in Kanchikacherla</h3>
              <p>Updated just now • AP Agriculture Network</p>
            </div>
            <div class="weather-temp">
              <h2>${CURRENT_WEATHER.temp}°C</h2>
              <p>${CURRENT_WEATHER.condition}</p>
            </div>
          </div>
          <div class="weather-metrics">
            <span class="weather-metric-item"><span class="material-symbols-outlined">rainy</span> Rain Prob: ${CURRENT_WEATHER.rainProb}%</span>
            <span class="weather-metric-item"><span class="material-symbols-outlined">air</span> Wind Speed: ${CURRENT_WEATHER.windSpeed} km/h</span>
            <span class="weather-metric-item"><span class="material-symbols-outlined">humidity_percentage</span> Humidity: ${CURRENT_WEATHER.humidity}%</span>
          </div>
          <div class="weather-suitability-pills">
            <span class="suitability-pill suitable">Ploughing: SUITABLE</span>
            <span class="suitability-pill caution">Spraying: CAUTION (Windy)</span>
            <span class="suitability-pill suitable">Harvesting: SUITABLE</span>
          </div>
        </div>

        <!-- Nearby Machinery Fleet Section -->
        <div class="machinery-section-header">
          <h3>Machinery Fleet Near You</h3>
          <button class="btn secondary" onclick="switchView('search')">View All</button>
        </div>
        <div class="machinery-list-vertical" id="nearby-fleet-container">
          <!-- Dynamic loading -->
        </div>
      </div>

      <!-- Right Support Column -->
      <aside>
        <!-- active status updates widget -->
        <div class="info-card glass" style="margin-bottom: 24px;">
          <h3>Active Operations</h3>
          <div id="home-active-bookings-preview" style="margin-top: 16px;">
            <!-- Dynamic loading -->
          </div>
        </div>

        <!-- Soil Advisory Summary Preview -->
        <div class="info-card glass" style="background: linear-gradient(135deg, rgba(30, 92, 63, 0.1) 0%, rgba(46, 139, 87, 0.05) 100%);">
          <h3>Smart Crop Match</h3>
          <p style="margin-top: 8px; font-size: 13px; color: var(--text-secondary);">
            Based on Kanchikacherla Alluvial Delta soil characteristics and Rabi season.
          </p>
          <div style="margin-top: 16px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <h4 style="color: var(--primary); font-size: 18px;">Paddy (BPT 5204)</h4>
              <p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Expected Yield: 35 Bags / Acre</p>
            </div>
            <span class="suitability-pill suitable" style="padding: 8px 12px; border-radius: 4px;">92% Match</span>
          </div>
          <button class="btn primary" style="width: 100%; margin-top: 20px;" onclick="switchView('soil')">View Full Soil Audit</button>
        </div>
      </aside>
    </div>
  `;

  // Render fleet list vertical
  const fleetContainer = document.getElementById("nearby-fleet-container");
  if(machinery.length === 0) {
    fleetContainer.innerHTML = `<p class="text-muted">No verified machinery currently listed near your coordinates.</p>`;
  } else {
    machinery.slice(0, 3).forEach(eq => {
      const card = document.createElement("div");
      card.className = "booking-card glass";
      card.onclick = () => openBookingModal(eq.id);
      card.innerHTML = `
        <div class="booking-details-summary">
          <div class="booking-icon-wrap">
            <span class="material-symbols-outlined">agriculture</span>
          </div>
          <div class="booking-meta">
            <h4>${eq.name}</h4>
            <p>Category: ${eq.category} • Rate: <strong>₹${eq.pricePerAcre}/Acre</strong></p>
          </div>
        </div>
        <div class="booking-status-box">
          <span class="rating-badge"><span class="material-symbols-outlined">star</span> ${eq.rating}</span>
          <span style="font-size: 11px; color: var(--text-muted);">Owner: ${eq.ownerName}</span>
        </div>
      `;
      fleetContainer.appendChild(card);
    });
  }

  // Render Active Booking Preview
  const activeBookings = db.getBookings().filter(b => b.bookingStatus !== "COMPLETED" && b.bookingStatus !== "REJECTED");
  const bookingPreviewEl = document.getElementById("home-active-bookings-preview");
  if(activeBookings.length === 0) {
    bookingPreviewEl.innerHTML = `<p style="font-size: 13px; color: var(--text-muted);">No reservations currently in progress. Place a new order using Book Fleet.</p>`;
  } else {
    const b = activeBookings[0];
    bookingPreviewEl.innerHTML = `
      <div style="border-left: 3px solid var(--accent); padding-left: 12px; margin-bottom: 12px;">
        <h4 style="font-size: 14px;">${b.equipmentName}</h4>
        <p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
          Status: <strong style="color: var(--primary); text-transform: uppercase;">${b.bookingStatus.replace("_", " ")}</strong>
        </p>
        <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Date: ${b.date} • ${b.timeSlot}</p>
      </div>
      <button class="btn secondary" style="width: 100%; font-size: 13px;" onclick="trackBookingRoute('${b.bookingId}')">Track Machine Live</button>
    `;
  }
}

function renderFarmerSearch(el) {
  el.innerHTML = `
    <div class="view-header">
      <div class="view-header-title">
        <h2>Reserve Agricultural Machinery</h2>
        <p>Browse verified high-performance farm tractors, harvesters, and crop drones.</p>
      </div>
    </div>

    <!-- Filter Actions Bar -->
    <div class="filter-bar">
      <div class="search-input-wrapper">
        <span class="material-symbols-outlined">search</span>
        <input type="text" id="search-query" placeholder="Search by model or specifications (e.g. 50HP, John Deere)..." onkeyup="filterMachineryList()">
      </div>
      
      <select id="filter-category" class="filter-select" onchange="filterMachineryList()">
        <option value="ALL">All Categories</option>
        <option value="Tractor">Tractor</option>
        <option value="Harvester">Harvester</option>
        <option value="Sprayer">Sprayer / Rotavator</option>
        <option value="Drone">Drone</option>
        <option value="Transplanter">Transplanter</option>
      </select>

      <select id="filter-availability" class="filter-select" onchange="filterMachineryList()">
        <option value="ALL">All Availability</option>
        <option value="AVAILABLE">Available</option>
        <option value="UNAVAILABLE">Maintenance / Busy</option>
      </select>
    </div>

    <!-- Grid items -->
    <div class="machinery-grid" id="search-grid-container">
      <!-- Dynamic cards loaded -->
    </div>
  `;
  filterMachineryList();
}

function filterMachineryList() {
  const query = document.getElementById("search-query").value.toLowerCase();
  const cat = document.getElementById("filter-category").value;
  const avail = document.getElementById("filter-availability").value;
  
  const allFleet = db.getMachinery().filter(eq => eq.isVerified);
  const container = document.getElementById("search-grid-container");
  container.innerHTML = "";
  
  const filtered = allFleet.filter(eq => {
    const matchesQuery = eq.name.toLowerCase().includes(query) || eq.description.toLowerCase().includes(query);
    const matchesCat = cat === "ALL" || eq.category === cat || (cat === "Sprayer" && eq.category === "Rotavator");
    const matchesAvail = avail === "ALL" || eq.availability === avail;
    return matchesQuery && matchesCat && matchesAvail;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 48px;"><p style="color: var(--text-secondary); font-size: 16px;">No equipment listings matched your filter criteria.</p></div>`;
    return;
  }

  filtered.forEach(eq => {
    const isAvail = eq.availability === "AVAILABLE";
    
    // Choose beautiful image placeholder based on category
    let imageSrc = "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=350&auto=format&fit=crop"; // Tractor default
    if(eq.category === "Harvester") imageSrc = "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=350&auto=format&fit=crop";
    else if(eq.category === "Drone") imageSrc = "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=350&auto=format&fit=crop";
    else if(eq.category === "Transplanter" || eq.category === "Rotavator") imageSrc = "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=350&auto=format&fit=crop";

    const card = document.createElement("article");
    card.className = "machinery-card glass";
    card.innerHTML = `
      <div class="machinery-img-wrap">
        <img src="${imageSrc}" alt="${eq.name}">
        <span class="machinery-badge ${isAvail ? 'available' : 'unavailable'}">${eq.availability}</span>
        <span class="machinery-distance"><span class="material-symbols-outlined" style="font-size: 11px; vertical-align: middle;">near_me</span> 1.2 Km Away</span>
      </div>
      <div class="machinery-content">
        <div class="machinery-title-row">
          <h3>${eq.name}</h3>
          <span class="rating-badge"><span class="material-symbols-outlined" style="font-size: 14px;">star</span> ${eq.rating}</span>
        </div>
        <div class="machinery-specs">
          <span>HP: ${eq.hpRating || 50} HP</span>
          <span>Reg: ${eq.vehicleNumber}</span>
        </div>
        <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; height: 50px; overflow: hidden;">
          ${eq.description}
        </p>
        <div class="machinery-owner">
          <span class="material-symbols-outlined">person</span>
          <span>Owner: ${eq.ownerName} (${eq.villageName})</span>
        </div>
        <div class="machinery-price-row">
          <div class="price-text">
            <h4>₹${eq.pricePerAcre}</h4>
            <p>PER ACRE RATE</p>
          </div>
          <button class="btn primary" onclick="openBookingModal('${eq.id}')">${isAvail ? 'Book Fleet' : 'Details'}</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderFarmerBookings(el) {
  const bookings = db.getBookings();

  if (activeBookingTrackId) {
    renderBookingTrackPanel(el, activeBookingTrackId);
    return;
  }

  el.innerHTML = `
    <div class="view-header">
      <div class="view-header-title">
        <h2>My Fleet Reservations</h2>
        <p>Track history, payments, and live GPS position of operators assigned to your field.</p>
      </div>
    </div>

    <div style="max-width: 800px;">
      <div class="machinery-section-header">
        <h3>Active Reservations</h3>
      </div>
      <div id="active-bookings-list" class="machinery-list-vertical" style="margin-bottom: 32px;"></div>

      <div class="machinery-section-header">
        <h3>Past Completed Bookings</h3>
      </div>
      <div id="past-bookings-list" class="machinery-list-vertical"></div>
    </div>
  `;

  const activeContainer = document.getElementById("active-bookings-list");
  const pastContainer = document.getElementById("past-bookings-list");
  
  const activeBookings = bookings.filter(b => b.bookingStatus !== "COMPLETED" && b.bookingStatus !== "REJECTED");
  const pastBookings = bookings.filter(b => b.bookingStatus === "COMPLETED" || b.bookingStatus === "REJECTED");

  if(activeBookings.length === 0) {
    activeContainer.innerHTML = `<p class="text-muted" style="padding: 16px;">No current active bookings. Visit Book Fleet tab to find machinery.</p>`;
  } else {
    activeBookings.forEach(b => {
      const card = document.createElement("div");
      card.className = "booking-card glass";
      card.onclick = () => trackBookingRoute(b.bookingId);
      card.innerHTML = `
        <div class="booking-details-summary">
          <div class="booking-icon-wrap">
            <span class="material-symbols-outlined">navigation</span>
          </div>
          <div class="booking-meta">
            <h4>${b.equipmentName}</h4>
            <p>Activity: ${b.activity} • Date: ${b.date} • Total: <strong>₹${b.totalAmount}</strong></p>
          </div>
        </div>
        <div class="booking-status-box">
          <span class="status-badge ${b.bookingStatus.toLowerCase()}">${b.bookingStatus.replace("_", " ")}</span>
          <span style="font-size: 11px; color: var(--text-secondary); cursor: pointer; text-decoration: underline;">Track on Map</span>
        </div>
      `;
      activeContainer.appendChild(card);
    });
  }

  if(pastBookings.length === 0) {
    pastContainer.innerHTML = `<p class="text-muted" style="padding: 16px;">No past reservations completed yet.</p>`;
  } else {
    pastBookings.forEach(b => {
      const card = document.createElement("div");
      card.className = "booking-card glass";
      card.innerHTML = `
        <div class="booking-details-summary">
          <div class="booking-icon-wrap" style="background: var(--bg-tertiary); color: var(--text-secondary);">
            <span class="material-symbols-outlined">task_alt</span>
          </div>
          <div class="booking-meta">
            <h4>${b.equipmentName}</h4>
            <p>Activity: ${b.activity} • Date: ${b.date} • Paid: <strong>₹${b.totalAmount}</strong></p>
          </div>
        </div>
        <div class="booking-status-box">
          <span class="status-badge completed">Completed</span>
          <span style="font-size: 11px; color: var(--text-muted);">Operator: ${b.workerName || 'Unassigned'}</span>
        </div>
      `;
      pastContainer.appendChild(card);
    });
  }
}

function trackBookingRoute(bookingId) {
  activeBookingTrackId = bookingId;
  renderView();
}

function exitTrackBooking() {
  activeBookingTrackId = "";
  renderView();
}

function renderBookingTrackPanel(el, bookingId) {
  const bookings = db.getBookings();
  const b = bookings.find(x => x.bookingId === bookingId);
  if (!b) {
    activeBookingTrackId = "";
    renderView();
    return;
  }

  el.innerHTML = `
    <div class="view-header">
      <div class="view-header-title">
        <button class="btn secondary" style="padding: 6px 12px; margin-bottom: 12px; font-size: 12px;" onclick="exitTrackBooking()">
          <span class="material-symbols-outlined" style="font-size: 16px;">arrow_back</span> Back to Reservations
        </button>
        <h2>Track Machinery Live: #${b.bookingId}</h2>
        <p>${b.equipmentName} • Assigned Operator: <strong>${b.workerName.ifBlank ? 'Unassigned' : b.workerName}</strong></p>
      </div>
      <button class="btn secondary" onclick="refreshTrackingDetails('${bookingId}')">
        <span class="material-symbols-outlined">sync</span> Refresh GPS
      </button>
    </div>

    <div class="track-booking-grid">
      <!-- Left Column: Status Timeline Details -->
      <div>
        <div class="timeline-card glass">
          <h3>Reservation Milestones</h3>
          <ul class="timeline-list">
            <li class="timeline-step completed">
              <div class="timeline-step-content">
                <h4>Booking Requested</h4>
                <p>Registered in system on date request</p>
              </div>
            </li>
            <li class="timeline-step ${b.bookingStatus !== "PENDING" && b.bookingStatus !== "REJECTED" ? 'completed' : 'active'}">
              <div class="timeline-step-content">
                <h4>Reservation Accepted</h4>
                <p>${b.bookingStatus === "PENDING" ? 'Awaiting owner confirmation' : 'Confirmed by owner ' + b.ownerName}</p>
              </div>
            </li>
            <li class="timeline-step ${b.workerId ? 'completed' : 'active'}">
              <div class="timeline-step-content">
                <h4>Skilled Operator Assigned</h4>
                <p>${b.workerId ? 'Operator ' + b.workerName + ' checked-in and assigned to job' : 'Awaiting worker dispatch'}</p>
              </div>
            </li>
            <li class="timeline-step ${b.bookingStatus === "IN_PROGRESS" ? 'active' : (b.bookingStatus === "COMPLETED" ? 'completed' : '')}">
              <div class="timeline-step-content">
                <h4>Operation In-Progress</h4>
                <p>Tillage / Spraying status running on field coordinates</p>
              </div>
            </li>
            <li class="timeline-step ${b.bookingStatus === "COMPLETED" ? 'completed' : ''}">
              <div class="timeline-step-content">
                <h4>Work Verified & Completed</h4>
                <p>Harvest completed, payment finalized</p>
              </div>
            </li>
          </ul>
        </div>

        <div class="info-card glass">
          <h3>Booking Summary Details</h3>
          <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px; font-size: 13px;">
            <p><strong>Farming Field Size:</strong> ${b.acres} Acres</p>
            <p><strong>Operation Rate:</strong> ₹${b.ratePerAcre} / Acre</p>
            <p><strong>Rent Amount:</strong> ₹${b.ratePerAcre * b.acres}</p>
            <p><strong>Service Fee:</strong> ₹${b.serviceFee}</p>
            <hr style="border:0; border-top: 1px solid var(--border-color); margin: 6px 0;">
            <p style="font-size: 15px; color: var(--primary);"><strong>Total Paid Amount:</strong> ₹${b.totalAmount}</p>
            <p><strong>Payment Status:</strong> <strong style="color: var(--primary);">${b.paymentStatus}</strong></p>
          </div>
        </div>
      </div>

      <!-- Right Column: Interactive Map Simulator -->
      <div>
        <div class="map-simulator-container">
          <!-- Decorative fields grid -->
          <div class="map-grid-overlay">
            <div class="map-field-cell"></div>
            <div class="map-field-cell"></div>
            <div class="map-field-cell"></div>
            <div class="map-field-cell"></div>
            <div class="map-field-cell"></div>
            <div class="map-field-cell"></div>
            <div class="map-field-cell"></div>
            <div class="map-field-cell"></div>
            <div class="map-field-cell"></div>
            <div class="map-field-cell"></div>
            <div class="map-field-cell"></div>
            <div class="map-field-cell"></div>
            <div class="map-field-cell"></div>
            <div class="map-field-cell"></div>
            <div class="map-field-cell"></div>
          </div>
          <!-- Road Path line -->
          <div class="map-road-path"></div>

          <!-- Farmer static position pin -->
          <div class="map-marker marker-farmer">
            <div class="map-marker-pin">
              <span class="material-symbols-outlined">home_pin</span>
            </div>
            <div class="map-marker-label">My Farm Field</div>
          </div>

          <!-- Tractor moving trajectory marker (Simulated via CSS keyframe) -->
          <div class="map-marker marker-tractor">
            <div class="map-marker-pin">
              <span class="material-symbols-outlined">agriculture</span>
            </div>
            <div class="map-marker-label">${b.equipmentName}</div>
          </div>

          <!-- Proximity indicator HUD -->
          <div class="map-overlay-card">
            <div class="proximity-info">
              <span class="material-symbols-outlined">navigation</span>
              <div class="proximity-text">
                <h4>Machinery En-Route</h4>
                <p>Simulating path: <strong>1.2 Km remaining (Approx 4 mins)</strong></p>
              </div>
            </div>
            <span class="suitability-pill suitable" style="background: var(--accent-light); color: #c08010; border-radius: 4px;">GPS ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function refreshTrackingDetails(bookingId) {
  alert("Re-established satellite link. Syncing GPS coordinates...");
  renderView();
}

function renderFarmerStore(el) {
  const products = db.getProducts();
  const cart = db.getCart();
  
  el.innerHTML = `
    <div class="view-header">
      <div class="view-header-title">
        <h2>Agri-Store & Seed Depot</h2>
        <p>Purchase certified crop seeds, government regulated fertilizers, and bio-pesticides with home delivery.</p>
      </div>
    </div>

    <div class="store-layout">
      <!-- Products List column -->
      <div>
        <div class="products-grid">
          ${products.map(p => `
            <div class="product-card glass">
              <div class="product-image-box">
                <span class="material-symbols-outlined">${p.icon}</span>
              </div>
              <div class="product-info">
                <span class="product-category">${p.category}</span>
                <h3>${p.name}</h3>
                <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.3; height: 30px; overflow:hidden;">
                  ${p.description}
                </p>
                <div class="product-price-row">
                  <span class="product-price">₹${p.price}</span>
                  <div class="btn-add-cart" onclick="addToCart('${p.id}')" title="Add to Cart">
                    <span class="material-symbols-outlined">add_shopping_cart</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Shopping Cart Column -->
      <aside>
        <div class="cart-card glass">
          <h3 style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px; display: flex; align-items:center; gap: 8px;">
            <span class="material-symbols-outlined">shopping_cart</span> Shopping Cart
          </h3>
          <ul class="cart-items-list" id="cart-list-container">
            <!-- Dynamic loading -->
          </ul>
          <div class="cart-cost-breakdown">
            <div class="cart-cost-row">
              <span>Subtotal</span>
              <span id="cart-subtotal">₹0.00</span>
            </div>
            <div class="cart-cost-row">
              <span>Delivery Charges</span>
              <span id="cart-delivery">₹0.00</span>
            </div>
            <div class="cart-cost-row total">
              <span>Grand Total</span>
              <span id="cart-total">₹0.00</span>
            </div>
            <button class="btn primary" style="width: 100%; margin-top: 16px;" onclick="checkoutCart()">
              Place Order (Cash on Delivery)
            </button>
          </div>
        </div>
      </aside>
    </div>
  `;
  renderCart();
}

function addToCart(productId) {
  const products = db.getProducts();
  const p = products.find(x => x.id === productId);
  if(!p) return;

  const cart = db.getCart();
  const existing = cart.find(x => x.product.id === productId);
  if(existing) {
    existing.quantity++;
  } else {
    cart.push({ product: p, quantity: 1 });
  }
  db.setCart(cart);
  renderCart();
  alert(`Added ${p.name} to cart.`);
}

function updateCartQty(productId, delta) {
  let cart = db.getCart();
  const item = cart.find(x => x.product.id === productId);
  if(item) {
    item.quantity += delta;
    if(item.quantity <= 0) {
      cart = cart.filter(x => x.product.id !== productId);
    }
  }
  db.setCart(cart);
  renderCart();
}

function renderCart() {
  const cart = db.getCart();
  const listContainer = document.getElementById("cart-list-container");
  listContainer.innerHTML = "";

  if(cart.length === 0) {
    listContainer.innerHTML = `<li style="text-align: center; padding: 24px 0; color: var(--text-muted); font-size:13px;">Your cart is empty. Add products.</li>`;
    document.getElementById("cart-subtotal").textContent = "₹0.00";
    document.getElementById("cart-delivery").textContent = "₹0.00";
    document.getElementById("cart-total").textContent = "₹0.00";
    return;
  }

  let subtotal = 0;
  cart.forEach(item => {
    const cost = item.product.price * item.quantity;
    subtotal += cost;

    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <div class="cart-item-details">
        <h4>${item.product.name}</h4>
        <p>₹${item.product.price} × ${item.quantity}</p>
      </div>
      <div class="cart-item-controls">
        <button class="cart-qty-btn" onclick="updateCartQty('${item.product.id}', -1)">-</button>
        <span class="cart-qty">${item.quantity}</span>
        <button class="cart-qty-btn" onclick="updateCartQty('${item.product.id}', 1)">+</button>
      </div>
    `;
    listContainer.appendChild(li);
  });

  const delivery = subtotal > 1000 ? 0.0 : 50.0;
  const total = subtotal + delivery;

  document.getElementById("cart-subtotal").textContent = `₹${subtotal.toFixed(2)}`;
  document.getElementById("cart-delivery").textContent = `₹${delivery.toFixed(2)}`;
  document.getElementById("cart-total").textContent = `₹${total.toFixed(2)}`;
}

function checkoutCart() {
  const cart = db.getCart();
  if(cart.length === 0) {
    alert("Cannot checkout an empty shopping cart.");
    return;
  }
  
  if(confirm("Confirm your order delivery address details (AP, India) and place order via Cash on Delivery?")) {
    db.setCart([]);
    alert("Congratulations! Order placed successfully. Delivery expected in 2-3 working days.");
    renderView();
  }
}

function renderFarmerSoil(el) {
  el.innerHTML = `
    <div class="view-header">
      <div class="view-header-title">
        <h2>Smart Soil Profiling & AI Crop Advisor</h2>
        <p>Select soil type to generate crop advisory matching the current weather and season.</p>
      </div>
    </div>

    <!-- Season banner auto-detected -->
    <div class="season-banner">
      <span class="material-symbols-outlined">calendar_month</span>
      <div class="season-banner-text">
        <h3 id="current-season-title">Rabi Crop Cycle (Winter Cycle)</h3>
        <p id="current-season-desc">Active Phase • October to March • Low rainfall, cool nights • Recommended for maize, pulses, black gram.</p>
      </div>
    </div>

    <!-- Inputs -->
    <div class="soil-profile-input-card glass">
      <h3>Select Your Farm Field Soil Characteristics</h3>
      <div class="form-group">
        <label>Selected Soil Type</label>
        <select id="selected-soil-type" class="soil-picker-btn" onchange="generateAiCropAdvisory()">
          <option value="Alluvial Delta">Alluvial Delta Soil (River Basins) - Recommended</option>
          <option value="Black Cotton">Black Cotton Soil (Deccan Traps)</option>
          <option value="Red Loamy">Red Sandy / Loamy Soil</option>
          <option value="Clay Loam">Clay Loam Soil</option>
          <option value="Sandy Loam">Sandy Loam Soil</option>
        </select>
      </div>
      
      <!-- NPK analysis details -->
      <div class="npk-values-badge-row">
        <div class="npk-badge n">
          <h4 id="npk-n">140 kg/ac</h4>
          <p>Nitrogen (N)</p>
        </div>
        <div class="npk-badge p">
          <h4 id="npk-p">35 kg/ac</h4>
          <p>Phosphorus (P)</p>
        </div>
        <div class="npk-badge k">
          <h4 id="npk-k">180 kg/ac</h4>
          <p>Potassium (K)</p>
        </div>
        <div class="npk-badge moist">
          <h4 id="npk-moist">45%</h4>
          <p>Field Moisture</p>
        </div>
      </div>
    </div>

    <!-- AI Advisory results grid -->
    <div class="advisory-results-grid" id="advisory-results-wrapper">
      <!-- Dynamic advisory loading -->
    </div>
  `;
  generateAiCropAdvisory();
}

function generateAiCropAdvisory() {
  const soilType = document.getElementById("selected-soil-type").value;
  const resultGrid = document.getElementById("advisory-results-wrapper");
  
  // Mock Recommendation Database mapping
  const recommendations = {
    "Alluvial Delta": {
      crop: "Paddy Rice (BPT 5204)",
      score: 95,
      reason: "High organic alluvial delta soil with optimal moisture retention and nitrogen level.",
      yield: "30 - 35 Bags / Acre",
      profit: "₹42,000 - ₹55,000 / Acre",
      water: "High (1200mm - 1400mm)",
      ph: "6.0 - 7.5 (Neutral)",
      machinery: "Rotavator (for tilling), walk-behind Paddy Transplanter, Combine Harvester",
      alternatives: [
        { crop: "Sugarcane (Co 86032)", yield: "45 Ton / Acre", score: 88 },
        { crop: "Black Gram (LBG-752)", yield: "6 Quintals / Acre", score: 82 }
      ]
    },
    "Black Cotton": {
      crop: "Cotton (Bt Hybrid)",
      score: 92,
      reason: "Excellent self-ploughing moisture retentive deep black soils, ideal during cool dry winters.",
      yield: "12 - 15 Quintals / Acre",
      profit: "₹38,000 - ₹48,000 / Acre",
      water: "Medium (700mm - 900mm)",
      ph: "7.2 - 8.5 (Slightly Alkaline)",
      machinery: "Deep land ploughing, weed cultivaters, tractor sprayer",
      alternatives: [
        { crop: "Bengal Gram (Desi)", yield: "8 Quintals / Acre", score: 85 },
        { crop: "Chilli (Teja-Guntur)", yield: "18 Quintals / Acre", score: 80 }
      ]
    },
    "Red Loamy": {
      crop: "Maize (Hybrid Seeds)",
      score: 90,
      reason: "Well-drained sandy-loam red soil profiles with quick water percolation, matches NPK status.",
      yield: "25 - 30 Quintals / Acre",
      profit: "₹25,000 - ₹35,000 / Acre",
      water: "Low-Medium (500mm - 700mm)",
      ph: "5.5 - 6.8 (Slightly Acidic)",
      machinery: "Tractor cultivator, seed drill sower, rotavator",
      alternatives: [
        { crop: "Groundnut (K-6)", yield: "10 Quintals / Acre", score: 86 },
        { crop: "Red Gram (Asha)", yield: "5 Quintals / Acre", score: 78 }
      ]
    },
    "Clay Loam": {
      crop: "Maize (Sweet Corn)",
      score: 87,
      reason: "Heavy texture clay loam profiles suitable for high biomass grain production cycles.",
      yield: "22 - 28 Quintals / Acre",
      profit: "₹28,000 - ₹38,000 / Acre",
      water: "Medium (800mm)",
      ph: "6.5 - 7.2",
      machinery: "Rotavator, tractor cultivators",
      alternatives: [
        { crop: "Sorghum / Jowar", yield: "12 Quintals / Acre", score: 80 },
        { crop: "Sunflower (S-275)", yield: "8 Quintals / Acre", score: 75 }
      ]
    },
    "Sandy Loam": {
      crop: "Groundnut (VRI-2)",
      score: 93,
      reason: "Loose sandy loam texture facilitates excellent pod development and easier crop harvesting.",
      yield: "12 Quintals / Acre",
      profit: "₹30,000 - ₹40,000 / Acre",
      water: "Low (450mm - 600mm)",
      ph: "6.0 - 6.5",
      machinery: "Tillage cultivators, weeders",
      alternatives: [
        { crop: "Sesame (Gingelly)", yield: "4 Quintals / Acre", score: 84 },
        { crop: "Pearl Millet (Bajra)", yield: "15 Quintals / Acre", score: 80 }
      ]
    }
  };

  const adv = recommendations[soilType];
  if(!adv) return;

  // Set NPK display labels dynamically
  if(soilType === "Black Cotton") {
    document.getElementById("npk-n").textContent = "90 kg/ac";
    document.getElementById("npk-p").textContent = "22 kg/ac";
    document.getElementById("npk-k").textContent = "290 kg/ac";
    document.getElementById("npk-moist").textContent = "58%";
  } else if(soilType === "Red Loamy") {
    document.getElementById("npk-n").textContent = "110 kg/ac";
    document.getElementById("npk-p").textContent = "18 kg/ac";
    document.getElementById("npk-k").textContent = "120 kg/ac";
    document.getElementById("npk-moist").textContent = "30%";
  } else {
    document.getElementById("npk-n").textContent = "140 kg/ac";
    document.getElementById("npk-p").textContent = "35 kg/ac";
    document.getElementById("npk-k").textContent = "180 kg/ac";
    document.getElementById("npk-moist").textContent = "45%";
  }

  resultGrid.innerHTML = `
    <!-- Top Recommended Crop Card -->
    <div class="primary-recommendation-card glass">
      <span class="match-score-badge">${adv.score}% Match</span>
      <h3 style="font-size: 14px; text-transform: uppercase; color: var(--text-muted); font-weight:600;">Primary Recommended Crop</h3>
      <h2 style="font-size: 28px; color: var(--primary); margin-top: 4px;">${adv.crop}</h2>
      <p style="font-size: 14px; color: var(--text-secondary); margin-top: 8px; line-height: 1.5;">${adv.reason}</p>
      
      <div class="recommendation-yield-matrix">
        <div class="matrix-cell">
          <h4>${adv.yield}</h4>
          <p>Expected Yield Estimate</p>
        </div>
        <div class="matrix-cell">
          <h4>${adv.profit}</h4>
          <p>Estimated Net Profit / Ac</p>
        </div>
      </div>

      <div class="crop-guide-details">
        <div class="guide-item">
          <span class="material-symbols-outlined">water_drop</span>
          <div class="guide-text">
            <h4>Water Requirements</h4>
            <p>${adv.water}</p>
          </div>
        </div>
        <div class="guide-item">
          <span class="material-symbols-outlined">science</span>
          <div class="guide-text">
            <h4>Ideal Soil pH Range</h4>
            <p>${adv.ph}</p>
          </div>
        </div>
        <div class="guide-item">
          <span class="material-symbols-outlined">agriculture</span>
          <div class="guide-text">
            <h4>Recommended Machinery Fleet</h4>
            <p>${adv.machinery}</p>
          </div>
        </div>
      </div>

      <button class="btn primary" style="width: 100%; margin-top: 24px;" onclick="switchView('search')">
        Reserve Fleet for this Crop
      </button>
    </div>

    <!-- Alternate Crops Panel -->
    <div class="alternate-crops-panel">
      <h3>Alternative Cultivation Matches</h3>
      ${adv.alternatives.map(alt => `
        <div class="alt-crop-card glass" onclick="alert('Showing alternate advisory for ${alt.crop}')">
          <div class="alt-crop-meta">
            <h4>${alt.crop}</h4>
            <p>Yield: ${alt.yield}</p>
          </div>
          <span class="alt-crop-score">${alt.score}% Match</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderFarmerCommunity(el) {
  const posts = db.getPosts();
  
  el.innerHTML = `
    <div class="view-header">
      <div class="view-header-title">
        <h2>Farming Community Chat & Forum</h2>
        <p>Ask crop questions, share pest diagnostics, or chat with farmers and experts locally.</p>
      </div>
    </div>

    <div class="community-layout">
      <!-- Left Column: Chat Room Channels -->
      <div>
        <h3>Live Group Channels</h3>
        <div class="chat-rooms-list" style="margin-top: 16px;">
          <div class="chat-room-tile glass active" onclick="switchChatRoom('paddy')">
            <div class="room-avatar" style="background: var(--primary);">🌾</div>
            <div class="room-info">
              <h4>Andhra Paddy Cultivators</h4>
              <p>Active members: 42 • Latest: Urea dosage tips</p>
            </div>
          </div>
          <div class="chat-room-tile glass" onclick="switchChatRoom('drones')">
            <div class="room-avatar" style="background: var(--info);">🛸</div>
            <div class="room-info">
              <h4>Kisan Drone Operators Hub</h4>
              <p>Active members: 18 • Latest: DJI calibration</p>
            </div>
          </div>
          <div class="chat-room-tile glass" onclick="switchChatRoom('market')">
            <div class="room-avatar" style="background: var(--accent);">💰</div>
            <div class="room-info">
              <h4>Guntur Chilli Market Rates</h4>
              <p>Active members: 110 • Latest: Price hikes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Interactive Chat Window -->
      <div>
        <div class="chat-window-card glass">
          <div class="chat-window-header">
            <h3 id="chat-room-title">🌾 Andhra Paddy Cultivators</h3>
          </div>
          <div class="chat-messages-container" id="chat-messages-box">
            <!-- Messages load here -->
            <div class="message-bubble incoming">
              <span class="msg-sender">Kalyan Ram</span>
              <p class="msg-text">Which pesticide is best for leaf folder control in Kharif paddy?</p>
              <p class="msg-time">10:02 AM</p>
            </div>
            <div class="message-bubble incoming">
              <span class="msg-sender">Ramesh Reddy (Owner)</span>
              <p class="msg-text">Apply Virtako 100g/acre diluted in 200L water. Worked well for me.</p>
              <p class="msg-time">10:05 AM</p>
            </div>
            <div class="message-bubble outgoing">
              <span class="msg-sender">Ravi Kumar (You)</span>
              <p class="msg-text">Thanks Ramesh, I will order neem oil from store too as alternative.</p>
              <p class="msg-time">10:15 AM</p>
            </div>
          </div>
          <form class="chat-input-bar" onsubmit="sendChatMessage(event)">
            <input type="text" id="chat-msg-input" placeholder="Type agricultural query message..." required>
            <button type="submit" class="btn-send-chat">
              <span class="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

function switchChatRoom(roomKey) {
  const titleEl = document.getElementById("chat-room-title");
  const msgBox = document.getElementById("chat-messages-box");
  document.querySelectorAll(".chat-room-tile").forEach(tile => tile.classList.remove("active"));
  
  if (roomKey === 'paddy') {
    titleEl.textContent = "🌾 Andhra Paddy Cultivators";
    msgBox.innerHTML = `
      <div class="message-bubble incoming"><span class="msg-sender">Kalyan Ram</span><p class="msg-text">Which pesticide is best for leaf folder control in Kharif paddy?</p><p class="msg-time">10:02 AM</p></div>
      <div class="message-bubble incoming"><span class="msg-sender">Ramesh Reddy (Owner)</span><p class="msg-text">Apply Virtako 100g/acre diluted in 200L water. Worked well for me.</p><p class="msg-time">10:05 AM</p></div>
      <div class="message-bubble outgoing"><span class="msg-sender">Ravi Kumar (You)</span><p class="msg-text">Thanks Ramesh, I will order neem oil from store too.</p><p class="msg-time">10:15 AM</p></div>
    `;
  } else if (roomKey === 'drones') {
    titleEl.textContent = "🛸 Kisan Drone Operators Hub";
    msgBox.innerHTML = `
      <div class="message-bubble incoming"><span class="msg-sender">Rambabu (Worker)</span><p class="msg-text">Calibrating nozzle pressure on Garuda Kisan Drone 16L. Any tips?</p><p class="msg-time">Yesterday</p></div>
      <div class="message-bubble incoming"><span class="msg-sender">Greeshma (Owner)</span><p class="msg-text">Keep it at 0.3 MPa for liquid urea split doses.</p><p class="msg-time">Yesterday</p></div>
    `;
  } else if (roomKey === 'market') {
    titleEl.textContent = "💰 Guntur Chilli Market Rates";
    msgBox.innerHTML = `
      <div class="message-bubble incoming"><span class="msg-sender">Venkat M.</span><p class="msg-text">Teja Guntur chilli rates touched ₹19,500 per quintal today.</p><p class="msg-time">12:30 PM</p></div>
      <div class="message-bubble incoming"><span class="msg-sender">Ravi Kumar (Farmer)</span><p class="msg-text">Good rate! Hope it holds till next harvest.</p><p class="msg-time">01:00 PM</p></div>
    `;
  }
}

function sendChatMessage(e) {
  e.preventDefault();
  const input = document.getElementById("chat-msg-input");
  const text = input.value;
  if(!text) return;

  const msgBox = document.getElementById("chat-messages-box");
  const bubble = document.createElement("div");
  bubble.className = "message-bubble outgoing";
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  bubble.innerHTML = `
    <span class="msg-sender">${USER_PROFILES[currentRole].name} (You)</span>
    <p class="msg-text">${text}</p>
    <p class="msg-time">${timeStr}</p>
  `;
  msgBox.appendChild(bubble);
  input.value = "";
  msgBox.scrollTop = msgBox.scrollHeight;
}

function renderFarmerDams(el) {
  const dams = db.getDams();
  
  el.innerHTML = `
    <div class="view-header">
      <div class="view-header-title">
        <h2>Water Reservoir Levels & Disaster Warning System</h2>
        <p>Live stats from Central Water Commission reference data for flood mitigation planning.</p>
      </div>
    </div>

    <!-- Warnings panel alerts -->
    <div class="weather-advisory-card caution" style="margin-bottom: 32px;">
      <span class="material-symbols-outlined advisory-icon">warning</span>
      <div class="advisory-text">
        <h4>Krishna River Basin Caution Alert</h4>
        <p>Srisailam Reservoir capacity reached 96%. Outflow gates may be opened, causing localized canal rise. Plan deep ploughing accordingly.</p>
      </div>
    </div>

    <div class="dams-grid">
      ${dams.map(dam => {
        const isCaution = dam.status === "CAUTION";
        return `
          <div class="dam-status-card glass" style="border-top: 4px solid ${isCaution ? 'var(--warning)' : 'var(--info)'}">
            <div class="dam-header">
              <h3>${dam.damName}</h3>
              <span class="suitability-pill ${isCaution ? 'caution' : 'suitable'}">${dam.status}</span>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: -10px;">District: ${dam.district}</p>
            
            <div style="margin-top: 12px;">
              <div class="dam-stats-row">
                <span>Water Fill Level:</span>
                <span class="val">${dam.waterLevelPercentage}%</span>
              </div>
              <div class="dam-level-bar-wrap" style="margin-top: 6px;">
                <div class="dam-level-fill" style="width: ${dam.waterLevelPercentage}%; background-color: ${isCaution ? 'var(--warning)' : 'var(--info)'}"></div>
              </div>
            </div>

            <div class="dam-stats-row" style="margin-top: 8px;">
              <span>Total Capacity:</span>
              <span class="val">${dam.reservoirCapacityTmc} TMC</span>
            </div>
            <div class="dam-stats-row">
              <span>Current Height:</span>
              <span class="val">${dam.currentWaterLevelFt} Ft</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ==================== OWNER VIEW RENDERERS ====================

function renderOwnerHome(el) {
  const profile = USER_PROFILES.OWNER;
  const machinery = db.getMachinery().filter(m => m.ownerId === "owner_primary" || !m.ownerId.startsWith("owner_"));
  const bookings = db.getBookings();
  const workers = db.getWorkers();

  const totalEarnings = bookings.filter(b => b.bookingStatus === "COMPLETED").reduce((sum, b) => sum + b.totalAmount, 0) || 54000;
  
  el.innerHTML = `
    <div class="view-header">
      <div class="view-header-title">
        <h2>Owner Dashboard - ${profile.name}</h2>
        <p>Hub location: 📍 ${profile.location}</p>
      </div>
      <button class="btn primary" onclick="openAddMachineryModal()">
        <span class="material-symbols-outlined">add</span> List New Equipment
      </button>
    </div>

    <!-- Stat widget row -->
    <div class="stats-container">
      <div class="stat-widget glass">
        <div class="stat-icon-wrapper success">
          <span class="material-symbols-outlined">payments</span>
        </div>
        <div class="stat-details">
          <h3>₹${totalEarnings.toLocaleString()}</h3>
          <p>Total Revenue</p>
        </div>
      </div>
      <div class="stat-widget glass">
        <div class="stat-icon-wrapper primary">
          <span class="material-symbols-outlined">agriculture</span>
        </div>
        <div class="stat-details">
          <h3>${machinery.length}</h3>
          <p>Machinery Units</p>
        </div>
      </div>
      <div class="stat-widget glass">
        <div class="stat-icon-wrapper accent">
          <span class="material-symbols-outlined">badge</span>
        </div>
        <div class="stat-details">
          <h3>${workers.length}</h3>
          <p>Registered Operators</p>
        </div>
      </div>
      <div class="stat-widget glass">
        <div class="stat-icon-wrapper danger">
          <span class="material-symbols-outlined">pending_actions</span>
        </div>
        <div class="stat-details">
          <h3>${bookings.filter(b => b.bookingStatus === "PENDING").length}</h3>
          <p>Pending Requests</p>
        </div>
      </div>
    </div>

    <div class="farmer-home-layout">
      <!-- Weekly Trends chart SVG mockup -->
      <div class="weekly-trends-chart-card glass">
        <h3>Weekly Fleet Rental Trends (₹ Earnings)</h3>
        <div class="chart-svg-container">
          <svg viewBox="0 0 500 200">
            <!-- Grid Lines -->
            <line x1="40" y1="20" x2="480" y2="20" stroke="var(--border-color)" stroke-dasharray="4"/>
            <line x1="40" y1="80" x2="480" y2="80" stroke="var(--border-color)" stroke-dasharray="4"/>
            <line x1="40" y1="140" x2="480" y2="140" stroke="var(--border-color)" stroke-dasharray="4"/>
            <line x1="40" y1="180" x2="480" y2="180" stroke="var(--text-muted)" stroke-width="1.5"/>
            
            <!-- Bars/Lines graph -->
            <path d="M 50 160 L 120 120 L 190 140 L 260 70 L 330 90 L 400 40 L 470 50" 
                  fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round"/>
                  
            <!-- Data Points dots -->
            <circle cx="50" cy="160" r="5" fill="var(--accent)" stroke="#fff" stroke-width="1.5"/>
            <circle cx="120" cy="120" r="5" fill="var(--accent)" stroke="#fff" stroke-width="1.5"/>
            <circle cx="190" cy="140" r="5" fill="var(--accent)" stroke="#fff" stroke-width="1.5"/>
            <circle cx="260" cy="70" r="5" fill="var(--accent)" stroke="#fff" stroke-width="1.5"/>
            <circle cx="330" cy="90" r="5" fill="var(--accent)" stroke="#fff" stroke-width="1.5"/>
            <circle cx="400" cy="40" r="5" fill="var(--accent)" stroke="#fff" stroke-width="1.5"/>
            <circle cx="470" cy="50" r="5" fill="var(--accent)" stroke="#fff" stroke-width="1.5"/>

            <!-- Axis Labels -->
            <text x="50" y="195" font-size="10" fill="var(--text-muted)" text-anchor="middle">Mon</text>
            <text x="120" y="195" font-size="10" fill="var(--text-muted)" text-anchor="middle">Tue</text>
            <text x="190" y="195" font-size="10" fill="var(--text-muted)" text-anchor="middle">Wed</text>
            <text x="260" y="195" font-size="10" fill="var(--text-muted)" text-anchor="middle">Thu</text>
            <text x="330" y="195" font-size="10" fill="var(--text-muted)" text-anchor="middle">Fri</text>
            <text x="400" y="195" font-size="10" fill="var(--text-muted)" text-anchor="middle">Sat</text>
            <text x="470" y="195" font-size="10" fill="var(--text-muted)" text-anchor="middle">Sun</text>
          </svg>
        </div>
      </div>

      <!-- Quick Pending Requests Panel -->
      <div class="info-card glass">
        <h3>Recent Bookings</h3>
        <div style="margin-top:16px;" id="owner-pending-preview-list">
          <!-- Dynamic loaded requests -->
        </div>
        <button class="btn secondary" style="width: 100%; margin-top: 12px;" onclick="switchView('requests')">View All Requests</button>
      </div>
    </div>
  `;
  
  const pendingList = document.getElementById("owner-pending-preview-list");
  const pBookings = bookings.filter(b => b.bookingStatus === "PENDING");
  if(pBookings.length === 0) {
    pendingList.innerHTML = `<p class="text-muted" style="font-size:13px;">No new reservation requests pending.</p>`;
  } else {
    pBookings.slice(0, 2).forEach(b => {
      const el = document.createElement("div");
      el.style = "border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px; font-size:13px;";
      el.innerHTML = `
        <p><strong>Farmer:</strong> ${b.farmerName}</p>
        <p><strong>Fleet:</strong> ${b.equipmentName}</p>
        <p><strong>Amt:</strong> ₹${b.totalAmount} • Acres: ${b.acres}</p>
      `;
      pendingList.appendChild(el);
    });
  }
}

function renderOwnerMachinery(el) {
  const fleet = db.getMachinery().filter(m => m.ownerId === "owner_primary" || !m.ownerId.startsWith("owner_"));

  el.innerHTML = `
    <div class="view-header">
      <div class="view-header-title">
        <h2>My Listed Fleet Machinery</h2>
        <p>Manage, view approval document status, or list new tractors and attachments.</p>
      </div>
      <button class="btn primary" onclick="openAddMachineryModal()">
        <span class="material-symbols-outlined">add</span> List New Equipment
      </button>
    </div>

    <div class="machinery-grid">
      ${fleet.map(eq => {
        let isAvail = eq.availability === "AVAILABLE";
        let isVer = eq.isVerified === true;
        let imageSrc = "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=350&auto=format&fit=crop"; // Tractor default
        if(eq.category === "Harvester") imageSrc = "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=350&auto=format&fit=crop";
        else if(eq.category === "Drone") imageSrc = "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=350&auto=format&fit=crop";
        else if(eq.category === "Transplanter" || eq.category === "Rotavator") imageSrc = "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=350&auto=format&fit=crop";

        return `
          <div class="machinery-card glass">
            <div class="machinery-img-wrap">
              <img src="${imageSrc}" alt="${eq.name}">
              <span class="machinery-badge ${isAvail ? 'available' : 'unavailable'}">${eq.availability}</span>
            </div>
            <div class="machinery-content">
              <div class="machinery-title-row">
                <h3>${eq.name}</h3>
                <span class="status-badge ${isVer ? 'completed' : 'pending'}">${isVer ? 'Verified' : 'Pending Docs'}</span>
              </div>
              <div class="machinery-specs">
                <span>Category: ${eq.category}</span>
                <span>Reg No: ${eq.vehicleNumber}</span>
              </div>
              <p style="font-size:12px; color: var(--text-secondary); height:48px; overflow:hidden;">
                ${eq.description}
              </p>
              <div class="machinery-price-row">
                <div class="price-text">
                  <h4>₹${eq.pricePerAcre}</h4>
                  <p>PER ACRE RATE</p>
                </div>
                <button class="btn secondary" style="font-size:12px; padding: 6px 12px;" onclick="alert('Demo: Update details or schedule maintenance.')">Manage</button>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderOwnerRequests(el) {
  const bookings = db.getBookings();
  const pendingBookings = bookings.filter(b => b.bookingStatus === "PENDING");
  const activeBookings = bookings.filter(b => b.bookingStatus !== "PENDING" && b.bookingStatus !== "COMPLETED" && b.bookingStatus !== "REJECTED");
  const workers = db.getWorkers();

  el.innerHTML = `
    <div class="view-header">
      <div class="view-header-title">
        <h2>Customer Reservations & Scheduling</h2>
        <p>Review bookings, accept requests, and assign active operators to fields.</p>
      </div>
    </div>

    <div style="max-width: 800px;">
      <div class="machinery-section-header">
        <h3>Pending Inbound Requests (${pendingBookings.length})</h3>
      </div>
      <div class="machinery-list-vertical" style="margin-bottom: 32px;" id="owner-pending-requests-box">
        <!-- Dynamic loading -->
      </div>

      <div class="machinery-section-header">
        <h3>Active Schedules & Assigned Tasks (${activeBookings.length})</h3>
      </div>
      <div class="machinery-list-vertical" id="owner-active-requests-box">
        <!-- Dynamic loading -->
      </div>
    </div>
  `;

  // Render pending list
  const pendingBox = document.getElementById("owner-pending-requests-box");
  if(pendingBookings.length === 0) {
    pendingBox.innerHTML = `<p class="text-muted" style="padding:16px;">No pending reservation requests currently.</p>`;
  } else {
    pendingBookings.forEach(b => {
      const card = document.createElement("div");
      card.className = "booking-card glass";
      card.style.flexDirection = "column";
      card.style.alignItems = "stretch";
      card.style.gap = "16px";
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h4 style="font-size: 16px; color: var(--primary);">${b.equipmentName}</h4>
            <p style="font-size: 13px; color: var(--text-secondary); margin-top:2px;">
              Farmer: <strong>${b.farmerName}</strong> • Phone: ${b.farmerPhone}
            </p>
            <p style="font-size: 12px; color: var(--text-muted); margin-top:2px;">
              Field Location: 📍 ${b.location}
            </p>
          </div>
          <div style="text-align: right;">
            <h4 style="font-size: 18px; color: var(--primary);">₹${b.totalAmount}</h4>
            <p style="font-size: 11px; color: var(--text-muted); font-weight:600;">For ${b.acres} Acres</p>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 12px;">
          <div class="form-group" style="margin-bottom: 0; min-width: 250px;">
            <select class="filter-select" id="assign-worker-select-${b.bookingId}" style="min-width: 250px; background: var(--bg-primary);">
              <option value="">-- Assign Field Operator (Worker) --</option>
              ${workers.map(w => `<option value="${w.id}">${w.name} (${w.skill})</option>`).join('')}
            </select>
          </div>
          
          <div class="verification-actions">
            <button class="btn danger" onclick="rejectBookingRequest('${b.bookingId}')">Reject</button>
            <button class="btn success" onclick="acceptBookingRequest('${b.bookingId}')">Accept & Assign</button>
          </div>
        </div>
      `;
      pendingBox.appendChild(card);
    });
  }

  // Render active listings
  const activeBox = document.getElementById("owner-active-requests-box");
  if(activeBookings.length === 0) {
    activeBox.innerHTML = `<p class="text-muted" style="padding:16px;">No active operations currently running.</p>`;
  } else {
    activeBookings.forEach(b => {
      const card = document.createElement("div");
      card.className = "booking-card glass";
      card.innerHTML = `
        <div class="booking-details-summary">
          <div class="booking-icon-wrap" style="background: var(--primary-light); color: var(--primary);">
            <span class="material-symbols-outlined">check_circle</span>
          </div>
          <div class="booking-meta">
            <h4>${b.equipmentName} - #${b.bookingId}</h4>
            <p>Farmer: ${b.farmerName} • Location: ${b.location}</p>
            <p style="font-size:11px; color: var(--text-muted); margin-top:2px;">
              Operator Assigned: <strong>${b.workerName || 'Unassigned'}</strong> • Status: <strong style="color:var(--primary);">${b.bookingStatus}</strong>
            </p>
          </div>
        </div>
        <div class="booking-status-box">
          <span class="status-badge ${b.bookingStatus.toLowerCase()}">${b.bookingStatus.replace("_", " ")}</span>
          <button class="btn secondary" style="font-size: 11px; padding: 6px 12px; margin-top: 4px;" onclick="triggerMockWorkComplete('${b.bookingId}')">
            Set Completed
          </button>
        </div>
      `;
      activeBox.appendChild(card);
    });
  }
}

function acceptBookingRequest(bookingId) {
  const wSelect = document.getElementById(`assign-worker-select-${bookingId}`);
  const wId = wSelect.value;
  if (!wId) {
    alert("Please select a farm operator (worker) from the dropdown to assign to this fleet reservation.");
    return;
  }

  const workers = db.getWorkers();
  const worker = workers.find(x => x.id === wId);

  const bookings = db.getBookings();
  const b = bookings.find(x => x.bookingId === bookingId);
  if(b) {
    b.bookingStatus = "WORKER_ASSIGNED";
    b.workerId = worker.id;
    b.workerName = worker.name;
    b.paymentStatus = "CASH_PENDING";
    
    // Also save in DB
    db.setBookings(bookings);
    alert(`Booking accepted. ${worker.name} has been notified and dispatched to coordinates.`);
    renderView();
  }
}

function rejectBookingRequest(bookingId) {
  if (confirm("Are you sure you want to reject this booking reservation request?")) {
    const bookings = db.getBookings();
    const b = bookings.find(x => x.bookingId === bookingId);
    if(b) {
      b.bookingStatus = "REJECTED";
      db.setBookings(bookings);
      alert("Reservation request rejected.");
      renderView();
    }
  }
}

function triggerMockWorkComplete(bookingId) {
  const bookings = db.getBookings();
  const b = bookings.find(x => x.bookingId === bookingId);
  if(b) {
    b.bookingStatus = "COMPLETED";
    b.paymentStatus = "PAID";
    db.setBookings(bookings);
    alert("Task marked as completed. Earnings registered in dashboard.");
    renderView();
  }
}

function renderOwnerWorkers(el) {
  const workers = db.getWorkers();
  
  el.innerHTML = `
    <div class="view-header">
      <div class="view-header-title">
        <h2>Manage Farm Operators (Workers)</h2>
        <p>Register drivers, drone pilots, track daily wage records and field availability.</p>
      </div>
      <button class="btn primary" onclick="openAddWorkerModal()">
        <span class="material-symbols-outlined">add</span> Register Operator
      </button>
    </div>

    <div class="verification-table-card glass">
      <table class="verification-table">
        <thead>
          <tr>
            <th>Operator Name</th>
            <th>Mobile Number</th>
            <th>Primary Skill Role</th>
            <th>Daily Wage</th>
            <th>Field Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${workers.map(w => `
            <tr>
              <td><strong>${w.name}</strong></td>
              <td>${w.phone}</td>
              <td><span class="suitability-pill suitable" style="background:var(--primary-light); color:var(--primary); font-weight:600;">${w.skill}</span></td>
              <td>₹${w.dailyWage} / Day</td>
              <td><span class="status-badge ${w.status === 'Available' ? 'confirmed' : 'pending'}">${w.status}</span></td>
              <td>
                <button class="btn secondary" style="font-size: 11px; padding: 6px 12px;" onclick="toggleWorkerAvailability('${w.id}')">Toggle Duty</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function toggleWorkerAvailability(workerId) {
  const workers = db.getWorkers();
  const w = workers.find(x => x.id === workerId);
  if(w) {
    w.status = w.status === "Available" ? "On Field Duty" : "Available";
    db.setWorkers(workers);
    renderView();
  }
}

// ==================== WORKER VIEW RENDERERS ====================

function renderWorkerHome(el) {
  const profile = USER_PROFILES.WORKER;
  const bookings = db.getBookings().filter(b => b.workerId === "WRK_1" && b.bookingStatus !== "COMPLETED");

  el.innerHTML = `
    <div class="view-header">
      <div class="view-header-title">
        <h2>Operator Duty Desk: ${profile.name}</h2>
        <p>GPS Field Tracking Status: <strong style="color:var(--primary);">ACTIVE</strong></p>
      </div>
    </div>

    <div class="farmer-home-layout">
      <!-- Left Column: Attendance & GPS checkin -->
      <div>
        <div class="info-card glass" style="margin-bottom: 24px;">
          <h3>Field Attendance & GPS Check-In</h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 8px;">
            Log your presence at the assigned farm field coordinates for payroll validation.
          </p>
          
          <div style="margin-top: 20px; display: flex; gap: 12px;" id="worker-attendance-box">
            <!-- Dynamic loaded button -->
            <button class="btn success" onclick="workerCheckIn()">
              <span class="material-symbols-outlined">pin_drop</span> Confirm Field Check-In
            </button>
          </div>
        </div>

        <div class="machinery-section-header">
          <h3>Assigned Field Jobs</h3>
        </div>
        <div class="machinery-list-vertical" id="worker-jobs-container">
          <!-- Dynamic jobs list -->
        </div>
      </div>

      <!-- Right Column: Payout details -->
      <aside>
        <div class="info-card glass" style="margin-bottom: 24px;">
          <h3>Earnings Summary</h3>
          <div style="margin-top: 16px; display: flex; flex-direction:column; gap: 8px; font-size:13px;">
            <p>Daily Operator Wage: <strong>₹600.00 / Day</strong></p>
            <p>Completed Jobs Count: <strong>3</strong></p>
            <p>Total Operator Earnings: <strong>₹1,800.00</strong></p>
            <p>Pending Payout: <strong>₹1,200.00</strong></p>
            <button class="btn primary" style="width: 100%; margin-top: 12px;" onclick="alert('Payout request submitted to owner Ramesh Reddy.')">Request Payout</button>
          </div>
        </div>
      </aside>
    </div>
  `;
  renderWorkerJobsList();
}

function renderWorkerJobsList() {
  const container = document.getElementById("worker-jobs-container");
  const bookings = db.getBookings().filter(b => b.workerId === "WRK_1" && b.bookingStatus !== "COMPLETED");

  if(bookings.length === 0) {
    container.innerHTML = `<p class="text-muted" style="padding:16px;">You have no active farm field jobs assigned currently.</p>`;
  } else {
    bookings.forEach(b => {
      const card = document.createElement("div");
      card.className = "booking-card glass";
      card.innerHTML = `
        <div class="booking-details-summary">
          <div class="booking-icon-wrap" style="background:var(--accent-light); color:var(--accent);">
            <span class="material-symbols-outlined">agriculture</span>
          </div>
          <div class="booking-meta">
            <h4>${b.equipmentName}</h4>
            <p>Farmer: ${b.farmerName} • Acres: ${b.acres}</p>
            <p style="font-size: 11px; color: var(--text-secondary); margin-top:2px;">Location: 📍 ${b.location}</p>
          </div>
        </div>
        <div class="booking-status-box">
          <span class="status-badge worker_assigned">Assigned</span>
          <button class="btn success" style="font-size: 11px; padding: 6px 12px; margin-top:4px;" onclick="triggerMockWorkComplete('${b.bookingId}')">
            Mark Completed
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  }
}

function workerCheckIn() {
  const box = document.getElementById("worker-attendance-box");
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  box.innerHTML = `
    <div style="display:flex; align-items:center; gap: 8px; color: var(--success); font-weight:600; font-size:14px;">
      <span class="material-symbols-outlined">verified</span>
      <span>Checked In Today at ${timeStr} near Mevalurkuppam Field</span>
    </div>
  `;
}

function renderWorkerTasks(el) {
  renderWorkerHome(el); // Redirect since views overlap in simple mockup
}

// ==================== ADMIN VIEW RENDERERS ====================

function renderAdminHome(el) {
  const fleet = db.getMachinery();
  const bookings = db.getBookings();
  
  el.innerHTML = `
    <div class="view-header">
      <div class="view-header-title">
        <h2>System Administration Command Console</h2>
        <p>Monitor system traffic, verify listed heavy fleet machinery documents, and track transactions.</p>
      </div>
    </div>

    <!-- Stats summary Row -->
    <div class="stats-container">
      <div class="stat-widget glass">
        <div class="stat-icon-wrapper primary">
          <span class="material-symbols-outlined">group</span>
        </div>
        <div class="stat-details">
          <h3>1,940</h3>
          <p>Total Registered Users</p>
        </div>
      </div>
      <div class="stat-widget glass">
        <div class="stat-icon-wrapper success">
          <span class="material-symbols-outlined">agriculture</span>
        </div>
        <div class="stat-details">
          <h3>${fleet.length}</h3>
          <p>Listed Fleet Units</p>
        </div>
      </div>
      <div class="stat-widget glass">
        <div class="stat-icon-wrapper info">
          <span class="material-symbols-outlined">shopping_cart</span>
        </div>
        <div class="stat-details">
          <h3>${bookings.length}</h3>
          <p>Total Bookings</p>
        </div>
      </div>
      <div class="stat-widget glass">
        <div class="stat-icon-wrapper danger">
          <span class="material-symbols-outlined">fact_check</span>
        </div>
        <div class="stat-details">
          <h3>${fleet.filter(m => !m.isVerified).length}</h3>
          <p>Pending Verifications</p>
        </div>
      </div>
    </div>

    <div class="info-card glass">
      <h3>Active System Transactions</h3>
      <div style="margin-top: 16px;">
        <table class="verification-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Owner</th>
              <th>Machinery</th>
              <th>Cost Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${bookings.map(b => `
              <tr>
                <td>#${b.bookingId}</td>
                <td>${b.farmerName}</td>
                <td>${b.ownerName}</td>
                <td>${b.equipmentName}</td>
                <td>₹${b.totalAmount}</td>
                <td><span class="status-badge ${b.bookingStatus.toLowerCase()}">${b.bookingStatus.replace("_", " ")}</span></td>
              </tr>
            `).join('')}
            ${bookings.length === 0 ? `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No system transactions found.</td></tr>` : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAdminVerification(el) {
  const fleet = db.getMachinery();
  const pendingFleet = fleet.filter(m => !m.isVerified);

  el.innerHTML = `
    <div class="view-header">
      <div class="view-header-title">
        <h2>Verify Listed Fleet Machinery RC Documents</h2>
        <p>Inspect uploaded vehicle registration certificates (RC) and approve listings for public rental.</p>
      </div>
    </div>

    <div class="verification-table-card glass">
      <table class="verification-table">
        <thead>
          <tr>
            <th>Machinery Model</th>
            <th>Owner Details</th>
            <th>Registration No</th>
            <th>Uploaded RC File</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="admin-verification-tbody">
          <!-- Dynamic loading -->
        </tbody>
      </table>
    </div>
  `;

  const tbody = document.getElementById("admin-verification-tbody");
  if(pendingFleet.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 24px; color:var(--text-muted);">All machinery listings verified and approved. No files pending in queue.</td></tr>`;
  } else {
    pendingFleet.forEach(m => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${m.name}</strong> (${m.category})</td>
        <td>${m.ownerName} (${m.ownerPhone})</td>
        <td>${m.vehicleNumber}</td>
        <td>
          <span class="doc-link-btn" onclick="alert('Viewing Uploaded RC Copy PDF: Verified registration details match registration number TN 21...')">
            <span class="material-symbols-outlined" style="font-size:16px; vertical-align:middle;">picture_as_pdf</span> View_RC_Doc.pdf
          </span>
        </td>
        <td>
          <div class="verification-actions">
            <button class="btn danger" style="padding:6px 12px; font-size:11px;" onclick="rejectListing('${m.id}')">Reject</button>
            <button class="btn success" style="padding:6px 12px; font-size:11px;" onclick="approveListing('${m.id}')">Approve & Publish</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function approveListing(id) {
  const fleet = db.getMachinery();
  const eq = fleet.find(x => x.id === id);
  if(eq) {
    eq.isVerified = true;
    db.setMachinery(fleet);
    alert(`Machinery ${eq.name} approved successfully. Published live in search results.`);
    renderView();
  }
}

function rejectListing(id) {
  if (confirm("Are you sure you want to reject this machinery listing registration doc?")) {
    let fleet = db.getMachinery();
    fleet = fleet.filter(x => x.id !== id);
    db.setMachinery(fleet);
    alert("Machinery listing rejected and deleted from registration queue.");
    renderView();
  }
}

// ==================== MODAL OVERLAYS CONTROLLER LOGIC ====================

function openBookingModal(eqId) {
  const eq = db.getMachinery().find(x => x.id === eqId);
  if(!eq) return;

  document.getElementById("booking-eq-id").value = eqId;
  document.getElementById("modal-eq-name").textContent = eq.name;
  document.getElementById("modal-eq-owner").textContent = eq.ownerName;
  document.getElementById("modal-eq-location").textContent = eq.location;
  document.getElementById("modal-eq-phone").textContent = "Contact: " + eq.ownerPhone;
  document.getElementById("modal-eq-rate").textContent = "₹" + eq.pricePerAcre;
  document.getElementById("modal-eq-desc").textContent = eq.description;
  document.getElementById("modal-eq-hp").innerHTML = `<span class="material-symbols-outlined">bolt</span> ${eq.hpRating || 50} HP`;
  document.getElementById("modal-eq-rating").innerHTML = `<span class="material-symbols-outlined text-yellow" style="color:var(--accent);">star</span> ${eq.rating} (${eq.reviewCount} reviews)`;
  
  // Set default booking date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById("booking-date").value = tomorrow.toISOString().split('T')[0];

  let imageSrc = "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=350&auto=format&fit=crop"; // Tractor default
  if(eq.category === "Harvester") imageSrc = "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=350&auto=format&fit=crop";
  else if(eq.category === "Drone") imageSrc = "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=350&auto=format&fit=crop";
  else if(eq.category === "Transplanter" || eq.category === "Rotavator") imageSrc = "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=350&auto=format&fit=crop";

  document.getElementById("modal-eq-image").src = imageSrc;

  calculateBookingCost();
  checkWeatherSuitability();

  document.getElementById("booking-modal").style.display = "flex";
}

function calculateBookingCost() {
  const eqId = document.getElementById("booking-eq-id").value;
  const eq = db.getMachinery().find(x => x.id === eqId);
  if(!eq) return;

  const acres = parseFloat(document.getElementById("booking-acres").value) || 1;
  const rent = eq.pricePerAcre * acres;
  const serviceFee = 150.00;
  const total = rent + serviceFee;

  document.getElementById("calc-rent").textContent = "₹" + rent.toFixed(2);
  document.getElementById("calc-fee").textContent = "₹" + serviceFee.toFixed(2);
  document.getElementById("calc-total").textContent = "₹" + total.toFixed(2);
}

function checkWeatherSuitability() {
  const activity = document.getElementById("booking-activity").value;
  const card = document.getElementById("booking-weather-card");
  const statusEl = document.getElementById("booking-weather-status");
  const summaryEl = document.getElementById("booking-weather-summary");

  card.className = "weather-advisory-card";

  if (activity === "Ploughing") {
    card.classList.add("suitable");
    statusEl.textContent = "SUITABLE OPERATIONAL WEATHER";
    summaryEl.textContent = "Partly Cloudy winds (14 km/h) are ideal for ground tillage and ploughing.";
  } else if (activity === "Spraying") {
    card.classList.add("caution");
    statusEl.textContent = "WEATHER CAUTION WARNING";
    summaryEl.textContent = "Wind speeds exceed 12 km/h. High chance of pesticide drift. Ultra-low volume drone sprayers should fly low.";
  } else if (activity === "Harvesting") {
    card.classList.add("suitable");
    statusEl.textContent = "SUITABLE OPERATIONAL WEATHER";
    summaryEl.textContent = "No rainfall in forecast. Low humidity ensures dry grain ears suitable for combine cutters.";
  } else {
    card.classList.add("suitable");
    statusEl.textContent = "SUITABLE OPERATIONAL WEATHER";
    summaryEl.textContent = "Weather parameters are optimal for general sowing and seedbed layout.";
  }
}

function submitBookingForm(e) {
  e.preventDefault();
  const eqId = document.getElementById("booking-eq-id").value;
  const eq = db.getMachinery().find(x => x.id === eqId);
  if(!eq) return;

  const acres = parseFloat(document.getElementById("booking-acres").value) || 1;
  const dateVal = document.getElementById("booking-date").value;
  const slotVal = document.getElementById("booking-timeslot").value;
  const activityVal = document.getElementById("booking-activity").value;
  const method = document.querySelector('input[name="paymentMethod"]:checked').value;

  const rent = eq.pricePerAcre * acres;
  const fee = 150.00;
  const total = rent + fee;

  const newBooking = {
    bookingId: "AR" + Date.now().toString().slice(-8),
    farmerId: "farmer_ravi",
    farmerName: USER_PROFILES.FARMER.name,
    farmerPhone: USER_PROFILES.FARMER.phone,
    ownerId: eq.ownerId,
    ownerName: eq.ownerName,
    ownerPhone: eq.ownerPhone,
    equipmentId: eq.id,
    equipmentName: eq.name,
    workerId: "",
    workerName: "",
    activity: activityVal,
    location: USER_PROFILES.FARMER.location,
    date: dateVal,
    timeSlot: slotVal,
    acres: acres,
    ratePerAcre: eq.pricePerAcre,
    serviceFee: fee,
    totalAmount: total,
    bookingStatus: "PENDING",
    paymentStatus: method === "CASH" ? "CASH_PENDING" : "PAID"
  };

  const bookings = db.getBookings();
  bookings.push(newBooking);
  db.setBookings(bookings);

  closeModal("booking-modal");
  
  // Trigger success dialog details
  document.getElementById("success-modal-title").textContent = "Reservation Submitted!";
  document.getElementById("success-modal-msg").innerHTML = `Booking Request ID: <strong>#${newBooking.bookingId}</strong> has been registered with owner <strong>${newBooking.ownerName}</strong> for approval.`;
  document.getElementById("success-modal").style.display = "flex";
}

function closeSuccessAndGoToBookings() {
  closeModal("success-modal");
  switchView("bookings");
}

function openAddMachineryModal() {
  document.getElementById("add-machinery-modal").style.display = "flex";
}

function handleFileSelected(event) {
  const file = event.target.files[0];
  const feedback = document.getElementById("file-selected-feedback");
  if (file) {
    feedback.textContent = `✓ Loaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  }
}

function submitAddMachineryForm(e) {
  e.preventDefault();
  
  const name = document.getElementById("add-eq-name").value;
  const cat = document.getElementById("add-eq-category").value;
  const rate = parseFloat(document.getElementById("add-eq-rate").value);
  const number = document.getElementById("add-eq-number").value;
  const desc = document.getElementById("add-eq-desc").value;

  const newEq = {
    id: "EQ_" + Date.now(),
    name: name,
    category: cat,
    type: cat,
    vehicleNumber: number,
    ownerId: "owner_primary",
    ownerName: USER_PROFILES.OWNER.name,
    ownerPhone: USER_PROFILES.OWNER.phone,
    pricePerAcre: rate,
    description: desc,
    villageName: "Mevalurkuppam",
    district: "Kanchipuram",
    location: "Mevalurkuppam, Tamil Nadu",
    latitude: 13.0180,
    longitude: 79.9880,
    rating: 5.0,
    reviewCount: 0,
    availability: "AVAILABLE",
    isVerified: false // Admin must verify docs
  };

  const fleet = db.getMachinery();
  fleet.push(newEq);
  db.setMachinery(fleet);

  closeModal("add-machinery-modal");
  alert("Machinery listing submitted successfully. Pending Admin verification of uploaded RC document.");
  renderView();
}

function openAddWorkerModal() {
  document.getElementById("add-worker-modal").style.display = "flex";
}

function submitAddWorkerForm(e) {
  e.preventDefault();
  const name = document.getElementById("worker-name-input").value;
  const phone = document.getElementById("worker-phone-input").value;
  const skill = document.getElementById("worker-skill-input").value;
  const wage = parseFloat(document.getElementById("worker-wage-input").value);

  const newWorker = {
    id: "WRK_" + Date.now(),
    name: name,
    phone: phone,
    skill: skill,
    dailyWage: wage,
    status: "Available",
    checkInTime: ""
  };

  const workers = db.getWorkers();
  workers.push(newWorker);
  db.setWorkers(workers);

  closeModal("add-worker-modal");
  alert(`Operator ${name} registered successfully.`);
  renderView();
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// Fallback logic helper
String.prototype.ifBlank = function(fallback) {
  return this.trim().length > 0 ? this.toString() : fallback;
};
