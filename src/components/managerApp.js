// EstateRadar — Unified Mobile Manager Console
// Engineered specifically for Native Android & iOS Phone Screens
import L from 'leaflet';
import { state } from '../state.js';
import { supabase } from '../services/supabase.js';
import { HAMZA_FULL_DAY_ROUTE } from '../simulation.js';

let activeManagerTab = 'radar'; // 'radar' | 'team' | 'surveys' | 'alerts'
let isProfileModalOpen = false;
let isAddSurveyorModalOpen = false;
let selectedSurveyorId = null;
let isDrawerExpanded = false;
let mapInstance = null;
let mapMarkers = {};
let routePolyline = null;

export function renderManagerApp() {
  const { company, employees, properties, alerts, auth } = state;
  const currentCompany = company || { name: 'EstateRadar Agency', company_code: 'PRIME' };
  const onDutyCount = employees.filter(e => e.isClockedIn).length;
  const idleCount = employees.filter(e => e.status === 'idle').length;
  const selectedEmp = employees.find(e => e.id === selectedSurveyorId);

  return `
    <div class="manager-mobile-layout">
      
      <!-- Top Mobile Native Header -->
      <header class="mobile-native-appbar">
        <div class="appbar-brand">
          <div class="appbar-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
          </div>
          <div class="appbar-text-group">
            <span class="appbar-company-name">${currentCompany.name || 'EstateRadar'}</span>
            <span class="appbar-role-badge">🏢 Agency Manager</span>
          </div>
        </div>

        <div class="appbar-actions">
          <button class="agency-code-chip" id="mgrHeaderCodeChip" title="Tap to copy Agency Code">
            <span>Code: <strong>${currentCompany.company_code || 'PRIME'}</strong></span>
          </button>
          ${state.updateState?.isAvailable ? `
            <button class="appbar-icon-btn text-green" id="mgrHeaderUpdateBtn" title="Update Available (${state.updateState.version})">
              📥
            </button>
          ` : ''}
          <button class="appbar-icon-btn" id="mgrHeaderSettingsBtn" title="Agency Profile & Settings">
            ⚙️
          </button>
        </div>
      </header>

      <!-- Main Mobile Viewport Body -->
      <main class="manager-tab-viewport">
        
        <!-- ================= TAB 1: RADAR (LIVE MAP) ================= -->
        <div class="manager-tab-pane ${activeManagerTab === 'radar' ? 'active' : ''}" id="mgrPaneRadar">
          <div class="mobile-map-container" id="mobileRadarMap"></div>

          <!-- Floating Map Top Summary Pill -->
          <div class="map-floating-summary-pill">
            <span class="summary-stat"><strong class="text-green">${onDutyCount}</strong> Active</span>
            <span class="stat-divider">•</span>
            <span class="summary-stat ${idleCount > 0 ? 'text-amber' : ''}"><strong class="${idleCount > 0 ? 'text-amber' : ''}">${idleCount}</strong> Idle</span>
            <span class="stat-divider">•</span>
            <span class="summary-stat"><strong>${properties.length}</strong> Surveys</span>
          </div>

          <!-- Floating Map Quick Actions -->
          <div class="map-floating-quick-controls">
            <button class="map-float-btn" id="mgrCenterAllBtn" title="Center All Field Units">🎯</button>
            <button class="map-float-btn" id="mgrRefreshGpsBtn" title="Refresh GPS Telemetry">🔄</button>
          </div>

          <!-- Bottom Collapsible Telemetry Sheet -->
          <div class="mobile-bottom-sheet ${isDrawerExpanded ? 'expanded' : ''}" id="mgrBottomSheet">
            <div class="bottom-sheet-drag-handle" id="mgrDrawerHandle">
              <div class="drag-bar"></div>
              <div class="drag-handle-header">
                <span class="drawer-title">Active Field Staff (${employees.length})</span>
                <span class="drawer-arrow-toggle">${isDrawerExpanded ? '▼ Close' : '▲ View Staff'}</span>
              </div>
            </div>

            <!-- Selected Surveyor Focus Card -->
            ${selectedEmp ? `
              <div class="selected-telemetry-card">
                <div class="telemetry-card-top">
                  <div class="telemetry-avatar" style="background-color: ${selectedEmp.color || '#10b981'}">
                    ${selectedEmp.avatar || 'AR'}
                  </div>
                  <div class="telemetry-info">
                    <strong>${selectedEmp.name}</strong>
                    <span class="text-dim">${selectedEmp.currentAddress || 'Assigned Territory'}</span>
                  </div>
                  <button class="telemetry-close-btn" id="mgrCloseSelectedEmpBtn">✕</button>
                </div>

                <div class="telemetry-metrics-grid">
                  <div class="metric-box">
                    <span class="m-label">Speed</span>
                    <strong class="m-val">${selectedEmp.isClockedIn ? selectedEmp.speedKmh : 0} km/h</strong>
                  </div>
                  <div class="metric-box">
                    <span class="m-label">Battery</span>
                    <strong class="m-val ${selectedEmp.batteryPercent < 20 ? 'text-danger' : ''}">${selectedEmp.batteryPercent}%</strong>
                  </div>
                  <div class="metric-box">
                    <span class="m-label">Status</span>
                    <strong class="m-val ${selectedEmp.status === 'idle' ? 'text-amber' : 'text-green'}">
                      ${selectedEmp.isClockedIn ? (selectedEmp.status === 'idle' ? 'Idle 26m' : 'Moving') : 'Offline'}
                    </strong>
                  </div>
                </div>

                <div class="telemetry-card-actions">
                  <button class="btn btn-outline btn-sm" id="mgrReplayEmpTrailBtn">
                    🎬 Replay Route Trail
                  </button>
                  <button class="btn btn-primary btn-sm" id="mgrFocusEmpMapBtn">
                    📍 Focus on Map
                  </button>
                </div>
              </div>
            ` : ''}

            <!-- Drawer Staff List -->
            <div class="drawer-staff-list">
              ${employees.length === 0 ? `
                <div class="drawer-empty-state">
                  <p>No field surveyors added yet.</p>
                  <button class="btn btn-outline btn-xs" id="mgrDrawerAddFirstBtn">+ Add First Surveyor</button>
                </div>
              ` : employees.map(emp => {
                const isIdle = emp.status === 'idle';
                const isClocked = emp.isClockedIn;
                return `
                  <div class="mobile-emp-row ${emp.id === selectedSurveyorId ? 'selected' : ''}" data-emp-id="${emp.id}">
                    <div class="emp-row-avatar" style="background-color: ${emp.color || '#10b981'}">
                      ${emp.avatar}
                    </div>
                    <div class="emp-row-details">
                      <div class="emp-row-name-line">
                        <strong>${emp.name}</strong>
                        <span class="status-pill ${isClocked ? (isIdle ? 'amber' : 'green') : 'gray'}">
                          ${!isClocked ? 'Offline' : (isIdle ? 'Idle' : 'Active')}
                        </span>
                      </div>
                      <span class="emp-row-street">${emp.currentAddress || 'On Patrol'}</span>
                    </div>
                    <div class="emp-row-stats">
                      <span class="row-speed">${isClocked ? emp.speedKmh : 0} km/h</span>
                      <span class="row-battery">🔋 ${emp.batteryPercent}%</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- ================= TAB 2: TEAM (FIELD STAFF) ================= -->
        <div class="manager-tab-pane ${activeManagerTab === 'team' ? 'active' : ''}" id="mgrPaneTeam">
          <div class="tab-scroll-container">
            
            <!-- Agency Code Sharing Banner -->
            <div class="agency-code-banner">
              <div class="code-banner-header">
                <span class="banner-kicker">FIELD AGENT ACTIVATION</span>
                <h3>Share Your Agency Code</h3>
              </div>
              <div class="code-banner-box">
                <span class="code-large">${currentCompany.company_code || 'PRIME'}</span>
                <button class="btn btn-primary btn-sm" id="teamCopyCodeActionBtn">
                  📋 Copy Code
                </button>
              </div>
              <p class="code-banner-help">
                Instruct your surveyors to install the EstateRadar app, select <strong>Field Surveyor</strong>, and enter code <strong>${currentCompany.company_code || 'PRIME'}</strong> to sign in.
              </p>
            </div>

            <!-- Team Actions Row -->
            <div class="team-header-row">
              <div>
                <h4>Field Surveyors (${employees.length})</h4>
                <span class="text-dim">Manage credentials & field assignments</span>
              </div>
              <button class="btn btn-primary btn-sm" id="teamAddSurveyorModalBtn">
                + Add Surveyor
              </button>
            </div>

            <!-- Surveyors List -->
            <div class="team-cards-stack">
              ${employees.length === 0 ? `
                <div class="empty-placeholder-card">
                  <div class="empty-icon">👷</div>
                  <h4>No surveyors in your agency yet</h4>
                  <p>Tap below to create surveyor credentials for your field team.</p>
                  <button class="btn btn-primary" id="teamAddFirstSurveyorBtn">+ Add Field Surveyor</button>
                </div>
              ` : employees.map(emp => {
                const isIdle = emp.status === 'idle';
                const isClocked = emp.isClockedIn;
                return `
                  <div class="team-surveyor-card" data-emp-id="${emp.id}">
                    <div class="surveyor-card-header">
                      <div class="surveyor-profile-group">
                        <div class="surveyor-avatar-circle" style="background-color: ${emp.color || '#10b981'}">
                          ${emp.avatar}
                        </div>
                        <div>
                          <strong class="surveyor-full-name">${emp.name}</strong>
                          <span class="surveyor-username">@${emp.username || emp.id}</span>
                        </div>
                      </div>
                      <span class="status-pill ${isClocked ? (isIdle ? 'amber' : 'green') : 'gray'}">
                        ${!isClocked ? 'Offline' : (isIdle ? 'Idle 26m' : 'Moving')}
                      </span>
                    </div>

                    <div class="surveyor-location-strip">
                      <span class="strip-icon">📍</span>
                      <span class="strip-text">${emp.currentAddress || 'Assigned Territory'}</span>
                    </div>

                    <div class="surveyor-metrics-row">
                      <div class="m-chip">🚗 <strong>${isClocked ? emp.speedKmh : 0} km/h</strong></div>
                      <div class="m-chip">🔋 <strong>${emp.batteryPercent}%</strong></div>
                      <div class="m-chip">📷 <strong>${emp.surveysToday || 0} surveys</strong></div>
                    </div>

                    <div class="surveyor-card-actions">
                      <button class="btn btn-outline btn-xs" data-jump-to-radar="${emp.id}">
                        🗺️ View on Map
                      </button>
                      <button class="btn btn-outline btn-xs" data-quick-reset-pass="${emp.id}">
                        🔑 Reset Password
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

          </div>
        </div>

        <!-- ================= TAB 3: SURVEYS (PROPERTY AUDITS) ================= -->
        <div class="manager-tab-pane ${activeManagerTab === 'surveys' ? 'active' : ''}" id="mgrPaneSurveys">
          <div class="tab-scroll-container">
            
            <div class="surveys-header-row">
              <div>
                <h4>Verified Surveys (${properties.length})</h4>
                <span class="text-dim">Cryptographic GPS-verified property dossiers</span>
              </div>
              <button class="btn btn-primary btn-sm" id="mgrAddSurveyDirectBtn">
                + Log Survey
              </button>
            </div>

            <div class="properties-feed-list">
              ${properties.length === 0 ? `
                <div class="empty-placeholder-card">
                  <div class="empty-icon">🏠</div>
                  <h4>No surveys logged yet</h4>
                  <p>When field agents photograph properties on duty, they stream here with verified GNSS coordinates.</p>
                  <button class="btn btn-primary" id="mgrAddFirstSurveyBtn">+ Log Property Survey</button>
                </div>
              ` : properties.map(prop => `
                <div class="property-feed-card" data-prop-id="${prop.id}">
                  <div class="prop-card-media-wrap">
                    <img src="${prop.imageUrl}" alt="${prop.address}" class="prop-card-thumbnail" loading="lazy" />
                    <span class="prop-card-watermark-tag">ESTATERADAR VERIFIED</span>
                    <span class="prop-card-demand-tag">${prop.demand}</span>
                  </div>

                  <div class="prop-card-body">
                    <h4 class="prop-card-address">${prop.address}</h4>
                    <span class="prop-card-type-row">${prop.type} • ${prop.area}</span>
                    
                    <div class="prop-card-verified-strip">
                      <span class="verified-glyph">✓</span>
                      <span>GPS Verified (±${prop.accuracyMeters || 4}m) • Surveyor: ${prop.surveyorName || 'Unit 01'}</span>
                    </div>

                    <div class="prop-card-footer">
                      <span class="prop-owner-info">👤 ${prop.ownerName || 'Direct Owner'}</span>
                      <button class="btn btn-outline btn-xs prop-view-dossier-btn" data-prop-id="${prop.id}">
                        Audit Dossier ›
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

          </div>
        </div>

        <!-- ================= TAB 4: ALERTS (LIVE TELEMETRY) ================= -->
        <div class="manager-tab-pane ${activeManagerTab === 'alerts' ? 'active' : ''}" id="mgrPaneAlerts">
          <div class="tab-scroll-container">
            
            <div class="alerts-header-row">
              <div>
                <h4>Telemetry & Audit Alerts</h4>
                <span class="text-dim">Real-time slacking detection & compliance events</span>
              </div>
            </div>

            <div class="alerts-feed-stack">
              ${alerts.map(alt => `
                <div class="alert-feed-item alert-type-${alt.severity || 'info'}">
                  <div class="alert-icon-wrap">
                    ${alt.severity === 'warning' ? '⚠️' : alt.severity === 'success' ? '✓' : 'ℹ️'}
                  </div>
                  <div class="alert-content-group">
                    <div class="alert-title-row">
                      <strong>${alt.title}</strong>
                      <span class="alert-timestamp">${alt.timestamp}</span>
                    </div>
                    <p class="alert-message">${alt.message}</p>
                  </div>
                </div>
              `).join('')}
            </div>

          </div>
        </div>

      </main>

      <!-- Bottom Native Navigation Bar -->
      <nav class="manager-bottom-nav">
        <button class="bnav-tab-btn ${activeManagerTab === 'radar' ? 'active' : ''}" data-target-tab="radar">
          <span class="bnav-icon">🗺️</span>
          <span class="bnav-label">Radar</span>
        </button>
        <button class="bnav-tab-btn ${activeManagerTab === 'team' ? 'active' : ''}" data-target-tab="team">
          <span class="bnav-icon">👷</span>
          <span class="bnav-label">Team</span>
        </button>
        <button class="bnav-tab-btn ${activeManagerTab === 'surveys' ? 'active' : ''}" data-target-tab="surveys">
          <span class="bnav-icon">🏠</span>
          <span class="bnav-label">Surveys</span>
        </button>
        <button class="bnav-tab-btn ${activeManagerTab === 'alerts' ? 'active' : ''}" data-target-tab="alerts">
          <span class="bnav-icon">⚡</span>
          <span class="bnav-label">Alerts</span>
        </button>
      </nav>

      <!-- Profile & Settings Modal -->
      <div class="modal-overlay ${isProfileModalOpen ? '' : 'hidden'}" id="mgrProfileModal">
        <div class="modal-container mobile-settings-modal">
          <div class="modal-header-simple">
            <h4>Agency Profile & Settings</h4>
            <button class="close-modal-icon" id="mgrCloseProfileModalBtn">✕</button>
          </div>

          <div class="settings-modal-body">
            <div class="settings-info-card">
              <div class="settings-avatar-big">🏢</div>
              <strong class="settings-agency-title">${currentCompany.name || 'EstateRadar'}</strong>
              <span class="settings-agency-code">Agency Code: <strong>${currentCompany.company_code || 'PRIME'}</strong></span>
              <span class="settings-email">${currentCompany.admin_email || auth.currentUser?.email || 'manager@agency.com'}</span>
            </div>

            <div class="settings-options-list">
              <button class="settings-option-item" id="mgrCheckUpdateOptionBtn">
                <span>App Version</span>
                <strong class="text-green">${state.updateState?.version || 'v1.0.2'} • Check Updates 📥</strong>
              </button>

              <button class="settings-option-item" id="mgrToggleThemeOptionBtn">
                <span>Theme</span>
                <strong>${state.theme === 'light' ? '🌙 Dark Mode' : '☀️ White Mode'}</strong>
              </button>
              
              <div class="settings-option-item">
                <span>Cloud Server</span>
                <strong class="text-green">${supabase.isConfigured() ? '✓ Connected' : 'Local Fallback'}</strong>
              </div>

              <div class="settings-option-item">
                <span>Agency Data Security</span>
                <strong class="text-green">Multi-Tenant Isolated</strong>
              </div>
            </div>

            <div class="settings-logout-wrap">
              <button class="btn btn-danger btn-full" id="mgrLogoutActionBtn">
                🚪 Sign Out of Agency
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Field Surveyor Modal -->
      <div class="modal-overlay ${isAddSurveyorModalOpen ? '' : 'hidden'}" id="mgrAddSurveyorModal">
        <div class="modal-container mobile-add-surveyor-modal">
          <div class="modal-header-simple">
            <h4>Add New Field Surveyor</h4>
            <button class="close-modal-icon" id="mgrCloseAddSurveyorModalBtn">✕</button>
          </div>

          <form id="mgrAddSurveyorForm" class="add-surveyor-form-body">
            <p class="modal-subtext">Create credentials for a surveyor under Agency Code <strong>${currentCompany.company_code || 'PRIME'}</strong>.</p>
            
            <div class="login-field-group">
              <label class="field-label" for="newSurveyorName">Surveyor Full Name</label>
              <input type="text" id="newSurveyorName" class="login-text-input" placeholder="e.g. Hamza Tariq" required />
            </div>

            <div class="login-field-group">
              <label class="field-label" for="newSurveyorUser">Staff Username / ID</label>
              <input type="text" id="newSurveyorUser" class="login-text-input" placeholder="e.g. surveyor03" required />
            </div>

            <div class="login-field-group">
              <label class="field-label" for="newSurveyorTerritory">Assigned Territory / Area</label>
              <input type="text" id="newSurveyorTerritory" class="login-text-input" placeholder="e.g. Gulberg III & Model Town" required />
            </div>

            <div class="login-field-group">
              <label class="field-label" for="newSurveyorPhone">Phone Number</label>
              <input type="tel" id="newSurveyorPhone" class="login-text-input" placeholder="e.g. +92 300 1234567" />
            </div>

            <div class="login-field-group">
              <label class="field-label" for="newSurveyorPass">Initial Password</label>
              <input type="password" id="newSurveyorPass" class="login-text-input" placeholder="e.g. Pass@2026" value="Pass@2026" required />
            </div>

            <div id="addSurveyorError" class="login-error-alert hidden"></div>

            <div class="modal-actions-footer">
              <button type="button" class="btn btn-secondary" id="mgrCancelAddSurveyorBtn">Cancel</button>
              <button type="submit" class="btn btn-primary" id="mgrSubmitAddSurveyorBtn">Add Surveyor</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `;
}

export function bindManagerAppEvents() {
  // Bottom Navigation Switching
  document.querySelectorAll('.bnav-tab-btn').forEach(btn => {
    btn.onclick = () => {
      const tab = btn.getAttribute('data-target-tab');
      if (tab) {
        activeManagerTab = tab;
        isDrawerExpanded = false;
        window.dispatchEvent(new CustomEvent('re-render-request'));
      }
    };
  });

  // Header Agency Code copy
  const codeChip = document.getElementById('mgrHeaderCodeChip');
  const codeActionBtn = document.getElementById('teamCopyCodeActionBtn');
  const copyHandler = () => {
    const code = state.company?.company_code || 'PRIME';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        alert(`Agency Code "${code}" copied to clipboard! Share this with your field staff.`);
      });
    } else {
      alert(`Agency Code: ${code}`);
    }
  };
  if (codeChip) codeChip.onclick = copyHandler;
  if (codeActionBtn) codeActionBtn.onclick = copyHandler;

  // Header Settings / Profile
  const settingsBtn = document.getElementById('mgrHeaderSettingsBtn');
  const closeProfileBtn = document.getElementById('mgrCloseProfileModalBtn');
  if (settingsBtn) {
    settingsBtn.onclick = () => {
      isProfileModalOpen = true;
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }
  if (closeProfileBtn) {
    closeProfileBtn.onclick = () => {
      isProfileModalOpen = false;
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Settings: Check Updates Action
  const updateOptBtn = document.getElementById('mgrCheckUpdateOptionBtn');
  if (updateOptBtn) {
    updateOptBtn.onclick = () => {
      isProfileModalOpen = false;
      state.openUpdateModal();
    };
  }

  // Header: Update Button Action
  const headerUpdateBtn = document.getElementById('mgrHeaderUpdateBtn');
  if (headerUpdateBtn) {
    headerUpdateBtn.onclick = () => {
      state.openUpdateModal();
    };
  }

  // Settings: Theme Toggle
  const themeOptBtn = document.getElementById('mgrToggleThemeOptionBtn');
  if (themeOptBtn) {
    themeOptBtn.onclick = () => {
      state.toggleTheme();
    };
  }

  // Settings: Logout Action
  const logoutBtn = document.getElementById('mgrLogoutActionBtn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      if (confirm('Are you sure you want to sign out of this agency?')) {
        isProfileModalOpen = false;
        state.logout();
        window.dispatchEvent(new CustomEvent('re-render-request'));
      }
    };
  }

  // Drawer Toggle
  const drawerHandle = document.getElementById('mgrDrawerHandle');
  if (drawerHandle) {
    drawerHandle.onclick = () => {
      isDrawerExpanded = !isDrawerExpanded;
      const sheet = document.getElementById('mgrBottomSheet');
      if (sheet) sheet.classList.toggle('expanded', isDrawerExpanded);
    };
  }

  // Map Recenter
  const recenterBtn = document.getElementById('mgrCenterAllBtn');
  if (recenterBtn) {
    recenterBtn.onclick = () => {
      if (mapInstance) {
        mapInstance.setView([31.49, 74.35], 13);
      }
    };
  }

  // Map Refresh
  const refreshBtn = document.getElementById('mgrRefreshGpsBtn');
  if (refreshBtn) {
    refreshBtn.onclick = () => {
      alert('GPS telemetry synchronized from cloud!');
    };
  }

  // Close Selected Surveyor
  const closeSelBtn = document.getElementById('mgrCloseSelectedEmpBtn');
  if (closeSelBtn) {
    closeSelBtn.onclick = () => {
      selectedSurveyorId = null;
      if (routePolyline && mapInstance) {
        mapInstance.removeLayer(routePolyline);
        routePolyline = null;
      }
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Focus on Selected Surveyor Map
  const focusEmpBtn = document.getElementById('mgrFocusEmpMapBtn');
  if (focusEmpBtn) {
    focusEmpBtn.onclick = () => {
      const emp = state.employees.find(e => e.id === selectedSurveyorId);
      if (emp && emp.coordinates && mapInstance) {
        mapInstance.flyTo([emp.coordinates.lat, emp.coordinates.lng], 16);
      }
    };
  }

  // Replay Route Trail
  const replayTrailBtn = document.getElementById('mgrReplayEmpTrailBtn');
  if (replayTrailBtn) {
    replayTrailBtn.onclick = () => {
      if (!mapInstance) return;
      if (routePolyline) mapInstance.removeLayer(routePolyline);
      const latlngs = HAMZA_FULL_DAY_ROUTE.map(p => [p.lat, p.lng]);
      routePolyline = L.polyline(latlngs, {
        color: '#10b981',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.9
      }).addTo(mapInstance);
      mapInstance.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });
    };
  }

  // Surveyor Selection from Row
  document.querySelectorAll('.mobile-emp-row').forEach(row => {
    row.onclick = () => {
      const empId = row.getAttribute('data-emp-id');
      if (empId) {
        selectedSurveyorId = empId;
        const emp = state.employees.find(e => e.id === empId);
        if (emp && emp.coordinates && mapInstance) {
          mapInstance.flyTo([emp.coordinates.lat, emp.coordinates.lng], 15);
        }
        window.dispatchEvent(new CustomEvent('re-render-request'));
      }
    };
  });

  // Jump from Team Tab to Radar
  document.querySelectorAll('[data-jump-to-radar]').forEach(btn => {
    btn.onclick = () => {
      const empId = btn.getAttribute('data-jump-to-radar');
      selectedSurveyorId = empId;
      activeManagerTab = 'radar';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  });

  // Add Surveyor Modal Open/Close
  const openAddSurveyorModal = () => {
    isAddSurveyorModalOpen = true;
    window.dispatchEvent(new CustomEvent('re-render-request'));
  };
  const closeAddSurveyorModal = () => {
    isAddSurveyorModalOpen = false;
    window.dispatchEvent(new CustomEvent('re-render-request'));
  };

  const addModalBtn1 = document.getElementById('teamAddSurveyorModalBtn');
  const addModalBtn2 = document.getElementById('teamAddFirstSurveyorBtn');
  const addModalBtn3 = document.getElementById('mgrDrawerAddFirstBtn');
  const cancelAddBtn = document.getElementById('mgrCancelAddSurveyorBtn');
  const closeAddModalBtn = document.getElementById('mgrCloseAddSurveyorModalBtn');

  if (addModalBtn1) addModalBtn1.onclick = openAddSurveyorModal;
  if (addModalBtn2) addModalBtn2.onclick = openAddSurveyorModal;
  if (addModalBtn3) addModalBtn3.onclick = openAddSurveyorModal;
  if (cancelAddBtn) cancelAddBtn.onclick = closeAddSurveyorModal;
  if (closeAddModalBtn) closeAddModalBtn.onclick = closeAddSurveyorModal;

  // Add Surveyor Form Submit
  const addSurveyorForm = document.getElementById('mgrAddSurveyorForm');
  if (addSurveyorForm) {
    addSurveyorForm.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('newSurveyorName').value.trim();
      const username = document.getElementById('newSurveyorUser').value.trim().toLowerCase();
      const territory = document.getElementById('newSurveyorTerritory').value.trim();
      const phone = document.getElementById('newSurveyorPhone').value.trim();
      const password = document.getElementById('newSurveyorPass').value.trim();
      const errBox = document.getElementById('addSurveyorError');
      const submitBtn = document.getElementById('mgrSubmitAddSurveyorBtn');

      if (submitBtn) submitBtn.disabled = true;
      if (errBox) errBox.classList.add('hidden');

      const newEmp = {
        id: 'emp_' + Date.now(),
        company_id: state.company?.id || 'comp_demo',
        name: name,
        username: username,
        phone: phone || '+92 300 0000000',
        avatar: name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
        color: '#10b981',
        status: 'moving',
        speedKmh: 15,
        batteryPercent: 95,
        isClockedIn: true,
        currentAddress: territory,
        coordinates: { lat: 31.4728, lng: 74.4021 },
        surveysToday: 0
      };

      state.employees.unshift(newEmp);
      isAddSurveyorModalOpen = false;
      alert(`Surveyor "${name}" created!\nUsername: ${username}\nPassword: ${password}\nAgency Code: ${state.company?.company_code || 'PRIME'}`);
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Quick reset password
  document.querySelectorAll('[data-quick-reset-pass]').forEach(btn => {
    btn.onclick = () => {
      const empId = btn.getAttribute('data-quick-reset-pass');
      const emp = state.employees.find(e => e.id === empId);
      if (emp) {
        const newPass = prompt(`Enter new password for ${emp.name}:`, 'Pass@2026');
        if (newPass) {
          alert(`Password for ${emp.name} updated to "${newPass}".`);
        }
      }
    };
  });

  // Audit Property Dossier click
  document.querySelectorAll('.prop-view-dossier-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const propId = btn.getAttribute('data-prop-id');
      const prop = state.properties.find(p => p.id === propId);
      if (prop) {
        window.dispatchEvent(new CustomEvent('open-property-dossier', { detail: prop }));
      }
    };
  });

  // Initialize Map if on Radar tab
  if (activeManagerTab === 'radar') {
    setTimeout(() => {
      initMobileMap();
    }, 60);
  }
}

function initMobileMap() {
  const container = document.getElementById('mobileRadarMap');
  if (!container) return;

  if (mapInstance) {
    try {
      mapInstance.remove();
    } catch (e) {}
    mapInstance = null;
    mapMarkers = {};
  }

  // Center around Lahore or surveyor coordinates
  const firstEmp = state.employees[0];
  const centerLat = firstEmp?.coordinates?.lat || 31.485;
  const centerLng = firstEmp?.coordinates?.lng || 74.35;

  mapInstance = L.map(container, {
    zoomControl: false,
    attributionControl: false
  }).setView([centerLat, centerLng], 13);

  // CartoDB Dark Matter tiles (modern sleek dark map)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(mapInstance);

  // Add Surveyor Markers
  state.employees.forEach(emp => {
    if (!emp.coordinates) return;
    const isClocked = emp.isClockedIn;
    const isIdle = emp.status === 'idle';
    const markerColor = isClocked ? (isIdle ? '#f59e0b' : '#10b981') : '#71717a';

    const customIcon = L.divIcon({
      className: 'custom-mobile-marker',
      html: `
        <div class="marker-pulse-wrapper" style="--pulse-color: ${markerColor}">
          <div class="marker-inner-dot" style="background-color: ${markerColor}">
            <span>${emp.avatar}</span>
          </div>
          <span class="marker-name-tag">${emp.name.split(' ')[0]}</span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const marker = L.marker([emp.coordinates.lat, emp.coordinates.lng], { icon: customIcon }).addTo(mapInstance);
    marker.on('click', () => {
      selectedSurveyorId = emp.id;
      isDrawerExpanded = true;
      window.dispatchEvent(new CustomEvent('re-render-request'));
    });
    mapMarkers[emp.id] = marker;
  });

  // Add Property Pins
  state.properties.forEach(prop => {
    if (!prop.coordinates) return;
    const propIcon = L.divIcon({
      className: 'property-pin-marker',
      html: `
        <div class="prop-pin-inner">
          <span>🏠</span>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const pMarker = L.marker([prop.coordinates.lat, prop.coordinates.lng], { icon: propIcon }).addTo(mapInstance);
    pMarker.on('click', () => {
      window.dispatchEvent(new CustomEvent('open-property-dossier', { detail: prop }));
    });
  });

  // Invalidate map size to ensure rendering
  setTimeout(() => {
    if (mapInstance) mapInstance.invalidateSize();
  }, 100);
}
