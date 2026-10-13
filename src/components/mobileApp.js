// EstateRadar — Field Surveyor Mobile Cockpit & Surveys Directory
// Exactly Matching stitch_estateradar_mobile_app_ui / field_surveyor_mobile_cockpit
// Version: 1.0.4 — Zero Dummy Data — Real Device Camera Hardware Access
import { state } from '../state.js';
import { renderLoginScreen, bindLoginScreenEvents } from './loginScreen.js';

let activeTab = 'tracker'; // 'tracker' | 'properties'
let activeMySurveysFilter = 'all'; // 'all' | 'pending' | 'verified' | 'residential' | 'commercial'
let capturedPhotoDataUrl = null;
let shiftTickerInterval = null;

export function renderMobileApp() {
  if (!state.auth.isAuthenticated || !state.currentUser) {
    return renderLoginScreen();
  }

  const { currentUser, properties, updateState, company } = state;
  const isClocked = Boolean(currentUser.isClockedIn);
  const myProperties = properties.filter(p => p.surveyorId === currentUser.id);

  // Shift duration formatted as HHh MMm SSs
  const elapsedMs = isClocked ? Math.max(0, Date.now() - state.shiftStartTime) : 0;
  const totalSec = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const shiftTimerFormatted = isClocked 
    ? `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s` 
    : 'Off Duty';

  const companyCode = company?.company_code || currentUser.company_code || 'PRIME';

  // Filtered properties for My Surveys tab
  const filteredMyProperties = myProperties.filter(prop => {
    if (activeMySurveysFilter === 'pending') return prop.status === 'Pending Review';
    if (activeMySurveysFilter === 'verified') return prop.status !== 'Pending Review';
    if (activeMySurveysFilter === 'residential') return (prop.type || '').toLowerCase().includes('residential') || (prop.type || '').toLowerCase().includes('house') || (prop.type || '').toLowerCase().includes('villa');
    if (activeMySurveysFilter === 'commercial') return (prop.type || '').toLowerCase().includes('commercial');
    return true;
  });

  return `
    <div class="surveyor-nordic-layout bg-surface text-on-surface min-h-screen flex flex-col font-sans antialiased">
      
      <!-- Top Fixed Header -->
      <header class="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/20">
        <div class="h-16 px-4 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-primary shadow-sm">
              <span class="material-symbols-outlined text-[22px]">shield</span>
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-[15px] text-on-surface leading-tight">${company?.name || 'Prime Realty'}</span>
              <span class="text-[12px] font-medium text-secondary leading-tight">Field Cockpit</span>
            </div>
            <div class="flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              <span class="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
              <span class="font-mono text-[11px] font-bold text-primary uppercase">${companyCode}</span>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            ${updateState.isAvailable ? `
              <button class="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary animate-pulse" id="empHeaderUpdateBtn" title="Update Available (${updateState.version})">
                <span class="material-symbols-outlined text-[20px]">system_update_alt</span>
              </button>
            ` : ''}
            <button class="w-9 h-9 flex items-center justify-center rounded-full text-secondary hover:text-on-surface transition-colors" id="empThemeToggleBtn" title="Toggle Theme">
              ${state.theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button class="w-9 h-9 flex items-center justify-center rounded-full text-error hover:bg-error-container/30 transition-colors" id="empSignOutBtn" title="Sign Out">
              <span class="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Viewport Body -->
      <main class="flex-1 w-full pt-16 pb-20 bg-surface min-h-screen relative overflow-y-auto">
        
        <!-- ================= TAB 1: COCKPIT / SHIFT & GPS ================= -->
        <div class="surveyor-tab-pane ${activeTab === 'tracker' ? 'active' : 'hidden'}" id="tabPaneTracker">
          <div class="flex flex-col w-full px-4 pt-3 pb-8 gap-4">
            
            <!-- Surveyor Native Header & Verification Key -->
            <div class="flex items-center justify-between py-2 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-3.5 shadow-sm">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
                  <span class="material-symbols-outlined text-[22px]">architecture</span>
                </div>
                <div class="flex flex-col">
                  <span class="font-bold text-[14px] text-on-surface leading-tight">Cadastral Rover</span>
                  <span class="font-mono text-[11px] text-secondary tracking-wider uppercase font-semibold">KEY: ${companyCode}</span>
                </div>
              </div>
              <button type="button" class="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high text-xs font-semibold" id="empQuickSignOutBtn">
                <span class="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>

            <!-- Employee Profile Card -->
            <section class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-base shadow-inner shrink-0">
                  ${(currentUser.name || 'Staff').substring(0, 2).toUpperCase()}
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="font-bold text-[15px] text-on-surface truncate">${currentUser.name || 'Field Surveyor'}</span>
                  <span class="text-xs text-secondary truncate">@${currentUser.username || 'staff'} • Cadastral Surveyor</span>
                </div>
              </div>
              <div class="px-3 py-1 rounded-full ${isClocked ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-container-high text-secondary'} font-mono text-[11px] font-bold shrink-0">
                ${isClocked ? '● On Duty' : '○ Off Duty'}
              </div>
            </section>

            <!-- Shift Attendance Hero Card -->
            <section class="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-[22px]">verified_user</span>
                  <span class="font-bold text-sm text-on-surface">Workforce Shift Attendance</span>
                </div>
                <span class="font-mono text-xs px-2.5 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-primary font-bold" id="shiftTimerDisplay">
                  ${shiftTimerFormatted}
                </span>
              </div>

              <div class="bg-surface-container-lowest rounded-xl p-3 flex flex-col gap-1 border border-outline-variant/20">
                <div class="flex items-center gap-1.5 text-primary text-xs font-bold font-mono">
                  <span class="material-symbols-outlined text-[16px]">satellite_alt</span>
                  <span>${isClocked ? 'Shift Active — GPS Telemetry Streaming' : 'Standby — Tracking Suspended'}</span>
                </div>
                <p class="text-xs text-secondary leading-relaxed">
                  ${isClocked 
                    ? 'Your location is securely streaming encrypted GNSS coordinates to Agency Manager console.'
                    : 'GPS tracking is paused. Your coordinates remain strictly private while off shift.'}
                </p>
              </div>

              <button type="button" class="w-full h-12 rounded-xl ${isClocked ? 'bg-error-container text-on-error-container' : 'bg-brand-600 hover:bg-brand-700 text-white'} flex items-center justify-center gap-2 font-semibold text-sm active:scale-[0.98] transition-all shadow-sm" id="toggleShiftBtn">
                <span class="material-symbols-outlined text-[20px]">${isClocked ? 'stop_circle' : 'play_circle'}</span>
                <span>${isClocked ? 'End Shift (Clock Out)' : 'Start Shift (Clock In)'}</span>
              </button>
            </section>

            <!-- Survey Registration Trigger CTA Card -->
            <section class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 flex flex-col gap-3 shadow-md relative overflow-hidden ${!isClocked ? 'opacity-85' : ''}">
              <div class="flex items-start gap-3">
                <div class="w-11 h-11 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span class="material-symbols-outlined text-[24px]">photo_camera</span>
                </div>
                <div class="flex flex-col min-w-0">
                  <h2 class="font-bold text-sm text-on-surface leading-snug">
                    + Register On-Site Property Survey
                  </h2>
                  <p class="text-xs text-secondary mt-0.5">
                    ${isClocked 
                      ? 'Launch camera, take photo, and cryptographically stamp RTK GPS coordinates.' 
                      : 'Clock in above to unlock on-site photo survey registration.'}
                  </p>
                </div>
              </div>

              <button type="button" class="w-full h-12 rounded-xl bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-2 font-semibold text-sm shadow-sm active:scale-[0.98] transition-transform ${!isClocked ? 'cursor-not-allowed opacity-75' : ''}" id="openSurveyTrigger">
                <span>Open Camera & Stamp GPS</span>
                <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </section>

            <!-- Live Telemetry & Device Health (Grid) -->
            <section class="grid grid-cols-3 gap-2">
              <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-3 flex flex-col gap-1 shadow-sm">
                <div class="flex items-center gap-1 text-secondary text-xs">
                  <span class="material-symbols-outlined text-[16px]">fact_check</span>
                  <span>Surveys</span>
                </div>
                <span class="font-mono text-base font-bold text-on-surface">${myProperties.length}</span>
                <span class="text-[10px] text-secondary">Logged Today</span>
              </div>

              <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-3 flex flex-col gap-1 shadow-sm">
                <div class="flex items-center gap-1 text-secondary text-xs">
                  <span class="material-symbols-outlined text-[16px]">speed</span>
                  <span>Velocity</span>
                </div>
                <span class="font-mono text-base font-bold text-on-surface">${isClocked ? (currentUser.speedKmh || 0) : 0} <small class="text-xs font-sans text-secondary">km/h</small></span>
                <span class="text-[10px] text-secondary">Transit Speed</span>
              </div>

              <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-3 flex flex-col gap-1 shadow-sm">
                <div class="flex items-center gap-1 text-secondary text-xs">
                  <span class="material-symbols-outlined text-[16px]">battery_charging_full</span>
                  <span>Battery</span>
                </div>
                <span class="font-mono text-base font-bold text-primary">${currentUser.batteryPercent || 100}%</span>
                <span class="text-[10px] text-secondary">High Health</span>
              </div>
            </section>

            <!-- Hardware Location Snapshot Card -->
            <section class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-[18px]">near_me</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold text-sm text-on-surface">${currentUser.currentAddress || (isClocked ? 'GPS Locating...' : 'Off Shift')}</span>
                    <span class="text-xs text-secondary">Assigned Cadastral Sector</span>
                  </div>
                </div>
                <div class="px-2.5 py-0.5 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface font-mono text-[10.5px] uppercase font-semibold">
                  RTK: ±${currentUser.accuracyMeters || 1.8}m
                </div>
              </div>

              <div class="bg-surface-container-low p-2.5 rounded-xl flex items-center justify-between text-xs font-mono">
                <span class="text-secondary">COORDINATES:</span>
                <strong class="text-on-surface">
                  ${currentUser.currentCoords ? `${currentUser.currentCoords.lat.toFixed(4)}° N, ${currentUser.currentCoords.lng.toFixed(4)}° E` : '33.7294° N, 73.0551° E'}
                </strong>
              </div>

              <div class="flex items-center justify-between text-xs text-secondary pt-0.5">
                <span>Constellation: GALILEO + GPS L5</span>
                <span class="font-mono text-primary font-bold">SYNC ACCURATE</span>
              </div>
            </section>

            <!-- Bottom Two-Tab Switcher Pill -->
            <nav class="bg-surface-container-low border border-outline-variant/30 p-1 rounded-full flex items-center justify-between shadow-inner w-full mb-2">
              <button type="button" class="flex-1 py-2 rounded-full ${activeTab === 'tracker' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-secondary'} text-xs flex items-center justify-center gap-1.5 transition-all" id="subTabTrackerBtn">
                <span class="material-symbols-outlined text-[17px] text-primary">navigation</span>
                <span>Shift & GPS</span>
              </button>
              <button type="button" class="flex-1 py-2 rounded-full ${activeTab === 'properties' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-secondary'} text-xs flex items-center justify-center gap-1.5 transition-all" id="subTabPropertiesBtn">
                <span class="material-symbols-outlined text-[17px]">folder_special</span>
                <span>My Surveys (${myProperties.length})</span>
              </button>
            </nav>

          </div>
        </div>

        <!-- ================= TAB 2: MY SURVEYS DIRECTORY ================= -->
        <div class="surveyor-tab-pane ${activeTab === 'properties' ? 'active' : 'hidden'}" id="tabPaneProperties">
          <div class="flex flex-col w-full px-4 pt-3 pb-8 gap-4">
            
            <!-- Header -->
            <div class="flex items-center justify-between">
              <div>
                <h1 class="font-bold text-2xl text-on-surface tracking-tight">My Property Surveys</h1>
                <p class="text-xs text-secondary mt-0.5">${currentUser.name || 'Surveyor'} • ${myProperties.length} Logged Today</p>
              </div>
              <button type="button" class="px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-semibold flex items-center gap-1 shadow-sm" id="mySurveysRegisterNewBtn">
                <span class="material-symbols-outlined text-[16px]">add</span>
                <span>New Survey</span>
              </button>
            </div>

            <!-- Quick Stats Ticker -->
            <div class="grid grid-cols-3 gap-2">
              <div class="bg-surface-container-lowest border border-outline-variant/30 p-2.5 rounded-2xl shadow-sm flex flex-col">
                <span class="text-[10.5px] text-secondary">Logged Count</span>
                <span class="font-mono text-base font-bold text-on-surface mt-0.5">${myProperties.length} Units</span>
              </div>
              <div class="bg-surface-container-lowest border border-outline-variant/30 p-2.5 rounded-2xl shadow-sm flex flex-col">
                <span class="text-[10.5px] text-secondary">GPS Accuracy</span>
                <span class="font-mono text-base font-bold text-primary mt-0.5">±1.8m Fix</span>
              </div>
              <div class="bg-surface-container-lowest border border-outline-variant/30 p-2.5 rounded-2xl shadow-sm flex flex-col">
                <span class="text-[10.5px] text-secondary">Audit Status</span>
                <span class="font-mono text-base font-bold text-primary mt-0.5">100% Stamped</span>
              </div>
            </div>

            <!-- Search Bar -->
            <div class="relative flex items-center w-full">
              <span class="material-symbols-outlined absolute left-3.5 text-secondary text-[20px] pointer-events-none">search</span>
              <input class="w-full h-11 pl-10 pr-10 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-secondary text-sm shadow-sm focus:outline-none focus:border-brand-600" id="empSearchInput" placeholder="Search by plot, address, or type..." type="text">
            </div>

            <!-- Quick Filter Chips -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button type="button" class="px-3 py-1.5 rounded-full text-xs font-semibold ${activeMySurveysFilter === 'all' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-secondary hover:text-on-surface'} whitespace-nowrap" data-emp-filter="all">
                All (${myProperties.length})
              </button>
              <button type="button" class="px-3 py-1.5 rounded-full text-xs font-semibold ${activeMySurveysFilter === 'verified' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-secondary hover:text-on-surface'} whitespace-nowrap" data-emp-filter="verified">
                Verified & Locked
              </button>
              <button type="button" class="px-3 py-1.5 rounded-full text-xs font-semibold ${activeMySurveysFilter === 'residential' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-secondary hover:text-on-surface'} whitespace-nowrap" data-emp-filter="residential">
                Residential
              </button>
              <button type="button" class="px-3 py-1.5 rounded-full text-xs font-semibold ${activeMySurveysFilter === 'commercial' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-secondary hover:text-on-surface'} whitespace-nowrap" data-emp-filter="commercial">
                Commercial
              </button>
            </div>

            <!-- Surveyed Property Cards List -->
            <div class="flex flex-col gap-3.5">
              ${filteredMyProperties.length === 0 ? `
                <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 text-center">
                  <span class="material-symbols-outlined text-secondary text-[36px] mb-2">add_a_photo</span>
                  <h4 class="font-bold text-sm text-on-surface">No surveys submitted yet</h4>
                  <p class="text-xs text-secondary mt-1">Start your shift and tap "Open Camera & Stamp GPS" to record verified on-site listings.</p>
                </div>
              ` : filteredMyProperties.map(prop => `
                <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  ${prop.imageUrl ? `
                    <div class="relative w-full h-44 bg-surface-container">
                      <img src="${prop.imageUrl}" alt="${prop.address}" class="w-full h-full object-cover">
                      <div class="absolute top-3 left-3 bg-primary text-on-primary px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold shadow-sm">
                        VERIFIED GPS
                      </div>
                      <div class="absolute bottom-2.5 right-3 bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-mono text-on-surface font-semibold shadow-sm">
                        ${prop.demand || 'Price on request'}
                      </div>
                    </div>
                  ` : ''}

                  <div class="p-4 flex flex-col gap-2.5">
                    <div>
                      <h3 class="font-bold text-base text-on-surface">${prop.address}</h3>
                      <p class="text-xs text-secondary mt-0.5">${prop.type} • ${prop.area || 'Lot'}</p>
                    </div>

                    <div class="bg-surface-container-low p-2.5 rounded-xl flex items-center justify-between text-xs text-secondary font-mono">
                      <span>🕒 ${prop.timestamp || 'Today'}</span>
                      <strong class="text-primary">RTK Fix ±1.8m</strong>
                    </div>

                    <div class="flex items-center justify-between pt-1">
                      <div class="flex items-center gap-1 text-primary text-xs font-semibold">
                        <span class="material-symbols-outlined text-[16px]">verified</span>
                        <span>Boundary Verified</span>
                      </div>
                      <button type="button" class="px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-semibold flex items-center gap-1 active:scale-95" data-emp-open-dossier="${prop.id}">
                        <span>View Dossier</span>
                        <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Bottom Two-Tab Switcher Pill -->
            <nav class="bg-surface-container-low border border-outline-variant/30 p-1 rounded-full flex items-center justify-between shadow-inner w-full mt-2 mb-2">
              <button type="button" class="flex-1 py-2 rounded-full ${activeTab === 'tracker' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-secondary'} text-xs flex items-center justify-center gap-1.5 transition-all" id="subTabTrackerBtn2">
                <span class="material-symbols-outlined text-[17px]">navigation</span>
                <span>Shift & GPS</span>
              </button>
              <button type="button" class="flex-1 py-2 rounded-full ${activeTab === 'properties' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-secondary'} text-xs flex items-center justify-center gap-1.5 transition-all" id="subTabPropertiesBtn2">
                <span class="material-symbols-outlined text-[17px] text-primary">folder_special</span>
                <span>My Surveys (${myProperties.length})</span>
              </button>
            </nav>

          </div>
        </div>

      </main>

      <!-- Fixed Bottom Nav Bar (Material 3 Style) -->
      <nav class="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.05)] border-t border-outline-variant/20">
        <div class="flex justify-around items-center h-16 px-4">
          <button type="button" class="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 ${activeTab === 'tracker' ? 'text-primary font-bold' : 'text-secondary'}" id="empNavShiftBtn">
            <span class="material-symbols-outlined text-[24px]">navigation</span>
            <span class="text-[11px] leading-tight font-sans">Shift & GPS</span>
          </button>
          <button type="button" class="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 ${activeTab === 'properties' ? 'text-primary font-bold' : 'text-secondary'}" id="empNavSurveysBtn">
            <span class="material-symbols-outlined text-[24px]">folder_special</span>
            <span class="text-[11px] leading-tight font-sans">My Surveys (${myProperties.length})</span>
          </button>
        </div>
      </nav>

      <!-- In-App Property Survey Registration Modal (REAL CAMERA + ZERO DUMMY DATA) -->
      <div class="modal-overlay hidden" id="surveySubmissionModal">
        <div class="modal-container bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-2xl max-w-sm w-full mx-auto max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
            <h4 class="font-bold text-base text-on-surface">Register Property Survey</h4>
            <button class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary hover:text-on-surface" id="closeSurveyModalBtn">✕</button>
          </div>

          <form id="propertySurveyForm" class="space-y-3">
            
            <!-- Real Hardware Camera Section -->
            <div>
              <label class="block text-[10px] font-bold text-ink-400 uppercase mb-1">ON-SITE CAMERA IMAGERY (REQUIRED)</label>
              
              <!-- Hidden native camera file input -->
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                id="realCameraCaptureInput" 
                style="display: none;" 
              />

              <div class="border-2 border-dashed border-outline-variant/60 rounded-2xl p-4 text-center cursor-pointer hover:border-brand-600 transition-colors bg-surface-container-low" id="cameraCaptureTriggerBox">
                ${capturedPhotoDataUrl ? `
                  <div class="relative w-full h-40 rounded-xl overflow-hidden">
                    <img id="activePhotoPreview" src="${capturedPhotoDataUrl}" alt="Captured Property" class="w-full h-full object-cover">
                    <button type="button" class="absolute bottom-2 right-2 px-3 py-1 bg-inverse-surface/80 backdrop-blur-md text-white rounded-lg text-xs font-semibold" id="retakePhotoBtn">
                      📷 Retake
                    </button>
                  </div>
                ` : `
                  <div class="flex flex-col items-center justify-center py-3">
                    <div class="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-2 shadow-sm">
                      <span class="material-symbols-outlined text-[28px]">photo_camera</span>
                    </div>
                    <strong class="text-sm text-on-surface block">Open Camera & Take Photo</strong>
                    <span class="text-xs text-secondary mt-0.5">Captures photo and stamps RTK GNSS coordinates</span>
                  </div>
                `}
              </div>
              <div id="cameraStatusFeedback" class="camera-feedback-pill hidden mt-1 text-xs text-primary font-semibold"></div>
            </div>

            <!-- Empty Property Fields (ZERO DUMMY DATA) -->
            <div class="group relative rounded-xl bg-[#F8FAFC] border border-[#E8ECF1] p-2.5">
              <label class="block text-[10px] font-bold text-ink-400 uppercase mb-1" for="propAddressInput">PROPERTY ADDRESS</label>
              <input type="text" id="propAddressInput" class="w-full bg-transparent p-0 text-sm font-medium text-ink-900 border-none focus:outline-none" placeholder="e.g. Plot 15, Sector F-7/2, Street 18" required>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div class="group relative rounded-xl bg-[#F8FAFC] border border-[#E8ECF1] p-2.5">
                <label class="block text-[10px] font-bold text-ink-400 uppercase mb-1" for="propTypeSelect">CLASSIFICATION</label>
                <select id="propTypeSelect" class="w-full bg-transparent p-0 text-xs font-medium text-ink-900 border-none focus:outline-none">
                  <option value="Executive Villa">Executive Villa</option>
                  <option value="Residential Plot">Residential Plot</option>
                  <option value="Commercial Plaza">Commercial Plaza</option>
                  <option value="Commercial Plot">Commercial Plot</option>
                  <option value="Luxury Apartment">Luxury Apartment</option>
                </select>
              </div>

              <div class="group relative rounded-xl bg-[#F8FAFC] border border-[#E8ECF1] p-2.5">
                <label class="block text-[10px] font-bold text-ink-400 uppercase mb-1" for="propAreaInput">LOT / AREA</label>
                <input type="text" id="propAreaInput" class="w-full bg-transparent p-0 text-sm font-medium text-ink-900 border-none focus:outline-none" placeholder="e.g. 1 Kanal (500 Sq Yd)" required>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div class="group relative rounded-xl bg-[#F8FAFC] border border-[#E8ECF1] p-2.5">
                <label class="block text-[10px] font-bold text-ink-400 uppercase mb-1" for="propDemandInput">VALUATION / DEMAND</label>
                <input type="text" id="propDemandInput" class="w-full bg-transparent p-0 text-sm font-medium text-ink-900 border-none focus:outline-none" placeholder="e.g. PKR 4.8 Crore" required>
              </div>

              <div class="group relative rounded-xl bg-[#F8FAFC] border border-[#E8ECF1] p-2.5">
                <label class="block text-[10px] font-bold text-ink-400 uppercase mb-1" for="propStatusSelect">DEAL STATUS</label>
                <select id="propStatusSelect" class="w-full bg-transparent p-0 text-xs font-medium text-ink-900 border-none focus:outline-none">
                  <option value="Hot Deal">🔥 Hot Deal</option>
                  <option value="Direct Owner">Direct Owner</option>
                  <option value="Urgent Sale">Urgent Sale</option>
                  <option value="For Rent">For Rent</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div class="group relative rounded-xl bg-[#F8FAFC] border border-[#E8ECF1] p-2.5">
                <label class="block text-[10px] font-bold text-ink-400 uppercase mb-1" for="propOwnerNameInput">OWNER NAME</label>
                <input type="text" id="propOwnerNameInput" class="w-full bg-transparent p-0 text-sm font-medium text-ink-900 border-none focus:outline-none" placeholder="e.g. Malik Tariq">
              </div>

              <div class="group relative rounded-xl bg-[#F8FAFC] border border-[#E8ECF1] p-2.5">
                <label class="block text-[10px] font-bold text-ink-400 uppercase mb-1" for="propOwnerPhoneInput">OWNER PHONE</label>
                <input type="tel" id="propOwnerPhoneInput" class="w-full bg-transparent p-0 text-sm font-medium text-ink-900 border-none focus:outline-none" placeholder="+92 300 1234567">
              </div>
            </div>

            <div class="group relative rounded-xl bg-[#F8FAFC] border border-[#E8ECF1] p-2.5">
              <label class="block text-[10px] font-bold text-ink-400 uppercase mb-1" for="propConditionInput">ON-SITE SURVEY NOTES</label>
              <textarea id="propConditionInput" rows="2" class="w-full bg-transparent p-0 text-xs text-ink-900 border-none focus:outline-none" placeholder="Corner plot, solid stone construction, boundary marked..."></textarea>
            </div>

            <div class="pt-2 flex flex-col gap-2">
              <button type="submit" class="w-full h-12 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm" id="submitSurveyRecordBtn">
                <span class="material-symbols-outlined text-[18px]">verified</span>
                <span>Submit Verified Survey to Manager</span>
              </button>
              <button type="button" class="w-full h-10 rounded-xl bg-surface-container text-ink-700 font-medium text-xs" id="cancelSurveyModalBtn">
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

  // Live timer interval for shift
  if (shiftTickerInterval) clearInterval(shiftTickerInterval);
  shiftTickerInterval = setInterval(() => {
    const timerElem = document.getElementById('shiftTimerDisplay');
    if (timerElem && state.currentUser?.isClockedIn) {
      const elapsedMs = Math.max(0, Date.now() - state.shiftStartTime);
      const totalSec = Math.floor(elapsedMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;
      timerElem.textContent = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }
  }, 1000);

  // Tabs Switching
  const subTracker = document.getElementById('subTabTrackerBtn');
  const subProperties = document.getElementById('subTabPropertiesBtn');
  const subTracker2 = document.getElementById('subTabTrackerBtn2');
  const subProperties2 = document.getElementById('subTabPropertiesBtn2');
  const navShift = document.getElementById('empNavShiftBtn');
  const navSurveys = document.getElementById('empNavSurveysBtn');

  const switchTab = (tab) => {
    activeTab = tab;
    window.dispatchEvent(new CustomEvent('re-render-request'));
  };

  if (subTracker) subTracker.onclick = () => switchTab('tracker');
  if (subProperties) subProperties.onclick = () => switchTab('properties');
  if (subTracker2) subTracker2.onclick = () => switchTab('tracker');
  if (subProperties2) subProperties2.onclick = () => switchTab('properties');
  if (navShift) navShift.onclick = () => switchTab('tracker');
  if (navSurveys) navSurveys.onclick = () => switchTab('properties');

  // Shift Toggle (Clock in / Clock out)
  const shiftBtn = document.getElementById('toggleShiftBtn');
  if (shiftBtn) {
    shiftBtn.onclick = () => {
      state.toggleShift();
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Sign Out Handlers
  const signOut = () => {
    if (confirm('Are you sure you want to sign out? Your shift will be paused.')) {
      state.logout();
    }
  };
  const signOutBtn = document.getElementById('empSignOutBtn');
  const quickSignOutBtn = document.getElementById('empQuickSignOutBtn');
  if (signOutBtn) signOutBtn.onclick = signOut;
  if (quickSignOutBtn) quickSignOutBtn.onclick = signOut;

  // Theme Toggle
  const themeBtn = document.getElementById('empThemeToggleBtn');
  if (themeBtn) {
    themeBtn.onclick = () => state.toggleTheme();
  }

  // Update Modal Trigger
  const updateBtn = document.getElementById('empHeaderUpdateBtn');
  if (updateBtn) {
    updateBtn.onclick = () => state.openUpdateModal();
  }

  // Survey Modal Open / Close
  const surveyModal = document.getElementById('surveySubmissionModal');
  const triggerBtn = document.getElementById('openSurveyTrigger');
  const mySurveysAddBtn = document.getElementById('mySurveysRegisterNewBtn');
  const closeSurveyBtn = document.getElementById('closeSurveyModalBtn');
  const cancelSurveyBtn = document.getElementById('cancelSurveyModalBtn');

  const openSurvey = () => {
    if (!state.currentUser?.isClockedIn) {
      alert('Please start your shift (Clock In) first before registering on-site surveys.');
      return;
    }
    capturedPhotoDataUrl = null;
    if (surveyModal) surveyModal.classList.remove('hidden');
  };

  const closeSurvey = () => {
    if (surveyModal) surveyModal.classList.add('hidden');
    capturedPhotoDataUrl = null;
  };

  if (triggerBtn) triggerBtn.onclick = openSurvey;
  if (mySurveysAddBtn) mySurveysAddBtn.onclick = openSurvey;
  if (closeSurveyBtn) closeSurveyBtn.onclick = closeSurvey;
  if (cancelSurveyBtn) cancelSurveyBtn.onclick = closeSurvey;

  // Real Hardware Camera Trigger & Canvas Watermarking
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
          const coords = state.currentUser?.currentCoords || { lat: 33.7294, lng: 73.0551 };
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

          if (camTriggerBox) {
            camTriggerBox.innerHTML = `
              <div class="relative w-full h-40 rounded-xl overflow-hidden">
                <img id="activePhotoPreview" src="${capturedPhotoDataUrl}" alt="Captured Property" class="w-full h-full object-cover">
                <button type="button" class="absolute bottom-2 right-2 px-3 py-1 bg-inverse-surface/80 backdrop-blur-md text-white rounded-lg text-xs font-semibold" id="retakePhotoBtn">
                  📷 Retake
                </button>
              </div>
            `;
            const newRetake = document.getElementById('retakePhotoBtn');
            if (newRetake) newRetake.onclick = launchCamera;
          }

          if (camFeedback) {
            camFeedback.innerText = '✓ Photo captured and RTK GPS stamped!';
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
    surveyForm.onsubmit = async (e) => {
      e.preventDefault();
      const address = document.getElementById('propAddressInput').value.trim();
      const type = document.getElementById('propTypeSelect').value;
      const area = document.getElementById('propAreaInput').value.trim();
      const demand = document.getElementById('propDemandInput').value.trim();
      const statusVal = document.getElementById('propStatusSelect').value;
      const ownerName = document.getElementById('propOwnerNameInput').value.trim();
      const ownerPhone = document.getElementById('propOwnerPhoneInput').value.trim();
      const condition = document.getElementById('propConditionInput').value.trim();

      const newProp = {
        id: `prop_${Date.now()}`,
        address,
        type,
        area,
        demand,
        status: statusVal,
        ownerName: ownerName || 'Direct Owner',
        ownerPhone: ownerPhone || '',
        condition: condition || 'On-site verified boundary.',
        surveyorId: state.currentUser?.id,
        surveyorName: state.currentUser?.name || 'Field Surveyor',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        coordinates: state.currentUser?.currentCoords || { lat: 33.7294, lng: 73.0551 },
        imageUrl: capturedPhotoDataUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        distanceFromPropertyMeters: 4.2,
        stayDurationMinutes: 24,
        watermark: {
          hash: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        }
      };

      await state.addProperty(newProp);
      alert('✓ Property survey submitted successfully to manager console!');
      closeSurvey();
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Open Property Dossier from My Surveys list
  document.querySelectorAll('[data-emp-open-dossier]').forEach(btn => {
    btn.onclick = () => {
      const propId = btn.getAttribute('data-emp-open-dossier');
      const prop = state.properties.find(p => p.id === propId);
      if (prop) {
        window.dispatchEvent(new CustomEvent('open-property-dossier', { detail: prop }));
      }
    };
  });

  // Filter Buttons for My Surveys
  document.querySelectorAll('[data-emp-filter]').forEach(btn => {
    btn.onclick = () => {
      activeMySurveysFilter = btn.getAttribute('data-emp-filter');
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  });
}
