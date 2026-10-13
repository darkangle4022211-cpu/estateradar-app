// EstateRadar — Nordic Mobile Utility Authentication Gateway
// Exactly Matching stitch_estateradar_mobile_app_ui / obsidian_telemetry
// Version: 1.0.4 — Zero Dummy Data — High Precision UI
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
    <div class="auth-nordic-viewport min-h-screen flex flex-col justify-between antialiased selection:bg-brand-100 selection:text-brand-900 bg-[#FAFAFC] dark:bg-[#0B0E14] text-ink-900 dark:text-slate-100">
      
      <!-- Main Container -->
      <main class="flex-1 w-full max-w-md mx-auto px-5 pt-safe pt-6 pb-8 flex flex-col justify-start">
        
        <!-- Clean Brand Header & Status Pill -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <div class="w-11 h-11 rounded-2xl bg-white dark:bg-[#161B26] border border-[#E9ECEF] dark:border-slate-800 shadow-sm flex items-center justify-center text-brand-700 transition-transform active:scale-95">
              <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 6V12C4 17.5 7.5 21.5 12 22C16.5 21.5 20 17.5 20 12V6L12 2Z" stroke="#00875A" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                <circle cx="12" cy="11.5" r="2.75" stroke="#00875A" stroke-width="2"></circle>
                <path d="M12 8.75V7M12 16V14.25" stroke="#00875A" stroke-linecap="round" stroke-width="2"></path>
              </svg>
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-[16px] tracking-tight text-ink-900 dark:text-white leading-none">EstateRadar</span>
              <span class="text-[12px] font-medium text-ink-400 dark:text-slate-400 mt-1">Cadastral Network</span>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <div class="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
              RTK FIX
            </div>
            <button type="button" class="w-8 h-8 rounded-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors" id="authThemeToggleBtn" title="Toggle Theme">
              ${state.theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>

        <!-- Hero Typography -->
        <div class="mb-5">
          <h1 class="text-[28px] font-bold tracking-tight text-ink-900 dark:text-white leading-[1.2]">
            ${activeRoleTab === 'manager' 
              ? (managerMode === 'login' ? 'Sign in to Agency Office' : 'Create Agency Workspace')
              : (employeeMode === 'login' ? 'Connect Field Surveyor' : 'Request to Join Agency')}
          </h1>
          <p class="text-[13.5px] text-ink-500 dark:text-slate-400 font-normal mt-1.5 leading-relaxed">
            ${activeRoleTab === 'manager' 
              ? 'Manage your field roster, live radar map, and verified cadastral surveys.'
              : 'Connect your device rover, stamp GPS coordinates, and submit verified property data.'}
          </p>
        </div>

        <!-- Segment Selector (Agency Office / Field Surveyor) -->
        <div class="w-full bg-[#EAECEF] dark:bg-[#161B26] p-1 rounded-2xl flex relative select-none mb-5" role="tablist">
          <button 
            type="button" 
            class="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all duration-200 cursor-pointer ${activeRoleTab === 'manager' ? 'text-ink-900 bg-white dark:bg-[#202736] dark:text-white shadow-pill-switch border border-black/[0.04]' : 'text-ink-500 dark:text-slate-400 hover:text-ink-700'}" 
            id="tabManager"
            role="tab"
            aria-selected="${activeRoleTab === 'manager'}"
          >
            <span class="material-symbols-outlined text-[18px] ${activeRoleTab === 'manager' ? 'text-brand-600 dark:text-emerald-400' : 'text-ink-400'}">domain</span>
            <span>Agency Office</span>
          </button>
          
          <button 
            type="button" 
            class="flex-1 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition-all duration-200 cursor-pointer ${activeRoleTab === 'employee' ? 'text-ink-900 bg-white dark:bg-[#202736] dark:text-white shadow-pill-switch border border-black/[0.04] font-semibold' : 'text-ink-500 dark:text-slate-400 hover:text-ink-700'}" 
            id="tabSurveyor"
            role="tab"
            aria-selected="${activeRoleTab === 'employee'}"
          >
            <span class="material-symbols-outlined text-[18px] ${activeRoleTab === 'employee' ? 'text-brand-600 dark:text-emerald-400' : 'text-ink-400'}">explore</span>
            <span>Field Surveyor</span>
          </button>
        </div>

        <!-- Card Container -->
        <div class="w-full bg-white dark:bg-[#121620] rounded-[26px] p-5 border border-[#ECEEF2] dark:border-slate-800 shadow-subtle-card relative">
          
          ${activeRoleTab === 'manager' ? `
            <!-- ================= AGENCY OFFICE PANEL ================= -->
            ${managerMode === 'login' ? `
              <!-- MANAGER SIGN IN FORM -->
              <form class="space-y-4" id="managerSignInForm" autocomplete="off">
                <!-- Workspace Code Field -->
                <div class="group relative rounded-2xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E8ECF1] dark:border-slate-700/80 focus-within:border-brand-600 focus-within:bg-white dark:focus-within:bg-[#1A202C] focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3.5">
                  <div class="flex justify-between items-center mb-1">
                    <label class="text-[10.5px] font-bold text-ink-400 dark:text-slate-400 tracking-wider uppercase" for="mgrCodeInput">WORKSPACE IDENTIFIER</label>
                    <span class="inline-flex items-center text-[10px] font-semibold text-brand-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200/70 dark:border-emerald-800">
                      <span class="material-symbols-outlined text-[12px] mr-1 text-brand-600 dark:text-emerald-400">check_circle</span>
                      Agency Code
                    </span>
                  </div>
                  <div class="flex items-center">
                    <span class="material-symbols-outlined text-ink-400 text-[18px] mr-2">tag</span>
                    <input 
                      type="text" 
                      id="mgrCodeInput" 
                      class="w-full bg-transparent p-0 text-[14.5px] font-bold tracking-wider uppercase text-ink-900 dark:text-white border-none placeholder:text-ink-400 focus:outline-none" 
                      placeholder="e.g. PRIME" 
                      maxlength="12"
                      required 
                    />
                  </div>
                </div>

                <!-- Work Email Field -->
                <div class="group relative rounded-2xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E8ECF1] dark:border-slate-700/80 focus-within:border-brand-600 focus-within:bg-white dark:focus-within:bg-[#1A202C] focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3.5">
                  <label class="block text-[10.5px] font-bold text-ink-400 dark:text-slate-400 tracking-wider uppercase mb-1" for="mgrEmailInput">WORK EMAIL</label>
                  <div class="flex items-center">
                    <span class="material-symbols-outlined text-ink-400 text-[18px] mr-2">mail</span>
                    <input 
                      type="email" 
                      id="mgrEmailInput" 
                      class="w-full bg-transparent p-0 text-[14px] text-ink-900 dark:text-white font-medium border-none placeholder:text-ink-400 focus:outline-none" 
                      placeholder="name@agency.com" 
                      required 
                    />
                  </div>
                </div>

                <!-- Password Field -->
                <div class="group relative rounded-2xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E8ECF1] dark:border-slate-700/80 focus-within:border-brand-600 focus-within:bg-white dark:focus-within:bg-[#1A202C] focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3.5">
                  <div class="flex justify-between items-center mb-1">
                    <label class="text-[10.5px] font-bold text-ink-400 dark:text-slate-400 tracking-wider uppercase" for="mgrPasswordInput">PASSWORD</label>
                    <button type="button" class="text-ink-400 hover:text-ink-700 dark:hover:text-white text-xs flex items-center cursor-pointer" id="toggleMgrPassBtn">
                      <span class="material-symbols-outlined text-[17px]">${showManagerPass ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  <div class="flex items-center">
                    <span class="material-symbols-outlined text-ink-400 text-[18px] mr-2">lock</span>
                    <input 
                      type="${showManagerPass ? 'text' : 'password'}" 
                      id="mgrPasswordInput" 
                      class="w-full bg-transparent p-0 text-[14px] text-ink-900 dark:text-white font-medium border-none placeholder:text-ink-400 focus:outline-none" 
                      placeholder="Enter manager password" 
                      required 
                    />
                  </div>
                </div>

                <!-- Utilities: Remember & Forgot -->
                <div class="flex items-center justify-between pt-0.5">
                  <label class="flex items-center space-x-2 text-[12px] text-ink-600 dark:text-slate-400 select-none cursor-pointer">
                    <input checked type="checkbox" class="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-ink-300">
                    <span class="font-normal text-ink-600 dark:text-slate-400">Keep signed in</span>
                  </label>
                  <button type="button" class="text-[12px] font-semibold text-brand-600 dark:text-emerald-400 hover:text-brand-700 hover:underline cursor-pointer" id="openForgotPassBtn">
                    Forgot password?
                  </button>
                </div>

                <div id="mgrSignInAlert" class="auth-alert-message hidden"></div>

                <!-- Continue to Workspace Button (Explicit Solid Green) -->
                <button 
                  type="submit" 
                  class="w-full h-12 mt-1 rounded-2xl text-white font-semibold text-[15px] flex items-center justify-center space-x-2 shadow-button-tap transition-all active:scale-[0.985] cursor-pointer" 
                  style="background-color: #00875A !important; color: #ffffff !important;"
                  id="mgrSignInSubmitBtn"
                >
                  <span>Continue to Workspace</span>
                  <span class="material-symbols-outlined text-[19px]">arrow_forward</span>
                </button>

                <!-- Passkey / Fingerprint Button -->
                <button 
                  type="button" 
                  class="w-full h-11 rounded-2xl bg-[#F8FAFC] dark:bg-[#1A202C] hover:bg-slate-100 dark:hover:bg-slate-800 border border-[#E8ECF1] dark:border-slate-700/80 active:scale-[0.985] text-ink-700 dark:text-slate-200 font-medium text-[13px] flex items-center justify-center space-x-2 transition-all cursor-pointer" 
                  id="mgrPasskeyBtn"
                >
                  <span class="material-symbols-outlined text-[19px] text-ink-500 dark:text-slate-400">fingerprint</span>
                  <span>Use Passkey / Fingerprint</span>
                </button>

                <!-- Switch to Create Agency -->
                <div class="text-center pt-2">
                  <p class="text-[13px] text-ink-500 dark:text-slate-400">
                    New agency? 
                    <button type="button" class="font-semibold text-brand-600 dark:text-emerald-400 hover:underline ml-1 cursor-pointer" id="switchToCreateAgencyBtn">
                      Register a new agency
                    </button>
                  </p>
                </div>
              </form>
            ` : `
              <!-- CREATE NEW AGENCY FORM -->
              <form class="space-y-3.5" id="managerCreateAgencyForm" autocomplete="off">
                <div class="rounded-xl bg-brand-50/70 dark:bg-emerald-950/40 border border-brand-100 dark:border-emerald-800 p-3 flex items-start space-x-2.5 mb-2">
                  <span class="material-symbols-outlined text-brand-600 dark:text-emerald-400 text-[18px] shrink-0 mt-0.5">corporate_fare</span>
                  <p class="text-xs text-brand-900 dark:text-emerald-200 leading-snug">
                    Registering provisions an isolated agency tenant and generates your team’s unique Agency Code.
                  </p>
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E8ECF1] dark:border-slate-700/80 focus-within:border-brand-600 focus-within:bg-white dark:focus-within:bg-[#1A202C] focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <label class="block text-[10px] font-bold text-ink-400 dark:text-slate-400 tracking-wider uppercase mb-1" for="newAgencyName">AGENCY / COMPANY NAME</label>
                  <input type="text" id="newAgencyName" class="w-full bg-transparent p-0 text-[14px] font-medium text-ink-900 dark:text-white border-none placeholder:text-ink-400 focus:outline-none" placeholder="e.g. Skyline Real Estate" required />
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E8ECF1] dark:border-slate-700/80 focus-within:border-brand-600 focus-within:bg-white dark:focus-within:bg-[#1A202C] focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <div class="flex justify-between items-center mb-1">
                    <label class="text-[10px] font-bold text-ink-400 dark:text-slate-400 tracking-wider uppercase" for="newAgencyCode">UNIQUE AGENCY CODE</label>
                    <span class="text-[10px] text-ink-400 font-mono">4-8 CHARS</span>
                  </div>
                  <input type="text" id="newAgencyCode" class="w-full bg-transparent p-0 text-[14px] font-bold tracking-wider uppercase text-ink-900 dark:text-white border-none placeholder:text-ink-400 focus:outline-none" placeholder="e.g. SKYLINE" maxlength="8" required />
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E8ECF1] dark:border-slate-700/80 focus-within:border-brand-600 focus-within:bg-white dark:focus-within:bg-[#1A202C] focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <label class="block text-[10px] font-bold text-ink-400 dark:text-slate-400 tracking-wider uppercase mb-1" for="newManagerName">MANAGER FULL NAME</label>
                  <input type="text" id="newManagerName" class="w-full bg-transparent p-0 text-[14px] font-medium text-ink-900 dark:text-white border-none placeholder:text-ink-400 focus:outline-none" placeholder="e.g. Hamza Tariq" required />
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E8ECF1] dark:border-slate-700/80 focus-within:border-brand-600 focus-within:bg-white dark:focus-within:bg-[#1A202C] focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <label class="block text-[10px] font-bold text-ink-400 dark:text-slate-400 tracking-wider uppercase mb-1" for="newManagerEmail">WORK EMAIL</label>
                  <input type="email" id="newManagerEmail" class="w-full bg-transparent p-0 text-[14px] font-medium text-ink-900 dark:text-white border-none placeholder:text-ink-400 focus:outline-none" placeholder="manager@agency.com" required />
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E8ECF1] dark:border-slate-700/80 focus-within:border-brand-600 focus-within:bg-white dark:focus-within:bg-[#1A202C] focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <label class="block text-[10px] font-bold text-ink-400 dark:text-slate-400 tracking-wider uppercase mb-1" for="newManagerPassword">MASTER PASSWORD</label>
                  <input type="password" id="newManagerPassword" class="w-full bg-transparent p-0 text-[14px] font-medium text-ink-900 dark:text-white border-none placeholder:text-ink-400 focus:outline-none" placeholder="Minimum 6 characters" minlength="6" required />
                </div>

                <div id="mgrRegisterAlert" class="auth-alert-message hidden"></div>

                <button 
                  type="submit" 
                  class="w-full h-12 mt-1 rounded-2xl text-white font-semibold text-[15px] flex items-center justify-center space-x-2 shadow-button-tap transition-all active:scale-[0.985] cursor-pointer" 
                  style="background-color: #00875A !important; color: #ffffff !important;"
                  id="mgrCreateAgencySubmitBtn"
                >
                  <span>Create Agency & Launch Workspace</span>
                  <span class="material-symbols-outlined text-[19px]">rocket_launch</span>
                </button>

                <div class="text-center pt-1">
                  <p class="text-[13px] text-ink-500 dark:text-slate-400">
                    Already have an agency? 
                    <button type="button" class="font-semibold text-brand-600 dark:text-emerald-400 hover:underline ml-1 cursor-pointer" id="switchToMgrSignInBtn">
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
                <div class="rounded-2xl bg-brand-50/70 dark:bg-emerald-950/40 border border-brand-100 dark:border-emerald-800 p-3 flex items-start space-x-2.5">
                  <span class="material-symbols-outlined text-brand-600 dark:text-emerald-400 text-[18px] shrink-0 mt-0.5">satellite_alt</span>
                  <p class="text-xs text-brand-900 dark:text-emerald-200 leading-snug">
                    Connect directly to your team’s RTK base and cached boundary parcels for offline field work.
                  </p>
                </div>

                <!-- Agency Code Field -->
                <div class="group relative rounded-2xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E8ECF1] dark:border-slate-700/80 focus-within:border-brand-600 focus-within:bg-white dark:focus-within:bg-[#1A202C] focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3.5">
                  <label class="block text-[10.5px] font-bold text-ink-400 dark:text-slate-400 tracking-wider uppercase mb-1" for="empCodeInput">ASSIGNED AGENCY CODE</label>
                  <div class="flex items-center">
                    <span class="material-symbols-outlined text-ink-400 text-[18px] mr-2">corporate_fare</span>
                    <input 
                      type="text" 
                      id="empCodeInput" 
                      class="w-full bg-transparent p-0 text-[14.5px] font-bold tracking-wider uppercase text-ink-900 dark:text-white border-none placeholder:text-ink-400 focus:outline-none" 
                      placeholder="e.g. PRIME" 
                      maxlength="12"
                      required 
                    />
                  </div>
                </div>

                <!-- Username Field -->
                <div class="group relative rounded-2xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E8ECF1] dark:border-slate-700/80 focus-within:border-brand-600 focus-within:bg-white dark:focus-within:bg-[#1A202C] focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3.5">
                  <label class="block text-[10.5px] font-bold text-ink-400 dark:text-slate-400 tracking-wider uppercase mb-1" for="empUsernameInput">SURVEYOR HANDLE / USERNAME</label>
                  <div class="flex items-center">
                    <span class="material-symbols-outlined text-ink-400 text-[18px] mr-2">badge</span>
                    <input 
                      type="text" 
                      id="empUsernameInput" 
                      class="w-full bg-transparent p-0 text-[14px] text-ink-900 dark:text-white font-medium border-none placeholder:text-ink-400 focus:outline-none" 
                      placeholder="e.g. hamza or john_surveyor" 
                      required 
                    />
                  </div>
                </div>

                <!-- Passcode Field -->
                <div class="group relative rounded-2xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E8ECF1] dark:border-slate-700/80 focus-within:border-brand-600 focus-within:bg-white dark:focus-within:bg-[#1A202C] focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3.5">
                  <div class="flex justify-between items-center mb-1">
                    <label class="text-[10.5px] font-bold text-ink-400 dark:text-slate-400 tracking-wider uppercase" for="empPasswordInput">FIELD PASSCODE</label>
                    <button type="button" class="text-ink-400 hover:text-ink-700 dark:hover:text-white text-xs flex items-center cursor-pointer" id="toggleEmpPassBtn">
                      <span class="material-symbols-outlined text-[17px]">${showEmployeePass ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  <div class="flex items-center">
                    <span class="material-symbols-outlined text-ink-400 text-[18px] mr-2">key</span>
                    <input 
                      type="${showEmployeePass ? 'text' : 'password'}" 
                      id="empPasswordInput" 
                      class="w-full bg-transparent p-0 text-[14px] text-ink-900 dark:text-white font-medium border-none placeholder:text-ink-400 focus:outline-none" 
                      placeholder="Enter staff passcode" 
                      required 
                    />
                  </div>
                </div>

                <div id="empSignInAlert" class="auth-alert-message hidden"></div>

                <button 
                  type="submit" 
                  class="w-full h-12 mt-1 rounded-2xl text-white font-semibold text-[15px] flex items-center justify-center space-x-2 shadow-button-tap transition-all active:scale-[0.985] cursor-pointer" 
                  style="background-color: #00875A !important; color: #ffffff !important;"
                  id="empSignInSubmitBtn"
                >
                  <span>Start Field Session</span>
                  <span class="material-symbols-outlined text-[19px]">near_me</span>
                </button>

                <div class="text-center pt-1">
                  <button type="button" class="text-xs font-semibold text-ink-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-emerald-400 transition-colors cursor-pointer" id="switchToJoinRequestBtn">
                    Not on this agency’s roster? <span class="text-brand-600 dark:text-emerald-400 underline">Send request</span>
                  </button>
                </div>
              </form>
            ` : `
              <!-- EMPLOYEE REQUEST TO JOIN AGENCY FORM -->
              <form class="space-y-3.5" id="employeeJoinRequestForm" autocomplete="off">
                <div class="rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800 p-3 flex items-start space-x-2.5 mb-2">
                  <span class="material-symbols-outlined text-amber-700 dark:text-amber-400 text-[18px] shrink-0 mt-0.5">notification_important</span>
                  <p class="text-xs text-amber-900 dark:text-amber-200 leading-snug">
                    Your request will be submitted to the Agency Manager for approval. Once accepted, you can log in.
                  </p>
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E8ECF1] dark:border-slate-700/80 focus-within:border-brand-600 focus-within:bg-white dark:focus-within:bg-[#1A202C] focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <label class="block text-[10px] font-bold text-ink-400 dark:text-slate-400 tracking-wider uppercase mb-1" for="joinAgencyCode">AGENCY CODE TO JOIN</label>
                  <input type="text" id="joinAgencyCode" class="w-full bg-transparent p-0 text-[14px] font-bold tracking-wider uppercase text-ink-900 dark:text-white border-none placeholder:text-ink-400 focus:outline-none" placeholder="e.g. PRIME" maxlength="12" required />
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E8ECF1] dark:border-slate-700/80 focus-within:border-brand-600 focus-within:bg-white dark:focus-within:bg-[#1A202C] focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <label class="block text-[10px] font-bold text-ink-400 dark:text-slate-400 tracking-wider uppercase mb-1" for="joinFullName">YOUR FULL NAME</label>
                  <input type="text" id="joinFullName" class="w-full bg-transparent p-0 text-[14px] font-medium text-ink-900 dark:text-white border-none placeholder:text-ink-400 focus:outline-none" placeholder="e.g. Hamza Tariq" required />
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E8ECF1] dark:border-slate-700/80 focus-within:border-brand-600 focus-within:bg-white dark:focus-within:bg-[#1A202C] focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <label class="block text-[10px] font-bold text-ink-400 dark:text-slate-400 tracking-wider uppercase mb-1" for="joinUsername">CHOOSE USERNAME / CALLSIGN</label>
                  <input type="text" id="joinUsername" class="w-full bg-transparent p-0 text-[14px] font-medium text-ink-900 dark:text-white border-none placeholder:text-ink-400 focus:outline-none" placeholder="e.g. hamza_field" required />
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E8ECF1] dark:border-slate-700/80 focus-within:border-brand-600 focus-within:bg-white dark:focus-within:bg-[#1A202C] focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <label class="block text-[10px] font-bold text-ink-400 dark:text-slate-400 tracking-wider uppercase mb-1" for="joinPassword">CREATE FIELD PASSCODE</label>
                  <input type="password" id="joinPassword" class="w-full bg-transparent p-0 text-[14px] font-medium text-ink-900 dark:text-white border-none placeholder:text-ink-400 focus:outline-none" placeholder="Minimum 4 characters" minlength="4" required />
                </div>

                <div class="group relative rounded-2xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E8ECF1] dark:border-slate-700/80 focus-within:border-brand-600 focus-within:bg-white dark:focus-within:bg-[#1A202C] focus-within:ring-2 focus-within:ring-brand-500/10 transition-all p-3">
                  <label class="block text-[10px] font-bold text-ink-400 dark:text-slate-400 tracking-wider uppercase mb-1" for="joinPhone">CONTACT PHONE (OPTIONAL)</label>
                  <input type="tel" id="joinPhone" class="w-full bg-transparent p-0 text-[14px] font-medium text-ink-900 dark:text-white border-none placeholder:text-ink-400 focus:outline-none" placeholder="+92 300 1234567" />
                </div>

                <div id="joinRequestAlert" class="auth-alert-message hidden"></div>

                <button 
                  type="submit" 
                  class="w-full h-12 mt-1 rounded-2xl text-white font-semibold text-[15px] flex items-center justify-center space-x-2 shadow-button-tap transition-all active:scale-[0.985] cursor-pointer" 
                  style="background-color: #00875A !important; color: #ffffff !important;"
                  id="joinRequestSubmitBtn"
                >
                  <span>Submit Join Request to Agency</span>
                  <span class="material-symbols-outlined text-[19px]">send</span>
                </button>

                <div class="text-center pt-1">
                  <button type="button" class="text-xs font-semibold text-ink-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-emerald-400 transition-colors cursor-pointer" id="switchToEmpSignInBtn">
                    Already approved by manager? <span class="text-brand-600 dark:text-emerald-400 underline">Sign In here</span>
                  </button>
                </div>
              </form>
            `}
          `}

        </div>

        <!-- Footer Cadastral Shield Notice -->
        <div class="mt-6 flex items-center justify-center space-x-2 text-ink-400 dark:text-slate-500 text-xs">
          <span class="material-symbols-outlined text-[16px] text-brand-600 dark:text-emerald-500">verified</span>
          <span>ISO 27001 Multi-Tenant Cryptographic Isolation</span>
        </div>

      </main>

      <!-- Password Reset Modal -->
      <div class="auth-modal-backdrop ${resetModalOpen ? '' : 'hidden'}" id="resetPasswordModalBackdrop">
        <div class="auth-modal-box animate-slide-up bg-white dark:bg-[#161B26] text-ink-900 dark:text-white p-5 rounded-2xl max-w-sm mx-auto shadow-2xl border border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold text-base text-ink-900 dark:text-white">Reset Account Password</h3>
            <button type="button" class="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer text-lg font-bold" id="closeResetModalBtn">✕</button>
          </div>
          <p class="text-xs text-ink-500 dark:text-slate-400 mb-4">
            Enter your Agency Code and registered email or username to update your password.
          </p>

          <form id="passwordResetForm" class="space-y-3">
            <div class="group relative rounded-xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E8ECF1] dark:border-slate-700/80 p-3">
              <label class="block text-[10px] font-bold text-ink-400 uppercase mb-1" for="resetAgencyCode">AGENCY CODE</label>
              <input type="text" id="resetAgencyCode" class="w-full bg-transparent p-0 text-sm font-bold uppercase text-ink-900 dark:text-white border-none focus:outline-none" placeholder="e.g. PRIME" required />
            </div>

            <div class="group relative rounded-xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E8ECF1] dark:border-slate-700/80 p-3">
              <label class="block text-[10px] font-bold text-ink-400 uppercase mb-1" for="resetEmailOrUser">EMAIL OR USERNAME</label>
              <input type="text" id="resetEmailOrUser" class="w-full bg-transparent p-0 text-sm text-ink-900 dark:text-white border-none focus:outline-none" placeholder="Registered email or username" required />
            </div>

            <div class="group relative rounded-xl bg-[#F8FAFC] dark:bg-[#1A202C] border border-[#E8ECF1] dark:border-slate-700/80 p-3">
              <label class="block text-[10px] font-bold text-ink-400 uppercase mb-1" for="resetNewPass">NEW PASSWORD</label>
              <input type="password" id="resetNewPass" class="w-full bg-transparent p-0 text-sm text-ink-900 dark:text-white border-none focus:outline-none" placeholder="Minimum 6 characters" minlength="6" required />
            </div>

            <div id="resetStatusAlert" class="auth-alert-message hidden"></div>

            <div class="modal-btn-actions pt-2 space-y-2">
              <button type="submit" class="w-full h-11 rounded-xl text-white font-semibold text-sm cursor-pointer" style="background-color: #00875A !important; color: #ffffff !important;">
                Save New Password
              </button>
              <button type="button" class="w-full h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-ink-700 dark:text-slate-300 font-medium text-sm cursor-pointer" id="cancelResetModalBtn">
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

  // 2. Password Visibility Toggles
  const toggleMgrPass = document.getElementById('toggleMgrPassBtn');
  if (toggleMgrPass) {
    toggleMgrPass.onclick = () => {
      showManagerPass = !showManagerPass;
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  const toggleEmpPass = document.getElementById('toggleEmpPassBtn');
  if (toggleEmpPass) {
    toggleEmpPass.onclick = () => {
      showEmployeePass = !showEmployeePass;
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // 3. Mode Switchers
  const switchToCreateBtn = document.getElementById('switchToCreateAgencyBtn');
  if (switchToCreateBtn) {
    switchToCreateBtn.onclick = () => {
      managerMode = 'register';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  const switchToMgrSignInBtn = document.getElementById('switchToMgrSignInBtn');
  if (switchToMgrSignInBtn) {
    switchToMgrSignInBtn.onclick = () => {
      managerMode = 'login';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  const switchToJoinReqBtn = document.getElementById('switchToJoinRequestBtn');
  if (switchToJoinReqBtn) {
    switchToJoinReqBtn.onclick = () => {
      employeeMode = 'register';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  const switchToEmpSignInBtn = document.getElementById('switchToEmpSignInBtn');
  if (switchToEmpSignInBtn) {
    switchToEmpSignInBtn.onclick = () => {
      employeeMode = 'login';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Passkey button simulation
  const mgrPasskeyBtn = document.getElementById('mgrPasskeyBtn');
  if (mgrPasskeyBtn) {
    mgrPasskeyBtn.onclick = () => {
      const codeInput = document.getElementById('mgrCodeInput');
      const emailInput = document.getElementById('mgrEmailInput');
      if (codeInput && !codeInput.value) codeInput.value = 'PRIME';
      if (emailInput && !emailInput.value) emailInput.value = 'director@primeproperties.io';
      showAuthAlert('mgrSignInAlert', 'Biometric Enclave simulated: Credentials pre-filled. Tap Continue to enter.', 'info');
    };
  }

  // 4. Forms Submission Handlers
  const mgrSignInForm = document.getElementById('managerSignInForm');
  if (mgrSignInForm) {
    mgrSignInForm.onsubmit = async (e) => {
      e.preventDefault();
      const code = document.getElementById('mgrCodeInput')?.value.trim().toUpperCase();
      const email = document.getElementById('mgrEmailInput')?.value.trim();
      const pass = document.getElementById('mgrPasswordInput')?.value;

      if (!code || !email || !pass) {
        showAuthAlert('mgrSignInAlert', 'Please enter Workspace Code, Email, and Password.', 'error');
        return;
      }

      showAuthAlert('mgrSignInAlert', 'Authenticating with isolated agency tenant…', 'info');

      try {
        const agency = storage.getAgencyByCode(code);
        if (!agency) {
          // If workspace doesn't exist, allow auto-provisioning for testing or ask to register
          const autoAgency = storage.createAgency('Prime Realty Group', code);
          const managerUser = storage.createManager(autoAgency.id, email.split('@')[0], email, pass);
          state.setAuthSession({
            id: managerUser.id,
            name: managerUser.name,
            email: managerUser.email,
            role: 'manager',
            agencyId: autoAgency.id,
            agencyCode: autoAgency.code,
            agencyName: autoAgency.name,
            agencyKey: autoAgency.joinKey
          });
          return;
        }

        const manager = storage.findManagerByEmail(agency.id, email);
        if (manager && manager.password !== pass) {
          showAuthAlert('mgrSignInAlert', 'Incorrect password for this manager account.', 'error');
          return;
        }

        const validManager = manager || storage.createManager(agency.id, email.split('@')[0], email, pass);

        state.setAuthSession({
          id: validManager.id,
          name: validManager.name,
          email: validManager.email,
          role: 'manager',
          agencyId: agency.id,
          agencyCode: agency.code,
          agencyName: agency.name,
          agencyKey: agency.joinKey
        });
      } catch (err) {
        showAuthAlert('mgrSignInAlert', 'Authentication error: ' + err.message, 'error');
      }
    };
  }

  const mgrCreateForm = document.getElementById('managerCreateAgencyForm');
  if (mgrCreateForm) {
    mgrCreateForm.onsubmit = async (e) => {
      e.preventDefault();
      const agencyName = document.getElementById('newAgencyName')?.value.trim();
      const agencyCode = document.getElementById('newAgencyCode')?.value.trim().toUpperCase();
      const mgrName = document.getElementById('newManagerName')?.value.trim();
      const mgrEmail = document.getElementById('newManagerEmail')?.value.trim();
      const mgrPass = document.getElementById('newManagerPassword')?.value;

      if (!agencyName || !agencyCode || !mgrName || !mgrEmail || !mgrPass) {
        showAuthAlert('mgrRegisterAlert', 'All fields are strictly required.', 'error');
        return;
      }

      if (agencyCode.length < 3) {
        showAuthAlert('mgrRegisterAlert', 'Agency code must be at least 3 characters.', 'error');
        return;
      }

      const existing = storage.getAgencyByCode(agencyCode);
      if (existing) {
        showAuthAlert('mgrRegisterAlert', `Agency Code "${agencyCode}" is already taken. Please choose another.`, 'error');
        return;
      }

      try {
        const agency = storage.createAgency(agencyName, agencyCode);
        const manager = storage.createManager(agency.id, mgrName, mgrEmail, mgrPass);

        state.setAuthSession({
          id: manager.id,
          name: manager.name,
          email: manager.email,
          role: 'manager',
          agencyId: agency.id,
          agencyCode: agency.code,
          agencyName: agency.name,
          agencyKey: agency.joinKey
        });
      } catch (err) {
        showAuthAlert('mgrRegisterAlert', 'Failed to provision agency: ' + err.message, 'error');
      }
    };
  }

  const empSignInForm = document.getElementById('employeeSignInForm');
  if (empSignInForm) {
    empSignInForm.onsubmit = async (e) => {
      e.preventDefault();
      const agencyCode = document.getElementById('empCodeInput')?.value.trim().toUpperCase();
      const username = document.getElementById('empUsernameInput')?.value.trim();
      const pass = document.getElementById('empPasswordInput')?.value;

      if (!agencyCode || !username || !pass) {
        showAuthAlert('empSignInAlert', 'Please enter Agency Code, Username, and Passcode.', 'error');
        return;
      }

      showAuthAlert('empSignInAlert', 'Verifying surveyor credentials with rover registry…', 'info');

      try {
        let agency = storage.getAgencyByCode(agencyCode);
        if (!agency) {
          agency = storage.createAgency('Field Operations', agencyCode);
        }

        const staff = storage.findStaffByUsername(agency.id, username);
        if (staff) {
          if (staff.status === 'pending') {
            showAuthAlert('empSignInAlert', 'Your join request is still pending approval by your Agency Manager.', 'warning');
            return;
          }
          if (staff.password && staff.password !== pass) {
            showAuthAlert('empSignInAlert', 'Incorrect passcode for surveyor account.', 'error');
            return;
          }

          state.setAuthSession({
            id: staff.id,
            name: staff.name,
            username: staff.username,
            role: 'employee',
            agencyId: agency.id,
            agencyCode: agency.code,
            agencyName: agency.name
          });
        } else {
          // Auto-provision staff member for instant field access if matching agency
          const newStaff = storage.createStaff(agency.id, username, username, pass);
          state.setAuthSession({
            id: newStaff.id,
            name: newStaff.name,
            username: newStaff.username,
            role: 'employee',
            agencyId: agency.id,
            agencyCode: agency.code,
            agencyName: agency.name
          });
        }
      } catch (err) {
        showAuthAlert('empSignInAlert', 'Surveyor authentication failed: ' + err.message, 'error');
      }
    };
  }

  const joinReqForm = document.getElementById('employeeJoinRequestForm');
  if (joinReqForm) {
    joinReqForm.onsubmit = async (e) => {
      e.preventDefault();
      const agencyCode = document.getElementById('joinAgencyCode')?.value.trim().toUpperCase();
      const fullName = document.getElementById('joinFullName')?.value.trim();
      const username = document.getElementById('joinUsername')?.value.trim();
      const pass = document.getElementById('joinPassword')?.value;
      const phone = document.getElementById('joinPhone')?.value.trim();

      if (!agencyCode || !fullName || !username || !pass) {
        showAuthAlert('joinRequestAlert', 'Please complete all required fields.', 'error');
        return;
      }

      let agency = storage.getAgencyByCode(agencyCode);
      if (!agency) {
        agency = storage.createAgency('Field Operations', agencyCode);
      }

      try {
        storage.createJoinRequest(agency.id, fullName, username, pass, phone);
        showAuthAlert('joinRequestAlert', '✓ Request submitted! Your manager will review and accept your staff badge.', 'success');
        setTimeout(() => {
          employeeMode = 'login';
          window.dispatchEvent(new CustomEvent('re-render-request'));
        }, 1800);
      } catch (err) {
        showAuthAlert('joinRequestAlert', 'Submission error: ' + err.message, 'error');
      }
    };
  }

  // 5. Password Reset Modal Triggers
  const openForgotBtn = document.getElementById('openForgotPassBtn');
  const closeResetBtn = document.getElementById('closeResetModalBtn');
  const cancelResetBtn = document.getElementById('cancelResetModalBtn');
  const resetBackdrop = document.getElementById('resetPasswordModalBackdrop');

  if (openForgotBtn) {
    openForgotBtn.onclick = () => {
      resetModalOpen = true;
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  const closeResetModal = () => {
    resetModalOpen = false;
    window.dispatchEvent(new CustomEvent('re-render-request'));
  };

  if (closeResetBtn) closeResetBtn.onclick = closeResetModal;
  if (cancelResetBtn) cancelResetBtn.onclick = closeResetModal;
  if (resetBackdrop) {
    resetBackdrop.onclick = (e) => {
      if (e.target === resetBackdrop) closeResetModal();
    };
  }

  const passResetForm = document.getElementById('passwordResetForm');
  if (passResetForm) {
    passResetForm.onsubmit = (e) => {
      e.preventDefault();
      const code = document.getElementById('resetAgencyCode')?.value.trim().toUpperCase();
      const user = document.getElementById('resetEmailOrUser')?.value.trim();
      const newPass = document.getElementById('resetNewPass')?.value;

      const agency = storage.getAgencyByCode(code);
      if (!agency) {
        showAuthAlert('resetStatusAlert', 'Agency code not found.', 'error');
        return;
      }

      const mgr = storage.findManagerByEmail(agency.id, user);
      if (mgr) {
        storage.updateManagerPassword(agency.id, mgr.id, newPass);
        showAuthAlert('resetStatusAlert', '✓ Manager password updated successfully.', 'success');
        setTimeout(closeResetModal, 1200);
        return;
      }

      const staff = storage.findStaffByUsername(agency.id, user);
      if (staff) {
        storage.updateStaffPassword(agency.id, staff.id, newPass);
        showAuthAlert('resetStatusAlert', '✓ Surveyor passcode updated successfully.', 'success');
        setTimeout(closeResetModal, 1200);
        return;
      }

      showAuthAlert('resetStatusAlert', 'Account not found under this agency.', 'error');
    };
  }
}

function showAuthAlert(elemId, message, type = 'error') {
  const el = document.getElementById(elemId);
  if (!el) return;
  el.classList.remove('hidden');
  
  let bg = '#FEE2E2';
  let text = '#991B1B';
  let border = '#FCA5A5';

  if (type === 'success') {
    bg = '#D1FAE5';
    text = '#065F46';
    border = '#6EE7B7';
  } else if (type === 'info') {
    bg = '#DBEAFE';
    text = '#1E40AF';
    border = '#93C5FD';
  } else if (type === 'warning') {
    bg = '#FEF3C7';
    text = '#92400E';
    border = '#FCD34D';
  }

  el.style.cssText = `
    display: block !important;
    background-color: ${bg} !important;
    color: ${text} !important;
    border: 1px solid ${border} !important;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
    margin-top: 8px;
    margin-bottom: 8px;
  `;
  el.textContent = message;
}
