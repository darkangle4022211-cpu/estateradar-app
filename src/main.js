// EstateRadar — Main Application Router & Entry
// Clean, Dedicated Native Mobile Architecture
import './style.css';
import { state } from './state.js';
import { simulator } from './simulation.js';
import { renderLoginScreen, bindLoginScreenEvents } from './components/loginScreen.js';
import { renderManagerApp, bindManagerAppEvents } from './components/managerApp.js';
import { renderMobileApp, bindMobileAppEvents } from './components/mobileApp.js';
import { renderPropertyDossierModal, bindPropertyDossierEvents } from './components/propertyModal.js';
import { renderUpdateModal, bindUpdateModalEvents } from './components/updateModal.js';

let activeDossierProperty = null;

export function renderApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // 1. If user is NOT authenticated: Display ONLY the full-screen Login & Manager Registration Screen
  if (!state.auth.isAuthenticated) {
    appContainer.innerHTML = `
      <div class="app-viewport-auth">
        ${renderLoginScreen()}
      </div>
      <div id="propertyDossierContainer"></div>
      <div id="updateModalContainer"></div>
    `;
    bindLoginScreenEvents();
    return;
  }

  // 2. User is authenticated. Determine role:
  // Agency Manager -> Render Manager Mobile App
  // Field Surveyor -> Render Surveyor Mobile App
  const isManager = state.userRole === 'manager' || state.userRole === 'admin';

  appContainer.innerHTML = `
    <div class="app-viewport-native">
      ${isManager ? renderManagerApp() : renderMobileApp()}
    </div>

    <!-- Online OTA In-App Update Modal -->
    <div id="updateModalContainer">
      ${renderUpdateModal()}
    </div>

    <!-- Property Dossier Overlay -->
    <div id="propertyDossierContainer">
      ${activeDossierProperty ? renderPropertyDossierModal(activeDossierProperty) : ''}
    </div>
  `;

  if (isManager) {
    bindManagerAppEvents();
  } else {
    bindMobileAppEvents();
  }

  bindUpdateModalEvents();

  // Bind Property Dossier events if active
  if (activeDossierProperty) {
    bindPropertyDossierEvents(() => {
      activeDossierProperty = null;
      renderApp();
    });
  }
}

// Global Re-render trigger
window.addEventListener('re-render-request', () => {
  renderApp();
});

// Listen for Property Dossier click
window.addEventListener('open-property-dossier', (e) => {
  activeDossierProperty = e.detail;
  renderApp();
});

// Shift timer background tick
state.subscribe((s) => {
  const timerElem = document.querySelector('.shift-timer');
  if (timerElem && s.currentUser && s.currentUser.isClockedIn) {
    const elapsedMs = Date.now() - s.shiftStartTime;
    const hours = Math.floor(elapsedMs / 3600000);
    const minutes = Math.floor((elapsedMs % 3600000) / 60000);
    timerElem.innerText = `${hours}h ${minutes}m on duty`;
  }
});

// Start application on page load
document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  simulator.start();
});
