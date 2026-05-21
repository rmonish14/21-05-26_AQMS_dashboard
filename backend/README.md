# ⚙️ AQMS Backend — Node.js SCADA Core

The AQMS backend is a lightweight, high-throughput Express server that bridges the gap between MQTT telemetry and the web dashboard.

---

## 🛠️ Architecture

The backend operates as a **Dual Protocol Bridge**:
1.  **Ingress (MQTT)**: Subscribes to sensors/simulators.
2.  **Egress (Socket.io/REST)**: Streams data to the UI.

---

## 🏗️ Technical Stack

- **Runtime**: Node.js (v18+)
- **Server**: Express
- **Real-time**: Socket.io
- **IoT Client**: `mqtt.js`
- **Database**: PostgreSQL (via `pg` pool)
- **Security**: JWT & bcrypt

---

## 🗄️ Database Schema (PostgreSQL)

The database focuses on **auditing** rather than raw storage. raw data is streamed via Socket.io, while only threshold breaches are persisted.

- **`devices`**: Master registry of all discovered sensor nodes.
- **`critical_events`**: Immutable log of sensor values that crossed safety thresholds.
- **`users`**: Operator authentication data.
- **`system_config`**: Centralized configuration JSON.

---

## 📡 The Handler Engine (`mqtt/handler.js`)

The core logic of the system lives in the MQTT message handler:

1.  **JSON Normalization**: Maps various sensor field names (e.g., `temp`, `temperature`, `t`) to a unified internal schema.
2.  **Stateless Broadcasting**: Emits every received packet to the frontend via `node_data` socket event.
3.  **Threshold Analysis**: Compares values against the current environment variables (e.g., `THRESHOLD_PM25`).
4.  **Logging**: If a breach is detected, it commits to PostgreSQL and emits a `critical_alert`.

---

## 🛣️ API Reference

- **`/api/auth`**: User registration and identity issuance.
- **`/api/nodes`**: Registry management and node discovery.
- **`/api/critical`**: Historical query interface for threshold breach events.
- **`/api/config`**: Dynamic configuration management (JSONB).

---

## 🧪 Simulation

The backend includes a `simulator.js` script that mimics several industrial sensor nodes:
- Publishes randomized values to MQTT.
- Periodically triggers threshold breaches for testing.
- Simulates node downtime events.

Run it using:
```bash
node simulator.js
```
