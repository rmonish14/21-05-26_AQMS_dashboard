# 🌊 System Data Flow — AQMS Detailed Internal Logic

This document details the exact sequence of events from the moment a sensor takes a reading to the moment it appears on the operator's dashboard.

---

## 1. The Telemetry Ingestion Flow (Live)

AQMS uses a "Publish/Subscribe" model for live data, ensuring that sensor readings bypass the database for visual updates to minimize latency.

### Step-by-Step Sequence:
1.  **Sensing**: THE ESP32 (or `simulator.js`) gathers data (PM2.5, CO2, Temp).
2.  **Publishing**: The device connects to `broker.hivemq.com` and publishes a JSON payload to `aqms/<nodeId>/data`.
3.  **Reception**: The Node.js backend (`server.js`) is subscribed to `aqms/+/data` and receives the message.
4.  **Parsing**: The `mqtt/handler.js` module parses the JSON and normalizes field names (e.g., mapping `pm2_5` to `pm25`).
5.  **Broadcast**: The backend immediately calls `io.emit('node_data', payload)`.
6.  **Visualization**: The frontend `socket.io-client` receives the event and updates the page state, causing the dashboard dials and charts to move in real-time.

---

## 2. The Persistence Flow (Critical Events)

Unlike live data, **Critical Events** are stored permanently in PostgreSQL for auditing and historical analysis.

### The Decision Logic:
- After Step 4 above, the backend checks the data against configured **Thresholds**:
  - `PM2.5 > 100`?
  - `CO2 > 1000`?
  - `Temp > 35`?
- **If NO**: The data is discarded (already broadcasted to live UI).
- **If YES**:
  1.  A SQL `INSERT` is sent to the `critical_events` table.
  2.  The derivation engine creates a `status` string (e.g., `"CRITICAL_PM25(112) | HIGH_TEMP(38)"`).
  3.  A `critical_alert` event is emitted via Socket.io to trigger the red alert-banners on the dashboard.

---

## 3. The Authentication Flow

AQMS uses a stateless JWT authentication strategy.

1.  **Registration/Identity**: Users register via `/api/auth/register`. Passwords are encrypted using **bcrypt**.
2.  **Authentication**: On login, the backend verifies credentials and issues a **JSON Web Token (JWT)**.
3.  **Session Management**: The frontend stores this token and includes it in the `Authorization` header for all subsequent API requests.
4.  **Authorization**: Middleware on the backend validates the token before allowing access to sensitive data (like `system_config` or worker details).

---

## 4. The Dashboard "Heartbeat" Flow

To detect offline devices, a "Last-Will" system is simulated:

1.  **Handshake**: When a device starts, it publishes `"online"` to `aqms/<nodeId>/status`.
2.  **Monitoring**: The backend listens to this topic and updates its internal registry.
3.  **Failure Detection**: If a device publishes `"offline"` (or the simulator stops), the backend detects the status change.
4.  **UI Feedback**: A `node_status` event is broadcasted, causing the green indicator to turn red on the dashboard and triggering an entry in the "Diagnostics" logs.

---

## 5. Summary of Topics & Events

| Event Type | Topic / Socket Key | Source | Target |
|------------|--------------------|--------|--------|
| Sensor Data | `aqms/+/data` | MQTT Node | Dashboard UI |
| Node Status | `aqms/+/status` | MQTT Node | Diagnostics Panel |
| Critical Alert | `critical_alert` | Backend Logic | Global UI Banner |
| DB Query | `/api/critical` | Dashboard UI | PostgreSQL |

---

**Next Steps**: For front-end implementation details, see [Frontend README](./frontend/README.md).
