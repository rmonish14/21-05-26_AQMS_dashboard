# 🎨 AQMS Frontend — Premium Dark-Tech Dashboard

The AQMS dashboard is a high-performance React application built with Next.js, optimized for industrial monitoring with a "Dark-Tech" aesthetic.

---

## 💎 Design System: The "Dark-Tech" Aesthetic

The dashboard uses a custom design system focused on "Visual Density" and "System Transparency".

### 1. Custom Canvas Backgrounds
Every section uses the HTML5 Canvas API for high-performance, non-blocking animations:
- **NeuralCanvas**: Particle-link physics representing AI processing.
- **RadarCanvas**: A 360-degree sonar sweep for geographic device location.
- **GridNetwork**: A pulsing hex/square grid and router network.

### 2. Glassmorphism & UI Layers
- **Glass-Card**: Semi-transparent backgrounds with `backdrop-blur` and subtle borders.
- **Data Shimmer**: Animated CSS gradients used as top-borders to indicate "active data pipelines."
- **Circuitry Motifs**: Background SVG/Icon decorations (Lucide-React) that pulse based on state.

---

## 🔧 Technical Stack

- **Framework**: Next.js 14
- **State Management**: React `useState` + `useEffect` (stateless routing)
- **Real-time**: `socket.io-client` (Port 5000)
- **Styling**: Tailwind CSS (Utility-first)
- **Charts**: Recharts (SVG-based telemetry)
- **Icons**: Lucide-React

---

## 📡 Real-time Socket Synchronization

The frontend subscribes to the following events in a global `useEffect` hook (or per-page hooks):

| Event | Logic |
|-------|-------|
| `node_data` | Updates the state of individual sensor cards and moves the charts forward. |
| `node_status` | Changes the "Live/Offline" indicator color globally. |
| `critical_alert` | Triggers a top-level alert modal or notification banner. |

### Performance Optimization:
We use a **Circular Buffer** approach for charts (keeping only the last 20–50 points in memory) to prevent memory leaks during long-running monitoring sessions.

---

## 📂 Key Components

- **`Dashboard.tsx`**: The main overview with the sensor grid.
- **`MapPage.tsx`**: Radar-style geographic visualization.
- **`PredictivePage.tsx`**: AI/ML analysis and forecasting view.
- **`WorkersPage.tsx`**: Individual personnel monitoring with biometric detail modals.
- **`AnalyticsPage.tsx`**: Deep-dive historical table and aggregation views.

---

## 🛠️ Development

Run the frontend in isolation:
```bash
npm run dev
```
Note: Ensure the backend is running on `localhost:5000` for Socket.io and API requests to function.
