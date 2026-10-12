// In-App Online Auto-Update Modal Component
import { state } from '../state.js';

export function renderUpdateModal() {
  const { updateState } = state;

  if (!updateState.isModalOpen) {
    return '';
  }

  const isDownloading = updateState.isDownloading;
  const isComplete = updateState.isComplete;
  const isAvailable = updateState.isAvailable;
  const currentVersion = updateState.currentVersion || 'v1.0.3';
  const targetVersion = updateState.version || currentVersion;

  return `
    <div class="update-backdrop" id="updateBackdrop">
      <div class="update-sheet-container animate-slide-up">
        
        <!-- Header -->
        <div class="update-header">
          <div class="update-header-left">
            <span class="update-tag-pill" style="${!isAvailable && !isComplete ? 'color: #10b981; background: rgba(16, 185, 129, 0.12);' : ''}">
              ${isComplete ? 'Update Ready' : isAvailable ? 'New Update Available' : 'Current Version'}
            </span>
            <h3 class="update-main-title">EstateRadar ${targetVersion}</h3>
          </div>
          <button class="update-close-btn" id="closeUpdateSheetBtn" title="Close window">
            ✕
          </button>
        </div>

        <!-- Status Card -->
        <div class="update-safety-card">
          <div class="safety-badge-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
          </div>
          <div class="safety-text-group">
            <h4 class="safety-headline">
              ${isComplete 
                ? 'Update downloaded successfully!' 
                : !isAvailable 
                  ? 'Your app is up to date' 
                  : 'Fast in-app background update'}
            </h4>
            <p class="safety-desc">
              ${isComplete 
                ? 'The update is installed and ready. Click "Reopen App" below to reload the app with the latest version.' 
                : !isAvailable 
                  ? `You are currently using ${currentVersion}. All systems and telemetry pipelines are running the latest version.` 
                  : 'Updates happen directly inside the app with zero external websites or repository pages.'}
            </p>
          </div>
        </div>

        <!-- Progress Section (When updating or completed) -->
        ${(isDownloading || isComplete) ? `
          <div class="update-progress-card">
            <div class="progress-meta-row">
              <span class="progress-status-text">
                ${isComplete 
                  ? '✅ 100% Downloaded — Ready to Reopen' 
                  : '⏳ Downloading update in background...'}
              </span>
              <span class="progress-percent-number">${updateState.progressPercent}%</span>
            </div>

            <div class="progress-track-bar">
              <div class="progress-track-fill ${isComplete ? 'complete' : ''}" style="width: ${updateState.progressPercent}%;"></div>
            </div>

            ${isComplete ? `
              <div style="margin-top: 10px; padding: 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; font-size: 0.78rem; color: #10b981; line-height: 1.45;">
                📲 <strong>Ready:</strong> Tap <strong>"Reopen App"</strong> below to refresh and load the latest version.
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Release Highlights -->
        <div class="update-notes-block">
          <div class="notes-header-text">What's in ${targetVersion}:</div>
          <ul class="clean-bullets-list">
            ${updateState.releaseNotes.map(note => `
              <li><span class="bullet-check">✓</span> <span>${note}</span></li>
            `).join('')}
          </ul>
        </div>

        <!-- Modal Footer Actions -->
        <div class="update-actions-footer">
          ${isComplete ? `
            <button class="btn btn-primary btn-full" id="reopenAppBtn" style="display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; font-weight: 700; background: #10b981;">
              🔄 Reopen App to Apply Update
            </button>
          ` : isAvailable ? `
            <button class="btn btn-primary btn-full" id="downloadUpdateOnlineBtn" style="display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; font-weight: 700;">
              ${isDownloading 
                ? '⏳ Updating (' + updateState.progressPercent + '%)...' 
                : '⚡ Update to ' + targetVersion + ' Directly'}
            </button>
          ` : `
            <button class="btn btn-primary btn-full" id="checkAgainBtn" style="display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; font-weight: 700;">
              ✓ You are up to date (${currentVersion})
            </button>
          `}
          
          <button class="btn btn-secondary btn-full" id="dismissUpdateBtn" style="margin-top: 8px;">
            ${isComplete ? 'Dismiss' : 'Close Window'}
          </button>
        </div>

      </div>
    </div>
  `;
}

export function bindUpdateModalEvents() {
  const closeBtn = document.getElementById('closeUpdateSheetBtn');
  const dismissBtn = document.getElementById('dismissUpdateBtn');
  const backdrop = document.getElementById('updateBackdrop');
  const downloadBtn = document.getElementById('downloadUpdateOnlineBtn');
  const reopenBtn = document.getElementById('reopenAppBtn');
  const checkAgainBtn = document.getElementById('checkAgainBtn');

  const closeHandler = () => {
    state.closeUpdateModal();
  };

  if (closeBtn) closeBtn.onclick = closeHandler;
  if (dismissBtn) dismissBtn.onclick = closeHandler;
  if (backdrop) {
    backdrop.onclick = (e) => {
      if (e.target === backdrop) closeHandler();
    };
  }

  if (downloadBtn) {
    downloadBtn.onclick = (e) => {
      e.preventDefault();
      state.triggerUpdateDownload();
    };
  }

  if (reopenBtn) {
    reopenBtn.onclick = (e) => {
      e.preventDefault();
      state.reopenAppWithUpdate();
    };
  }

  if (checkAgainBtn) {
    checkAgainBtn.onclick = (e) => {
      e.preventDefault();
      state.checkForUpdatesOnline();
    };
  }
}
