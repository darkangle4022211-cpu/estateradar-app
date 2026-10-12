// In-App Online Update Modal Component
import { state } from '../state.js';

export function renderUpdateModal() {
  const { updateState } = state;

  if (!updateState.isModalOpen) {
    return '';
  }

  return `
    <div class="update-backdrop" id="updateBackdrop">
      <div class="update-sheet-container animate-slide-up">
        
        <!-- Header -->
        <div class="update-header">
          <div class="update-header-left">
            <span class="update-tag-pill">App Update</span>
            <h3 class="update-main-title">EstateRadar ${updateState.version}</h3>
          </div>
          <button class="update-close-btn" id="closeUpdateSheetBtn" title="Close window">
            ✕
          </button>
        </div>

        <!-- Prominent Safety Message (Strict User Requirement) -->
        <div class="update-safety-card">
          <div class="safety-badge-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
          </div>
          <div class="safety-text-group">
            <h4 class="safety-headline">It is safe to close while the app updates.</h4>
            <p class="safety-desc">You can safely close this window and continue using the app. The update will continue in the background without interrupting your work or GPS tracking.</p>
          </div>
        </div>

        <!-- Progress Section -->
        <div class="update-progress-card">
          <div class="progress-meta-row">
            <span class="progress-status-text">
              ${updateState.isComplete 
                ? 'Update complete' 
                : updateState.isDownloading 
                  ? 'Downloading and installing...' 
                  : 'Preparing update...'}
            </span>
            <span class="progress-percent-number">${updateState.progressPercent}%</span>
          </div>

          <div class="progress-track-bar">
            <div class="progress-track-fill ${updateState.isComplete ? 'complete' : ''}" style="width: ${updateState.progressPercent}%;"></div>
          </div>
        </div>

        <!-- Release Notes Highlights -->
        <div class="update-notes-block">
          <div class="notes-header-text">What's new:</div>
          <ul class="clean-bullets-list">
            ${updateState.releaseNotes.map(note => `
              <li><span class="bullet-check">✓</span> <span>${note}</span></li>
            `).join('')}
          </ul>
        </div>

        <!-- Modal Footer Actions -->
        <div class="update-actions-footer">
          <a href="${updateState.downloadUrl || 'https://github.com/darkangle4022211-cpu/estateradar-app/releases/download/v1.0.2/EstateRadar.apk'}" class="btn btn-primary btn-full" id="downloadUpdateOnlineBtn" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
            📥 Download & Install ${updateState.version} Online
          </a>
          <button class="btn btn-secondary btn-full" id="dismissUpdateBtn" style="margin-top: 8px;">
            Close
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
}
