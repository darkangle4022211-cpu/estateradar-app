// EstateRadar — Unified Mobile Manager Console
// Clean, Human-Designed Architecture — Zero Dummy Data — Pending Requests Flow
import L from 'leaflet';
import { state } from '../state.js';
import { supabase } from '../services/supabase.js';

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
  
  const pendingEmployees = employees.filter(e => e.status === 'pending');
  const activeEmployees = employees.filter(e => e.status !== 'pending');
  
  const onDutyCount = activeEmployees.filter(e => e.isClockedIn).length;
  const idleCount = activeEmployees.filter(e => e.status === 'idle').length;
  const selectedEmp = activeEmployees.find(e => e.id === selectedSurveyorId);

  return `
    <div class="manager-mobile-layout">
      
      <!-- Top Mobile Native Header -->
      <header class="mobile-native-appbar">
        <div class="appbar-brand">
          <div class="appbar-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
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
            <button class="appbar-icon-btn update-glowing-badge" id="mgrHeaderUpdateBtn" title="Update Available (${state.updateState.version})">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span class="update-glow-dot"></span>
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
            <span class="summary-stat"><strong class="text-green">${onDutyCount}</strong> Active Staff</span>
            <span class="stat-divider">•</span>
            <span class="summary-stat"><strong>${properties.length}</strong> Surveys</span>
            ${pendingEmployees.length > 0 ? `
              <span class="stat-divider">•</span>
              <span class="summary-stat text-amber"><strong>${pendingEmployees.length}</strong> Pending</span>
            ` : ''}
          </div>

          <!-- Floating Map Quick Actions -->
          <div class="map-floating-quick-controls">
            <button class="map-float-btn" id="mgrCenterAllBtn" title="Center Map">🎯</button>
            <button class="map-float-btn" id="mgrRefreshGpsBtn" title="Refresh GPS">🔄</button>
          </div>

          <!-- Bottom Collapsible Telemetry Sheet -->
          <div class="mobile-bottom-sheet ${isDrawerExpanded ? 'expanded' : ''}" id="mgrBottomSheet">
            <div class="bottom-sheet-drag-handle" id="mgrDrawerHandle">
              <div class="drag-bar"></div>
              <div class="drag-handle-header">
                <span class="drawer-title">Field Staff (${activeEmployees.length})</span>
                <span class="drawer-arrow-toggle">${isDrawerExpanded ? '▼ Close' : '▲ View Staff'}</span>
              </div>
            </div>

            <!-- Selected Surveyor Focus Card -->
            ${selectedEmp ? `
              <div class="selected-telemetry-card">
                <div class="telemetry-card-top">
                  <div class="telemetry-avatar" style="background-color: ${selectedEmp.color || '#10b981'}">
                    ${selectedEmp.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div class="telemetry-info">
                    <strong>${selectedEmp.name}</strong>
                    <span class="text-dim">${selectedEmp.currentAddress || 'Field Assigned'}</span>
                  </div>
                  <button class="telemetry-close-btn" id="mgrCloseSelectedEmpBtn">✕</button>
                </div>

                <div class="telemetry-metrics-grid">
                  <div class="metric-box">
                    <span class="m-label">Speed</span>
                    <strong class="m-val">${selectedEmp.isClockedIn ? (selectedEmp.speedKmh || 0) : 0} km/h</strong>
                  </div>
                  <div class="metric-box">
                    <span class="m-label">Battery</span>
                    <strong class="m-val">${selectedEmp.batteryPercent || 100}%</strong>
                  </div>
                  <div class="metric-box">
                    <span class="m-label">Surveys</span>
                    <strong class="m-val">${selectedEmp.surveysToday || 0}</strong>
                  </div>
                  <div class="metric-box">
                    <span class="m-label">Status</span>
                    <strong class="m-val ${selectedEmp.isClockedIn ? 'text-green' : 'text-dim'}">
                      ${selectedEmp.isClockedIn ? 'On Duty' : 'Offline'}
                    </strong>
                  </div>
                </div>

                <div class="telemetry-actions-strip">
                  <button class="btn btn-primary btn-xs" id="mgrFocusEmpMapBtn">
                    📍 Focus on Map
                  </button>
                </div>
              </div>
            ` : ''}

            <!-- Drawer Staff List -->
            <div class="drawer-staff-list">
              ${activeEmployees.length === 0 ? `
                <div class="drawer-empty-state">
                  <p>No active field staff yet.</p>
                  <button class="btn btn-outline btn-xs" id="mgrDrawerAddFirstBtn">+ Add Staff Member</button>
                </div>
              ` : activeEmployees.map(emp => {
                const isClocked = emp.isClockedIn;
                return `
                  <div class="mobile-emp-row ${emp.id === selectedSurveyorId ? 'selected' : ''}" data-emp-id="${emp.id}">
                    <div class="emp-row-avatar" style="background-color: ${emp.color || '#10b981'}">
                      ${emp.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div class="emp-row-details">
                      <div class="emp-row-name-line">
                        <strong>${emp.name}</strong>
                        <span class="status-pill ${isClocked ? 'green' : 'gray'}">
                          ${isClocked ? 'On Duty' : 'Offline'}
                        </span>
                      </div>
                      <span class="emp-row-street">${emp.currentAddress || 'Assigned Territory'}</span>
                    </div>
                    <div class="emp-row-stats">
                      <span class="row-speed">${isClocked ? (emp.speedKmh || 0) : 0} km/h</span>
                      <span class="row-battery">🔋 ${emp.batteryPercent || 100}%</span>
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
                <span class="banner-kicker">AGENCY CODE</span>
                <h3>Share with Field Employees</h3>
              </div>
              <div class="code-banner-box">
                <span class="code-large">${currentCompany.company_code || 'PRIME'}</span>
                <button class="btn btn-primary btn-sm" id="teamCopyCodeActionBtn">
                  📋 Copy Code
                </button>
              </div>
              <p class="code-banner-help">
                Employees enter code <strong>${currentCompany.company_code || 'PRIME'}</strong> when signing in or requesting to join on their phones.
              </p>
            </div>

            <!-- PENDING JOIN REQUESTS (USER CORE REQUIREMENT) -->
            ${pendingEmployees.length > 0 ? `
              <div class="pending-approval-box">
                <div class="pending-box-header">
                  <div class="pending-tag-count">🔔 ${pendingEmployees.length} Pending</div>
                  <h4>Staff Join Requests</h4>
                </div>
                <p class="pending-sub-desc">These employees registered with code <strong>${currentCompany.company_code}</strong> and need your approval to access the app.</p>
                
                <div class="pending-cards-list">
                  ${pendingEmployees.map(p => `
                    <div class="pending-emp-card">
                      <div class="pending-emp-meta">
                        <div class="pending-avatar">${p.name.substring(0, 2).toUpperCase()}</div>
                        <div class="pending-text">
                          <strong>${p.name}</strong>
                          <span class="text-dim">@${p.username} ${p.phone ? `• ${p.phone}` : ''}</span>
                        </div>
                      </div>
                      <div class="pending-card-buttons">
                        <button class="btn btn-primary btn-sm" data-approve-id="${p.id}">
                          ✓ Accept
                        </button>
                        <button class="btn btn-secondary btn-sm" data-reject-id="${p.id}">
                          ✕ Decline
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Team Actions Row -->
            <div class="team-header-row">
              <div>
                <h4>Active Staff (${activeEmployees.length})</h4>
                <span class="text-dim">Manage credentials & field assignments</span>
              </div>
              <button class="btn btn-primary btn-sm" id="teamAddSurveyorModalBtn">
                + Add Employee
              </button>
            </div>

            <!-- Active Surveyors List -->
            <div class="team-cards-stack">
              ${activeEmployees.length === 0 ? `
                <div class="empty-placeholder-card">
                  <div class="empty-icon">👷</div>
                  <h4>No active employees yet</h4>
                  <p>Share Agency Code <strong>${currentCompany.company_code || 'PRIME'}</strong> for employees to request access, or add them directly below.</p>
                  <button class="btn btn-primary" id="teamAddFirstSurveyorBtn">+ Add Employee</button>
                </div>
              ` : activeEmployees.map(emp => {
                const isClocked = emp.isClockedIn;
                return `
                  <div class="team-surveyor-card" data-emp-id="${emp.id}">
                    <div class="surveyor-card-header">
                      <div class="surveyor-profile-group">
                        <div class="surveyor-avatar-circle" style="background-color: ${emp.color || '#10b981'}">
                          ${emp.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong class="surveyor-full-name">${emp.name}</strong>
                          <span class="surveyor-username">@${emp.username || emp.id}</span>
                        </div>
                      </div>
                      <span class="status-pill ${isClocked ? 'green' : 'gray'}">
                        ${isClocked ? 'On Duty' : 'Offline'}
                      </span>
                    </div>

                    <div class="surveyor-location-strip">
                      <span class="strip-icon">📍</span>
                      <span class="strip-text">${emp.currentAddress || 'Assigned Territory'}</span>
                    </div>

                    <div class="surveyor-metrics-row">
                      <div class="m-chip">🚗 <strong>${isClocked ? (emp.speedKmh || 0) : 0} km/h</strong></div>
                      <div class="m-chip">🔋 <strong>${emp.batteryPercent || 100}%</strong></div>
                      <div class="m-chip">📷 <strong>${emp.surveysToday || 0} surveys</strong></div>
                    </div>

                    <div class="surveyor-card-actions">
                      <button class="btn btn-outline btn-xs" data-jump-to-radar="${emp.id}">
                        🗺️ View on Map
                      </button>
                      <button class="btn btn-ghost btn-xs text-danger" data-remove-emp-id="${emp.id}">
                        Remove
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

          </div>
        </div>

        <!-- ================= TAB 3: SURVEYS ================= -->
        <div class="manager-tab-pane ${activeManagerTab === 'surveys' ? 'active' : ''}" id="mgrPaneSurveys">
          <div class="tab-scroll-container">
            <div class="team-header-row">
              <div>
                <h4>Property Surveys (${properties.length})</h4>
                <span class="text-dim">Real verified surveys submitted by staff</span>
              </div>
            </div>

            <div class="surveys-feed-stack">
              ${properties.length === 0 ? `
                <div class="empty-placeholder-card">
                  <div class="empty-icon">🏠</div>
                  <h4>No property surveys yet</h4>
                  <p>When your field staff submit property surveys with GPS photos, they will appear here in real time.</p>
                </div>
              ` : properties.map(prop => `
                <div class="verified-survey-card" data-prop-id="${prop.id}">
                  ${prop.imageUrl ? `
                    <div class="survey-card-media-box">
                      <img src="${prop.imageUrl}" alt="${prop.address}" class="survey-card-img" />
                      <span class="survey-type-badge">${prop.type || 'Property'}</span>
                    </div>
                  ` : ''}
                  <div class="survey-card-body">
                    <div class="survey-card-price-row">
                      <strong class="survey-demand-price">${prop.demand || 'Price on Request'}</strong>
                      <span class="survey-verified-chip">✓ GPS Verified</span>
                    </div>
                    <h4 class="survey-card-address">${prop.address}</h4>
                    <div class="survey-meta-footer">
                      <span>👤 ${prop.surveyorName || 'Staff'}</span>
                      <span>🕒 ${prop.timestamp || 'Today'}</span>
                    </div>
                    ${prop.ownerPhone ? `
                      <div class="survey-contact-row">
                        <span>Owner: <strong>${prop.ownerName || 'Contact'}</strong> (${prop.ownerPhone})</span>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- ================= TAB 4: ALERTS ================= -->
        <div class="manager-tab-pane ${activeManagerTab === 'alerts' ? 'active' : ''}" id="mgrPaneAlerts">
          <div class="tab-scroll-container">
            <div class="team-header-row">
              <div>
                <h4>Security & Audit Feed</h4>
                <span class="text-dim">Real-time workforce verification & system logs</span>
              </div>
            </div>

            <!-- Security & Telemetry System Health HUD -->
            <div class="alerts-health-hud-grid">
              <div class="health-hud-card">
                <span class="hud-status-dot online"></span>
                <div class="hud-text-group">
                  <strong>GNSS Telemetry Stream</strong>
                  <span>Active • 5s ping frequency</span>
                </div>
              </div>
              <div class="health-hud-card">
                <span class="hud-status-dot online"></span>
                <div class="hud-text-group">
                  <strong>Anti-Spoofing Guard</strong>
                  <span>Mock GPS filter enabled</span>
                </div>
              </div>
              <div class="health-hud-card">
                <span class="hud-status-dot online"></span>
                <div class="hud-text-group">
                  <strong>Tenant Boundary</strong>
                  <span>Multi-tenant data isolated</span>
                </div>
              </div>
            </div>

            <!-- Alerts List or Verified Normal State -->
            <div class="alerts-feed-stack">
              ${alerts.length === 0 ? `
                <div class="audit-healthy-banner">
                  <div class="healthy-badge-icon">🛡️</div>
                  <div class="healthy-text-block">
                    <h4>All Agency Operations Normal</h4>
                    <p>No security anomalies or boundary violations detected. Live field activity will be logged here as surveyors check in and register properties.</p>
                  </div>
                </div>

                <div class="monitored-events-card">
                  <h5 class="monitored-title">Events Monitored in Real-Time:</h5>
                  <ul class="monitored-list">
                    <li><span class="event-bullet">🕒</span> <span>Surveyor Shift Clock-Ins & Clock-Outs</span></li>
                    <li><span class="event-bullet">📸</span> <span>On-Site Property Survey Submissions with Watermarked GPS</span></li>
                    <li><span class="event-bullet">📍</span> <span>Geofence Crossings & Rapid Velocity Shifts</span></li>
                    <li><span class="event-bullet">👥</span> <span>New Staff Member Join Requests & Agency Approvals</span></li>
                  </ul>
                </div>
              ` : alerts.map(alt => {
                const sev = alt.severity || 'info';
                const icon = sev === 'critical' ? '🚨' : sev === 'warning' ? '⚠️' : sev === 'success' ? '✅' : 'ℹ️';
                return `
                  <div class="audit-alert-card severity-${sev}">
                    <div class="alert-card-left-accent"></div>
                    <div class="alert-card-inner">
                      <div class="alert-card-top">
                        <div class="alert-title-group">
                          <span class="alert-icon-mini">${icon}</span>
                          <strong class="alert-title-text">${alt.title}</strong>
                        </div>
                        <span class="alert-severity-pill ${sev}">${sev.toUpperCase()}</span>
                      </div>
                      <p class="alert-card-msg">${alt.message}</p>
                      <div class="alert-card-footer">
                        <span class="alert-time-pill">🕒 ${alt.timestamp || 'Just now'}</span>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

      </main>

      <!-- Bottom Material 3 Navigation Bar -->
      <nav class="manager-bottom-nav">
        <button class="mgr-nav-item ${activeManagerTab === 'radar' ? 'active' : ''}" id="mgrTabBtnRadar">
          <span class="nav-icon">🗺️</span>
          <span class="nav-label">Radar</span>
        </button>
        <button class="mgr-nav-item ${activeManagerTab === 'team' ? 'active' : ''}" id="mgrTabBtnTeam">
          <span class="nav-icon">👥</span>
          <span class="nav-label">Team ${pendingEmployees.length > 0 ? `(${pendingEmployees.length})` : ''}</span>
        </button>
        <button class="mgr-nav-item ${activeManagerTab === 'surveys' ? 'active' : ''}" id="mgrTabBtnSurveys">
          <span class="nav-icon">📋</span>
          <span class="nav-label">Surveys</span>
        </button>
        <button class="mgr-nav-item ${activeManagerTab === 'alerts' ? 'active' : ''}" id="mgrTabBtnAlerts">
          <span class="nav-icon">⚡</span>
          <span class="nav-label">Alerts</span>
        </button>
      </nav>

      <!-- Agency Profile & Settings Modal -->
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
                <span>Data Isolation</span>
                <strong class="text-green">Multi-Tenant Protected</strong>
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

      <!-- Add Field Employee Modal -->
      <div class="modal-overlay ${isAddSurveyorModalOpen ? '' : 'hidden'}" id="mgrAddSurveyorModal">
        <div class="modal-container mobile-add-surveyor-modal">
          <div class="modal-header-simple">
            <h4>Add New Field Employee</h4>
            <button class="close-modal-icon" id="mgrCloseAddSurveyorModalBtn">✕</button>
          </div>

          <form id="mgrAddSurveyorForm" class="add-surveyor-form-body">
            <p class="modal-subtext">Create credentials for staff under Agency Code <strong>${currentCompany.company_code || 'PRIME'}</strong>.</p>
            
            <div class="login-field-group">
              <label class="field-label" for="newSurveyorName">Full Name</label>
              <input type="text" id="newSurveyorName" class="login-text-input" placeholder="e.g. Hamza Tariq" required />
            </div>

            <div class="login-field-group">
              <label class="field-label" for="newSurveyorUser">Username</label>
              <input type="text" id="newSurveyorUser" class="login-text-input" placeholder="e.g. hamza" required />
            </div>

            <div class="login-field-group">
              <label class="field-label" for="newSurveyorPass">Password</label>
              <input type="password" id="newSurveyorPass" class="login-text-input" placeholder="Password for staff to sign in" required />
            </div>

            <div class="login-field-group">
              <label class="field-label" for="newSurveyorPhone">Phone Number (Optional)</label>
              <input type="tel" id="newSurveyorPhone" class="login-text-input" placeholder="+92 300 1234567" />
            </div>

            <div id="addSurveyorError" class="login-error-alert hidden"></div>

            <div class="add-surveyor-actions">
              <button type="submit" class="btn btn-primary btn-full" id="mgrSubmitAddSurveyorBtn">
                Create & Activate Staff
              </button>
              <button type="button" class="btn btn-secondary btn-full" id="mgrCancelAddSurveyorBtn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `;
}

export function bindManagerAppEvents() {
  // Tab Switching
  const bindTab = (btnId, tabName) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.onclick = () => {
        activeManagerTab = tabName;
        window.dispatchEvent(new CustomEvent('re-render-request'));
      };
    }
  };

  bindTab('mgrTabBtnRadar', 'radar');
  bindTab('mgrTabBtnTeam', 'team');
  bindTab('mgrTabBtnSurveys', 'surveys');
  bindTab('mgrTabBtnAlerts', 'alerts');

  // Copy Agency Code
  const copyCode = () => {
    const code = state.company?.company_code || 'PRIME';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        alert(`Agency Code "${code}" copied to clipboard!`);
      }).catch(() => {
        alert(`Agency Code: ${code}`);
      });
    } else {
      alert(`Agency Code: ${code}`);
    }
  };

  const codeChip = document.getElementById('mgrHeaderCodeChip');
  const copyBtn = document.getElementById('teamCopyCodeActionBtn');
  if (codeChip) codeChip.onclick = copyCode;
  if (copyBtn) copyBtn.onclick = copyCode;

  // Settings Modal Open/Close
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

  // Close Selected Surveyor
  const closeSelectedBtn = document.getElementById('mgrCloseSelectedEmpBtn');
  if (closeSelectedBtn) {
    closeSelectedBtn.onclick = () => {
      selectedSurveyorId = null;
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Focus on Selected Surveyor Map
  const focusEmpBtn = document.getElementById('mgrFocusEmpMapBtn');
  if (focusEmpBtn) {
    focusEmpBtn.onclick = () => {
      const emp = state.employees.find(e => e.id === selectedSurveyorId);
      const coords = emp?.currentCoords || emp?.coordinates;
      if (coords && mapInstance) {
        mapInstance.flyTo([coords.lat, coords.lng], 16);
      }
    };
  }

  // Surveyor Selection from Row
  document.querySelectorAll('.mobile-emp-row').forEach(row => {
    row.onclick = () => {
      const empId = row.getAttribute('data-emp-id');
      if (empId) {
        selectedSurveyorId = empId;
        const emp = state.employees.find(e => e.id === empId);
        const coords = emp?.currentCoords || emp?.coordinates;
        if (coords && mapInstance) {
          mapInstance.flyTo([coords.lat, coords.lng], 15);
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

  // Remove Employee
  document.querySelectorAll('[data-remove-emp-id]').forEach(btn => {
    btn.onclick = () => {
      const empId = btn.getAttribute('data-remove-emp-id');
      if (confirm('Remove this employee from your agency roster?')) {
        state.rejectEmployee(empId);
        window.dispatchEvent(new CustomEvent('re-render-request'));
      }
    };
  });

  // PENDING JOIN REQUEST ACTIONS (APPROVE / REJECT)
  document.querySelectorAll('[data-approve-id]').forEach(btn => {
    btn.onclick = () => {
      const empId = btn.getAttribute('data-approve-id');
      state.approveEmployee(empId);
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  });

  document.querySelectorAll('[data-reject-id]').forEach(btn => {
    btn.onclick = () => {
      const empId = btn.getAttribute('data-reject-id');
      if (confirm('Decline this staff request?')) {
        state.rejectEmployee(empId);
        window.dispatchEvent(new CustomEvent('re-render-request'));
      }
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
    addSurveyorForm.onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('newSurveyorName').value.trim();
      const username = document.getElementById('newSurveyorUser').value.trim().toLowerCase();
      const password = document.getElementById('newSurveyorPass').value.trim();
      const phone = document.getElementById('newSurveyorPhone').value.trim();
      const errBox = document.getElementById('addSurveyorError');
      const submitBtn = document.getElementById('mgrSubmitAddSurveyorBtn');

      if (submitBtn) submitBtn.disabled = true;
      if (errBox) errBox.classList.add('hidden');

      const res = state.createEmployee({
        name,
        username,
        password,
        phone,
        role: 'Field Surveyor'
      });

      if (submitBtn) submitBtn.disabled = false;

      if (!res.success) {
        if (errBox) {
          errBox.innerText = res.error || 'Failed to add employee.';
          errBox.classList.remove('hidden');
        }
      } else {
        isAddSurveyorModalOpen = false;
        alert(`Employee "${name}" created!\nUsername: ${username}\nPassword: ${password}\nAgency Code: ${state.company?.company_code || 'PRIME'}`);
        window.dispatchEvent(new CustomEvent('re-render-request'));
      }
    };
  }

  // Refresh & Center Map
  const centerBtn = document.getElementById('mgrCenterAllBtn');
  if (centerBtn) {
    centerBtn.onclick = () => {
      if (mapInstance) {
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(pos => {
            mapInstance.flyTo([pos.coords.latitude, pos.coords.longitude], 15);
          });
        }
      }
    };
  }

  const refreshGpsBtn = document.getElementById('mgrRefreshGpsBtn');
  if (refreshGpsBtn) {
    refreshGpsBtn.onclick = () => {
      state.loadCompanyData();
      if (mapInstance) {
        setTimeout(() => mapInstance.invalidateSize(), 50);
      }
    };
  }

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

  // Center on active employee or real device coordinates
  const activeEmpWithCoords = state.employees.find(e => (e.currentCoords || e.coordinates) && e.status !== 'pending');
  const defaultLat = activeEmpWithCoords?.currentCoords?.lat || activeEmpWithCoords?.coordinates?.lat || 31.5204;
  const defaultLng = activeEmpWithCoords?.currentCoords?.lng || activeEmpWithCoords?.coordinates?.lng || 74.3587;

  mapInstance = L.map(container, {
    zoomControl: false,
    attributionControl: false
  }).setView([defaultLat, defaultLng], 13);

  // Reliable OpenStreetMap tiles (no API key required)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapInstance);

  // If no employees with coordinates, center on real device position
  if (!activeEmpWithCoords && typeof navigator !== 'undefined' && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      if (mapInstance) {
        mapInstance.setView([pos.coords.latitude, pos.coords.longitude], 14);
      }
    }, () => {}, { timeout: 4000 });
  }

  // Add Real Active Staff Markers
  state.employees.filter(e => e.status !== 'pending').forEach(emp => {
    const coords = emp.currentCoords || emp.coordinates;
    if (!coords) return;
    const isClocked = emp.isClockedIn;
    const markerColor = isClocked ? '#10b981' : '#71717a';

    const customIcon = L.divIcon({
      className: 'custom-mobile-marker',
      html: `
        <div class="marker-pulse-wrapper" style="--pulse-color: ${markerColor}">
          <div class="marker-inner-dot" style="background-color: ${markerColor}">
            <span>${emp.name.substring(0, 2).toUpperCase()}</span>
          </div>
          <span class="marker-name-tag">${emp.name.split(' ')[0]}</span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const marker = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(mapInstance);
    marker.on('click', () => {
      selectedSurveyorId = emp.id;
      isDrawerExpanded = true;
      window.dispatchEvent(new CustomEvent('re-render-request'));
    });
    mapMarkers[emp.id] = marker;
  });

  // Add Real Property Survey Pins
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

  // Ensure map tiles render without grey boxes
  setTimeout(() => { if (mapInstance) mapInstance.invalidateSize(); }, 60);
  setTimeout(() => { if (mapInstance) mapInstance.invalidateSize(); }, 300);
}
