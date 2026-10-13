// EstateRadar — In-App Online Auto-Update Modal Component
// Obsidian Telemetry Design System
import { state } from '../state.js';

export function renderUpdateModal() {
  const { updateState } = state;

  if (!updateState.isModalOpen) {
    return '';
  }

  const isChecking = updateState.isChecking;
  const isDownloading = updateState.isDownloading;
  const isComplete = updateState.isComplete;
  const isAvailable = updateState.isAvailable;
  const currentVersion = updateState.currentVersion || 'v1.0.4';
  const targetVersion = updateState.version || currentVersion;
  const lastChecked = updateState.lastCheckedTime;
  const checkError = updateState.checkError;

  return `
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" id="updateBackdrop">
      <div class="w-full max-w-md bg-white dark:bg-[#121620] text-slate-900 dark:text-slate-100 rounded-t-2xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 flex flex-col gap-4 animate-slide-up" id="updateModalCard">
        
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                isComplete 
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                  : isAvailable 
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40' 
                    : isChecking
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }">
                ${isComplete ? 'UPDATE READY' : isAvailable ? 'NEW UPDATE AVAILABLE' : isChecking ? 'CHECKING ONLINE…' : 'CURRENT VERSION'}
              </span>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[22px] ${isChecking ? 'animate-spin' : ''}">
                ${isChecking ? 'sync' : 'system_update'}
              </span>
              <span>EstateRadar ${targetVersion}</span>
            </h3>
          </div>
          <button class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer" 
                  id="closeUpdateSheetBtn" 
                  title="Close window">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <!-- Telemetry Status Card -->
        <div class="bg-slate-50 dark:bg-[#1A202C] rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/80 flex items-start gap-3">
          <div class="w-9 h-9 rounded-lg ${isComplete || isAvailable ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : isChecking ? 'bg-blue-500/15 text-blue-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'} flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[20px] ${isChecking ? 'animate-spin' : ''}">
              ${isComplete ? 'check_circle' : isAvailable ? 'download' : isChecking ? 'sync' : 'verified'}
            </span>
          </div>
          <div class="flex flex-col min-w-0">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              ${isComplete 
                ? 'Update downloaded successfully!' 
                : isAvailable 
                  ? `New update (${targetVersion}) is ready to install!` 
                  : isChecking 
                    ? 'Connecting to GitHub release server…'
                    : 'Your app is up to date'}
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
              ${isComplete 
                ? 'The update is installed and ready. Click "Reopen App" below to reload the app with the latest version.' 
                : isAvailable 
                  ? `Upgrading from ${currentVersion} to ${targetVersion}. Download happens directly in background without external webpages.` 
                  : isChecking
                    ? 'Bypassing cache and verifying latest release tags…'
                    : `You are running ${currentVersion}. Last checked: ${lastChecked || 'Just now'}.`}
            </p>
            ${checkError ? `
              <p class="text-[10px] text-amber-600 dark:text-amber-400 mt-1">⚠️ Note: ${checkError}</p>
            ` : ''}
          </div>
        </div>

        <!-- Progress Section (When updating or completed) -->
        ${(isDownloading || isComplete) ? `
          <div class="bg-slate-50 dark:bg-[#1A202C] rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/80 flex flex-col gap-2">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-slate-500 dark:text-slate-400 font-medium">
                ${isComplete ? 'Ready to Apply' : 'Downloading Update Payload...'}
              </span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400">${updateState.progressPercent}%</span>
            </div>

            <div class="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div class="h-full bg-emerald-500 transition-all duration-300 rounded-full" 
                   style="width: ${updateState.progressPercent}%;"></div>
            </div>

            ${isComplete ? `
              <div class="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <span class="material-symbols-outlined text-[16px]">touch_app</span>
                <span>Tap <strong>Reopen App</strong> below to restart with version ${targetVersion}.</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Release Highlights -->
        <div class="bg-slate-50 dark:bg-[#1A202C] rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/80 flex flex-col gap-2">
          <div class="text-[11px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">Release Highlights (${targetVersion}):</div>
          <ul class="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
            ${updateState.releaseNotes.map(note => `
              <li class="flex items-start gap-2">
                <span class="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">check_small</span>
                <span>${note}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-2 pt-1">
          ${isComplete ? `
            <button class="w-full py-3 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition-all active:scale-[0.99] shadow-md cursor-pointer" 
                    style="background-color: #00875A !important; color: #ffffff !important;"
                    id="reopenAppBtn">
              <span class="material-symbols-outlined text-[18px]">restart_alt</span>
              <span>Reopen App to Apply Update</span>
            </button>
          ` : isAvailable ? `
            <button class="w-full py-3 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition-all active:scale-[0.99] shadow-md cursor-pointer" 
                    style="background-color: #00875A !important; color: #ffffff !important;"
                    id="downloadUpdateOnlineBtn">
              <span class="material-symbols-outlined text-[18px]">download</span>
              <span>${isDownloading ? 'Updating (' + updateState.progressPercent + '%)...' : 'Update to ' + targetVersion + ' Directly'}</span>
            </button>
          ` : `
            <button class="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer" 
                    id="checkAgainBtn">
              <span class="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400 ${isChecking ? 'animate-spin' : ''}">sync</span>
              <span>${isChecking ? 'Checking GitHub…' : 'Check for Updates Now'}</span>
            </button>
          `}
          
          <button class="w-full py-2.5 px-4 rounded-xl bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium text-xs transition-colors cursor-pointer" 
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
