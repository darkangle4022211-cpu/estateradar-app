// Clean, Enterprise Human-Designed Admin Fleet Dashboard
import L from 'leaflet';
import { state } from '../state.js';
import { HAMZA_FULL_DAY_ROUTE } from '../simulation.js';
import { supabase } from '../services/supabase.js';

let mapInstance = null;
let employeeMarkers = {};
let propertyMarkers = {};
let routePolyline = null;
let playbackMarker = null;
let playbackInterval = null;
let newlyCreatedCredentials = null;
let newlyIssuedPassword = null;
let isServerSetupModalOpen = false;
let serverSetupStatusMessage = null;
let isAlertsFeedOpen = true;

export function renderAdminDashboard() {
  const { employees, properties, alerts, playback } = state;
  const activeCount = employees.filter(e => e.isClockedIn).length;
  const idleCount = employees.filter(e => e.status === 'idle').length;

  return `
    <div class="admin-fleet-dashboard">
      
      <!-- Top Floating Stats & Filter Bar -->
      <div class="map-floating-top-bar">
        <div class="dashboard-branding">
          <div>
            <h3>Manager Live Map</h3>
            <span class="sub-text">Field Staff Monitoring</span>
          </div>
        </div>

        <div class="filter-pills-cluster">
          <div class="filter-pill active">
            <span>On Duty: <strong>${activeCount}</strong></span>
          </div>
          <div class="filter-pill ${idleCount > 0 ? 'warning' : ''}">
            <span>${idleCount > 0 ? '⚠️' : '✓'} Idle Alert: <strong>${idleCount}</strong></span>
          </div>
          <div class="filter-pill">
            <span>Surveys Logged: <strong>${properties.length}</strong></span>
          </div>
        </div>

        <div class="map-top-action-group">
          <button class="btn btn-outline btn-sm ${supabase.isConfigured() ? 'btn-active-cloud' : ''}" id="openServerSetupModalBtn" title="Connect Supabase Project URL & Anon Key">
            <span>⚡ ${supabase.isConfigured() ? 'Cloud Server Connected' : 'Connect Cloud Server'}</span>
          </button>
          <button class="btn btn-primary btn-sm" id="openAddEmployeeModalBtn">
            <span>+ Add Employee</span>
          </button>
          <button class="btn btn-secondary btn-sm" id="recenterMapBtn">
            <span>Center All Units</span>
          </button>
        </div>
      </div>

      <!-- Main Leaflet Map Viewport -->
      <div class="admin-full-map-viewport" id="adminMapContainer">
        
        <!-- Left Side Floating Agents Drawer -->
        <div class="floating-agents-card">
          <div class="drawer-header">
            <div>
              <h4>Field Agents Today (${employees.length})</h4>
              <span class="drawer-sub">Select an agent to locate on map</span>
            </div>
            <button class="btn btn-outline btn-xs" id="drawerAddEmpBtn">+ Add</button>
          </div>

          <div class="agents-scroll-list">
            ${employees.map(emp => {
              const isIdle = emp.status === 'idle';
              const isClocked = emp.isClockedIn;
              return `
                <div class="agent-item-card ${isIdle ? 'idle-highlight' : ''}" data-emp-id="${emp.id}">
                  <div class="agent-main-row">
                    <div class="agent-avatar-circle" style="background-color: ${emp.color}">
                      ${emp.avatar}
                    </div>
                    <div class="agent-name-group">
                      <strong class="agent-name">${emp.name}</strong>
                      <span class="agent-street">${emp.currentAddress}</span>
                    </div>
                    <span class="badge ${isClocked ? (isIdle ? 'badge-amber' : 'badge-green') : 'badge-dim'}">
                      ${!isClocked ? 'Offline' : (isIdle ? 'Idle 26m' : 'Moving')}
                    </span>
                  </div>

                  <div class="agent-telemetry-row">
                    <span>Speed: <strong>${isClocked ? emp.speedKmh : 0} km/h</strong></span>
                    <span>Battery: <strong>${emp.batteryPercent}%</strong></span>
                    <span>Surveys: <strong>${emp.surveysToday}</strong></span>
                  </div>

                  ${emp.passwordResetRequested ? `
                    <div class="agent-reset-notice">
                      <span class="reset-alert-text">🔑 Password Reset Requested</span>
                      <button type="button" class="btn btn-warning btn-xs admin-issue-pass-btn" data-reset-emp-id="${emp.id}" data-reset-emp-name="${emp.name}">
                        Issue Temporary Password
                      </button>
                    </div>
                  ` : ''}

                  ${isIdle ? `
                    <div class="idle-alert-note">
                      ⚠️ <strong>Protracted Stop:</strong> Parked at Cafe Retro for 26 minutes with no survey activity.
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Top Right Floating Alerts Feed -->
        <div class="alerts-hud-card ${isAlertsFeedOpen ? '' : 'collapsed'}" id="alertsHudCard">
          <div class="alerts-hud-header">
            <span class="alerts-hud-title">Real-Time Alerts (${alerts.length})</span>
            <button type="button" class="alerts-hud-toggle-btn" id="toggleAlertsFeedBtn" title="${isAlertsFeedOpen ? 'Minimize Alerts' : 'Expand Alerts'}">
              ${isAlertsFeedOpen ? '✕' : '🔔'}
            </button>
          </div>
          ${isAlertsFeedOpen ? `
            <div class="alerts-hud-list">
              ${alerts.slice(0, 3).map(alt => `
                <div class="feed-alert-bubble ${alt.severity}">
                  <div class="alert-top-line">
                    <strong>${alt.title}</strong>
                    <span>${alt.timestamp}</span>
                  </div>
                  <p>${alt.message}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

      </div>

      <!-- Bottom Floating Route Playback Bar -->
      <div class="map-floating-bottom-bar">
        <div class="playback-btn-group">
          <button class="btn btn-primary btn-sm" id="togglePlaybackBtn">
            <span>${playback.isPlaying ? '⏸ Pause' : '▶ Replay Route'}</span>
          </button>
          <div class="speed-control-pills">
            <button class="speed-pill ${playback.speedMultiplier === 1 ? 'selected' : ''}" data-speed="1">1x</button>
            <button class="speed-pill ${playback.speedMultiplier === 2 ? 'selected' : ''}" data-speed="2">2x</button>
            <button class="speed-pill ${playback.speedMultiplier === 5 ? 'selected' : ''}" data-speed="5">5x</button>
          </div>
        </div>

        <div class="playback-scrubber-box">
          <input type="range" min="0" max="${HAMZA_FULL_DAY_ROUTE.length - 1}" value="${playback.progressIndex}" class="scrubber-slider" id="playbackSlider" />
          <div class="scrubber-ticks">
            <span>09:00 AM (Start)</span>
            <span>09:25 AM (Plot 42-B)</span>
            <span>11:45 AM (Villa 18)</span>
            <span>01:30 PM (Lunch)</span>
            <span>02:30 PM (Now)</span>
          </div>
        </div>

        <span class="playback-step-description" id="playbackStepLabel">
          ${HAMZA_FULL_DAY_ROUTE[playback.progressIndex].time}: ${HAMZA_FULL_DAY_ROUTE[playback.progressIndex].label}
        </span>
      </div>

      <!-- ================= MODAL: ADD EMPLOYEE (ADMIN FUNCTION) ================= -->
      <div class="modal-overlay ${state.auth.isAddEmployeeModalOpen ? '' : 'hidden'}" id="addEmployeeModal">
        <div class="modal-container admin-add-emp-card">
          <div class="modal-header-simple">
            <h4>Register New Field Employee</h4>
            <button class="close-modal-icon" id="closeAddEmployeeModalBtn">✕</button>
          </div>

          <form id="addEmployeeForm" class="clean-form">
            <div class="form-grid-2">
              <div class="form-group">
                <label class="input-label">Full Name</label>
                <input type="text" id="newEmpName" class="text-input" placeholder="e.g. Farhan Ali" required />
              </div>
              <div class="form-group">
                <label class="input-label">Assigned Role</label>
                <select id="newEmpRole" class="text-input">
                  <option value="Field Surveyor">Field Surveyor</option>
                  <option value="Senior Surveyor">Senior Surveyor</option>
                  <option value="Area Inspector">Area Inspector</option>
                  <option value="Property Verifier">Property Verifier</option>
                </select>
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="input-label">Mobile Number</label>
                <input type="tel" id="newEmpPhone" class="text-input" placeholder="e.g. +92 300 9876543" required />
              </div>
              <div class="form-group">
                <label class="input-label">Assigned Territory / Area</label>
                <input type="text" id="newEmpTerritory" class="text-input" placeholder="e.g. DHA Phase 6" required />
              </div>
            </div>

            <div class="credential-provision-card">
              <div class="cred-card-top">
                <strong>App Login Credentials</strong>
                <button type="button" class="btn btn-outline btn-xs" id="autoGenPassBtn">🔄 Auto-Generate</button>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label class="input-label">Username</label>
                  <input type="text" id="newEmpUsername" class="text-input" placeholder="e.g. farhan_dha" required />
                </div>
                <div class="form-group">
                  <label class="input-label">Initial Password</label>
                  <input type="text" id="newEmpPassword" class="text-input" value="Survey@2026" required />
                </div>
              </div>
              <p class="credential-hint-note">
                Give these credentials to the employee. Once logged in, they can authenticate using their device fingerprint.
              </p>
            </div>

            <div class="modal-actions-footer">
              <button type="button" class="btn btn-secondary" id="cancelAddEmpBtn">Cancel</button>
              <button type="submit" class="btn btn-primary" id="saveNewEmployeeBtn">Create Employee Account</button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================= MODAL: CREDENTIALS CONFIRMATION & WHATSAPP SHARE ================= -->
      <div class="modal-overlay ${newlyCreatedCredentials ? '' : 'hidden'}" id="credentialsReceiptModal">
        <div class="modal-container">
          <div class="modal-header-simple">
            <h4>✅ Employee Registered</h4>
            <button class="close-modal-icon" id="closeReceiptModalBtn">✕</button>
          </div>
          ${newlyCreatedCredentials ? `
            <div class="credentials-receipt-body">
              <p class="receipt-note">Send these login credentials to <strong>${newlyCreatedCredentials.name}</strong>:</p>
              
              <div class="credentials-display-box">
                <div class="cred-display-row">
                  <span class="cred-label">Username:</span>
                  <code class="cred-val">${newlyCreatedCredentials.username}</code>
                </div>
                <div class="cred-display-row">
                  <span class="cred-label">Password:</span>
                  <code class="cred-val">${newlyCreatedCredentials.password}</code>
                </div>
                <div class="cred-display-row">
                  <span class="cred-label">Assigned Role:</span>
                  <span>${newlyCreatedCredentials.role}</span>
                </div>
              </div>

              <div class="receipt-actions-list">
                <button type="button" class="btn btn-primary btn-full" id="copyCredsBtn">
                  📋 Copy Credentials to Clipboard
                </button>
                <a 
                  href="https://wa.me/?text=${encodeURIComponent(`EstateRadar Login Credentials for ${newlyCreatedCredentials.name}:\nUsername: ${newlyCreatedCredentials.username}\nPassword: ${newlyCreatedCredentials.password}\nPlease log in and activate fingerprint biometrics.`)}" 
                  target="_blank" 
                  class="btn btn-whatsapp btn-full"
                >
                  💬 Share via WhatsApp
                </a>
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- ================= MODAL: TEMPORARY PASSWORD ISSUED ================= -->
      <div class="modal-overlay ${newlyIssuedPassword ? '' : 'hidden'}" id="passwordResetResultModal">
        <div class="modal-container">
          <div class="modal-header-simple">
            <h4>🔑 Temporary Password Issued</h4>
            <button class="close-modal-icon" id="closeResetResultModalBtn">✕</button>
          </div>
          ${newlyIssuedPassword ? `
            <div class="credentials-receipt-body">
              <p class="receipt-note">New temporary credentials for <strong>${newlyIssuedPassword.name}</strong>:</p>
              
              <div class="credentials-display-box">
                <div class="cred-display-row">
                  <span class="cred-label">New Password:</span>
                  <strong class="temp-password-highlight">${newlyIssuedPassword.password}</strong>
                </div>
              </div>

              <div class="receipt-actions-list">
                <a 
                  href="https://wa.me/?text=${encodeURIComponent(`EstateRadar Password Reset for ${newlyIssuedPassword.name}:\nYour new temporary password is: ${newlyIssuedPassword.password}\nPlease log in and authenticate with fingerprint.`)}" 
                  target="_blank" 
                  class="btn btn-whatsapp btn-full"
                >
                  💬 Send Password via WhatsApp
                </a>
                <button type="button" class="btn btn-secondary btn-full" id="dismissResetResultBtn">
                  Done
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- ================= MODAL: SUPABASE CLOUD SERVER SETUP ================= -->
      <div class="modal-overlay ${isServerSetupModalOpen ? '' : 'hidden'}" id="serverSetupModal">
        <div class="modal-container server-setup-modal-card">
          <div class="modal-header-simple">
            <h4>⚡ Cloud Server & Database Setup (Supabase)</h4>
            <button class="close-modal-icon" id="closeServerSetupModalBtn">✕</button>
          </div>

          <div class="server-setup-body">
            <div class="connection-status-banner ${supabase.isConfigured() ? 'connected' : 'offline'}">
              <span>Cloud Status:</span>
              <strong>${supabase.isConfigured() ? '🟢 Connected to Supabase' : '⚪ Local Offline / In-Memory Demo Mode'}</strong>
            </div>

            <!-- Setup Steps Checklist -->
            <div class="setup-steps-list">
              <div class="setup-step-item">
                <span class="step-num">1</span>
                <div>
                  <strong>Create Free Project:</strong>
                  <p>Open <a href="https://supabase.com" target="_blank" class="text-link">supabase.com</a>, log in, click <em>New Project</em>, and name it <code>estateradar</code>.</p>
                </div>
              </div>

              <div class="setup-step-item">
                <span class="step-num">2</span>
                <div>
                  <strong>Get URL & Key:</strong>
                  <p>In Supabase, go to <strong>Project Settings → API</strong>. Copy your <strong>Project URL</strong> and <strong>anon public key</strong> and paste them below.</p>
                </div>
              </div>
            </div>

            <!-- Credentials Form -->
            <form id="saveSupabaseCredentialsForm" class="clean-form">
              <div class="form-group">
                <label class="input-label">Supabase Project URL</label>
                <input 
                  type="url" 
                  id="supabaseUrlInput" 
                  class="text-input" 
                  placeholder="https://xyzabcdefghijklm.supabase.co" 
                  value="${supabase.getCredentials().url}" 
                  required 
                />
              </div>

              <div class="form-group">
                <label class="input-label">Project Anon API Key</label>
                <input 
                  type="text" 
                  id="supabaseKeyInput" 
                  class="text-input" 
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                  value="${supabase.getCredentials().key}" 
                  required 
                />
              </div>

              ${serverSetupStatusMessage ? `
                <div class="setup-test-feedback ${serverSetupStatusMessage.success ? 'success' : 'error'}">
                  ${serverSetupStatusMessage.message}
                </div>
              ` : ''}

              <div class="server-modal-actions">
                <button type="submit" class="btn btn-primary" id="testSaveServerBtn">
                  <span>Connect & Save</span>
                </button>
                ${supabase.isConfigured() ? `
                  <button type="button" class="btn btn-secondary" id="clearServerCredsBtn">
                    <span>Disconnect Cloud</span>
                  </button>
                ` : ''}
              </div>
            </form>

            <!-- Step 3: Database Tables Schema -->
            <div class="sql-schema-guide-block">
              <div class="guide-header-row">
                <div>
                  <strong>Step 3: Database Tables (One-Time Run)</strong>
                  <p class="text-dim">In Supabase -> <strong>SQL Editor</strong>, paste this script and click <strong>Run</strong>:</p>
                </div>
                <button type="button" class="btn btn-outline btn-xs" id="copySqlSchemaBtn">
                  📋 Copy SQL Script
                </button>
              </div>
              <textarea class="schema-code-preview" id="sqlSchemaTextarea" readonly rows="8">-- 1. EMPLOYEES / FIELD AGENTS TABLE
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'Surveyor',
    phone TEXT,
    status TEXT DEFAULT 'offline',
    is_clocked_in BOOLEAN DEFAULT false,
    latitude DOUBLE PRECISION DEFAULT 31.5204,
    longitude DOUBLE PRECISION DEFAULT 74.3587,
    battery_percent INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LIVE GPS TELEMETRY LOGS
CREATE TABLE IF NOT EXISTS public.gps_logs (
    id BIGSERIAL PRIMARY KEY,
    employee_id TEXT REFERENCES public.employees(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed_kmh NUMERIC(5, 2) DEFAULT 0,
    battery_percent INTEGER DEFAULT 100,
    current_address TEXT,
    transit_status TEXT DEFAULT 'moving',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROPERTY SURVEYS
CREATE TABLE IF NOT EXISTS public.properties (
    id TEXT PRIMARY KEY,
    surveyor_id TEXT REFERENCES public.employees(id) ON DELETE SET NULL,
    surveyor_name TEXT,
    address TEXT NOT NULL,
    property_type TEXT DEFAULT 'House / Villa',
    area TEXT,
    demand TEXT,
    deal_status TEXT DEFAULT 'Hot Deal',
    owner_name TEXT,
    owner_phone TEXT,
    condition_notes TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    image_url TEXT,
    timestamp TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access gps_logs" ON public.gps_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access properties" ON public.properties FOR ALL USING (true) WITH CHECK (true);</textarea>
            </div>

          </div>
        </div>
      </div>

    </div>
  `;
}

export function initAdminMap() {
  const container = document.getElementById('adminMapContainer');
  if (!container) return;

  if (mapInstance) {
    try {
      mapInstance.remove();
    } catch (e) {
      console.warn('Map cleanup error:', e);
    }
    mapInstance = null;
    employeeMarkers = {};
    propertyMarkers = {};
  }

  mapInstance = L.map('adminMapContainer', {
    center: [31.5050, 74.3600],
    zoom: 13,
    zoomControl: false
  });

  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(mapInstance);

  // Full day route line
  const latLngs = HAMZA_FULL_DAY_ROUTE.map(p => [p.lat, p.lng]);
  routePolyline = L.polyline(latLngs, {
    color: '#0284c7',
    weight: 5,
    opacity: 0.75,
    dashArray: '8, 6',
    lineCap: 'round'
  }).addTo(mapInstance);

  // Stop pins
  HAMZA_FULL_DAY_ROUTE.filter(p => p.label.includes('Stop')).forEach(stop => {
    const stopIcon = L.divIcon({
      className: 'clean-stop-flag',
      html: `<div>🚩 ${stop.time}</div>`,
      iconSize: [80, 24],
      iconAnchor: [40, 24]
    });
    L.marker([stop.lat, stop.lng], { icon: stopIcon })
      .bindPopup(`<strong>Stop Audit:</strong><br>${stop.label}<br>Time: ${stop.time}`)
      .addTo(mapInstance);
  });

  renderPropertyPins();
  updateFleetMarkers();

  setTimeout(() => {
    if (mapInstance) mapInstance.invalidateSize();
  }, 200);
}

function renderPropertyPins() {
  if (!mapInstance) return;

  Object.values(propertyMarkers).forEach(m => m.remove());
  propertyMarkers = {};

  state.properties.forEach(prop => {
    const houseIcon = L.divIcon({
      className: 'clean-property-pin',
      html: `
        <div class="property-map-pill">
          <span>🏡 ${prop.demand.split(' ')[1] || prop.demand}</span>
        </div>
      `,
      iconSize: [80, 30],
      iconAnchor: [40, 30]
    });

    const marker = L.marker([prop.coordinates.lat, prop.coordinates.lng], { icon: houseIcon })
      .addTo(mapInstance);

    marker.on('click', () => {
      window.dispatchEvent(new CustomEvent('open-property-dossier', { detail: prop }));
    });

    propertyMarkers[prop.id] = marker;
  });
}

export function updateFleetMarkers() {
  if (!mapInstance) return;

  state.employees.forEach(emp => {
    if (!emp.isClockedIn) {
      if (employeeMarkers[emp.id]) {
        employeeMarkers[emp.id].remove();
        delete employeeMarkers[emp.id];
      }
      return;
    }

    const { lat, lng } = emp.currentCoords;
    const isIdle = emp.status === 'idle';

    const empIconHtml = `
      <div class="clean-agent-pin ${isIdle ? 'pin-idle' : 'pin-active'}">
        <div class="agent-pin-avatar" style="background-color: ${emp.color}">
          ${emp.avatar}
        </div>
        <div class="agent-pin-label">
          <strong>${emp.name}</strong>
          <span>${isIdle ? '⚠️ IDLE' : `${emp.speedKmh} km/h`}</span>
        </div>
      </div>
    `;

    const icon = L.divIcon({
      className: 'agent-map-marker',
      html: empIconHtml,
      iconSize: [85, 36],
      iconAnchor: [42, 36]
    });

    if (employeeMarkers[emp.id]) {
      employeeMarkers[emp.id].setLatLng([lat, lng]);
      employeeMarkers[emp.id].setIcon(icon);
    } else {
      const marker = L.marker([lat, lng], { icon }).addTo(mapInstance);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px; padding: 4px;">
          <h4 style="margin: 0 0 4px 0;">${emp.name}</h4>
          <p style="margin: 0;">Status: <strong>${emp.status.toUpperCase()}</strong></p>
          <p style="margin: 0;">Speed: <strong>${emp.speedKmh} km/h</strong></p>
          <p style="margin: 0;">Battery: <strong>${emp.batteryPercent}%</strong></p>
          <p style="margin: 4px 0 0 0; color: #555;">Location: ${emp.currentAddress}</p>
        </div>
      `);
      employeeMarkers[emp.id] = marker;
    }
  });
}

export function bindAdminDashboardEvents() {
  const recenterBtn = document.getElementById('recenterMapBtn');
  if (recenterBtn && mapInstance) {
    recenterBtn.onclick = () => {
      const activeCoords = state.employees.filter(e => e.isClockedIn).map(e => [e.currentCoords.lat, e.currentCoords.lng]);
      if (activeCoords.length > 0) {
        mapInstance.fitBounds(activeCoords, { padding: [80, 80] });
      } else {
        mapInstance.setView([31.5050, 74.3600], 13);
      }
    };
  }

  // Toggle Alerts HUD Card
  const toggleAlertsBtn = document.getElementById('toggleAlertsFeedBtn');
  if (toggleAlertsBtn) {
    toggleAlertsBtn.onclick = () => {
      isAlertsFeedOpen = !isAlertsFeedOpen;
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Focus agent
  const agentCards = document.querySelectorAll('.agent-item-card');
  agentCards.forEach(card => {
    card.onclick = () => {
      const empId = card.getAttribute('data-emp-id');
      const emp = state.employees.find(e => e.id === empId);
      if (emp && mapInstance && emp.isClockedIn) {
        mapInstance.flyTo([emp.currentCoords.lat, emp.currentCoords.lng], 16, { duration: 1.2 });
      }
    };
  });

  // Replay
  const togglePlayBtn = document.getElementById('togglePlaybackBtn');
  const slider = document.getElementById('playbackSlider');
  const speedButtons = document.querySelectorAll('.speed-pill');

  if (togglePlayBtn) {
    togglePlayBtn.onclick = () => {
      state.playback.isPlaying = !state.playback.isPlaying;
      if (state.playback.isPlaying) {
        startRoutePlayback();
      } else {
        stopRoutePlayback();
      }
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  if (slider) {
    slider.oninput = (e) => {
      state.playback.progressIndex = parseInt(e.target.value, 10);
      updatePlaybackPosition();
    };
  }

  speedButtons.forEach(btn => {
    btn.onclick = () => {
      const spd = parseInt(btn.getAttribute('data-speed'), 10);
      state.playback.speedMultiplier = spd;
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  });

  // Open Add Employee Modal
  const openAddBtn = document.getElementById('openAddEmployeeModalBtn');
  const drawerAddBtn = document.getElementById('drawerAddEmpBtn');
  const closeAddBtn = document.getElementById('closeAddEmployeeModalBtn');
  const cancelAddBtn = document.getElementById('cancelAddEmpBtn');

  const openAddHandler = () => {
    state.openAddEmployeeModal(true);
    window.dispatchEvent(new CustomEvent('re-render-request'));
  };

  const closeAddHandler = () => {
    state.openAddEmployeeModal(false);
    window.dispatchEvent(new CustomEvent('re-render-request'));
  };

  if (openAddBtn) openAddBtn.onclick = openAddHandler;
  if (drawerAddBtn) drawerAddBtn.onclick = openAddHandler;
  if (closeAddBtn) closeAddBtn.onclick = closeAddHandler;
  if (cancelAddBtn) cancelAddBtn.onclick = closeAddHandler;

  // Auto-generate password
  const autoGenBtn = document.getElementById('autoGenPassBtn');
  if (autoGenBtn) {
    autoGenBtn.onclick = () => {
      const passInput = document.getElementById('newEmpPassword');
      if (passInput) {
        passInput.value = `Radar@${Math.floor(1000 + Math.random() * 9000)}`;
      }
    };
  }

  // Handle Add Employee Form Submit
  const addEmpForm = document.getElementById('addEmployeeForm');
  if (addEmpForm) {
    addEmpForm.onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('newEmpName').value;
      const role = document.getElementById('newEmpRole').value;
      const phone = document.getElementById('newEmpPhone').value;
      const territory = document.getElementById('newEmpTerritory').value;
      const username = document.getElementById('newEmpUsername').value;
      const password = document.getElementById('newEmpPassword').value;

      const created = state.addNewEmployee({
        name,
        role,
        phone,
        territory,
        username,
        password
      });

      newlyCreatedCredentials = created;
      state.openAddEmployeeModal(false);
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Close Receipt Modal
  const closeReceiptBtn = document.getElementById('closeReceiptModalBtn');
  if (closeReceiptBtn) {
    closeReceiptBtn.onclick = () => {
      newlyCreatedCredentials = null;
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Copy Credentials
  const copyCredsBtn = document.getElementById('copyCredsBtn');
  if (copyCredsBtn && newlyCreatedCredentials) {
    copyCredsBtn.onclick = () => {
      const textToCopy = `EstateRadar Login Credentials:\nUsername: ${newlyCreatedCredentials.username}\nPassword: ${newlyCreatedCredentials.password}`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        copyCredsBtn.innerText = '✓ Copied to Clipboard!';
        setTimeout(() => {
          if (copyCredsBtn) copyCredsBtn.innerText = '📋 Copy Credentials to Clipboard';
        }, 2000);
      });
    };
  }

  // Admin issue password reset buttons
  const issuePassButtons = document.querySelectorAll('.admin-issue-pass-btn');
  issuePassButtons.forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const empId = btn.getAttribute('data-reset-emp-id');
      const empName = btn.getAttribute('data-reset-emp-name');
      const newPass = state.adminResetPassword(empId);
      if (newPass) {
        newlyIssuedPassword = { id: empId, name: empName, password: newPass };
        window.dispatchEvent(new CustomEvent('re-render-request'));
      }
    };
  });

  // Close Reset Result Modal
  const closeResetResultBtn = document.getElementById('closeResetResultModalBtn');
  const dismissResetResultBtn = document.getElementById('dismissResetResultBtn');
  const closeResetHandler = () => {
    newlyIssuedPassword = null;
    window.dispatchEvent(new CustomEvent('re-render-request'));
  };
  if (closeResetResultBtn) closeResetResultBtn.onclick = closeResetHandler;
  if (dismissResetResultBtn) dismissResetResultBtn.onclick = closeResetHandler;

  // Server Setup Modal Events
  const openServerSetupBtn = document.getElementById('openServerSetupModalBtn');
  const closeServerSetupBtn = document.getElementById('closeServerSetupModalBtn');
  const saveServerForm = document.getElementById('saveSupabaseCredentialsForm');
  const clearServerBtn = document.getElementById('clearServerCredsBtn');
  const copySqlBtn = document.getElementById('copySqlSchemaBtn');
  const sqlTextarea = document.getElementById('sqlSchemaTextarea');

  if (openServerSetupBtn) {
    openServerSetupBtn.onclick = () => {
      isServerSetupModalOpen = true;
      serverSetupStatusMessage = null;
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  if (closeServerSetupBtn) {
    closeServerSetupBtn.onclick = () => {
      isServerSetupModalOpen = false;
      serverSetupStatusMessage = null;
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  if (saveServerForm) {
    saveServerForm.onsubmit = async (e) => {
      e.preventDefault();
      const urlInput = document.getElementById('supabaseUrlInput');
      const keyInput = document.getElementById('supabaseKeyInput');
      if (urlInput && keyInput) {
        const result = await supabase.saveCredentials(urlInput.value, keyInput.value);
        serverSetupStatusMessage = result;
        window.dispatchEvent(new CustomEvent('re-render-request'));
      }
    };
  }

  if (clearServerBtn) {
    clearServerBtn.onclick = () => {
      supabase.clearCredentials();
      serverSetupStatusMessage = { success: true, message: 'Cloud credentials cleared. Operating in local offline mode.' };
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  if (copySqlBtn && sqlTextarea) {
    copySqlBtn.onclick = () => {
      navigator.clipboard.writeText(sqlTextarea.value).then(() => {
        copySqlBtn.innerText = '✓ Copied SQL!';
        setTimeout(() => {
          copySqlBtn.innerText = '📋 Copy SQL Script';
        }, 2000);
      }).catch(() => {
        sqlTextarea.select();
        document.execCommand('copy');
        copySqlBtn.innerText = '✓ Copied SQL!';
        setTimeout(() => {
          copySqlBtn.innerText = '📋 Copy SQL Script';
        }, 2000);
      });
    };
  }
}

function startRoutePlayback() {
  stopRoutePlayback();
  playbackInterval = setInterval(() => {
    state.playback.progressIndex += 1;
    if (state.playback.progressIndex >= HAMZA_FULL_DAY_ROUTE.length) {
      state.playback.progressIndex = 0;
    }
    updatePlaybackPosition();
  }, Math.max(300, 1500 / state.playback.speedMultiplier));
}

function stopRoutePlayback() {
  if (playbackInterval) {
    clearInterval(playbackInterval);
    playbackInterval = null;
  }
}

function updatePlaybackPosition() {
  const step = HAMZA_FULL_DAY_ROUTE[state.playback.progressIndex];
  const labelElem = document.getElementById('playbackStepLabel');
  const slider = document.getElementById('playbackSlider');
  if (labelElem) labelElem.innerText = `${step.time}: ${step.label}`;
  if (slider) slider.value = state.playback.progressIndex;

  if (mapInstance) {
    if (!playbackMarker) {
      const ghostIcon = L.divIcon({
        className: 'playback-ghost-icon',
        html: `<div style="font-size: 22px;">🚗</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      playbackMarker = L.marker([step.lat, step.lng], { icon: ghostIcon }).addTo(mapInstance);
    } else {
      playbackMarker.setLatLng([step.lat, step.lng]);
    }
    mapInstance.panTo([step.lat, step.lng]);
  }
}
