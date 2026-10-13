// EstateRadar — Nordic Mobile Utility Authentication Gateway
// Exactly Matching stitch_estateradar_mobile_app_ui / obsidian_telemetry
// Version: 1.0.4 — Zero Dummy Data — No Auto-fill Bugs — High Precision UI
import { state } from '../state.js';
import { storage } from '../services/storage.js';

let activeRoleTab = 'manager'; // 'manager' | 'employee'
let managerMode = 'login'; // 'login' | 'register'
let employeeMode = 'login'; // 'login' | 'register'
let resetModalOpen = false;
let showManagerPass = false;
let showEmployeePass = false;

export function renderLoginScreen() {
  return `
    <div class="auth-nordic-viewport min-h-screen flex flex-col justify-between antialiased selection:bg-brand-100 selection:text-brand-900">
      
      <!-- Native Mobile Top Status Bar Simulation -->
      <header class="w-full pt-safe px-6 pt-3 pb-2 flex items-center justify-between text-ink-700 text-xs font-semibold select-none z-30">
        <span class="tracking-tight text-ink-900 text-[14px] font-bold">EstateRadar</span>
        <div class="flex items-center space-x-2 text-ink-900">
          <span class="inline-flex items-center text-[10.5px] font-semibold text-brand-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
            RTK v1.0.4 Online
          </span>
          <button type="button" class="theme-icon-toggle-btn text-ink-500 hover:text-ink-900" id="authThemeToggleBtn" title="Toggle Theme">
            ${state.theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <!-- Main Container -->
      <main class="flex-1 w-full max-w-md mx-auto px-6 pt-2 pb-8 flex flex-col justify-start">
        
        <!-- Brand Emblem & Quick Status Header -->
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center space-x-3">
            <div class="w-11 h-11 rounded-2xl bg-white border border-[#E9ECEF] shadow-sm flex items-center justify-center text-brand-700 transition-transform active:scale-95">
              <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 6V12C4 17.5 7.5 21.5 12 22C16.5 21.5 20 17.5 20 12V6L12 2Z" stroke="#00875A" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                <circle cx="12" cy="11.5" r="2.75" stroke="#00875A" stroke-width="2"></circle>
                <path d="M12 8.75V7M12 16V14.25" stroke="#00875A" stroke-linecap="round" stroke-width="2"></path>
              </svg>
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-[16px] tracking-tight text-ink-900 leading-none">EstateRadar</span>
              <span class="text-[12px] font-medium text-ink-400 mt-1">Cadastral Telemetry Network</span>
            </div>
          </div>
          
          <div class="px-2.5 py-1 rounded-full bg-surface-container-high border border-outline-variant/30 text-[11px] font-mono font-semibold text-ink-700">
            DGPS FIX
          </div>
        </div>

        <!-- Hero Typography -->
        <div class="mb-5">
          <h1 class="text-[26px] font-bold tracking-tight text-ink-900 leading-[1.2]">
            ${activeRoleTab === 'manager' 
              ? (managerMode === 'login' ? 'Sign in to Agency Office' : 'Create Agency Workspace')
              : (employeeMode === 'login' ? 'Connect Field Surveyor' : 'Request to Join Agency')}
          </h1>
          <p class="text-[13.5px] text-ink-500 font-normal mt-1 leading-relaxed">
            ${activeRoleTab === 'manager' 
              ? 'Manage your field roster, live radar map, and verified cadastral surveys.'
              : 'Connect your device rover, stamp GPS coordinates, and submit verified property data.'}
          </p>
        </div>

        <!-- Segment Selector (Agency Office / Field Surveyor) -->
        <div class="w-full bg-[#EAECEF] p-1 rounded-2xl flex relative select-none mb-5" role="tablist">
          <button 
            type="button" 
            class="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all duration-200 ${activeRoleTab === 'manager' ? 'text-ink-900 bg-white shadow-pill-switch border border-black/[0.04]' : 'text-ink-500 hover:text-ink-700'}" 
            id="tabManager"
            role="tab"
            aria-selected="${activeRoleTab === 'manager'}"
          >
            <span class="material-symbols-outlined text-[18px] ${activeRoleTab === 'manager' ? 'text-brand-600' : 'text-ink-400'}">domain</span>
            <span>Agency Office</span>
          </button>
          
          <button 
            type="button" 
            class="flex-1 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition-all duration-200 ${activeRoleTab === 'employee' ? 'text-ink-900 bg-white shadow-pill-switch border border-black/[0.04] font-semibold' : 'text-ink-500 hover:text-ink-700'}" 
            id="tabSurveyor"
            role="tab"
            aria-selected="${activeRoleTab === 'employee'}"
          >
            <span class="material-symbols-outlined text-[18px] ${activeRoleTab === 'employee' ? 'text-brand-600' : 'text-ink-400'}">explore</span>
            <span>Field Surveyor</span>
          </button>
        </div>

        <!-- Card Container -->
        <div class="w-full bg-white rounded-[26px] p-5 border border-[#ECEEF2] shadow-subtle-card relative">
          
          ${activeRoleTab === 'manager' ? `
            <!-- ================= AGENCY OFFICE PANEL ================= -->
            ${managerMode === 'login' ? `
              <!-- MANAGER SIGN IN FORM -->
              <form class="space-y-4" id="managerSignInForm" autocomplete="off">
                <!-- Workspace Code Field -->
                <div class="group relative rounded-2xl bg-[#F8FAFC] border border-[#E8ECF1] focus-within:border-brand-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3.5">
                  <div class="flex justify-between items-center mb-1">
                    <label class="text-[10px] font-bold text-ink-400 tracking-wider uppercase" for="mgrCodeInput">WORKSPACE IDENTIFIER</label>
                    <span class="inline-flex items-center text-[10px] font-semibold text-brand-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                      <span class="material-symbols-outlined text-[12px] mr-1 text-brand-600">check_circle</span>
                      Agency Code
                    </span>
                  </div>
                  <div class="flex items-center">
                    <span class="material-symbols-outlined text-ink-400 text-[18px] mr-2">tag</span>
                    <input 
                      type="text" 
                      id="mgrCodeInput" 
                      class="w-full bg-transparent p-0 text-[14.5px] font-bold tracking-wider uppercase text-ink-900 border-none placeholder:text-ink-400 focus:outline-none" 
                      placeholder="e.g. PRIME" 
                      maxlength="12"
                      required 
                    />
                  </div>
                </div>

                <!-- Work Email Field -->
                <div class="group relative rounded-2xl bg-[#F8FAFC] border border-[#E8ECF1] focus-within:border-brand-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3.5">
                  <label class="block text-[10px] font-bold text-ink-400 tracking-wider uppercase mb-1" for="mgrEmailInput">WORK EMAIL</label>
                  <div class="flex items-center">
                    <span class="material-symbols-outlined text-ink-400 text-[18px] mr-2">mail</span>
                    <input 
                      type="email" 
                      id="mgrEmailInput" 
                      class="w-full bg-transparent p-0 text-[14px] text-ink-900 font-medium border-none placeholder:text-ink-400 focus:outline-none" 
                      placeholder="name@agency.com" 
                      required 
                    />
                  </div>
                </div>

                <!-- Password Field -->
                <div class="group relative rounded-2xl bg-[#F8FAFC] border border-[#E8ECF1] focus-within:border-brand-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3.5">
                  <div class="flex justify-between items-center mb-1">
                    <label class="text-[10px] font-bold text-ink-400 tracking-wider uppercase" for="mgrPasswordInput">PASSWORD</label>
                    <button type="button" class="text-ink-400 hover:text-ink-700 text-xs flex items-center" id="toggleMgrPassBtn">
                      <span class="material-symbols-outlined text-[17px]">${showManagerPass ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  <div class="flex items-center">
                    <span class="material-symbols-outlined text-ink-400 text-[18px] mr-2">lock</span>
                    <input 
                      type="${showManagerPass ? 'text' : 'password'}" 
                      id="mgrPasswordInput" 
                      class="w-full bg-transparent p-0 text-[14px] text-ink-900 font-medium border-none placeholder:text-ink-400 focus:outline-none" 
                      placeholder="Enter manager password" 
                      required 
                    />
                  </div>
                </div>

                <!-- Utilities: Remember & Forgot -->
                <div class="flex items-center justify-between pt-0.5">
                  <label class="flex items-center space-x-2 text-[12px] text-ink-600 select-none cursor-pointer">
                    <input checked type="checkbox" class="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-ink-300">
                    <span class="font-normal text-ink-600">Keep signed in</span>
                  </label>
                  <button type="button" class="text-[12px] font-semibold text-brand-600 hover:text-brand-700 hover:underline" id="openForgotPassBtn">
                    Forgot password?
                  </button>
                </div>

                <div id="mgrSignInAlert" class="auth-alert-message hidden"></div>

                <!-- Continue to Workspace Button -->
                <button type="submit" class="w-full h-12 mt-1 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-[0.985] text-white font-semibold text-[14px] flex items-center justify-center space-x-2 shadow-button-tap transition-all" id="mgrSignInSubmitBtn">
                  <span>Continue to Workspace</span>
                  <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>

                <!-- Switch to Create Agency -->
                <div class="text-center pt-2">
                  <p class="text-[13px] text-ink-500">
                    New agency? 
                    <button type="button" class="font-semibold text-brand-600 hover:underline ml-1" id="switchToCreateAgencyBtn">
                      Register a new agency
                    </button>
                  </p>
                </div>
              </form>
            ` : `
              <!-- CREATE NEW AGENCY FORM -->
              <form class="space-y-3.5" id="managerCreateAgencyForm" autocomplete="off">
                <div class="rounded-xl bg-brand-50/70 border border-brand-100 p-3 flex items-start space-x-2.5 mb-2">
                  <span class="material-symbols-outlined text-brand-600 text-[18px] shrink-0 mt-0.5">corporate_fare</span>
                  <p class="text-xs text-brand-900 leading-snug">
                    Registering provisions an isolated agency tenant and generates your team’s unique Agency Code.
                  </p>
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] border border-[#E8ECF1] focus-within:border-brand-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <label class="block text-[10px] font-bold text-ink-400 tracking-wider uppercase mb-1" for="newAgencyName">AGENCY / COMPANY NAME</label>
                  <input type="text" id="newAgencyName" class="w-full bg-transparent p-0 text-[14px] font-medium text-ink-900 border-none placeholder:text-ink-400 focus:outline-none" placeholder="e.g. Skyline Real Estate" required />
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] border border-[#E8ECF1] focus-within:border-brand-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <div class="flex justify-between items-center mb-1">
                    <label class="text-[10px] font-bold text-ink-400 tracking-wider uppercase" for="newAgencyCode">UNIQUE AGENCY CODE</label>
                    <span class="text-[10px] text-ink-400 font-mono">4-8 CHARS</span>
                  </div>
                  <input type="text" id="newAgencyCode" class="w-full bg-transparent p-0 text-[14px] font-bold tracking-wider uppercase text-ink-900 border-none placeholder:text-ink-400 focus:outline-none" placeholder="e.g. SKYLINE" maxlength="8" required />
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] border border-[#E8ECF1] focus-within:border-brand-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <label class="block text-[10px] font-bold text-ink-400 tracking-wider uppercase mb-1" for="newManagerName">MANAGER FULL NAME</label>
                  <input type="text" id="newManagerName" class="w-full bg-transparent p-0 text-[14px] font-medium text-ink-900 border-none placeholder:text-ink-400 focus:outline-none" placeholder="e.g. Hamza Tariq" required />
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] border border-[#E8ECF1] focus-within:border-brand-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <label class="block text-[10px] font-bold text-ink-400 tracking-wider uppercase mb-1" for="newManagerEmail">WORK EMAIL</label>
                  <input type="email" id="newManagerEmail" class="w-full bg-transparent p-0 text-[14px] font-medium text-ink-900 border-none placeholder:text-ink-400 focus:outline-none" placeholder="manager@agency.com" required />
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] border border-[#E8ECF1] focus-within:border-brand-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <label class="block text-[10px] font-bold text-ink-400 tracking-wider uppercase mb-1" for="newManagerPassword">MASTER PASSWORD</label>
                  <input type="password" id="newManagerPassword" class="w-full bg-transparent p-0 text-[14px] font-medium text-ink-900 border-none placeholder:text-ink-400 focus:outline-none" placeholder="Minimum 6 characters" minlength="6" required />
                </div>

                <div id="mgrRegisterAlert" class="auth-alert-message hidden"></div>

                <button type="submit" class="w-full h-12 mt-1 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-[0.985] text-white font-semibold text-[14px] flex items-center justify-center space-x-2 shadow-button-tap transition-all" id="mgrCreateAgencySubmitBtn">
                  <span>Create Agency & Launch Workspace</span>
                  <span class="material-symbols-outlined text-[18px]">rocket_launch</span>
                </button>

                <div class="text-center pt-1">
                  <p class="text-[13px] text-ink-500">
                    Already have an agency? 
                    <button type="button" class="font-semibold text-brand-600 hover:underline ml-1" id="switchToMgrSignInBtn">
                      Sign In here
                    </button>
                  </p>
                </div>
              </form>
            `}
          ` : `
            <!-- ================= FIELD SURVEYOR PANEL ================= -->
            ${employeeMode === 'login' ? `
              <!-- EMPLOYEE SIGN IN FORM -->
              <form class="space-y-4" id="employeeSignInForm" autocomplete="off">
                <!-- Contextual Note -->
                <div class="rounded-2xl bg-brand-50/70 border border-brand-100 p-3 flex items-start space-x-2.5">
                  <span class="material-symbols-outlined text-brand-600 text-[18px] shrink-0 mt-0.5">satellite_alt</span>
                  <p class="text-xs text-brand-900 leading-snug">
                    Connect directly to your team’s RTK base and cached boundary parcels for offline field work.
                  </p>
                </div>

                <!-- Agency Code Field -->
                <div class="group relative rounded-2xl bg-[#F8FAFC] border border-[#E8ECF1] focus-within:border-brand-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3.5">
                  <label class="block text-[10px] font-bold text-ink-400 tracking-wider uppercase mb-1" for="empCodeInput">ASSIGNED AGENCY CODE</label>
                  <div class="flex items-center">
                    <span class="material-symbols-outlined text-ink-400 text-[18px] mr-2">corporate_fare</span>
                    <input 
                      type="text" 
                      id="empCodeInput" 
                      class="w-full bg-transparent p-0 text-[14.5px] font-bold tracking-wider uppercase text-ink-900 border-none placeholder:text-ink-400 focus:outline-none" 
                      placeholder="e.g. PRIME" 
                      maxlength="12"
                      required 
                    />
                  </div>
                </div>

                <!-- Username Field -->
                <div class="group relative rounded-2xl bg-[#F8FAFC] border border-[#E8ECF1] focus-within:border-brand-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3.5">
                  <label class="block text-[10px] font-bold text-ink-400 tracking-wider uppercase mb-1" for="empUsernameInput">SURVEYOR HANDLE / USERNAME</label>
                  <div class="flex items-center">
                    <span class="material-symbols-outlined text-ink-400 text-[18px] mr-2">badge</span>
                    <input 
                      type="text" 
                      id="empUsernameInput" 
                      class="w-full bg-transparent p-0 text-[14px] text-ink-900 font-medium border-none placeholder:text-ink-400 focus:outline-none" 
                      placeholder="e.g. hamza or john_surveyor" 
                      required 
                    />
                  </div>
                </div>

                <!-- Passcode Field -->
                <div class="group relative rounded-2xl bg-[#F8FAFC] border border-[#E8ECF1] focus-within:border-brand-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3.5">
                  <div class="flex justify-between items-center mb-1">
                    <label class="text-[10px] font-bold text-ink-400 tracking-wider uppercase" for="empPasswordInput">FIELD PASSCODE</label>
                    <button type="button" class="text-ink-400 hover:text-ink-700 text-xs flex items-center" id="toggleEmpPassBtn">
                      <span class="material-symbols-outlined text-[17px]">${showEmployeePass ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  <div class="flex items-center">
                    <span class="material-symbols-outlined text-ink-400 text-[18px] mr-2">key</span>
                    <input 
                      type="${showEmployeePass ? 'text' : 'password'}" 
                      id="empPasswordInput" 
                      class="w-full bg-transparent p-0 text-[14px] text-ink-900 font-medium border-none placeholder:text-ink-400 focus:outline-none" 
                      placeholder="Enter staff passcode" 
                      required 
                    />
                  </div>
                </div>

                <div id="empSignInAlert" class="auth-alert-message hidden"></div>

                <button type="submit" class="w-full h-12 mt-1 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-[0.985] text-white font-semibold text-[14px] flex items-center justify-center space-x-2 shadow-button-tap transition-all" id="empSignInSubmitBtn">
                  <span>Start Field Session</span>
                  <span class="material-symbols-outlined text-[18px]">near_me</span>
                </button>

                <div class="text-center pt-1">
                  <button type="button" class="text-xs font-semibold text-ink-500 hover:text-brand-600 transition-colors" id="switchToJoinRequestBtn">
                    Not on this agency’s roster? <span class="text-brand-600 underline">Send request</span>
                  </button>
                </div>
              </form>
            ` : `
              <!-- EMPLOYEE REQUEST TO JOIN AGENCY FORM -->
              <form class="space-y-3.5" id="employeeJoinRequestForm" autocomplete="off">
                <div class="rounded-xl bg-amber-50/80 border border-amber-200/70 p-3 flex items-start space-x-2.5 mb-2">
                  <span class="material-symbols-outlined text-amber-700 text-[18px] shrink-0 mt-0.5">notification_important</span>
                  <p class="text-xs text-amber-900 leading-snug">
                    Your request will be submitted to the Agency Manager for approval. Once accepted, you can log in.
                  </p>
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] border border-[#E8ECF1] focus-within:border-brand-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <label class="block text-[10px] font-bold text-ink-400 tracking-wider uppercase mb-1" for="joinAgencyCode">AGENCY CODE TO JOIN</label>
                  <input type="text" id="joinAgencyCode" class="w-full bg-transparent p-0 text-[14px] font-bold tracking-wider uppercase text-ink-900 border-none placeholder:text-ink-400 focus:outline-none" placeholder="e.g. PRIME" maxlength="12" required />
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] border border-[#E8ECF1] focus-within:border-brand-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <label class="block text-[10px] font-bold text-ink-400 tracking-wider uppercase mb-1" for="joinFullName">YOUR FULL NAME</label>
                  <input type="text" id="joinFullName" class="w-full bg-transparent p-0 text-[14px] font-medium text-ink-900 border-none placeholder:text-ink-400 focus:outline-none" placeholder="e.g. Hamza Tariq" required />
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] border border-[#E8ECF1] focus-within:border-brand-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <label class="block text-[10px] font-bold text-ink-400 tracking-wider uppercase mb-1" for="joinUsername">CHOOSE USERNAME / CALLSIGN</label>
                  <input type="text" id="joinUsername" class="w-full bg-transparent p-0 text-[14px] font-medium text-ink-900 border-none placeholder:text-ink-400 focus:outline-none" placeholder="e.g. hamza_field" required />
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] border border-[#E8ECF1] focus-within:border-brand-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <label class="block text-[10px] font-bold text-ink-400 tracking-wider uppercase mb-1" for="joinPassword">CREATE FIELD PASSCODE</label>
                  <input type="password" id="joinPassword" class="w-full bg-transparent p-0 text-[14px] font-medium text-ink-900 border-none placeholder:text-ink-400 focus:outline-none" placeholder="Minimum 4 characters" minlength="4" required />
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] border border-[#E8ECF1] focus-within:border-brand-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <label class="block text-[10px] font-bold text-ink-400 tracking-wider uppercase mb-1" for="joinPhone">CONTACT PHONE (OPTIONAL)</label>
                  <input type="tel" id="joinPhone" class="w-full bg-transparent p-0 text-[14px] font-medium text-ink-900 border-none placeholder:text-ink-400 focus:outline-none" placeholder="+92 300 1234567" />
                </div>

                <div id="joinRequestAlert" class="auth-alert-message hidden"></div>

                <button type="submit" class="w-full h-12 mt-1 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-[0.985] text-white font-semibold text-[14px] flex items-center justify-center space-x-2 shadow-button-tap transition-all" id="joinRequestSubmitBtn">
                  <span>Submit Join Request to Agency</span>
                  <span class="material-symbols-outlined text-[18px]">send</span>
                </button>

                <div class="text-center pt-1">
                  <button type="button" class="text-xs font-semibold text-ink-500 hover:text-brand-600 transition-colors" id="switchToEmpSignInBtn">
                    Already approved by manager? <span class="text-brand-600 underline">Sign In here</span>
                  </button>
                </div>
              </form>
            `}
          `}

        </div>

        <!-- Footer Cadastral Shield Notice -->
        <div class="mt-6 flex items-center justify-center space-x-2 text-ink-400 text-xs">
          <span class="material-symbols-outlined text-[16px] text-brand-600">verified</span>
          <span>ISO 27001 Multi-Tenant Cryptographic Isolation</span>
        </div>

      </main>

      <!-- Password Reset Modal -->
      <div class="auth-modal-backdrop ${resetModalOpen ? '' : 'hidden'}" id="resetPasswordModalBackdrop">
        <div class="auth-modal-box animate-slide-up">
          <div class="modal-title-row">
            <h3 class="font-bold text-ink-900">Reset Account Password</h3>
            <button type="button" class="modal-close-cross" id="closeResetModalBtn">✕</button>
          </div>
          <p class="modal-desc-text text-sm text-ink-500 mt-1 mb-4">
            Enter your Agency Code and registered email or username to update your password.
          </p>

          <form id="passwordResetForm" class="space-y-3">
            <div class="group relative rounded-xl bg-[#F8FAFC] border border-[#E8ECF1] p-3">
              <label class="block text-[10px] font-bold text-ink-400 uppercase mb-1" for="resetAgencyCode">AGENCY CODE</label>
              <input type="text" id="resetAgencyCode" class="w-full bg-transparent p-0 text-sm font-bold uppercase text-ink-900 border-none focus:outline-none" placeholder="e.g. PRIME" required />
            </div>

            <div class="group relative rounded-xl bg-[#F8FAFC] border border-[#E8ECF1] p-3">
              <label class="block text-[10px] font-bold text-ink-400 uppercase mb-1" for="resetEmailOrUser">EMAIL OR USERNAME</label>
              <input type="text" id="resetEmailOrUser" class="w-full bg-transparent p-0 text-sm text-ink-900 border-none focus:outline-none" placeholder="Registered email or username" required />
            </div>

            <div class="group relative rounded-xl bg-[#F8FAFC] border border-[#E8ECF1] p-3">
              <label class="block text-[10px] font-bold text-ink-400 uppercase mb-1" for="resetNewPass">NEW PASSWORD</label>
              <input type="password" id="resetNewPass" class="w-full bg-transparent p-0 text-sm text-ink-900 border-none focus:outline-none" placeholder="Minimum 6 characters" minlength="6" required />
            </div>

            <div id="resetStatusAlert" class="auth-alert-message hidden"></div>

            <div class="modal-btn-actions pt-2 space-y-2">
              <button type="submit" class="w-full h-11 rounded-xl bg-brand-600 text-white font-semibold text-sm">
                Save New Password
              </button>
              <button type="button" class="w-full h-11 rounded-xl bg-surface-container text-ink-700 font-medium text-sm" id="cancelResetModalBtn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `;
}

