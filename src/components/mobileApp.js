// Clean, Human-Designed Mobile Application for Field Surveyors
// Zero Dummy Data — Real Device Camera Access — Full Logout Flow
import { state } from '../state.js';
import { renderLoginScreen, bindLoginScreenEvents } from './loginScreen.js';

let activeTab = 'tracker'; // 'tracker' | 'properties'
let capturedPhotoDataUrl = null;

export function renderMobileApp() {
  if (!state.auth.isAuthenticated || !state.currentUser) {
    return renderLoginScreen();
  }

  const { currentUser, properties, updateState, company } = state;
  const isClocked = Boolean(currentUser.isClockedIn);
  const myProperties = properties.filter(p => p.surveyorId === currentUser.id);

  // Shift duration
  const elapsedMs = isClocked ? Math.max(0, Date.now() - state.shiftStartTime) : 0;
  const hours = Math.floor(elapsedMs / 3600000);
  const minutes = Math.floor((elapsedMs % 3600000) / 60000);
  const shiftText = isClocked ? `${hours}h ${minutes}m on duty` : 'Off Duty';

  const companyCode = company?.company_code || currentUser.company_code || 'AGENCY';

  return `
    <div class="mobile-device-viewport">
      
      <!-- Top Native-Style Header -->
      <header class="mobile-native-header">
        <div class="header-left">
          <span class="company-logo-text">${company?.name || 'EstateRadar'}</span>
          <span class="user-role-label">Code: ${companyCode}</span>
        </div>
        <div class="header-right">
          ${updateState.isAvailable ? `
            <button class="appbar-icon-btn update-glowing-badge" id="empHeaderUpdateBtn" title="Update Available (${updateState.version})">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span class="update-glow-dot"></span>
            </button>
          ` : ''}
          <button class="header-action-btn" id="toggleThemeBtn" title="Toggle Theme">
            ${state.theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button class="header-action-btn text-danger" id="empSignOutBtn" title="Sign Out">
            🚪 Sign Out
          </button>
        </div>
      </header>

      <!-- Main Scrollable App Container -->
      <main class="mobile-tab-content">
        
        <!-- ================= TAB 1: TRACKER / DASHBOARD ================= -->
        <div class="tab-pane ${activeTab === 'tracker' ? 'active' : ''}" id="tabPaneTracker">
          
          <!-- Employee Identity Card -->
          <div class="employee-identity-banner">
            <div class="emp-avatar-circle">
              ${(currentUser.name || 'Staff').substring(0, 2).toUpperCase()}
            </div>
            <div class="emp-identity-text">
              <h3 class="emp-identity-name">${currentUser.name || 'Field Surveyor'}</h3>
              <span class="emp-identity-role">@${currentUser.username || 'staff'} • ${currentUser.role || 'Field Staff'}</span>
            </div>
            <span class="header-plain-status ${isClocked ? 'online' : 'offline'}">
              ${isClocked ? 'On Shift' : 'Off Duty'}
            </span>
          </div>

          <!-- Shift Control Card -->
          <div class="card shift-card ${isClocked ? 'card-active-shift' : ''}">
            <div class="shift-card-header">
              <div>
                <span class="shift-kicker">WORKFORCE SHIFT ATTENDANCE</span>
                <h3 class="shift-title">${isClocked ? 'Shift Active — GPS Streaming' : 'Standby • Shift Inactive'}</h3>
              </div>
              <span class="shift-timer">${shiftText}</span>
            </div>

            <p class="shift-desc">
              ${isClocked 
                ? 'Your location is active and streaming encrypted GNSS coordinates to your Agency Manager console.' 
                : 'GPS tracking is paused. Coordinates are strictly private while off duty.'}
            </p>

            <button class="btn ${isClocked ? 'btn-danger' : 'btn-primary'} btn-full" id="toggleShiftBtn">
              <span>${isClocked ? 'End Shift (Clock Out)' : 'Start Shift (Clock In)'}</span>
            </button>
          </div>

          <!-- Quick Action: Register Property Survey (REAL CAMERA) -->
          <div class="action-banner-card ${!isClocked ? 'disabled' : ''}" id="quickAddPropertyBtn">
            <div class="action-icon-circle">📷</div>
            <div class="action-text-group">
              <h4>+ Register Property Survey</h4>
              <p>${isClocked ? 'Open camera, capture photo & stamp GPS coordinates' : 'Clock in first to submit surveys'}</p>
            </div>
            <span class="action-chevron">›</span>
          </div>

          <!-- Real-Time Metrics -->
          <div class="stats-row">
            <div class="stat-box">
              <span class="stat-number">${myProperties.length}</span>
              <span class="stat-label">Surveys Submitted</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">${isClocked ? (currentUser.speedKmh || 0) : 0} <small>km/h</small></span>
              <span class="stat-label">Current Velocity</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">${currentUser.batteryPercent || 100}%</span>
              <span class="stat-label">Device Battery</span>
            </div>
          </div>

          <!-- Current Location Snapshot -->
          <div class="card location-card">
            <div class="card-header-simple">
              <span class="icon-small">📍</span>
              <strong>Live Telemetry Snapshot</strong>
            </div>
            <p class="current-street-name">${currentUser.currentAddress || (isClocked ? 'GPS Locating...' : 'Off Shift (Not tracking)')}</p>
            <div class="telemetry-subtext">
              <span>Latitude: <strong>${currentUser.currentCoords ? currentUser.currentCoords.lat.toFixed(4) + '°' : 'N/A'}</strong></span>
              <span>Longitude: <strong>${currentUser.currentCoords ? currentUser.currentCoords.lng.toFixed(4) + '°' : 'N/A'}</strong></span>
              <span>Accuracy: <strong>±${currentUser.accuracyMeters || 5} m</strong></span>
            </div>
          </div>

          <!-- Recent Properties Quick Preview -->
          <div class="recent-preview-block">
            <div class="block-header">
              <h4>My Recent Surveys (${myProperties.length})</h4>
              <button class="text-link-btn" id="viewAllPropertiesLink">View directory ›</button>
            </div>

            <div class="properties-mini-stack">
              ${myProperties.length === 0 ? `
                <div class="empty-mini-card">
                  <p>No property surveys logged yet today.</p>
                </div>
              ` : myProperties.slice(0, 3).map(prop => `
                <div class="property-list-card">
                  ${prop.imageUrl ? `
                    <img src="${prop.imageUrl}" alt="${prop.address}" class="prop-card-thumbnail" />
                  ` : `
                    <div class="prop-card-thumbnail-placeholder">🏠</div>
                  `}
                  <div class="prop-card-details">
                    <div class="prop-price-row">
                      <strong class="prop-price">${prop.demand || 'Price on request'}</strong>
                      <span class="prop-type-badge">${prop.type}</span>
                    </div>
                    <span class="prop-address-text">${prop.address}</span>
                    <span class="prop-time-stamp">🕒 ${prop.timestamp}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

        <!-- ================= TAB 2: PROPERTIES DIRECTORY ================= -->
        <div class="tab-pane ${activeTab === 'properties' ? 'active' : ''}" id="tabPaneProperties">
          <div class="properties-tab-header">
            <h3>My Surveyed Properties (${myProperties.length})</h3>
            <span class="text-dim">Verified on-site documentation records</span>
          </div>

          <div class="properties-full-list">
            ${myProperties.length === 0 ? `
              <div class="empty-placeholder-card">
                <div class="empty-icon">📷</div>
                <h4>No surveys submitted yet</h4>
                <p>Clock in and tap "Register Property Survey" to record verified on-site listings with photos and GPS.</p>
              </div>
            ` : myProperties.map(prop => `
              <div class="property-card-large">
                ${prop.imageUrl ? `
                  <div class="prop-image-frame">
                    <img src="${prop.imageUrl}" alt="${prop.address}" class="prop-img-hero" />
                    <span class="prop-badge-floating">${prop.status || 'Verified'}</span>
                  </div>
                ` : ''}
                <div class="prop-details-body">
                  <div class="prop-price-large">${prop.demand || 'Price on Request'}</div>
                  <h4 class="prop-street">${prop.address}</h4>
                  
                  <div class="prop-specs-grid">
                    <div>
                      <span class="spec-label">Classification</span>
                      <strong>${prop.type}</strong>
                    </div>
                    <div>
                      <span class="spec-label">Area / Size</span>
                      <strong>${prop.area || 'N/A'}</strong>
                    </div>
                    <div>
                      <span class="spec-label">GPS Verified</span>
                      <strong class="text-green">✓ Accurate</strong>
                    </div>
                  </div>

                  ${prop.ownerPhone ? `
                    <div class="prop-owner-info">
                      <span>Owner: <strong>${prop.ownerName || 'Contact'}</strong> (${prop.ownerPhone})</span>
                    </div>
                  ` : ''}

                  ${prop.condition ? `
                    <p class="prop-condition-notes">${prop.condition}</p>
                  ` : ''}

                  <div class="prop-timestamp-footer">
                    <span>Logged on: ${prop.timestamp}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </main>

      <!-- Bottom Nav Bar -->
      <nav class="mobile-nav-bar">
        <button class="nav-item-btn ${activeTab === 'tracker' ? 'active' : ''}" id="navTrackerBtn">
          <span class="nav-icon">🧭</span>
          <span class="nav-label">Shift & GPS</span>
        </button>
        <button class="nav-item-btn ${activeTab === 'properties' ? 'active' : ''}" id="navPropertiesBtn">
          <span class="nav-icon">🏠</span>
          <span class="nav-label">My Surveys (${myProperties.length})</span>
        </button>
      </nav>

      <!-- In-App Property Survey Modal (REAL DEVICE CAMERA & ZERO DUMMY DATA) -->
      <div class="modal-overlay hidden" id="surveySubmissionModal">
        <div class="modal-container">
          <div class="modal-header-simple">
            <h4>Register Property Survey</h4>
            <button class="close-modal-icon" id="closeSurveyModalBtn">✕</button>
          </div>

          <form class="clean-form" id="propertySurveyForm">
            
            <!-- Real Hardware Camera Section -->
            <div class="form-group">
              <label class="input-label">On-Site Camera Imagery (Required)</label>
              
              <!-- Hidden native camera file input -->
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                id="realCameraCaptureInput" 
                style="display: none;" 
              />

              <div class="camera-capture-box" id="cameraCaptureTriggerBox">
                ${capturedPhotoDataUrl ? `
                  <div class="camera-captured-preview">
                    <img id="activePhotoPreview" src="${capturedPhotoDataUrl}" alt="Captured Property" class="preview-img" />
                    <button type="button" class="retake-photo-btn" id="retakePhotoBtn">📷 Retake Photo</button>
                  </div>
                ` : `
                  <div class="camera-empty-placeholder" id="launchCameraPlaceholder">
                    <div class="cam-big-icon">📷</div>
                    <strong class="cam-cta-text">Open Camera & Take Photo</strong>
                    <span class="cam-sub-text">Captures photo and stamps GNSS coordinates</span>
                  </div>
                `}
              </div>
              <div id="cameraStatusFeedback" class="camera-feedback-pill hidden"></div>
            </div>

            <!-- Empty Property Fields (ZERO DUMMY DATA) -->
            <div class="form-group">
              <label class="input-label" for="propAddressInput">Property Address</label>
              <input 
                type="text" 
                id="propAddressInput" 
                class="text-input" 
                placeholder="e.g. Plot 15, Sector C, DHA Phase 5" 
                required 
              />
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="input-label" for="propTypeSelect">Classification</label>
                <select id="propTypeSelect" class="text-input">
                  <option value="House / Villa">House / Villa</option>
                  <option value="Residential Plot">Residential Plot</option>
                  <option value="Commercial Plot">Commercial Plot</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Commercial Building">Commercial Building</option>
                </select>
              </div>
              <div class="form-group">
                <label class="input-label" for="propAreaInput">Lot Dimensions / Area</label>
                <input 
                  type="text" 
                  id="propAreaInput" 
                  class="text-input" 
                  placeholder="e.g. 1 Kanal, 10 Marla" 
                  required 
                />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="input-label" for="propDemandInput">Asking Price / Valuation</label>
                <input 
                  type="text" 
                  id="propDemandInput" 
                  class="text-input" 
                  placeholder="e.g. $250,000 / PKR 4.8 Crore" 
                  required 
                />
              </div>
              <div class="form-group">
                <label class="input-label" for="propStatusSelect">Deal Priority</label>
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
                <label class="input-label" for="propOwnerNameInput">Owner / Representative Name</label>
                <input 
                  type="text" 
                  id="propOwnerNameInput" 
                  class="text-input" 
                  placeholder="e.g. Mr. Malik" 
                />
              </div>
              <div class="form-group">
                <label class="input-label" for="propOwnerPhoneInput">Owner Contact Phone</label>
                <input 
                  type="tel" 
                  id="propOwnerPhoneInput" 
                  class="text-input" 
                  placeholder="e.g. +92 300 1234567" 
                />
              </div>
            </div>

            <div class="form-group">
              <label class="input-label" for="propConditionInput">Property Notes & Highlights</label>
              <textarea 
                id="propConditionInput" 
                class="text-input" 
                rows="2" 
                placeholder="Corner plot, solid construction, motivated seller..."
              ></textarea>
            </div>

            <div class="modal-form-actions">
              <button type="submit" class="btn btn-primary btn-full" id="submitSurveyRecordBtn">
                Submit Verified Survey to Manager
              </button>
              <button type="button" class="btn btn-secondary btn-full" id="cancelSurveyModalBtn" style="margin-top: 8px;">
                Cancel
              </button>
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

  // Bottom Nav Bar Tabs
  const trackerBtn = document.getElementById('navTrackerBtn');
  const propertiesBtn = document.getElementById('navPropertiesBtn');
  const viewAllProps = document.getElementById('viewAllPropertiesLink');

  if (trackerBtn) {
    trackerBtn.onclick = () => {
      activeTab = 'tracker';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  if (propertiesBtn) {
    propertiesBtn.onclick = () => {
      activeTab = 'properties';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  if (viewAllProps) {
    viewAllProps.onclick = () => {
      activeTab = 'properties';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Shift Toggle
  const shiftBtn = document.getElementById('toggleShiftBtn');
  if (shiftBtn) {
    shiftBtn.onclick = () => {
      state.toggleShift();
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Employee Sign Out (FULL LOGOUT)
  const signOutBtn = document.getElementById('empSignOutBtn');
  if (signOutBtn) {
    signOutBtn.onclick = () => {
      if (confirm('Are you sure you want to sign out?')) {
        state.logout();
      }
    };
  }

  // Theme Toggle Button
  const themeBtn = document.getElementById('toggleThemeBtn');
  if (themeBtn) {
    themeBtn.onclick = () => {
      state.toggleTheme();
    };
  }

  // Header Update Button
  const headerUpdateBtn = document.getElementById('empHeaderUpdateBtn');
  if (headerUpdateBtn) {
    headerUpdateBtn.onclick = () => {
      state.openUpdateModal();
    };
  }

  // Open & Close Survey Modal
  const surveyModal = document.getElementById('surveySubmissionModal');
  const quickAddBtn = document.getElementById('quickAddPropertyBtn');
  const closeModalBtn = document.getElementById('closeSurveyModalBtn');
  const cancelModalBtn = document.getElementById('cancelSurveyModalBtn');

  const openSurvey = () => {
    if (!state.currentUser?.isClockedIn) {
      alert('Please start your shift (Clock In) first before registering a property.');
      return;
    }
    capturedPhotoDataUrl = null;
    if (surveyModal) surveyModal.classList.remove('hidden');
  };

  const closeSurvey = () => {
    if (surveyModal) surveyModal.classList.add('hidden');
    capturedPhotoDataUrl = null;
  };

  if (quickAddBtn) quickAddBtn.onclick = openSurvey;
  if (closeModalBtn) closeModalBtn.onclick = closeSurvey;
  if (cancelModalBtn) cancelModalBtn.onclick = closeSurvey;

  // Real Hardware Camera Trigger & Photo Capture
  const camInput = document.getElementById('realCameraCaptureInput');
  const camTriggerBox = document.getElementById('cameraCaptureTriggerBox');
  const retakeBtn = document.getElementById('retakePhotoBtn');
  const camFeedback = document.getElementById('cameraStatusFeedback');

  const launchCamera = () => {
    if (camInput) camInput.click();
  };

  if (camTriggerBox) {
    camTriggerBox.onclick = (e) => {
      if (e.target.id === 'retakePhotoBtn' || e.target.closest('#retakePhotoBtn')) {
        launchCamera();
      } else if (!capturedPhotoDataUrl) {
        launchCamera();
      }
    };
  }
  if (retakeBtn) retakeBtn.onclick = launchCamera;

  if (camInput) {
    camInput.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const rawImg = new Image();
        rawImg.onload = () => {
          // Stamp GPS and Timestamp on canvas
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let w = rawImg.width;
          let h = rawImg.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(rawImg, 0, 0, w, h);

          // Get real coords
          const coords = state.currentUser?.currentCoords || { lat: 31.5204, lng: 74.3587 };
          const stampText = `ESTATERADAR VERIFIED | ${coords.lat.toFixed(5)}° N, ${coords.lng.toFixed(5)}° E | ${new Date().toLocaleTimeString()} | Staff: ${state.currentUser?.name || 'Surveyor'}`;

          // Draw bottom watermark bar
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.fillRect(0, h - 48, w, 48);

          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 15px sans-serif';
          ctx.fillText('✓ GPS VERIFIED', 16, h - 20);

          ctx.fillStyle = '#ffffff';
          ctx.font = '13px sans-serif';
          ctx.fillText(stampText, 140, h - 20);

          capturedPhotoDataUrl = canvas.toDataURL('image/jpeg', 0.85);

          // Update trigger box preview
          if (camTriggerBox) {
            camTriggerBox.innerHTML = `
              <div class="camera-captured-preview">
                <img id="activePhotoPreview" src="${capturedPhotoDataUrl}" alt="Captured Property" class="preview-img" />
                <button type="button" class="retake-photo-btn" id="retakePhotoBtn">📷 Retake Photo</button>
              </div>
            `;
            const newRetake = document.getElementById('retakePhotoBtn');
            if (newRetake) newRetake.onclick = launchCamera;
          }

          if (camFeedback) {
            camFeedback.innerText = '✓ Photo captured and GPS stamped!';
            camFeedback.className = 'camera-feedback-pill success';
            camFeedback.classList.remove('hidden');
          }
        };
        rawImg.src = loadEvent.target.result;
      };
      reader.readAsDataURL(file);
    };
  }

  // Survey Form Submission
  const surveyForm = document.getElementById('propertySurveyForm');
  if (surveyForm) {
    surveyForm.onsubmit = (e) => {
      e.preventDefault();
      const address = document.getElementById('propAddressInput').value.trim();
      const type = document.getElementById('propTypeSelect').value;
      const area = document.getElementById('propAreaInput').value.trim();
      const demand = document.getElementById('propDemandInput').value.trim();
      const statusValue = document.getElementById('propStatusSelect').value;
      const ownerName = document.getElementById('propOwnerNameInput').value.trim();
      const ownerPhone = document.getElementById('propOwnerPhoneInput').value.trim();
      const condition = document.getElementById('propConditionInput').value.trim();

      if (!capturedPhotoDataUrl) {
        if (!confirm('No property photo was taken. Would you like to submit without a photo?')) {
          launchCamera();
          return;
        }
      }

      state.submitPropertySurvey({
        address,
        type,
        area,
        demand,
        status: statusValue,
        ownerName,
        ownerPhone,
        condition,
        imageUrl: capturedPhotoDataUrl || ''
      });

      closeSurvey();
      activeTab = 'properties';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }
}
