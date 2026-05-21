# 🌊 AQMS — Air Quality Monitoring System

A production-ready Industrial IoT platform for real-time air quality monitoring across distributed sensor nodes, featuring a premium "Dark-Tech" aesthetic and threshold-driven telemetry.

---

## 🏛️ System Architecture

AQMS is built on a high-concurrency event-driven architecture designed to handle real-time sensor streams with minimal latency.

```mermaid
graph TD
    subgraph "Hardware / Edge"
        ESP32[ESP32 / Simulator] -- "MQTT (aqms/+/data)" --> Broker[HiveMQ Cloud]
    end

    subgraph "Backend (Node.js)"
        Broker -- "Subscribe" --> Handler[MQTT Handler]
        Handler -- "Socket.io (node_data)" --> Frontend
        Handler -- "Threshold Check" --> DB_Check{Critical?}
        DB_Check -- "Yes" --> PG[(PostgreSQL)]
        DB_Check -- "Yes" --> Alert[Socket.io: critical_alert]
        Alert --> Frontend
    end

    subgraph "Frontend (Next.js)"
        Frontend[Premium Dashboard] -- "REST API" --> API[Express Routes]
        API -- "Query" --> PG
    end
```

### Core Technologies
- **Edge**: ESP32 (Physical) / Node.js (Simulator)
- **Messaging**: MQTT (HiveMQ Public Broker)
- **Backend**: Node.js (Express) + Socket.io
- **Database**: PostgreSQL (Relational persistence for critical events)
- **Frontend**: Next.js 14 + TailwindCSS + Lucide Icons
- **Aesthetics**: Custom Canvas API for High-Tech backgrounds (Neural, Radar, Pulse)

---

## 📜 Detailed Documentation

Visit the links below for a deep dive into each module:

1.  **[System Data Flow](./FLOW.md)**: A detailed breakdown of how data moves from hardware to the UI.
2.  **[Frontend Architecture](./frontend/README.md)**: Exploration of the "Dark-Tech" UI, React state, and Socket integration.
3.  **[Backend & API](./backend/README.md)**: Documentation on Express routes, MQTT logic, and DB schema.

---

## 🚀 Quick Start (Deployment Flow)

### 1. Environment Configuration
Create a `.env` file in the `/backend` directory:
```env
DATABASE_URL=postgresql://user:pass@host/dbname
PORT=5000
HIVEMQ_URL=mqtt://broker.hivemq.com:1883
JWT_SECRET=production_secret_key
```

### 2. Launch Sequence

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

**Terminal 3 (Simulator - Optional):**
```bash
cd backend
node simulator.js
```

---

## 🛡️ Security & Access Control
- **JWT Authentication**: All sensitive API routes require a valid Bearer token.
- **Role-Based Access**: Support for `operator` and `admin` roles (expandable).
- **Encrypted Transmission**: MQTT and Socket.io traffic can be wrapped in SSL/TLS.

---

**Design Philosophy**: AQMS prioritizes **visual density** and **low-latency feedback**. The interface is designed to make operators feel "in control" of a complex industrial environment, using glassmorphism and real-time canvas animations to represent active system monitoring.
