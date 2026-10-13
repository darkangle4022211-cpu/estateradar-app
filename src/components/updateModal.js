// EstateRadar — In-App Online Auto-Update Modal Component
// Obsidian Telemetry Design System (v1.0.4)
import { state } from '../state.js';

export function renderUpdateModal() {
  const { updateState } = state;

  if (!updateState.isModalOpen) {
    return '';
  }

  const isDownloading = updateState.isDownloading;
  const isComplete = updateState.isComplete;
  const isAvailable = updateState.isAvailable;
  const currentVersion = updateState.currentVersion || 'v1.0.4';
  const targetVersion = updateState.version || currentVersion;

  return `
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" id="updateBackdrop">
      <div class="w-full max-w-md bg-surface text-on-surface rounded-t-2xl sm:rounded-2xl border border-outline-variant/30 shadow-2xl p-5 flex flex-col gap-4 animate-slide-up" id="updateModalCard">
        
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                isComplete 
                  ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20' 
                  : isAvailable 
                    ? 'bg-primary/15 text-primary border border-primary/20' 
                    : 'bg-surface-container text-secondary'
              }">
                ${isComplete ? 'UPDATE READY' : isAvailable ? 'NEW UPDATE AVAILABLE' : 'CURRENT VERSION'}
              </span>
            </div>
            <h3 class="text-lg font-bold text-on-surface mt-1.5 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[22px]">system_update</span>
              <span>EstateRadar ${targetVersion}</span>
            </h3>
          </div>
          <button class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary hover:text-on-surface transition-colors cursor-pointer" 
                  id="closeUpdateSheetBtn" 
                  title="Close window">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <!-- Telemetry Status Card -->
        <div class="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/20 flex items-start gap-3">
          <div class="w-9 h-9 rounded-lg ${isComplete || !isAvailable ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'} flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[20px]">${isComplete ? 'check_circle' : !isAvailable ? 'verified' : 'cloud_download'}</span>
          </div>
          <div class="flex flex-col min-w-0">
            <h4 class="text-xs font-bold text-on-surface leading-tight">
              ${isComplete 
                ? 'Update downloaded successfully!' 
                : !isAvailable 
                  ? 'Your app is up to date' 
                  : 'Fast in-app background update'}
            </h4>
            <p class="text-[11px] text-secondary mt-0.5 leading-normal">
              ${isComplete 
                ? 'The update is installed and ready. Click "Reopen App" below to reload the app with the latest version.' 
                : !isAvailable 
                  ? `You are running ${currentVersion}. All cadastral sensors and telemetry pipelines are running the latest version.` 
                  : 'Updates download directly inside the app with zero external websites or store redirects.'}
            </p>
          </div>
        </div>

        <!-- Progress Section (When updating or completed) -->
        ${(isDownloading || isComplete) ? `
          <div class="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/20 flex flex-col gap-2">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-secondary font-medium">
                ${isComplete ? 'Ready to Apply' : 'Downloading Update Payload...'}
              </span>
              <span class="font-bold text-primary">${updateState.progressPercent}%</span>
            </div>

            <div class="w-full h-2 rounded-full bg-surface-container overflow-hidden">
              <div class="h-full bg-primary transition-all duration-300 rounded-full ${isComplete ? 'bg-emerald-500' : ''}" 
                   style="width: ${updateState.progressPercent}%;"></div>
            </div>

            ${isComplete ? `
              <div class="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-500 flex items-center gap-2">
                <span class="material-symbols-outlined text-[16px]">touch_app</span>
                <span>Tap <strong>Reopen App</strong> below to restart with version ${targetVersion}.</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Release Highlights -->
        <div class="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/20 flex flex-col gap-2">
          <div class="text-[11px] font-mono uppercase font-bold text-secondary">Release Highlights (${targetVersion}):</div>
          <ul class="space-y-1.5 text-xs text-on-surface">
            ${updateState.releaseNotes.map(note => `
              <li class="flex items-start gap-2">
                <span class="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_small</span>
                <span>${note}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-2 pt-1">
          ${isComplete ? `
            <button class="w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-[0.99] shadow-md cursor-pointer" 
                    id="reopenAppBtn">
              <span class="material-symbols-outlined text-[18px]">restart_alt</span>
              <span>Reopen App to Apply Update</span>
            </button>
          ` : isAvailable ? `
            <button class="w-full py-3 px-4 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-[0.99] shadow-md cursor-pointer" 
                    id="downloadUpdateOnlineBtn">
              <span class="material-symbols-outlined text-[18px]">download</span>
              <span>${isDownloading ? 'Updating (' + updateState.progressPercent + '%)...' : 'Update to ' + targetVersion + ' Directly'}</span>
            </button>
          ` : `
            <button class="w-full py-3 px-4 rounded-xl bg-surface-container-high text-on-surface font-semibold text-xs flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors cursor-pointer" 
                    id="checkAgainBtn">
              <span class="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
              <span>You are up to date (${currentVersion})</span>
            </button>
          `}
          
          <button class="w-full py-2.5 px-4 rounded-xl bg-transparent text-secondary hover:text-on-surface font-medium text-xs transition-colors cursor-pointer" 
                  id="dismissUpdateBtn">
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
