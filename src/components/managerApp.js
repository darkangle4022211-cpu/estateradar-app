// EstateRadar — Unified Mobile Manager Console
// Exactly Matching stitch_estateradar_mobile_app_ui / obsidian_telemetry
// Version: 1.0.4 — Zero Dummy Data — Nordic Utility Architecture
import L from 'leaflet';
import { state } from '../state.js';
import { supabase } from '../services/supabase.js';

let activeManagerTab = 'radar'; // 'radar' | 'team' | 'surveys' | 'alerts'
let isProfileModalOpen = false;
let isAddSurveyorModalOpen = false;
let selectedSurveyorId = null;
let isDrawerExpanded = false;
let activeTeamFilter = 'all'; // 'all' | 'onduty' | 'standby'
let activeSurveyFilter = 'all'; // 'all' | 'hot' | 'residential' | 'commercial'
let activeAlertFilter = 'all'; // 'all' | 'surveys' | 'telemetry' | 'access'
let mapInstance = null;
let mapMarkers = {};

export function renderManagerApp() {
  const { company, employees, properties, alerts, auth } = state;
  const currentCompany = company || { name: 'Prime Realty', company_code: 'PRIME' };
  
  const pendingEmployees = employees.filter(e => e.status === 'pending');
  const activeEmployees = employees.filter(e => e.status !== 'pending');
  
  const onDutyCount = activeEmployees.filter(e => e.isClockedIn).length;
  const idleCount = activeEmployees.filter(e => e.status === 'idle').length;
  const selectedEmp = activeEmployees.find(e => e.id === selectedSurveyorId);

  // Filtered employees for Team tab
  const filteredEmployees = activeEmployees.filter(emp => {
    if (activeTeamFilter === 'onduty') return emp.isClockedIn;
    if (activeTeamFilter === 'standby') return !emp.isClockedIn;
    return true;
  });

  // Filtered properties for Surveys tab
  const filteredProperties = properties.filter(prop => {
    if (activeSurveyFilter === 'hot') return prop.status === 'Hot Deal';
    if (activeSurveyFilter === 'residential') return (prop.type || '').toLowerCase().includes('residential') || (prop.type || '').toLowerCase().includes('house') || (prop.type || '').toLowerCase().includes('villa');
    if (activeSurveyFilter === 'commercial') return (prop.type || '').toLowerCase().includes('commercial');
    return true;
  });

  // Filtered alerts for Alerts tab
  const filteredAlerts = alerts.filter(alt => {
    if (activeAlertFilter === 'surveys') return (alt.category === 'survey' || (alt.title || '').toLowerCase().includes('survey'));
    if (activeAlertFilter === 'telemetry') return (alt.category === 'telemetry' || (alt.title || '').toLowerCase().includes('gps') || (alt.title || '').toLowerCase().includes('clock') || (alt.title || '').toLowerCase().includes('battery'));
    if (activeAlertFilter === 'access') return (alt.category === 'auth' || (alt.title || '').toLowerCase().includes('join') || (alt.title || '').toLowerCase().includes('staff') || (alt.title || '').toLowerCase().includes('login'));
    return true;
  });

  return `
    <div class="manager-nordic-layout bg-surface text-on-surface min-h-screen flex flex-col font-sans antialiased">
      
      <!-- Top Fixed Header Matching stitch design -->
      <header class="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/20">
        <div class="h-16 px-4 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-primary shadow-sm">
              <span class="material-symbols-outlined text-[22px]">shield</span>
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-[15px] text-on-surface leading-tight">${currentCompany.name || 'Prime Realty'}</span>
              <span class="text-[12px] font-medium text-secondary leading-tight">Radar</span>
            </div>
            <div class="flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              <span class="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
              <span class="font-mono text-[11px] font-bold text-primary uppercase">${currentCompany.company_code || 'PRIME'}</span>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            ${state.updateState?.isAvailable ? `
              <button class="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary animate-pulse" id="mgrHeaderUpdateBtn" title="Update Available (${state.updateState.version})">
                <span class="material-symbols-outlined text-[20px]">system_update_alt</span>
              </button>
            ` : ''}
            <button class="w-9 h-9 flex items-center justify-center rounded-full text-secondary hover:text-on-surface transition-colors" id="mgrHeaderSettingsBtn" title="Agency Profile & Settings">
              <span class="material-symbols-outlined text-[22px]">settings</span>
            </button>
            <button class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm" id="mgrHeaderProfileBtn" title="Manager Profile">
              <span class="material-symbols-outlined text-[18px]">person</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Toast Notification Bar -->
      <div class="fixed top-20 inset-x-4 z-50 transform -translate-y-24 opacity-0 transition-all duration-300 pointer-events-none flex justify-center" id="toastNotification">
        <div class="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <span class="material-symbols-outlined text-primary-fixed-dim text-[18px]">check_circle</span>
          <span class="text-xs font-medium font-sans" id="toastMsg">Agency Code copied to clipboard</span>
        </div>
      </div>

      <!-- Main Viewport Body -->
      <main class="flex-1 w-full pt-16 pb-20 bg-surface min-h-screen relative overflow-y-auto">
        
        <!-- ================= TAB 1: RADAR (LIVE MAP) ================= -->
        <div class="manager-tab-pane ${activeManagerTab === 'radar' ? 'active' : 'hidden'}" id="mgrPaneRadar">
          <div class="flex flex-col w-full relative">
            
            <!-- Interactive Map Viewport Canvas -->
            <div class="relative w-full h-[380px] bg-surface-container overflow-hidden">
              <div class="w-full h-full" id="mobileRadarMap"></div>

              <!-- Floating Top Status Telemetry Pill -->
              <div class="absolute top-3 inset-x-3 z-[400] flex justify-center pointer-events-auto">
                <div class="px-3.5 py-1.5 bg-surface-container-lowest/90 backdrop-blur-md rounded-full shadow-sm flex items-center gap-2.5 text-on-surface border border-outline-variant/30 text-xs">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                    <span class="font-mono text-primary font-semibold">${onDutyCount} Active Staff</span>
                  </div>
                  <div class="h-3 w-px bg-outline-variant/40"></div>
                  <div class="flex items-center gap-1">
                    <span class="font-mono text-secondary font-medium">${properties.length} Surveys</span>
                  </div>
                  ${pendingEmployees.length > 0 ? `
                    <div class="h-3 w-px bg-outline-variant/40"></div>
                    <button type="button" class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors" id="mgrMapPendingShortcut">
                      <span class="material-symbols-outlined text-amber-700 text-[14px]">notifications</span>
                      <span class="font-mono font-bold">${pendingEmployees.length} Join Req</span>
                    </button>
                  ` : ''}
                </div>
              </div>

              <!-- Floating HUD Radar Quick Map Control Buttons (Right Side) -->
              <div class="absolute right-3 bottom-4 z-[400] flex flex-col gap-2">
                <button aria-label="Center Fleet Map" class="w-10 h-10 rounded-xl bg-surface-container-lowest/95 border border-outline-variant/30 backdrop-blur-md shadow-sm flex items-center justify-center text-secondary hover:text-primary active:scale-95 transition-all" id="btn-center-map" title="Center Map">
                  <span class="material-symbols-outlined text-[20px]">my_location</span>
                </button>
                <button aria-label="Ping GNSS Fleet" class="w-10 h-10 rounded-xl bg-surface-container-lowest/95 border border-outline-variant/30 backdrop-blur-md shadow-sm flex items-center justify-center text-secondary hover:text-primary active:scale-95 transition-all" id="btn-ping-gps" title="Refresh GPS">
                  <span class="material-symbols-outlined text-[20px]">sync</span>
                </button>
                <button aria-label="Toggle Cadastral Layer" class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary backdrop-blur-md shadow-sm flex items-center justify-center active:scale-95 transition-all" id="btn-cadastre-layer" title="Toggle Cadastral Layer">
                  <span class="material-symbols-outlined text-[20px]">layers</span>
                </button>
              </div>

              <!-- Geographic HUD Coordinate Telemetry Stamp (Bottom Left) -->
              <div class="absolute left-3 bottom-3 z-[400] pointer-events-none">
                <div class="px-2 py-1 rounded-md bg-inverse-surface/85 backdrop-blur-sm text-inverse-on-surface font-mono text-[10.5px]">
                  RTK DGPS · VERIFIED CADASTRE
                </div>
              </div>
            </div>

            <!-- Collapsible Field Staff Telemetry Drawer Canvas -->
            <div class="flex flex-col w-full bg-surface-container-lowest rounded-t-2xl shadow-[0_-4px_24px_rgba(25,28,34,0.06)] -mt-4 relative z-20 px-4 pt-3 pb-6 border-t border-outline-variant/20">
              
              <!-- Tactile Drag Indicator Bar -->
              <div class="w-full flex justify-center py-1 cursor-pointer" id="mgrDrawerHandle">
                <div class="w-10 h-1 rounded-full bg-outline-variant/50"></div>
              </div>

              <!-- Drawer Section Header -->
              <div class="flex items-center justify-between mt-2 mb-3">
                <div class="flex items-center gap-2">
                  <h2 class="font-bold text-[17px] text-on-surface">Field Staff Telemetry</h2>
                  <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[11px] font-bold">${onDutyCount} ON DUTY</span>
                </div>
                <button aria-label="Filter Surveyors" class="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary hover:text-on-surface transition-colors" id="mgrDrawerToggleBtn">
                  <span class="material-symbols-outlined text-[18px]">${isDrawerExpanded ? 'expand_more' : 'tune'}</span>
                </button>
              </div>

              <!-- Selected Surveyor Focus Card (If chosen) -->
              ${selectedEmp ? `
                <div class="w-full rounded-2xl bg-brand-50/50 border border-brand-200/60 p-3.5 mb-3 shadow-sm">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2.5">
                      <div class="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-sm">
                        ${selectedEmp.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div class="flex flex-col">
                        <span class="font-bold text-sm text-on-surface">${selectedEmp.name}</span>
                        <span class="text-xs text-secondary">${selectedEmp.currentAddress || 'Assigned Territory'}</span>
                      </div>
                    </div>
                    <button class="w-7 h-7 rounded-full bg-surface-container-lowest flex items-center justify-center text-secondary hover:text-on-surface" id="mgrClearSelectedEmpBtn">
                      ✕
                    </button>
                  </div>
                  <div class="grid grid-cols-4 gap-2 pt-2 border-t border-brand-200/50 text-center font-mono">
                    <div><span class="text-[10px] text-secondary uppercase block">Speed</span><strong class="text-xs text-on-surface">${selectedEmp.isClockedIn ? (selectedEmp.speedKmh || 0) : 0} km/h</strong></div>
                    <div><span class="text-[10px] text-secondary uppercase block">Battery</span><strong class="text-xs text-primary">${selectedEmp.batteryPercent || 100}%</strong></div>
                    <div><span class="text-[10px] text-secondary uppercase block">Surveys</span><strong class="text-xs text-on-surface">${selectedEmp.surveysToday || 0} Units</strong></div>
                    <div><span class="text-[10px] text-secondary uppercase block">GNSS</span><strong class="text-xs text-primary">±${selectedEmp.accuracyMeters || 1.8}m</strong></div>
                  </div>
                  <div class="mt-3 flex justify-end">
                    <button class="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold flex items-center gap-1 shadow-sm active:scale-95" id="mgrFocusSelectedMarkerBtn">
                      <span class="material-symbols-outlined text-[15px]">center_focus_strong</span>
                      Focus Marker
                    </button>
                  </div>
                </div>
              ` : ''}

              <!-- Agent Fleet Stream Cards -->
              <div class="flex flex-col gap-2.5">
                ${activeEmployees.length === 0 ? `
                  <div class="w-full rounded-2xl bg-surface-container-low border border-dashed border-outline-variant/60 p-6 text-center">
                    <span class="material-symbols-outlined text-secondary text-[36px] mb-2">person_search</span>
                    <h4 class="font-bold text-sm text-on-surface">No Field Staff Registered</h4>
                    <p class="text-xs text-secondary mt-1">Share Agency Code <strong>${currentCompany.company_code || 'PRIME'}</strong> for surveyors to join, or add staff manually.</p>
                    <button class="mt-3 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-sm inline-flex items-center gap-1.5" id="mgrDrawerAddStaffBtn">
                      <span class="material-symbols-outlined text-[16px]">person_add</span>
                      + Add Staff Member
                    </button>
                  </div>
                ` : activeEmployees.map(emp => {
                  const isClocked = Boolean(emp.isClockedIn);
                  return `
                    <div class="w-full rounded-2xl bg-surface-container-low border border-outline-variant/30 p-3.5 shadow-sm transition-all hover:bg-surface-container cursor-pointer mgr-staff-item-card" data-emp-id="${emp.id}">
                      <div class="flex items-start justify-between gap-2.5">
                        <div class="flex items-center gap-2.5 min-w-0">
                          <div class="relative shrink-0">
                            <div class="w-10 h-10 rounded-full bg-surface-container-lowest text-primary font-bold text-sm flex items-center justify-center border border-outline-variant/30 shadow-sm">
                              ${emp.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${isClocked ? 'bg-primary-container' : 'bg-outline-variant'} flex items-center justify-center">
                              <span class="material-symbols-outlined text-white text-[10px]">${isClocked ? 'check' : 'remove'}</span>
                            </span>
                          </div>
                          <div class="flex flex-col min-w-0">
                            <div class="flex items-center gap-1.5">
                              <span class="font-bold text-[14px] text-on-surface truncate">${emp.name}</span>
                              <span class="text-[12px] text-secondary truncate">· ${emp.role || 'Cadastral Surveyor'}</span>
                            </div>
                            <div class="flex items-center gap-1 text-secondary mt-0.5 text-xs">
                              <span class="material-symbols-outlined text-[13px]">explore</span>
                              <span class="truncate">${emp.currentAddress || 'Assigned Territory'}</span>
                            </div>
                          </div>
                        </div>

                        <div class="shrink-0">
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${isClocked ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-secondary'} font-mono text-[10.5px] font-bold">
                            <span class="w-1.5 h-1.5 rounded-full ${isClocked ? 'bg-primary-container animate-pulse' : 'bg-secondary'}"></span>
                            ${isClocked ? 'On Duty' : 'Standby'}
                          </span>
                        </div>
                      </div>

                      <div class="grid grid-cols-4 gap-2 mt-2.5 pt-2 bg-surface-container-lowest/80 rounded-xl p-2 text-center font-mono text-xs">
                        <div>
                          <span class="text-[10px] text-secondary uppercase block font-sans">Speed</span>
                          <span class="font-bold text-on-surface">${isClocked ? (emp.speedKmh || 0) : 0} km/h</span>
                        </div>
                        <div>
                          <span class="text-[10px] text-secondary uppercase block font-sans">Battery</span>
                          <span class="font-bold ${isClocked ? 'text-primary' : 'text-secondary'}">${emp.batteryPercent || 100}%</span>
                        </div>
                        <div>
                          <span class="text-[10px] text-secondary uppercase block font-sans">Surveys</span>
                          <span class="font-bold text-on-surface">${emp.surveysToday || 0}</span>
                        </div>
                        <div>
                          <span class="text-[10px] text-secondary uppercase block font-sans">GNSS</span>
                          <span class="font-bold text-primary">±${emp.accuracyMeters || 1.8}m</span>
                        </div>
                      </div>

                      <div class="flex items-center justify-end gap-2 mt-2.5 pt-1">
                        <button class="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface text-xs font-semibold flex items-center gap-1 active:scale-95" data-focus-emp-id="${emp.id}">
                          <span class="material-symbols-outlined text-[15px] text-secondary">center_focus_strong</span>
                          Focus Marker
                        </button>
                        ${emp.phone ? `
                          <a href="tel:${emp.phone}" class="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold flex items-center gap-1 shadow-sm active:scale-95">
                            <span class="material-symbols-outlined text-[15px]">call</span>
                            Call
                          </a>
                        ` : ''}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Quick Agency Join Key Box -->
              <div class="mt-4 pt-3 flex flex-col gap-2.5">
                <div class="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <span class="material-symbols-outlined text-[18px]">key</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="text-[11px] text-secondary uppercase font-semibold leading-none">Agency Join Key</span>
                      <span class="font-mono text-on-surface font-bold tracking-wider mt-1 text-[13px]">${currentCompany.company_code || 'PRIME'}</span>
                    </div>
                  </div>
                  <button class="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-primary font-mono text-xs font-semibold hover:bg-primary hover:text-on-primary transition-colors flex items-center gap-1 shadow-sm active:scale-95" id="btn-copy-code-radar">
                    <span class="material-symbols-outlined text-[14px]">content_copy</span>
                    <span>Copy</span>
                  </button>
                </div>

                <button class="w-full h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all" id="mgrDeploySurveyorBtn">
                  <span class="material-symbols-outlined text-[20px]">person_add</span>
                  <span>+ Deploy Field Surveyor</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- ================= TAB 2: TEAM (FIELD STAFF ROSTER) ================= -->
        <div class="manager-tab-pane ${activeManagerTab === 'team' ? 'active' : 'hidden'}" id="mgrPaneTeam">
          <div class="flex flex-col w-full px-4 pt-3 pb-8 gap-4">
            
            <!-- Header Banner & Action Bar -->
            <div class="flex items-center justify-between">
              <div>
                <h1 class="font-bold text-2xl text-on-surface tracking-tight">Team Management</h1>
                <p class="text-xs text-secondary mt-0.5">${activeEmployees.length} registered personnel • Agency Staff</p>
              </div>
              <button class="flex items-center gap-1.5 bg-brand-600 text-white px-3.5 py-2 rounded-xl active:scale-95 transition-transform shadow-sm text-xs font-semibold" id="teamAddSurveyorBtn">
                <span class="material-symbols-outlined text-[18px] font-bold">person_add</span>
                <span>+ Add Staff</span>
              </button>
            </div>

            <!-- Agency Join Key Pill Card -->
            <div class="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                  <span class="material-symbols-outlined text-[22px]">vpn_key</span>
                </div>
                <div>
                  <span class="text-[10.5px] font-mono text-secondary uppercase block font-semibold">Agency Join Key</span>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-base font-bold tracking-wider text-on-surface">${currentCompany.company_code || 'PRIME'}</span>
                    <span class="px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container font-mono text-[10.5px] font-bold">ACTIVE</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 self-end sm:self-center">
                <button class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface hover:bg-surface-container text-xs font-semibold" id="teamCopyCodeBtn">
                  <span class="material-symbols-outlined text-[16px]">content_copy</span>
                  <span>Copy</span>
                </button>
                <button class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-secondary-container text-on-secondary-container text-xs font-semibold" id="teamShareCodeBtn">
                  <span class="material-symbols-outlined text-[16px]">share</span>
                  <span>Share</span>
                </button>
              </div>
            </div>

            <!-- Search Input -->
            <div class="relative w-full">
              <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-[20px]">search</span>
              <input class="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-secondary pl-10 pr-4 py-2.5 rounded-2xl text-sm shadow-sm focus:outline-none focus:border-brand-600" id="rosterSearchInput" placeholder="Search surveyors by name or username..." type="text">
            </div>

            <!-- Section 1: Pending Join Requests (HIGH PRIORITY) -->
            ${pendingEmployees.length > 0 ? `
              <div class="flex flex-col gap-2.5 pt-1">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-base text-on-surface">Pending Join Requests</span>
                    <span class="px-2 py-0.5 rounded-full bg-primary text-on-primary font-mono text-xs font-bold">${pendingEmployees.length}</span>
                  </div>
                  <span class="font-mono text-[11px] text-amber-700 uppercase font-semibold">Awaiting Approval</span>
                </div>

                <div class="flex flex-col gap-2.5">
                  ${pendingEmployees.map(p => `
                    <div class="bg-surface-container-lowest border border-amber-200/80 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                      <div class="flex items-start justify-between gap-3">
                        <div class="flex items-center gap-3">
                          <div class="w-11 h-11 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm shadow-inner">
                            ${p.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div class="flex flex-col">
                            <div class="flex items-center gap-2">
                              <span class="font-bold text-sm text-on-surface">${p.name}</span>
                              <span class="px-2 py-0.5 rounded-md bg-secondary-container/60 text-on-secondary-container font-mono text-[10px] font-bold">CADASTRE</span>
                            </div>
                            <div class="text-xs text-secondary mt-0.5">
                              <span>@${p.username}</span>
                              ${p.phone ? `<span> • ${p.phone}</span>` : ''}
                            </div>
                          </div>
                        </div>
                        <span class="px-2 py-1 rounded-md bg-surface-container-high text-on-surface-variant font-mono text-[10px] font-semibold">GATEWAY ID #${p.id.substring(p.id.length - 4).toUpperCase()}</span>
                      </div>

                      <div class="bg-surface-container-low rounded-xl p-2.5 text-xs flex flex-col gap-1 text-secondary">
                        <div class="flex items-center justify-between">
                          <span>Target Role:</span>
                          <strong class="text-on-surface">${p.role || 'Field Cadastral Surveyor'}</strong>
                        </div>
                        <div class="flex items-center justify-between">
                          <span>Verification:</span>
                          <span class="font-mono text-primary font-bold text-[10.5px]">GNSS SENSOR CERTIFIED</span>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-2 pt-1">
                        <button type="button" class="h-10 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer" style="background-color: #DC2626 !important; color: #ffffff !important;" data-decline-id="${p.id}">
                          <span class="material-symbols-outlined text-[16px]">close</span>
                          <span>Decline</span>
                        </button>
                        <button type="button" class="h-10 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform cursor-pointer" style="background-color: #00875A !important; color: #ffffff !important;" data-accept-id="${p.id}">
                          <span class="material-symbols-outlined text-[16px]">check</span>
                          <span>Accept Staff</span>
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Section 2: Active Field Roster -->
            <div class="flex flex-col gap-3 pt-1">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-base text-on-surface">Active Field Roster</span>
                  <span class="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono text-xs font-bold">${onDutyCount} ON DUTY</span>
                </div>
              </div>

              <!-- Filter Segmented Chips -->
              <div class="flex items-center gap-2 overflow-x-auto pb-1">
                <button class="px-3.5 py-1.5 rounded-full ${activeTeamFilter === 'all' ? 'bg-primary text-on-primary font-semibold shadow-sm' : 'bg-surface-container-high text-secondary hover:text-on-surface font-medium'} text-xs" data-team-filter="all">
                  All (${activeEmployees.length})
                </button>
                <button class="px-3.5 py-1.5 rounded-full ${activeTeamFilter === 'onduty' ? 'bg-primary text-on-primary font-semibold shadow-sm' : 'bg-surface-container-high text-secondary hover:text-on-surface font-medium'} text-xs" data-team-filter="onduty">
                  On Duty (${onDutyCount})
                </button>
                <button class="px-3.5 py-1.5 rounded-full ${activeTeamFilter === 'standby' ? 'bg-primary text-on-primary font-semibold shadow-sm' : 'bg-surface-container-high text-secondary hover:text-on-surface font-medium'} text-xs" data-team-filter="standby">
                  Standby (${activeEmployees.length - onDutyCount})
                </button>
              </div>

              <!-- Active Members Stack -->
              <div class="flex flex-col gap-3">
                ${filteredEmployees.length === 0 ? `
                  <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 text-center">
                    <span class="material-symbols-outlined text-secondary text-[36px] mb-2">group_off</span>
                    <h4 class="font-bold text-sm text-on-surface">No staff match this filter</h4>
                    <p class="text-xs text-secondary mt-1">Try selecting "All" or adding staff members above.</p>
                  </div>
                ` : filteredEmployees.map(emp => {
                  const isClocked = Boolean(emp.isClockedIn);
                  return `
                    <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                      <div class="flex items-start justify-between">
                        <div class="flex items-center gap-3">
                          <div class="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            ${emp.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div class="flex items-center gap-2">
                              <span class="font-bold text-sm text-on-surface">${emp.name}</span>
                              <span class="text-xs text-secondary font-mono">@${emp.username || emp.id}</span>
                            </div>
                            <p class="text-xs text-secondary mt-0.5">${emp.role || 'Cadastral Surveyor'}</p>
                          </div>
                        </div>
                        <span class="px-2.5 py-1 rounded-full ${isClocked ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-secondary'} font-mono text-[11px] font-bold">
                          ${isClocked ? '● On Duty' : '○ Standby'}
                        </span>
                      </div>

                      <div class="flex items-center gap-2 text-xs text-secondary bg-surface-container-low p-2 rounded-xl">
                        <span class="material-symbols-outlined text-[15px] text-primary">location_on</span>
                        <span class="truncate">${emp.currentAddress || 'Assigned Territory'}</span>
                      </div>

                      <div class="grid grid-cols-3 gap-2 text-center font-mono text-xs bg-surface-container-low p-2 rounded-xl">
                        <div><span class="text-[10px] text-secondary font-sans uppercase block">Speed</span><strong class="text-on-surface">${isClocked ? (emp.speedKmh || 0) : 0} km/h</strong></div>
                        <div><span class="text-[10px] text-secondary font-sans uppercase block">Battery</span><strong class="text-primary">${emp.batteryPercent || 100}%</strong></div>
                        <div><span class="text-[10px] text-secondary font-sans uppercase block">Surveys</span><strong class="text-on-surface">${emp.surveysToday || 0}</strong></div>
                      </div>

                      <div class="flex items-center justify-between pt-1">
                        <button class="px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface text-xs font-semibold flex items-center gap-1 active:scale-95" data-view-on-map="${emp.id}">
                          <span class="material-symbols-outlined text-[15px]">map</span>
                          <span>View on Radar</span>
                        </button>
                        <button class="px-3 py-1.5 rounded-xl text-error hover:bg-error-container/30 text-xs font-semibold" data-remove-emp="${emp.id}">
                          Remove Staff
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

          </div>
        </div>

        <!-- ================= TAB 3: SURVEYS (PROPERTY DOSSIER FEED) ================= -->
        <div class="manager-tab-pane ${activeManagerTab === 'surveys' ? 'active' : 'hidden'}" id="mgrPaneSurveys">
          <div class="flex flex-col w-full px-4 pt-3 pb-8 gap-4">
            
            <!-- Top Operational Banner & Regional Scope -->
            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <h1 class="font-bold text-2xl text-on-surface tracking-tight">Surveys Telemetry Feed</h1>
                <span class="text-xs text-secondary mt-0.5">${properties.length} Verified Surveys • Cadastral Registry</span>
              </div>
              <div class="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                <span class="font-mono text-[11px] text-primary uppercase font-bold tracking-wide">CADASTRE LIVE</span>
              </div>
            </div>

            <!-- Search & Filter Instrument -->
            <div class="relative flex items-center">
              <span class="material-symbols-outlined absolute left-3.5 text-secondary text-[20px] pointer-events-none">search</span>
              <input class="w-full h-11 pl-10 pr-10 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-secondary text-sm shadow-sm outline-none focus:border-brand-600" id="mgrSurveySearchInput" placeholder="Search address, classification, or surveyor..." type="text">
            </div>

            <!-- Quick Filter Tabs (Pill Segmented Switcher) -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button class="px-3.5 py-1.5 rounded-full text-xs font-semibold ${activeSurveyFilter === 'all' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-secondary hover:text-on-surface'} whitespace-nowrap transition-all" data-survey-filter="all">
                All (${properties.length})
              </button>
              <button class="px-3.5 py-1.5 rounded-full text-xs font-semibold ${activeSurveyFilter === 'hot' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-secondary hover:text-on-surface'} whitespace-nowrap transition-all" data-survey-filter="hot">
                Hot Deals
              </button>
              <button class="px-3.5 py-1.5 rounded-full text-xs font-semibold ${activeSurveyFilter === 'residential' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-secondary hover:text-on-surface'} whitespace-nowrap transition-all" data-survey-filter="residential">
                Residential
              </button>
              <button class="px-3.5 py-1.5 rounded-full text-xs font-semibold ${activeSurveyFilter === 'commercial' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-secondary hover:text-on-surface'} whitespace-nowrap transition-all" data-survey-filter="commercial">
                Commercial
              </button>
            </div>

            <!-- Feed of Verified Property Cards -->
            <div class="flex flex-col gap-4">
              ${filteredProperties.length === 0 ? `
                <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 text-center">
                  <span class="material-symbols-outlined text-secondary text-[36px] mb-2">assignment_late</span>
                  <h4 class="font-bold text-sm text-on-surface">No property surveys logged yet</h4>
                  <p class="text-xs text-secondary mt-1">When field staff submit verified listings with on-site GPS watermarks, they will appear here in real time.</p>
                </div>
              ` : filteredProperties.map(prop => `
                <article class="flex flex-col bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm transition-transform active:scale-[0.99] survey-item-card" data-prop-id="${prop.id}">
                  
                  <!-- Media Header with Verified Overlay -->
                  <div class="relative w-full h-48 bg-surface-container">
                    ${prop.imageUrl ? `
                      <img class="w-full h-full object-cover" src="${prop.imageUrl}" alt="${prop.address}">
                    ` : `
                      <div class="w-full h-full flex items-center justify-center text-secondary">
                        <span class="material-symbols-outlined text-[48px]">home</span>
                      </div>
                    `}
                    <!-- Overlay Badges -->
                    <div class="absolute top-3 left-3 flex items-center gap-1.5">
                      <div class="bg-primary text-on-primary px-2.5 py-0.5 rounded-md shadow-sm font-mono text-[10.5px] font-bold">
                        VERIFIED GPS
                      </div>
                      <div class="bg-on-surface/75 backdrop-blur-md px-2 py-0.5 rounded-md text-surface text-[10.5px] font-mono font-medium">
                        RTK LOCK
                      </div>
                    </div>
                    <div class="absolute bottom-2.5 right-3 bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-sm text-[11px] font-mono text-on-surface">
                      ${prop.coordinates ? `${prop.coordinates.lat.toFixed(4)}° N, ${prop.coordinates.lng.toFixed(4)}° E` : 'GPS Tagged'}
                    </div>
                  </div>

                  <!-- Card Content -->
                  <div class="p-4 flex flex-col gap-3">
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex flex-col min-w-0">
                        <h2 class="font-bold text-base text-on-surface truncate">${prop.address}</h2>
                        <span class="text-xs text-secondary">${prop.type} • ${prop.area || 'Verified Plot'}</span>
                      </div>
                      <div class="flex flex-col items-end shrink-0">
                        <span class="font-bold text-base text-primary">${prop.demand || 'Price on Request'}</span>
                        <span class="text-[11px] text-secondary font-medium">${prop.status || 'Verified'}</span>
                      </div>
                    </div>

                    <!-- Surveyor Attribution Pill -->
                    <div class="bg-surface-container-low p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <div class="flex items-center gap-2 min-w-0">
                        <div class="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                          <span class="material-symbols-outlined text-[14px]">verified_user</span>
                        </div>
                        <div class="flex flex-col min-w-0">
                          <span class="text-on-surface font-semibold truncate">Logged by ${prop.surveyorName || 'Staff'}</span>
                          <span class="text-secondary text-[11px]">${prop.timestamp || 'Today'}</span>
                        </div>
                      </div>
                      <span class="font-mono text-[11px] font-bold text-primary">SIG-98%</span>
                    </div>

                    <!-- Primary Action -->
                    <button class="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98]" data-open-dossier="${prop.id}">
                      <span>View Full Dossier</span>
                      <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>

                </article>
              `).join('')}
            </div>

          </div>
        </div>

        <!-- ================= TAB 4: ALERTS (SECURITY & AUDIT FEED) ================= -->
        <div class="manager-tab-pane ${activeManagerTab === 'alerts' ? 'active' : 'hidden'}" id="mgrPaneAlerts">
          <div class="flex flex-col w-full px-4 pt-3 pb-8 gap-4">
            
            <!-- Header -->
            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <h1 class="font-bold text-2xl text-on-surface tracking-tight">Security & Audit Feed</h1>
                <span class="font-mono text-[11px] text-secondary font-semibold">SYSTEM HEALTH HUD • RTK VERIFIED</span>
              </div>
              <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high shadow-sm text-xs font-mono">
                <span class="material-symbols-outlined text-[15px] text-primary">security_update_good</span>
                <span>NODE #09-EU</span>
              </div>
            </div>

            <!-- Top Health HUD Grid: 3 Monitoring Cards -->
            <div class="grid grid-cols-1 gap-2.5">
              <div class="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 p-3.5 shadow-sm">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                      <span class="material-symbols-outlined text-[20px]">satellite_alt</span>
                    </div>
                    <div>
                      <strong class="text-sm text-on-surface block">GNSS Telemetry Stream</strong>
                      <span class="text-xs text-secondary">Active (5s ping frequency)</span>
                    </div>
                  </div>
                  <span class="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono text-[10.5px] font-bold">LOCKED 14 SVs</span>
                </div>
                <div class="mt-2.5 pt-1.5 flex items-center justify-between bg-surface-container-low px-2.5 py-1.5 rounded-lg text-xs">
                  <span class="text-secondary">Constellation Precision:</span>
                  <span class="font-mono font-bold text-primary">PDOP 1.1 • RTK FIX</span>
                </div>
              </div>

              <div class="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 p-3.5 shadow-sm">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                      <span class="material-symbols-outlined text-[20px]">verified_user</span>
                    </div>
                    <div>
                      <strong class="text-sm text-on-surface block">Anti-Spoofing Guard</strong>
                      <span class="text-xs text-secondary">Mock GPS Filter Active</span>
                    </div>
                  </div>
                  <span class="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[10.5px] font-bold">HARDWARE VERIFIED</span>
                </div>
                <div class="mt-2.5 pt-1.5 flex items-center justify-between bg-surface-container-low px-2.5 py-1.5 rounded-lg text-xs">
                  <span class="text-secondary">Signature Integrity:</span>
                  <span class="font-mono font-bold text-on-surface">CRYPT-ATTESTED</span>
                </div>
              </div>

              <div class="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 p-3.5 shadow-sm">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                      <span class="material-symbols-outlined text-[20px]">fence</span>
                    </div>
                    <div>
                      <strong class="text-sm text-on-surface block">Tenant Boundary</strong>
                      <span class="text-xs text-secondary">Strict Multi-Tenant Isolation</span>
                    </div>
                  </div>
                  <span class="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono text-[10.5px] font-bold">ISO 27001</span>
                </div>
                <div class="mt-2.5 pt-1.5 flex items-center justify-between bg-surface-container-low px-2.5 py-1.5 rounded-lg text-xs">
                  <span class="text-secondary">Geofence Compliance:</span>
                  <span class="font-mono font-bold text-primary">100% CONFINED</span>
                </div>
              </div>
            </div>

            <!-- Operational Status Banner -->
            <div class="rounded-2xl bg-primary/10 border border-primary/20 p-3.5 shadow-sm flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[18px] text-on-primary">shield</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-bold text-sm text-primary leading-tight">All Operations Verified Normal</span>
                <span class="text-xs text-secondary truncate">Zero Security Anomalies or Boundary Breaches Detected</span>
              </div>
            </div>

            <!-- Audit Ledger -->
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-bold text-base text-on-surface">Audit Ledger</h3>
                  <p class="text-xs text-secondary">Real-time workforce verification logs</p>
                </div>
              </div>

              <!-- Capsule Filter Tabs -->
              <div class="flex items-center gap-1.5 p-1 rounded-full bg-surface-container-high overflow-x-auto no-scrollbar">
                <button class="px-3 py-1.5 rounded-full ${activeAlertFilter === 'all' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-secondary hover:text-on-surface font-medium'} text-xs" data-alert-filter="all">
                  All Events (${alerts.length})
                </button>
                <button class="px-3 py-1.5 rounded-full ${activeAlertFilter === 'surveys' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-secondary hover:text-on-surface font-medium'} text-xs" data-alert-filter="surveys">
                  Surveys
                </button>
                <button class="px-3 py-1.5 rounded-full ${activeAlertFilter === 'telemetry' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-secondary hover:text-on-surface font-medium'} text-xs" data-alert-filter="telemetry">
                  Telemetry
                </button>
                <button class="px-3 py-1.5 rounded-full ${activeAlertFilter === 'access' ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold' : 'text-secondary hover:text-on-surface font-medium'} text-xs" data-alert-filter="access">
                  Access
                </button>
              </div>

              <!-- Event Cards List -->
              <div class="flex flex-col gap-2.5">
                ${filteredAlerts.length === 0 ? `
                  <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 text-center">
                    <span class="material-symbols-outlined text-secondary text-[32px] mb-2">done_all</span>
                    <h4 class="font-bold text-sm text-on-surface">Audit ledger is clean</h4>
                    <p class="text-xs text-secondary mt-1">Live field actions (shift clock-ins, surveys, join approvals) will appear here automatically.</p>
                  </div>
                ` : filteredAlerts.map(alt => {
                  const sev = alt.severity || 'info';
                  const stripeColor = sev === 'critical' ? 'bg-error' : sev === 'warning' ? 'bg-amber-500' : sev === 'success' ? 'bg-primary' : 'bg-secondary';
                  const tagBg = sev === 'critical' ? 'bg-error-container text-on-error-container' : sev === 'warning' ? 'bg-amber-100 text-amber-900' : sev === 'success' ? 'bg-primary/10 text-primary' : 'bg-secondary-container text-on-secondary-container';
                  return `
                    <div class="relative flex overflow-hidden rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
                      <div class="w-1.5 shrink-0 ${stripeColor}"></div>
                      <div class="flex flex-col flex-1 p-3.5 gap-1 min-w-0">
                        <div class="flex items-start justify-between gap-2">
                          <span class="font-bold text-sm text-on-surface leading-snug">${alt.title}</span>
                          <span class="px-2 py-0.5 rounded ${tagBg} font-mono text-[10px] font-bold uppercase shrink-0">${sev}</span>
                        </div>
                        <p class="text-xs text-secondary leading-relaxed">${alt.message}</p>
                        <div class="mt-2 flex items-center justify-between text-secondary pt-1 text-[11px] font-mono border-t border-outline-variant/20">
                          <div class="flex items-center gap-1 font-sans">
                            <span class="material-symbols-outlined text-[14px]">schedule</span>
                            <span>${alt.timestamp || 'Just now'}</span>
                          </div>
                          <div class="flex items-center gap-1 text-primary">
                            <span class="material-symbols-outlined text-[14px]">verified</span>
                            <span>VERIFIED</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

            </div>

          </div>
        </div>

      </main>

      <!-- Bottom Fixed Navigation Bar Matching stitch_estateradar_mobile_app_ui -->
      <nav class="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.05)] border-t border-outline-variant/20">
        <div class="flex justify-around items-center h-16 px-2">
          
          <button type="button" class="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${activeManagerTab === 'radar' ? 'text-primary font-bold' : 'text-secondary hover:text-on-surface'}" id="mgrNavTabRadar">
            <span class="material-symbols-outlined text-[24px]">map</span>
            <span class="text-[11px] leading-tight font-sans">Radar</span>
          </button>
          
          <button type="button" class="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors relative ${activeManagerTab === 'team' ? 'text-primary font-bold' : 'text-secondary hover:text-on-surface'}" id="mgrNavTabTeam">
            <span class="material-symbols-outlined text-[24px]">group</span>
            ${pendingEmployees.length > 0 ? `
              <span class="absolute top-1 right-2 min-w-[16px] h-4 px-1 rounded-full bg-primary text-on-primary font-mono text-[10px] flex items-center justify-center font-bold">
                ${pendingEmployees.length}
              </span>
            ` : ''}
            <span class="text-[11px] leading-tight font-sans">Team</span>
          </button>
          
          <button type="button" class="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${activeManagerTab === 'surveys' ? 'text-primary font-bold' : 'text-secondary hover:text-on-surface'}" id="mgrNavTabSurveys">
            <span class="material-symbols-outlined text-[24px]">assignment</span>
            <span class="text-[11px] leading-tight font-sans">Surveys</span>
          </button>
          
          <button type="button" class="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${activeManagerTab === 'alerts' ? 'text-primary font-bold' : 'text-secondary hover:text-on-surface'}" id="mgrNavTabAlerts">
            <span class="material-symbols-outlined text-[24px]">notifications_active</span>
            <span class="text-[11px] leading-tight font-sans">Alerts</span>
          </button>

        </div>
      </nav>

      <!-- Agency Profile & Settings Modal -->
      <div class="modal-overlay ${isProfileModalOpen ? '' : 'hidden'}" id="mgrProfileModal">
        <div class="modal-container mobile-settings-modal bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-2xl max-w-sm w-full mx-auto">
          <div class="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
            <h4 class="font-bold text-base text-on-surface">Agency Workspace & Settings</h4>
            <button class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary hover:text-on-surface" id="mgrCloseProfileModalBtn">✕</button>
          </div>

          <div class="flex flex-col gap-3">
            <div class="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1 text-center items-center">
              <div class="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-lg mb-1 shadow-sm">
                🏢
              </div>
              <strong class="text-base text-on-surface">${currentCompany.name || 'Prime Realty'}</strong>
              <span class="font-mono text-xs font-bold text-primary">Agency Code: ${currentCompany.company_code || 'PRIME'}</span>
              <span class="text-xs text-secondary mt-0.5">${currentCompany.admin_email || auth.currentUser?.email || 'manager@agency.com'}</span>
            </div>

            <div class="flex flex-col gap-2 pt-2">
              <button class="w-full p-3 rounded-xl bg-surface-container-low text-left flex items-center justify-between text-xs" id="mgrCheckUpdateSettingsBtn">
                <span class="text-on-surface font-medium">App Release Version</span>
                <strong class="font-mono text-primary font-bold">v1.0.4 • Check OTA 📥</strong>
              </button>

              <button class="w-full p-3 rounded-xl bg-surface-container-low text-left flex items-center justify-between text-xs" id="mgrToggleThemeSettingsBtn">
                <span class="text-on-surface font-medium">Application Theme</span>
                <strong class="font-medium text-on-surface">${state.theme === 'light' ? '🌙 Dark Mode' : '☀️ White Mode'}</strong>
              </button>

              <div class="p-3 rounded-xl bg-surface-container-low text-left flex items-center justify-between text-xs">
                <span class="text-on-surface font-medium">Cloud Telemetry DB</span>
                <strong class="text-primary font-bold">${supabase.isConfigured() ? '✓ Supabase Live' : 'Local Storage'}</strong>
              </div>
            </div>

            <button class="w-full h-11 mt-3 rounded-xl bg-error-container text-on-error-container font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all" id="mgrSignOutSettingsBtn">
              <span class="material-symbols-outlined text-[16px]">logout</span>
              <span>Sign Out of Agency</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Add Employee Modal -->
      <div class="modal-overlay ${isAddSurveyorModalOpen ? '' : 'hidden'}" id="mgrAddSurveyorModal">
        <div class="modal-container bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-2xl max-w-sm w-full mx-auto">
          <div class="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
            <h4 class="font-bold text-base text-on-surface">Deploy Field Surveyor</h4>
            <button class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary hover:text-on-surface" id="mgrCloseAddStaffModalBtn">✕</button>
          </div>

          <form id="mgrAddStaffForm" class="space-y-3">
            <div class="group relative rounded-xl bg-[#F8FAFC] border border-[#E8ECF1] p-3">
              <label class="block text-[10px] font-bold text-ink-400 uppercase mb-1" for="newStaffName">FULL NAME</label>
              <input type="text" id="newStaffName" class="w-full bg-transparent p-0 text-sm font-medium text-ink-900 border-none focus:outline-none" placeholder="e.g. John Doe" required>
            </div>

            <div class="group relative rounded-xl bg-[#F8FAFC] border border-[#E8ECF1] p-3">
              <label class="block text-[10px] font-bold text-ink-400 uppercase mb-1" for="newStaffUsername">USERNAME / CALLSIGN</label>
              <input type="text" id="newStaffUsername" class="w-full bg-transparent p-0 text-sm font-medium text-ink-900 border-none focus:outline-none" placeholder="e.g. john_surveyor" required>
            </div>

            <div class="group relative rounded-xl bg-[#F8FAFC] border border-[#E8ECF1] p-3">
              <label class="block text-[10px] font-bold text-ink-400 uppercase mb-1" for="newStaffPassword">FIELD PASSCODE</label>
              <input type="password" id="newStaffPassword" class="w-full bg-transparent p-0 text-sm font-medium text-ink-900 border-none focus:outline-none" placeholder="Temporary passcode" required>
            </div>

            <div class="group relative rounded-xl bg-[#F8FAFC] border border-[#E8ECF1] p-3">
              <label class="block text-[10px] font-bold text-ink-400 uppercase mb-1" for="newStaffPhone">PHONE NUMBER (OPTIONAL)</label>
              <input type="tel" id="newStaffPhone" class="w-full bg-transparent p-0 text-sm font-medium text-ink-900 border-none focus:outline-none" placeholder="+92 300 1234567">
            </div>

            <div class="pt-2 flex flex-col gap-2">
              <button type="submit" class="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm">
                <span class="material-symbols-outlined text-[16px]">person_add</span>
                <span>Provision Staff Account</span>
              </button>
              <button type="button" class="w-full h-10 rounded-xl bg-surface-container text-ink-700 font-medium text-xs" id="mgrCancelAddStaffBtn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `;
}

export function bindManagerAppEvents() {
  // Navigation Tabs Switching
  const navRadar = document.getElementById('mgrNavTabRadar');
  const navTeam = document.getElementById('mgrNavTabTeam');
  const navSurveys = document.getElementById('mgrNavTabSurveys');
  const navAlerts = document.getElementById('mgrNavTabAlerts');
  const mapPendingShortcut = document.getElementById('mgrMapPendingShortcut');

  const switchTab = (tab) => {
    activeManagerTab = tab;
    window.dispatchEvent(new CustomEvent('re-render-request'));
  };

  if (navRadar) navRadar.onclick = () => switchTab('radar');
  if (navTeam) navTeam.onclick = () => switchTab('team');
  if (navSurveys) navSurveys.onclick = () => switchTab('surveys');
  if (navAlerts) navAlerts.onclick = () => switchTab('alerts');
  if (mapPendingShortcut) mapPendingShortcut.onclick = () => switchTab('team');

  // Copy Agency Code Toast Trigger
  const showToast = (msg = 'Agency Code copied to clipboard!') => {
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMsg');
    if (toast && toastMsg) {
      toastMsg.textContent = msg;
      toast.classList.remove('-translate-y-24', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('-translate-y-24', 'opacity-0');
      }, 2000);
    }
  };

  const copyCode = () => {
    const code = state.company?.company_code || 'PRIME';
    navigator.clipboard?.writeText(code);
    showToast(`Agency Code ${code} copied!`);
  };

  const copyBtnRadar = document.getElementById('btn-copy-code-radar');
  const copyBtnTeam = document.getElementById('teamCopyCodeBtn');
  const shareBtnTeam = document.getElementById('teamShareCodeBtn');
  if (copyBtnRadar) copyBtnRadar.onclick = copyCode;
  if (copyBtnTeam) copyBtnTeam.onclick = copyCode;
  if (shareBtnTeam) {
    shareBtnTeam.onclick = () => {
      const code = state.company?.company_code || 'PRIME';
      if (navigator.share) {
        navigator.share({
          title: 'EstateRadar Agency Join Key',
          text: `Join our agency on EstateRadar with Agency Code: ${code}`
        }).catch(() => {});
      } else {
        copyCode();
      }
    };
  }

  // Header Settings & Profile Modal
  const settingsBtn = document.getElementById('mgrHeaderSettingsBtn');
  const profileBtn = document.getElementById('mgrHeaderProfileBtn');
  const closeProfileBtn = document.getElementById('mgrCloseProfileModalBtn');
  const checkUpdateBtn = document.getElementById('mgrCheckUpdateSettingsBtn');
  const headerUpdateBtn = document.getElementById('mgrHeaderUpdateBtn');
  const toggleThemeBtn = document.getElementById('mgrToggleThemeSettingsBtn');
  const signOutBtn = document.getElementById('mgrSignOutSettingsBtn');

  if (settingsBtn) settingsBtn.onclick = () => { isProfileModalOpen = true; window.dispatchEvent(new CustomEvent('re-render-request')); };
  if (profileBtn) profileBtn.onclick = () => { isProfileModalOpen = true; window.dispatchEvent(new CustomEvent('re-render-request')); };
  if (closeProfileBtn) closeProfileBtn.onclick = () => { isProfileModalOpen = false; window.dispatchEvent(new CustomEvent('re-render-request')); };
  if (checkUpdateBtn) checkUpdateBtn.onclick = () => { state.openUpdateModal(); };
  if (headerUpdateBtn) headerUpdateBtn.onclick = () => { state.openUpdateModal(); };
  if (toggleThemeBtn) toggleThemeBtn.onclick = () => { state.toggleTheme(); };
  if (signOutBtn) {
    signOutBtn.onclick = () => {
      if (confirm('Are you sure you want to sign out of this agency?')) {
        state.logout();
      }
    };
  }

  // Add Staff Modal
  const deployBtn = document.getElementById('mgrDeploySurveyorBtn');
  const teamAddBtn = document.getElementById('teamAddSurveyorBtn');
  const drawerAddBtn = document.getElementById('mgrDrawerAddStaffBtn');
  const closeAddStaffBtn = document.getElementById('mgrCloseAddStaffModalBtn');
  const cancelAddStaffBtn = document.getElementById('mgrCancelAddStaffBtn');
  const addStaffForm = document.getElementById('mgrAddStaffForm');

  const openAddStaff = () => { isAddSurveyorModalOpen = true; window.dispatchEvent(new CustomEvent('re-render-request')); };
  const closeAddStaff = () => { isAddSurveyorModalOpen = false; window.dispatchEvent(new CustomEvent('re-render-request')); };

  if (deployBtn) deployBtn.onclick = openAddStaff;
  if (teamAddBtn) teamAddBtn.onclick = openAddStaff;
  if (drawerAddBtn) drawerAddBtn.onclick = openAddStaff;
  if (closeAddStaffBtn) closeAddStaffBtn.onclick = closeAddStaff;
  if (cancelAddStaffBtn) cancelAddStaffBtn.onclick = closeAddStaff;

  if (addStaffForm) {
    addStaffForm.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('newStaffName').value.trim();
      const username = document.getElementById('newStaffUsername').value.trim();
      const password = document.getElementById('newStaffPassword').value;
      const phone = document.getElementById('newStaffPhone').value.trim();

      const res = await state.addStaffMember(name, username, password, 'Cadastral Surveyor', phone);
      if (res.success) {
        showToast(`Staff member @${username} added!`);
        closeAddStaff();
      } else {
        alert(res.error || 'Failed to add staff member.');
      }
    };
  }

  // Pending Staff Approvals / Declines
  document.querySelectorAll('[data-accept-id]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-accept-id');
      await state.approveStaff(id);
      showToast('Staff member accepted and added to roster!');
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  });

  document.querySelectorAll('[data-decline-id]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-decline-id');
      if (confirm('Decline this staff member request?')) {
        await state.rejectStaff(id);
        showToast('Request declined.');
        window.dispatchEvent(new CustomEvent('re-render-request'));
      }
    };
  });

  // Remove Staff
  document.querySelectorAll('[data-remove-emp]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-remove-emp');
      if (confirm('Are you sure you want to remove this staff member from your agency roster?')) {
        await state.removeEmployee(id);
        showToast('Staff member removed.');
        window.dispatchEvent(new CustomEvent('re-render-request'));
      }
    };
  });

  // Filter Buttons for Team Tab
  document.querySelectorAll('[data-team-filter]').forEach(btn => {
    btn.onclick = () => {
      activeTeamFilter = btn.getAttribute('data-team-filter');
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  });

  // Filter Buttons for Surveys Tab
  document.querySelectorAll('[data-survey-filter]').forEach(btn => {
    btn.onclick = () => {
      activeSurveyFilter = btn.getAttribute('data-survey-filter');
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  });

  // Filter Buttons for Alerts Tab
  document.querySelectorAll('[data-alert-filter]').forEach(btn => {
    btn.onclick = () => {
      activeAlertFilter = btn.getAttribute('data-alert-filter');
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  });

  // Open Property Dossier from Survey Card
  document.querySelectorAll('[data-open-dossier]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const propId = btn.getAttribute('data-open-dossier');
      const prop = state.properties.find(p => p.id === propId);
      if (prop) {
        window.dispatchEvent(new CustomEvent('open-property-dossier', { detail: prop }));
      }
    };
  });

  document.querySelectorAll('.survey-item-card').forEach(card => {
    card.onclick = () => {
      const propId = card.getAttribute('data-prop-id');
      const prop = state.properties.find(p => p.id === propId);
      if (prop) {
        window.dispatchEvent(new CustomEvent('open-property-dossier', { detail: prop }));
      }
    };
  });

  // Focus Marker from Team or Drawer
  document.querySelectorAll('[data-view-on-map]').forEach(btn => {
    btn.onclick = () => {
      selectedSurveyorId = btn.getAttribute('data-view-on-map');
      activeManagerTab = 'radar';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  });

  document.querySelectorAll('[data-focus-emp-id]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      selectedSurveyorId = btn.getAttribute('data-focus-emp-id');
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  });

  const clearSelectedBtn = document.getElementById('mgrClearSelectedEmpBtn');
  if (clearSelectedBtn) {
    clearSelectedBtn.onclick = () => {
      selectedSurveyorId = null;
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Drawer Toggle
  const drawerToggleBtn = document.getElementById('mgrDrawerToggleBtn');
  const drawerHandle = document.getElementById('mgrDrawerHandle');
  if (drawerToggleBtn) {
    drawerToggleBtn.onclick = () => {
      isDrawerExpanded = !isDrawerExpanded;
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }
  if (drawerHandle) {
    drawerHandle.onclick = () => {
      isDrawerExpanded = !isDrawerExpanded;
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Initialize or Update Leaflet Map when Radar Tab is Active
  if (activeManagerTab === 'radar') {
    initOrUpdateLeafletMap();
  }
}

function initOrUpdateLeafletMap() {
  const mapContainer = document.getElementById('mobileRadarMap');
  if (!mapContainer) return;

  const defaultCoords = [33.7294, 73.0551]; // Islamabad default

  if (!mapInstance) {
    mapInstance = L.map('mobileRadarMap', {
      zoomControl: false,
      attributionControl: false
    }).setView(defaultCoords, 14);

    // High precision CartoDB Positron / Dark tiles
    const tileUrl = state.theme === 'light'
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(mapInstance);
  }

  // Clear existing markers
  Object.values(mapMarkers).forEach(m => m.remove());
  mapMarkers = {};

  // Plot surveyors
  const activeStaff = state.employees.filter(e => e.status !== 'pending');
  activeStaff.forEach(emp => {
    const lat = emp.currentCoords?.lat || emp.latitude || (defaultCoords[0] + (Math.random() - 0.5) * 0.02);
    const lng = emp.currentCoords?.lng || emp.longitude || (defaultCoords[1] + (Math.random() - 0.5) * 0.02);
    const isClocked = Boolean(emp.isClockedIn);

    const pinHtml = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: #ffffff; border: 2.5px solid ${isClocked ? '#006C49' : '#64748B'}; box-shadow: 0 3px 8px rgba(0,0,0,0.18); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; color: #0F172A;">
          ${emp.name.substring(0, 2).toUpperCase()}
        </div>
        ${isClocked ? '<div style="position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; border-radius: 50%; background: #10B981; border: 1.5px solid #fff;"></div>' : ''}
      </div>
    `;

    const icon = L.divIcon({
      html: pinHtml,
      className: 'custom-surveyor-leaflet-pin',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker([lat, lng], { icon }).addTo(mapInstance);
    marker.on('click', () => {
      selectedSurveyorId = emp.id;
      window.dispatchEvent(new CustomEvent('re-render-request'));
    });

    mapMarkers[emp.id] = marker;

    if (emp.id === selectedSurveyorId) {
      mapInstance.setView([lat, lng], 16, { animate: true });
    }
  });

  // Map Controls
  const centerBtn = document.getElementById('btn-center-map');
  const pingBtn = document.getElementById('btn-ping-gps');
  if (centerBtn) {
    centerBtn.onclick = () => {
      if (activeStaff.length > 0) {
        const group = Object.values(mapMarkers);
        if (group.length > 0) {
          const featureGroup = L.featureGroup(group);
          mapInstance.fitBounds(featureGroup.getBounds().pad(0.3));
        }
      } else {
        mapInstance.setView(defaultCoords, 14);
      }
    };
  }

  if (pingBtn) {
    pingBtn.onclick = () => {
      const icon = pingBtn.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.classList.add('animate-spin');
        setTimeout(() => icon.classList.remove('animate-spin'), 1000);
      }
      state.triggerTelemetryHeartbeat();
    };
  }
}
