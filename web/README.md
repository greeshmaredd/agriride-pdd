# AgriRide 2026 - Web Application

This directory contains the Single-Page Web Application version of the **AgriRide 2026** platform, ported directly from the Android Kotlin codebase.

## Key Features Implemented

1. **Persona Simulator Dropdown**: Instantly switch between **Farmer**, **Equipment Owner**, **Worker**, and **Admin** profiles from the top navigation bar to test all system layers in real-time.
2. **Dynamic Language Switcher**: Toggle translation support between English, Telugu (తెలుగు), and Tamil (தமிழ்).
3. **Responsive Glassmorphism Styling**: Visually premium aesthetic utilizing HSL customized colors, layout shadows, Outfit typography, and dynamic flexbox grids.
4. **Machinery Rental Hub**: Browse, search, filter and book heavy farm equipment with real-time weather checking.
5. **Real-time Map Simulator**: Interactive track booking view showcasing satellite coordinates and a live CSS-animated tractor en-route.
6. **Agri-Store Seed Depot**: Full-featured e-commerce catalog with cart add/removals, delivery fee calculation, and Cash-on-Delivery checkout.
7. **Soil Profiling & Crop Advisor**: Select soil type (Black Cotton, Red Loamy, Alluvial Delta, etc.) to get match scores, crop advisory summaries, NPK ratings, yield predictions, and recommended machineries.
8. **Dam Reservoir Watch**: Monitor live water capacities (Prakasam Barrage, Nagarjuna Sagar) and weather alerts.
9. **Admin Verification Panel**: Approve or reject vehicle RC document uploads to publish listings.

## Getting Started

To run the application locally:

### Option A: Direct Launch (No setup)
Simply double-click the `index.html` file in this directory to open it directly in any modern web browser (Chrome, Edge, Safari, Firefox).

### Option B: Local Web Server (Recommended)
For full features (including browser caching persistence), run a simple local web server in the `web` folder directory:

- **Using Node.js (`http-server`)**:
  ```bash
  npx http-server .
  ```
- **Using Python**:
  ```bash
  python -m http.server 8000
  ```
Then navigate to `http://localhost:8000` (or the port specified).
