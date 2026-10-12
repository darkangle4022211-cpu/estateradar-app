// In-App Online Auto-Update Modal Component
import { state } from '../state.js';

export function renderUpdateModal() {
  const { updateState } = state;

  if (!updateState.isModalOpen) {
    return '';
  }

  const isDownloading = updateState.isDownloading;
  const isComplete = updateState.isComplete;

  return `
    <div class="update-backdrop" id="updateBackdrop">
      <div class="update-sheet-container animate-slide-up">
        
        <!-- Header -->
        <div class="update-header">
          <div class="update-header-left">
            <span class="update-tag-pill">Direct In-App Update</span>
            <h3 class="update-main-title">EstateRadar ${updateState.version}</h3>
          </div>
          <button class="update-close-btn" id="closeUpdateSheetBtn" title="Close window">
            ✕
          </button>
        </div>

        <!-- Prominent Safety Message -->
        <div class="update-safety-card">
          <div class="safety-badge-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
          </div>
          <div class="safety-text-group">
            <h4 class="safety-headline">Auto-updating inside the app</h4>
            <p class="safety-desc">No external websites or repository pages. The update downloads and installs directly on your device while preserving all your company and surveyor data.</p>
          </div>
        </div>

        <!-- Progress Section -->
        <div class="update-progress-card">
          <div class="progress-meta-row">
            <span class="progress-status-text">
              ${isComplete 
                ? '✅ Download Complete — Launching Installer' 
                : isDownloading 
                  ? '⏳ Downloading EstateRadar APK...' 
                  : 'Ready to auto-update'}
            </span>
            <span class="progress-percent-number">${updateState.progressPercent}%</span>
          </div>

          <div class="progress-track-bar">
            <div class="progress-track-fill ${isComplete ? 'complete' : ''}" style="width: ${updateState.progressPercent}%;"></div>
          </div>

          ${isComplete ? `
            <div style="margin-top: 10px; padding: 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; font-size: 0.78rem; color: #10b981; line-height: 1.45;">
              📲 <strong>Android Dialog:</strong> Tap <strong>"Update"</strong> when the system installer prompt appears to finish updating in place.
            </div>
          ` : ''}
        </div>

        <!-- Release Notes Highlights -->
        <div class="update-notes-block">
          <div class="notes-header-text">What's new in ${updateState.version}:</div>
          <ul class="clean-bullets-list">
            ${updateState.releaseNotes.map(note => `
              <li><span class="bullet-check">✓</span> <span>${note}</span></li>
            `).join('')}
          </ul>
        </div>

        <!-- Modal Footer Actions -->
        <div class="update-actions-footer">
          <button class="btn btn-primary btn-full" id="downloadUpdateOnlineBtn" style="display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; font-weight: 700;">
            ${isDownloading 
              ? '⏳ Auto-Updating (' + updateState.progressPercent + '%)...' 
              : isComplete 
                ? '⚡ Re-launch Installer (' + updateState.version + ')' 
                : '⚡ Auto-Update Directly Now (' + updateState.version + ')'}
          </button>
          <button class="btn btn-secondary btn-full" id="dismissUpdateBtn" style="margin-top: 8px;">
            Close & Continue in App
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
}
