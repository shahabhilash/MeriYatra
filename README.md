<div align="center">
  <img src="public/logo.svg" alt="मेरी yatra" width="260" />
  <h1>मेरी yatra (MeriYatra)</h1>
  <p><strong>Know exactly where your bus, auto or cab is, even when nobody runs it on a timetable.</strong></p>
</div>

---

## The Problem

In most Indian cities outside the big metros, daily travel depends on local buses, shared autos and private cabs that do not follow a fixed schedule. Anyone who commutes in places like Bhopal, Sehore or Indore knows the routine:

- **You wait without knowing.** Standing at a stop, there is no way to tell if the next bus is two minutes away or forty. People leave early "just in case" and still miss it, or give up and pay for a costlier ride.
- **Map apps cannot help.** Google Maps and similar apps show transit only where an official timetable exists. Informal city buses and autos simply are not there.
- **Students and workers on the edge of the city have it worst.** Campuses and industrial areas are often far from the main road, served by a handful of vehicles a day. Missing one can mean a long, unsafe wait.
- **Families worry.** Parents cannot see where a child's college bus or shared auto has reached, so it becomes a stream of phone calls.
- **Drivers lose passengers.** A driver running a few minutes late finds the stop empty because riders assumed the vehicle was not coming.
- **Language is a barrier.** Many riders and drivers are far more comfortable in Hindi than in English, but most transport apps are English-only.

## The Solution

**मेरी yatra** turns any driver's phone into a live GPS beacon and lets anyone see that vehicle move on a map, right in the browser. There is no app to install, no special hardware in the vehicle and no account needed to track a ride.

| Real-world problem | How मेरी yatra solves it |
| --- | --- |
| "Is my bus coming or not?" | Type the vehicle's number plate and watch it move live on the map. |
| "How long until it reaches me?" | Pick your destination and get a driving-time estimate with an expected arrival clock time, refreshed as the vehicle moves. |
| "I don't know the vehicle number." | See every vehicle broadcasting near you, sorted by distance, and track one with a single tap. |
| "My family wants to know where I am." | Share a live tracking link. Whoever opens it sees the same vehicle moving. |
| "Which rides go my way today?" | Enter From and To places to see scheduled rides and buses on that route. |
| "Passengers don't know I'm coming." | Drivers start a trip in one tap and can schedule upcoming rides in advance. |
| "The app isn't in my language." | Switch the entire site between Hindi and English at any time. |

## Who It's For

- **Passengers:** students, office-goers and daily wage workers who rely on local transport and want to stop guessing.
- **Drivers and small operators:** auto, cab and private bus drivers who want riders to find them and wait for them.
- **Families:** anyone who wants peace of mind about where a loved one's ride has reached.

## How It Works

**For passengers**

1. **Enter the vehicle number** printed on the number plate, or pick a vehicle from the "Live Vehicles Near You" list.
2. **Choose where you are going.** The app calculates how long the vehicle will take to get there.
3. **Watch it arrive** on the live map, with its speed, last update time and expected arrival.

**For drivers**

1. **Register once** with the vehicle type and RTO number.
2. **Tap Start Trip.** The phone shares its location every two seconds while the screen is kept awake.
3. **Schedule upcoming rides** so passengers searching that route can plan ahead.

New visitors get a built-in "How it works" guide on the home page. Every feature is shown as a card you can tap to try it immediately, so nobody needs instructions to get started.

## Features

**Live tracking**
- Real-time positions for every vehicle that is broadcasting, labelled with its number plate.
- The vehicle you are tracking is highlighted, and the map follows it without resetting your zoom.
- A distance-sorted list of live vehicles near you, with speed and how recently each one updated.
- Vehicles that stop sending updates are removed automatically, so the map never shows ghosts.

**Arrival estimates**
- Driving-time estimate from the moving vehicle to your destination, using real road routing.
- Expected arrival clock time and a destination pin on the map.

**Planning and sharing**
- Search rides by From and To places with location suggestions across India.
- Shareable tracking links, with the phone's native share sheet when available.
- Recent searches remembered on the device for one-tap re-tracking.
- A routes directory with every stop and assigned vehicle; tap a vehicle to track it.

**For drivers**
- One-tap trip start and stop, with live trip time, distance covered and current speed.
- Screen stays awake during a trip so the broadcast is not interrupted.
- Schedule upcoming rides and cancel them if plans change; past and cancelled rides are clearly marked.

**Accessible by design**
- Full Hindi and English support, remembered between visits.
- Works on any phone browser, including low-end Android devices, with no install.
- Responsive layout built for small screens first, with clear hints on every input and a map legend.

## Under the Hood

```text
Driver's phone (GPS)
      │  location every 2s
      ▼
Supabase Realtime broadcast channel ──► every passenger's browser
                                           │
                                           ├─ Leaflet + OpenStreetMap: live map
                                           ├─ OSRM: road routing for arrival estimates
                                           └─ Nominatim: place search and suggestions
Supabase PostgreSQL: profiles, driver details, scheduled rides
```

- **Frontend:** React and Vite
- **Styling:** Tailwind CSS
- **Real-time data:** Supabase Realtime broadcast channels
- **Database:** Supabase PostgreSQL (profiles, driver details, scheduled rides)
- **Maps:** React-Leaflet with OpenStreetMap tiles
- **Routing:** Open Source Routing Machine (OSRM)
- **Place search:** Nominatim (OpenStreetMap)

### Design Decisions

- **Web, not a native app.** Riders in smaller cities often have limited phone storage and data. A link that opens instantly removes the biggest barrier to adoption.
- **Broadcast instead of database writes.** Live GPS points are sent over a realtime channel instead of being stored, which keeps latency low and costs near zero while still reaching every viewer.
- **Passenger-side timestamps.** Each update is stamped with the passenger's own clock, so a driver's phone with the wrong time cannot make a live vehicle look stale.
- **Gentle on shared services.** Arrival estimates are refreshed at most every 15 seconds instead of on every GPS tick, which respects the free public routing server.

## Project Structure

```text
MeriYatra/
├── public/                     # Logo, favicon, extension manifest
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx           # Passenger home: search, tracking, ETA
│   │   ├── GettingStarted.jsx      # "How it works" guide and feature cards
│   │   ├── NearbyVehicles.jsx      # Distance-sorted list of live vehicles
│   │   ├── LiveMap.jsx             # Map, markers, legend and camera control
│   │   ├── LiveBuses.jsx           # Scheduled ride and route bus cards
│   │   ├── DriverDashboard.jsx     # Trip broadcast, stats and scheduling
│   │   ├── AutocompleteInput.jsx   # Place search with suggestions
│   │   ├── Logo.jsx, Navbar.jsx, Footer.jsx
│   ├── context/                # Auth and language state
│   ├── hooks/                  # Route data hook
│   ├── locales/                # English and Hindi text
│   ├── pages/                  # Routes, About, Login, 404
│   ├── services/               # Supabase client and sample route data
│   └── utils/                  # Distance, duration and storage helpers
└── tailwind.config.js          # Brand colours
```

## What's Next

- Crowd-sourced stops so riders can add pickup points that are not on any official list.
- Arrival alerts when a tracked vehicle is a few minutes away.
- Occupancy reports from drivers so riders can skip a full vehicle.
- Offline-friendly mode for areas with patchy mobile data.

## About

मेरी yatra is a personal project by **Abhilash Shah**, built out of the everyday frustration of waiting for local transport without knowing when it would arrive.

Released under the [MIT License](LICENSE).
