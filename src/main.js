// EstateRadar — Main Application Router & Entry
import './style.css';
import { state } from './state.js';
import { simulator } from './simulation.js';
import { renderMobileApp, bindMobileAppEvents } from './components/mobileApp.js';
import { renderAdminDashboard, initAdminMap, updateFleetMarkers, bindAdminDashboardEvents } from './components/adminDashboard.js';
import { renderPropertyDossierModal, bindPropertyDossierEvents } from './components/propertyModal.js';

let activeDossierProperty = null;

function renderApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  const currentView = state.activeView; // 'mobile' or 'radar'

  appContainer.innerHTML = `
    <!-- Top Modern Switcher Bar -->
    <header class="app-global-nav">
      <div class="nav-brand-area">
        <span class="brand-title">EstateRadar</span>
        <span class="brand-badge">Field GPS System</span>
      </div>

      <!-- Segmented View Controller -->
      <div class="view-segmented-control">
        <button class="seg-btn ${currentView === 'mobile' ? 'active' : ''}" id="switchToMobileBtn">
          <span>📱 Mobile App</span>
        </button>
        <button class="seg-btn ${currentView === 'radar' ? 'active' : ''}" id="switchToAdminBtn">
          <span>🖥️ Admin Dashboard</span>
        </button>
      </div>

      <!-- Right Test Tool -->
      <div class="nav-right-tools">
        <button class="btn btn-outline btn-sm" id="globalThemeToggleBtn" title="Toggle White / Dark Theme">
          ${state.theme === 'light' ? '🌙 Dark Mode' : '☀️ White Mode'}
        </button>
        <button class="btn btn-outline btn-sm" id="testUpdateToggleBtn" title="Toggle Update Availability">
          ${state.updateState.isAvailable ? '⚡ Update Available' : '🔄 Check for Update'}
        </button>
        <button class="btn btn-outline btn-sm" id="globalSimToggleBtn">
          ${simulator.isRunning ? '⏸ Pause GPS' : '▶ Simulate GPS'}
        </button>
      </div>
    </header>

    <!-- Main Dynamic Application Screen -->
    <main class="app-viewport-body view-mode-${currentView}">
      ${currentView === 'mobile' ? `
        <div class="mobile-frame-chassis">
          ${renderMobileApp()}
        </div>
      ` : `
        <div class="admin-full-frame">
          ${renderAdminDashboard()}
        </div>
      `}
    </main>

    <!-- Property Dossier Overlay -->
    <div id="propertyDossierContainer">
      ${renderPropertyDossierModal(activeDossierProperty)}
    </div>
  `;

  // Bind Events depending on view
  if (currentView === 'mobile') {
    bindMobileAppEvents();
  } else {
    bindAdminDashboardEvents();
    setTimeout(() => {
      initAdminMap();
    }, 60);
  }

  bindNavEvents();
}

function bindNavEvents() {
  const toMobileBtn = document.getElementById('switchToMobileBtn');
  const toAdminBtn = document.getElementById('switchToAdminBtn');
  const simBtn = document.getElementById('globalSimToggleBtn');

  if (toMobileBtn) {
    toMobileBtn.onclick = () => {
      state.activeView = 'mobile';
      renderApp();
    };
  }

  if (toAdminBtn) {
    toAdminBtn.onclick = () => {
      state.activeView = 'radar';
      renderApp();
    };
  }

  const themeToggle = document.getElementById('globalThemeToggleBtn');
  if (themeToggle) {
    themeToggle.onclick = () => {
      state.toggleTheme();
      renderApp();
    };
  }

  const updateToggleBtn = document.getElementById('testUpdateToggleBtn');
  if (updateToggleBtn) {
    updateToggleBtn.onclick = () => {
      state.triggerSimulatedUpdate(!state.updateState.isAvailable);
      renderApp();
    };
  }

  if (simBtn) {
    simBtn.onclick = () => {
      if (simulator.isRunning) {
        simulator.pause();
      } else {
        simulator.start();
      }
      renderApp();
    };
  }

  // Listen for Property Dossier click
  window.addEventListener('open-property-dossier', (e) => {
    activeDossierProperty = e.detail;
    const container = document.getElementById('propertyDossierContainer');
    if (container) {
      container.innerHTML = renderPropertyDossierModal(activeDossierProperty);
      bindPropertyDossierEvents(() => {
        activeDossierProperty = null;
        container.innerHTML = '';
      });
    }
  });
}

// Global Re-render trigger
window.addEventListener('re-render-request', () => {
  renderApp();
});

// Periodic lightweight updates
state.subscribe((s) => {
  if (state.activeView === 'radar') {
    updateFleetMarkers();
  }

  const timerElem = document.querySelector('.shift-timer');
  if (timerElem && s.currentUser.isClockedIn) {
    const elapsedMs = Date.now() - s.shiftStartTime;
    const hours = Math.floor(elapsedMs / 3600000);
    const minutes = Math.floor((elapsedMs % 3600000) / 60000);
    timerElem.innerText = `${hours}h ${minutes}m on duty`;
  }
});

// Start application
document.addEventListener('DOMContentLoaded', () => {
  // Start on mobile view by default for authentic mobile experience
  state.activeView = 'mobile';
  renderApp();
  simulator.start();
});