export function bindLoginScreenEvents() {
  // Theme Toggle in Header
  const themeBtn = document.getElementById('authThemeToggleBtn');
  if (themeBtn) {
    themeBtn.onclick = () => {
      state.toggleTheme();
    };
  }

  // 1. Role Toggle (Agency Office vs Field Surveyor)
  const tabMgr = document.getElementById('tabManager');
  const tabSurv = document.getElementById('tabSurveyor');

  if (tabMgr) {
    tabMgr.onclick = () => {
      activeRoleTab = 'manager';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  if (tabSurv) {
    tabSurv.onclick = () => {
      activeRoleTab = 'employee';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Password visibility toggles
  const toggleMgrPass = document.getElementById('toggleMgrPassBtn');
  if (toggleMgrPass) {
    toggleMgrPass.onclick = () => {
      showManagerPass = !showManagerPass;
      const passInput = document.getElementById('mgrPasswordInput');
      if (passInput) passInput.type = showManagerPass ? 'text' : 'password';
      const icon = toggleMgrPass.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = showManagerPass ? 'visibility_off' : 'visibility';
    };
  }

  const toggleEmpPass = document.getElementById('toggleEmpPassBtn');
  if (toggleEmpPass) {
    toggleEmpPass.onclick = () => {
      showEmployeePass = !showEmployeePass;
      const passInput = document.getElementById('empPasswordInput');
      if (passInput) passInput.type = showEmployeePass ? 'text' : 'password';
      const icon = toggleEmpPass.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = showEmployeePass ? 'visibility_off' : 'visibility';
    };
  }

  // 2. Manager Sub-tabs
  const switchCreate = document.getElementById('switchToCreateAgencyBtn');
  const switchMgrSign = document.getElementById('switchToMgrSignInBtn');

  if (switchCreate) {
    switchCreate.onclick = () => {
      managerMode = 'register';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }
  if (switchMgrSign) {
    switchMgrSign.onclick = () => {
      managerMode = 'login';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // 3. Employee Sub-tabs
  const switchJoin = document.getElementById('switchToJoinRequestBtn');
  const switchEmpSign = document.getElementById('switchToEmpSignInBtn');

  if (switchJoin) {
    switchJoin.onclick = () => {
      employeeMode = 'register';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }
  if (switchEmpSign) {
    switchEmpSign.onclick = () => {
      employeeMode = 'login';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // 4. Manager Sign In Form Submission
  const mgrLoginForm = document.getElementById('managerSignInForm');
  if (mgrLoginForm) {
    mgrLoginForm.onsubmit = async (e) => {
      e.preventDefault();
      const code = document.getElementById('mgrCodeInput').value.trim();
      const email = document.getElementById('mgrEmailInput').value.trim();
      const pass = document.getElementById('mgrPasswordInput').value;
      const alertBox = document.getElementById('mgrSignInAlert');
      const submitBtn = document.getElementById('mgrSignInSubmitBtn');

      if (submitBtn) submitBtn.disabled = true;
      if (alertBox) alertBox.classList.add('hidden');

      const res = await state.loginAsManager(code, email, pass);
      if (submitBtn) submitBtn.disabled = false;

      if (!res.success) {
        if (alertBox) {
          alertBox.innerText = res.error || 'Failed to sign in as manager.';
          alertBox.className = 'auth-alert-message error';
          alertBox.classList.remove('hidden');
        }
      } else {
        window.dispatchEvent(new CustomEvent('re-render-request'));
      }
    };
  }

  // 5. Manager Create Agency Form Submission
  const mgrRegForm = document.getElementById('managerCreateAgencyForm');
  if (mgrRegForm) {
    mgrRegForm.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('newAgencyName').value.trim();
      const code = document.getElementById('newAgencyCode').value.trim();
      const mgrName = document.getElementById('newManagerName').value.trim();
      const email = document.getElementById('newManagerEmail').value.trim();
      const pass = document.getElementById('newManagerPassword').value;
      const alertBox = document.getElementById('mgrRegisterAlert');
      const submitBtn = document.getElementById('mgrCreateAgencySubmitBtn');

      if (submitBtn) submitBtn.disabled = true;
      if (alertBox) alertBox.classList.add('hidden');

      const res = await state.registerNewCompany(name, code, email, pass, mgrName);
      if (submitBtn) submitBtn.disabled = false;

      if (!res.success) {
        if (alertBox) {
          alertBox.innerText = res.error || 'Failed to create agency.';
          alertBox.className = 'auth-alert-message error';
          alertBox.classList.remove('hidden');
        }
      } else {
        window.dispatchEvent(new CustomEvent('re-render-request'));
      }
    };
  }

  // 6. Employee Sign In Form Submission
  const empLoginForm = document.getElementById('employeeSignInForm');
  if (empLoginForm) {
    empLoginForm.onsubmit = async (e) => {
      e.preventDefault();
      const code = document.getElementById('empCodeInput').value.trim();
      const user = document.getElementById('empUsernameInput').value.trim();
      const pass = document.getElementById('empPasswordInput').value;
      const alertBox = document.getElementById('empSignInAlert');
      const submitBtn = document.getElementById('empSignInSubmitBtn');

      if (!pass) {
        if (alertBox) {
          alertBox.innerText = 'Please enter your password.';
          alertBox.className = 'auth-alert-message error';
          alertBox.classList.remove('hidden');
        }
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      if (alertBox) alertBox.classList.add('hidden');

      const res = await state.loginAsEmployee(code, user, pass);
      if (submitBtn) submitBtn.disabled = false;

      if (!res.success) {
        if (alertBox) {
          alertBox.innerText = res.error || 'Failed to sign in as employee.';
          alertBox.className = 'auth-alert-message error';
          alertBox.classList.remove('hidden');
        }
      } else {
        window.dispatchEvent(new CustomEvent('re-render-request'));
      }
    };
  }

  // 7. Employee Join Request Form Submission
  const joinForm = document.getElementById('employeeJoinRequestForm');
  if (joinForm) {
    joinForm.onsubmit = async (e) => {
      e.preventDefault();
      const code = document.getElementById('joinAgencyCode').value.trim();
      const name = document.getElementById('joinFullName').value.trim();
      const username = document.getElementById('joinUsername').value.trim();
      const pass = document.getElementById('joinPassword').value;
      const phone = document.getElementById('joinPhone').value.trim();
      const alertBox = document.getElementById('joinRequestAlert');
      const submitBtn = document.getElementById('joinRequestSubmitBtn');

      if (submitBtn) submitBtn.disabled = true;
      if (alertBox) alertBox.classList.add('hidden');

      const res = await state.requestJoinAgency(code, name, username, pass, phone);
      if (submitBtn) submitBtn.disabled = false;

      if (!res.success) {
        if (alertBox) {
          alertBox.innerText = res.error || 'Failed to submit request.';
          alertBox.className = 'auth-alert-message error';
          alertBox.classList.remove('hidden');
        }
      } else {
        if (alertBox) {
          alertBox.innerText = '✓ Join request sent successfully! Your Agency Manager has been notified. Once approved, you can sign in.';
          alertBox.className = 'auth-alert-message success';
          alertBox.classList.remove('hidden');
        }
        setTimeout(() => {
          employeeMode = 'login';
          window.dispatchEvent(new CustomEvent('re-render-request'));
        }, 2200);
      }
    };
  }

  // 8. Forgot Password Flow
  const openResetBtn = document.getElementById('openForgotPassBtn');
  const closeResetBtn = document.getElementById('closeResetModalBtn');
  const cancelResetBtn = document.getElementById('cancelResetModalBtn');
  const resetBackdrop = document.getElementById('resetPasswordModalBackdrop');
  const resetForm = document.getElementById('passwordResetForm');

  const openReset = () => {
    resetModalOpen = true;
    if (resetBackdrop) resetBackdrop.classList.remove('hidden');
  };
  const closeReset = () => {
    resetModalOpen = false;
    if (resetBackdrop) resetBackdrop.classList.add('hidden');
  };

  if (openResetBtn) openResetBtn.onclick = openReset;
  if (closeResetBtn) closeResetBtn.onclick = closeReset;
  if (cancelResetBtn) cancelResetBtn.onclick = closeReset;

  if (resetForm) {
    resetForm.onsubmit = async (e) => {
      e.preventDefault();
      const code = document.getElementById('resetAgencyCode').value.trim();
      const userOrEmail = document.getElementById('resetEmailOrUser').value.trim();
      const newPass = document.getElementById('resetNewPass').value;
      const alertBox = document.getElementById('resetStatusAlert');

      const res = await state.resetUserPassword(code, userOrEmail, newPass);
      if (alertBox) {
        if (res.success) {
          alertBox.innerText = '✓ Password reset successfully! You can now sign in.';
          alertBox.className = 'auth-alert-message success';
          alertBox.classList.remove('hidden');
          setTimeout(() => closeReset(), 1800);
        } else {
          alertBox.innerText = res.error || 'Account not found.';
          alertBox.className = 'auth-alert-message error';
          alertBox.classList.remove('hidden');
        }
      }
    };
  }
}
