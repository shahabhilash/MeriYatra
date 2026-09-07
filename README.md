<div align="center">
  <img src="public/logo.png" alt="मेरी yatra Logo" width="150"/>
  <h1>मेरी yatra</h1>
  <p><strong>Next-Generation Real-Time Public Transit Ecosystem</strong></p>
</div>

---

**मेरी yatra** bridges the gap between unorganized local transit (autos, cabs, private buses) and daily commuters. By leveraging ultra-low latency WebSockets, it provides a seamless, Uber-like live tracking experience directly on the web and via a native Chrome Extension.

## ✨ Core Features

- 🌍 **Global Live Tracking:** Passengers instantly see every active driver around them broadcasting live GPS coordinates in real-time.
- ⏱️ **Smart OSRM ETA Engine:** Calculates precise driving duration in seconds from the moving vehicle to the passenger's destination, updating dynamically on every GPS tick.
- 📅 **Driver Dashboards & Scheduling:** Drivers can broadcast their location and schedule future rides, which instantly populate passenger search results.
- 🔍 **Instant Route Search:** Lightning-fast global search through predefined routes, stops, and assigned vehicles.
- 🧩 **Chrome Extension Support:** 100% unified codebase runs natively as a Web App or as a Google Chrome Extension without breaking functionality.

## 🛠️ Tech Stack

- **Frontend:** React + Vite (Lightning-fast client-side rendering)
- **Styling:** Tailwind CSS (Premium "Atomic Orange" & "Oatmilk Latte" brand identity)
- **Real-Time Data:** Supabase Realtime WebSockets (Sub-100ms broadcasting latency)
- **Mapping:** React-Leaflet (Interactive dynamic mapping)
- **Routing API:** Open Source Routing Machine (OSRM)
- **Location API:** Nominatim OpenStreetMap

## 🚀 Getting Started (Web App)

1. **Clone & Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```

3. **Open the App**
   Navigate to `http://localhost:5173` in your browser.

## 🧩 Installing the Chrome Extension

1. **Build the Project**
   ```bash
   npm run build
   ```
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the newly generated `dist` folder.
5. Pin the **MeriYatra** extension and use it directly from your toolbar!

---
*Built with ❤️ for a seamless daily commute.*