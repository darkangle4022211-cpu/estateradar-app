// Clean, Multi-Tab Human-Designed Mobile Application
import { state } from '../state.js';
import { renderUpdateModal, bindUpdateModalEvents } from './updateModal.js';
import { renderLoginScreen, bindLoginScreenEvents } from './loginScreen.js';

let activeTab = 'tracker'; // 'tracker' | 'properties'

export function renderMobileApp() {
  // If not authenticated, render the Biometric Login Screen
  if (!state.auth.isAuthenticated) {
    return renderLoginScreen();
  }

  const { currentUser, properties, updateState } = state;
  const isClocked = currentUser.isClockedIn;
  const myProperties = properties.filter(p => p.surveyorId === currentUser.id);

  // Shift duration
  const elapsedMs = isClocked ? Date.now() - state.shiftStartTime : 0;
  const hours = Math.floor(elapsedMs / 3600000);
  const minutes = Math.floor((elapsedMs % 3600000) / 60000);
  const shiftText = isClocked ? `${hours}h ${minutes}m on duty` : 'Standby';

  return `
    <div class="mobile-device-viewport">
      
      <!-- Top Native-Style Header -->
      <header class="mobile-native-header">
        <div class="header-left">
          <span class="company-logo-text">EstateRadar</span>
          <span class="user-role-label">Field Agent</span>
        </div>
        <div class="header-right">
          ${updateState.isAvailable ? `
            <button class="header-plain-link" id="openUpdatePillBtn" title="Update available — Tap to install">
              Update Available
            </button>
          ` : ''}
          <span class="header-plain-status ${isClocked ? 'online' : 'offline'}">
            ${isClocked ? 'On Shift' : 'Off Shift'}
          </span>
          <button class="header-action-btn" id="toggleThemeBtn" title="Toggle White / Dark Theme">
            ${state.theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button class="header-action-btn" id="lockAppBtn" title="Lock App / Biometric Sign In">
            🔒
          </button>
        </div>
      </header>

      <!-- Main Scrollable App Container -->
      <main class="mobile-tab-content">
        
        <!-- ================= TAB 1: TRACKER / DASHBOARD ================= -->
        <div class="tab-pane ${activeTab === 'tracker' ? 'active' : ''}" id="tabPaneTracker">
          
          ${updateState.isAvailable ? `
            <!-- Prominent In-App Update Notice -->
            <div class="update-available-banner" id="openUpdateBannerBtn" title="Click to update">
              <div class="banner-badge-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
              <div class="banner-text-details">
                <span class="banner-bold-title">System Update Available</span>
                <span class="banner-subtext">Release v${updateState.version} (Verified Build) is ready to deploy</span>
              </div>
              <span class="banner-click-arrow">›</span>
            </div>
          ` : ''}
          
          <!-- Shift Control Card -->
          <div class="card shift-card ${isClocked ? 'card-active-shift' : ''}">
            <div class="shift-card-header">
              <div>
                <span class="shift-kicker">FIELD SHIFT TELEMETRY</span>
                <h3 class="shift-title">${isClocked ? 'Active Patrol in Progress' : 'Standby • Shift Inactive'}</h3>
              </div>
              <span class="shift-timer">${shiftText}</span>
            </div>

            <p class="shift-desc">
              ${isClocked 
                ? 'High-precision GNSS coordinates and transit waypoints are streaming encrypted to the manager radar console.' 
                : 'Telemetry polling is deactivated. Coordinates are private and invisible to dispatch while off duty.'}
            </p>

            <button class="btn ${isClocked ? 'btn-danger' : 'btn-primary'} btn-full" id="toggleShiftBtn">
              <span>${isClocked ? 'Conclude Shift' : 'Commence Shift'}</span>
            </button>
          </div>

          <!-- Quick Action: Log Property Survey -->
          <div class="action-banner-card ${!isClocked ? 'disabled' : ''}" id="quickAddPropertyBtn">
            <div class="action-icon-circle">📷</div>
            <div class="action-text-group">
              <h4>+ Register Property Survey</h4>
              <p>Capture verified geo-tagged photo & appraisal dossier</p>
            </div>
            <span class="action-chevron">›</span>
          </div>

          <!-- Real-Time Metrics -->
          <div class="stats-row">
            <div class="stat-box">
              <span class="stat-number">${myProperties.length}</span>
              <span class="stat-label">Surveys Logged</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">${currentUser.distanceCoveredKm.toFixed(1)} <small>km</small></span>
              <span class="stat-label">Patrol Transit</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">${currentUser.batteryPercent}%</span>
              <span class="stat-label">Device Battery</span>
            </div>
          </div>

          <!-- Current Location Snapshot -->
          <div class="card location-card">
            <div class="card-header-simple">
              <span class="icon-small">📍</span>
              <strong>Real-Time Location Telemetry</strong>
            </div>
            <p class="current-street-name">${currentUser.currentAddress}</p>
            <div class="telemetry-subtext">
              <span>Transit Status: <strong>${currentUser.status.toUpperCase()}</strong></span>
              <span>Velocity: <strong>${isClocked ? currentUser.speedKmh : 0} km/h</strong></span>
              <span>Accuracy: <strong>±3 m</strong></span>
            </div>
          </div>

          <!-- Recent Properties Quick Preview -->
          <div class="recent-preview-block">
            <div class="block-header">
              <h4>Recent Field Dossiers (${myProperties.length})</h4>
              <button class="text-link-btn" id="viewAllPropertiesLink">View directory ›</button>
            </div>

            <div class="properties-mini-stack">
              ${myProperties.slice(0, 2).map(prop => `
                <div class="property-list-card">
                  <img src="${prop.imageUrl}" alt="${prop.address}" class="prop-card-thumbnail" />
                  <div class="prop-card-details">
                    <div class="prop-price-row">
                      <strong class="prop-price">${prop.demand}</strong>
                      <span class="prop-type-badge">${prop.type}</span>
                    </div>
                    <p class="prop-address">${prop.address}</p>
                    <span class="prop-owner-info">Contact: ${prop.ownerName} (${prop.ownerPhone})</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

        <!-- ================= TAB 2: PROPERTIES LIST ================= -->
        <div class="tab-pane ${activeTab === 'properties' ? 'active' : ''}" id="tabPaneProperties">
          <div class="properties-tab-header">
            <h3>Property Survey Archive</h3>
            <p>GPS-verified property appraisals logged under your agent ID</p>
          </div>

          <div class="properties-full-stack">
            ${myProperties.length === 0 ? `
              <div class="empty-state-box">
                <p>No surveys recorded during this session. Commence your shift and select "+ Register Property Survey" when on site.</p>
              </div>
            ` : myProperties.map(prop => `
              <div class="property-full-card">
                <div class="prop-image-wrap">
                  <img src="${prop.imageUrl}" alt="${prop.address}" class="prop-cover-image" />
                  <span class="prop-deal-pill">${prop.status}</span>
                  <span class="prop-gps-badge">✓ GNSS Geo-Verified</span>
                </div>
                <div class="prop-card-body">
                  <div class="prop-headline">
                    <h4 class="prop-price-large">${prop.demand}</h4>
                    <span class="prop-size">${prop.area}</span>
                  </div>
                  <p class="prop-street">${prop.address}</p>
                  
                  <div class="prop-details-grid">
                    <div>
                      <span class="label-dim">Owner / Rep</span>
                      <strong>${prop.ownerName}</strong>
                    </div>
                    <div>
                      <span class="label-dim">Contact</span>
                      <strong>${prop.ownerPhone}</strong>
                    </div>
                    <div>
                      <span class="label-dim">Recorded</span>
                      <span>${prop.timestamp.split(' ')[1]}</span>
                    </div>
                  </div>

                  <div class="prop-notes-preview">
                    "${prop.condition}"
                  </div>

                  <div class="prop-card-actions">
                    <a href="https://wa.me/?text=Verified%20Property%20Record%3A%20${encodeURIComponent(prop.address)}%20-%20Valuation%3A%20${encodeURIComponent(prop.demand)}" target="_blank" class="btn btn-outline btn-whatsapp">
                      💬 Export Survey Dossier
                    </a>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </main>

      <!-- Bottom Native Tab Bar (Tracker & Properties Only) -->
      <nav class="mobile-bottom-tabs">
        <button class="tab-button ${activeTab === 'tracker' ? 'active' : ''}" data-target-tab="tracker">
          <span class="tab-glyph">📍</span>
          <span class="tab-text">Telemetry</span>
        </button>
        <button class="tab-button ${activeTab === 'properties' ? 'active' : ''}" data-target-tab="properties">
          <span class="tab-glyph">🏠</span>
          <span class="tab-text">Surveys</span>
        </button>
      </nav>

      <!-- In-App Online Update Modal Container -->
      ${renderUpdateModal()}

      <!-- In-App Survey Submission Modal -->
      <div class="modal-overlay hidden" id="surveySubmissionModal">
        <div class="modal-container">
          <div class="modal-header-simple">
            <h4>Register Property Survey</h4>
            <button class="close-modal-icon" id="closeSurveyModalBtn">✕</button>
          </div>

          <form class="clean-form" id="propertySurveyForm">
            <!-- Sample Photos for Demo Testing -->
            <div class="form-group">
              <label class="input-label">On-Site Camera Imagery (Watermarked)</label>
              <div class="camera-preview-box">
                <img id="activePhotoPreview" src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80" alt="House" class="preview-img" />
                <div class="watermark-pill">
                  <span>GNSS: ${currentUser.currentCoords.lat.toFixed(4)}°, ${currentUser.currentCoords.lng.toFixed(4)}° • ${new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="input-label">Property Address (Reverse-Geocoded)</label>
              <input type="text" id="propAddressInput" class="text-input" value="Plot 15, Sector C, DHA Phase 5, Lahore" required />
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="input-label">Classification</label>
                <select id="propTypeSelect" class="text-input">
                  <option value="House / Villa">House / Villa</option>
                  <option value="Commercial Plot">Commercial Plot</option>
                  <option value="Residential Plot">Residential Plot</option>
                  <option value="Apartment">Apartment</option>
                </select>
              </div>
              <div class="form-group">
                <label class="input-label">Lot Dimensions / Covered Area</label>
                <input type="text" id="propAreaInput" class="text-input" value="1 Kanal (4,500 Sq Ft)" required />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="input-label">Asking Valuation / Demand</label>
                <input type="text" id="propDemandInput" class="text-input" value="PKR 4.8 Crore" required />
              </div>
              <div class="form-group">
                <label class="input-label">Deal Priority</label>
                <select id="propStatusSelect" class="text-input">
                  <option value="Hot Deal">🔥 Hot Deal</option>
                  <option value="Direct Owner">Direct Owner</option>
                  <option value="Urgent Sale">Urgent Sale</option>
                  <option value="For Rent">For Rent</option>
                </select>
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="input-label">Owner / Broker Representative</label>
                <input type="text" id="propOwnerNameInput" class="text-input" value="Mian Shahzad" required />
              </div>
              <div class="form-group">
                <label class="input-label">Owner Contact Number</label>
                <input type="tel" id="propOwnerPhoneInput" class="text-input" value="+92 321 8899770" required />
              </div>
            </div>

            <div class="form-group">
              <label class="input-label">Site Inspection Notes & Assessment</label>
              <textarea id="propConditionInput" class="text-input" rows="2">Solid construction, ready for immediate possession, clear property documentation verified.</textarea>
            </div>

            <div class="modal-actions-footer">
              <button type="button" class="btn btn-secondary" id="cancelSurveyModalBtn">Cancel</button>
              <button type="submit" class="btn btn-primary">Confirm & Submit Survey Record</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `;
}

export function bindMobileAppEvents() {
  if (!state.auth.isAuthenticated) {
    bindLoginScreenEvents();
    return;
  }

  bindUpdateModalEvents();

  // Lock / Logout Button
  const lockBtn = document.getElementById('lockAppBtn');
  if (lockBtn) {
    lockBtn.onclick = () => {
      state.logout();
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Bottom Tab Navigation
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(btn => {
    btn.onclick = () => {
      activeTab = btn.getAttribute('data-target-tab');
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  });

  const viewAllBtn = document.getElementById('viewAllPropertiesLink');
  if (viewAllBtn) {
    viewAllBtn.onclick = () => {
      activeTab = 'properties';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Shift Toggle
  const toggleBtn = document.getElementById('toggleShiftBtn');
  if (toggleBtn) {
    toggleBtn.onclick = () => {
      state.toggleShift();
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Survey Modal Triggers
  const quickAddBtn = document.getElementById('quickAddPropertyBtn');
  const surveyModal = document.getElementById('surveySubmissionModal');
  const closeModalBtn = document.getElementById('closeSurveyModalBtn');
  const cancelModalBtn = document.getElementById('cancelSurveyModalBtn');

  const openSurvey = () => {
    if (state.currentUser.isClockedIn && surveyModal) {
      surveyModal.classList.remove('hidden');
    }
  };

  const closeSurvey = () => {
    if (surveyModal) surveyModal.classList.add('hidden');
  };

  if (quickAddBtn) quickAddBtn.onclick = openSurvey;
  if (closeModalBtn) closeModalBtn.onclick = closeSurvey;
  if (cancelModalBtn) cancelModalBtn.onclick = closeSurvey;

  // Update available triggers
  const updatePillBtn = document.getElementById('openUpdatePillBtn');
  const updateBannerBtn = document.getElementById('openUpdateBannerBtn');

  if (updatePillBtn) {
    updatePillBtn.onclick = () => {
      state.openUpdateModal();
    };
  }

  if (updateBannerBtn) {
    updateBannerBtn.onclick = () => {
      state.openUpdateModal();
    };
  }

  // Theme Toggle Button
  const themeBtn = document.getElementById('toggleThemeBtn');
  if (themeBtn) {
    themeBtn.onclick = () => {
      state.toggleTheme();
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Survey Form Submission
  const surveyForm = document.getElementById('propertySurveyForm');
  if (surveyForm) {
    surveyForm.onsubmit = (e) => {
      e.preventDefault();
      const address = document.getElementById('propAddressInput').value;
      const type = document.getElementById('propTypeSelect').value;
      const area = document.getElementById('propAreaInput').value;
      const demand = document.getElementById('propDemandInput').value;
      const statusValue = document.getElementById('propStatusSelect').value;
      const ownerName = document.getElementById('propOwnerNameInput').value;
      const ownerPhone = document.getElementById('propOwnerPhoneInput').value;
      const condition = document.getElementById('propConditionInput').value;

      const newProperty = {
        id: 'prop_' + Date.now(),
        surveyorId: state.currentUser.id,
        surveyorName: state.currentUser.name,
        address,
        type,
        area,
        demand,
        status: statusValue,
        ownerName,
        ownerPhone,
        condition,
        coordinates: { ...state.currentUser.currentCoords },
        accuracyMeters: 4.0,
        distanceVerified: true,
        distanceFromPropertyMeters: 5.5,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        stayDurationMinutes: 20,
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        watermark: {
          text: `ESTATERADAR • ${new Date().toLocaleTimeString()} • Verified`,
          hash: 'SHA256:verified'
        }
      };

      state.addProperty(newProperty);
      closeSurvey();
      activeTab = 'properties';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }
}
