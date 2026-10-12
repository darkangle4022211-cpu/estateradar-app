// Clean, Dedicated Enterprise Mobile Authentication & Manager Onboarding Screen
import { state } from '../state.js';

let activeAuthTab = 'manager'; // 'manager' | 'surveyor'
let managerMode = 'register'; // 'register' | 'login'

export function renderLoginScreen() {
  const { auth, employees, company } = state;
  const currentSurveyor = auth.currentUser || employees[0] || { username: 'surveyor01', password: 'Pass@2026' };
  const currentCompanyCode = company?.company_code || 'PRIME';

  return `
    <div class="mobile-login-viewport animate-fade-in">
      
      <!-- Top Brand Header -->
      <div class="login-brand-header">
        <div class="brand-shield-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.4">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <polyline points="9 12 11 14 15 10"></polyline>
          </svg>
        </div>
        <h2 class="login-brand-title">EstateRadar</h2>
        <p class="login-sub-text">Mobile Workforce & Property Survey Radar</p>
      </div>

      <!-- Main Login Card -->
      <div class="login-card">

        <!-- Role Selector Segmented Bar -->
        <div class="auth-role-tabs">
          <button type="button" class="auth-role-tab ${activeAuthTab === 'manager' ? 'active' : ''}" id="tabSelectManager">
            🏢 Agency Manager
          </button>
          <button type="button" class="auth-role-tab ${activeAuthTab === 'surveyor' ? 'active' : ''}" id="tabSelectSurveyor">
            👷 Field Surveyor
          </button>
        </div>

        ${activeAuthTab === 'manager' ? `
          <!-- ================= TAB: AGENCY MANAGER ================= -->
          <div class="agency-mode-toggle">
            <button type="button" class="mode-toggle-btn ${managerMode === 'register' ? 'active' : ''}" id="modeManagerRegister">
              + Register New Agency
            </button>
            <button type="button" class="mode-toggle-btn ${managerMode === 'login' ? 'active' : ''}" id="modeManagerLogin">
              Manager Sign In
            </button>
          </div>

          ${managerMode === 'register' ? `
            <!-- MANAGER REGISTRATION FORM (DEFAULT) -->
            <div class="card-intro-row">
              <div>
                <h3>Create Agency Workspace</h3>
                <span class="text-dim">Register as Manager to start tracking field staff</span>
              </div>
              <span class="auth-mode-pill">New Tenant</span>
            </div>

            <form class="login-form-body" id="managerRegisterForm">
              <div class="login-field-group">
                <label class="field-label" for="regCompanyName">Real Estate Agency / Company Name</label>
                <div class="input-icon-wrap">
                  <span class="field-glyph">🏢</span>
                  <input 
                    type="text" 
                    id="regCompanyName" 
                    class="login-text-input" 
                    placeholder="e.g. Apex Real Estate" 
                    required 
                  />
                </div>
              </div>

              <div class="login-field-group">
                <label class="field-label" for="regCompanyCode">Choose Agency Code (Short Identifier)</label>
                <div class="input-icon-wrap">
                  <span class="field-glyph">🏷️</span>
                  <input 
                    type="text" 
                    id="regCompanyCode" 
                    class="login-text-input uppercase" 
                    placeholder="e.g. APEX" 
                    maxlength="8" 
                    required 
                  />
                </div>
                <span class="field-hint">Your field surveyors will enter this code to log into your agency on their phones.</span>
              </div>

              <div class="login-field-group">
                <label class="field-label" for="regManagerName">Manager Full Name</label>
                <div class="input-icon-wrap">
                  <span class="field-glyph">👤</span>
                  <input 
                    type="text" 
                    id="regManagerName" 
                    class="login-text-input" 
                    placeholder="e.g. Alex Morgan" 
                    required 
                  />
                </div>
              </div>

              <div class="login-field-group">
                <label class="field-label" for="regEmail">Manager Email Address</label>
                <div class="input-icon-wrap">
                  <span class="field-glyph">✉️</span>
                  <input 
                    type="email" 
                    id="regEmail" 
                    class="login-text-input" 
                    placeholder="manager@agency.com" 
                    required 
                  />
                </div>
              </div>

              <div class="login-field-group">
                <label class="field-label" for="regPassword">Manager Password</label>
                <div class="input-icon-wrap">
                  <span class="field-glyph">🔒</span>
                  <input 
                    type="password" 
                    id="regPassword" 
                    class="login-text-input" 
                    placeholder="Minimum 6 characters" 
                    required 
                  />
                </div>
              </div>

              <div id="managerRegisterError" class="login-error-alert hidden"></div>

              <button type="submit" class="btn btn-primary btn-full login-submit-btn" id="regSubmitBtn">
                🚀 Register Agency & Open App
              </button>

              <div class="auth-switch-link-row">
                <span>Already have an agency?</span>
                <button type="button" class="plain-action-link" id="switchMgrLoginBtn">Sign In here</button>
              </div>
            </form>
          ` : `
            <!-- MANAGER LOGIN FORM -->
            <div class="card-intro-row">
              <div>
                <h3>Manager Sign In</h3>
                <span class="text-dim">Enter your Agency Code and Manager credentials</span>
              </div>
              <span class="auth-mode-pill">Cloud Isolated</span>
            </div>

            <form class="login-form-body" id="managerLoginForm">
              <div class="login-field-group">
                <label class="field-label" for="mgrCompanyCode">Agency Code</label>
                <div class="input-icon-wrap">
                  <span class="field-glyph">🏢</span>
                  <input 
                    type="text" 
                    id="mgrCompanyCode" 
                    class="login-text-input uppercase" 
                    placeholder="e.g. PRIME" 
                    value="${currentCompanyCode}" 
                    required 
                  />
                </div>
              </div>

              <div class="login-field-group">
                <label class="field-label" for="mgrEmail">Manager Email</label>
                <div class="input-icon-wrap">
                  <span class="field-glyph">✉️</span>
                  <input 
                    type="email" 
                    id="mgrEmail" 
                    class="login-text-input" 
                    placeholder="manager@agency.com" 
                    value="manager@estateradar.com" 
                    required 
                  />
                </div>
              </div>

              <div class="login-field-group">
                <label class="field-label" for="mgrPassword">Manager Password</label>
                <div class="input-icon-wrap">
                  <span class="field-glyph">🔒</span>
                  <input 
                    type="password" 
                    id="mgrPassword" 
                    class="login-text-input" 
                    placeholder="Enter password" 
                    value="Admin@2026" 
                    required 
                  />
                </div>
              </div>

              <div id="managerLoginError" class="login-error-alert hidden"></div>

              <button type="submit" class="btn btn-primary btn-full login-submit-btn" id="mgrLoginSubmitBtn">
                Sign In & Launch App
              </button>

              <div class="auth-switch-link-row">
                <span>Need a new workspace?</span>
                <button type="button" class="plain-action-link" id="switchMgrRegisterBtn">+ Register New Agency</button>
              </div>
            </form>
          `}
        ` : `
          <!-- ================= TAB: SURVEYOR LOGIN ================= -->
          <div class="card-intro-row">
            <div>
              <h3>Surveyor Sign In</h3>
              <span class="text-dim">Agency Code + Staff Credentials</span>
            </div>
            <span class="auth-mode-pill">Biometrics Ready</span>
          </div>

          <form class="login-form-body" id="surveyorLoginForm">
            <div class="login-field-group">
              <label class="field-label" for="loginCompanyCode">Agency Code</label>
              <div class="input-icon-wrap">
                <span class="field-glyph">🏢</span>
                <input 
                  type="text" 
                  id="loginCompanyCode" 
                  class="login-text-input uppercase" 
                  placeholder="e.g. PRIME" 
                  value="${currentCompanyCode}" 
                  required 
                />
              </div>
            </div>

            <div class="login-field-group">
              <label class="field-label" for="loginUsername">Staff ID / Username</label>
              <div class="input-icon-wrap">
                <span class="field-glyph">👤</span>
                <input 
                  type="text" 
                  id="loginUsername" 
                  class="login-text-input" 
                  placeholder="e.g. surveyor01" 
                  value="${currentSurveyor.username || 'surveyor01'}" 
                  required 
                />
              </div>
            </div>

            <div class="login-field-group">
              <div class="label-with-action">
                <label class="field-label" for="loginPassword">Password</label>
                <button type="button" class="forgot-pass-link" id="openForgotPassBtn">
                  Forgot?
                </button>
              </div>
              <div class="input-icon-wrap">
                <span class="field-glyph">🔒</span>
                <input 
                  type="password" 
                  id="loginPassword" 
                  class="login-text-input" 
                  placeholder="Enter password" 
                  value="${currentSurveyor.password || 'Pass@2026'}" 
                  required 
                />
              </div>
            </div>

            <div id="surveyorLoginError" class="login-error-alert hidden"></div>

            <button type="submit" class="btn btn-primary btn-full login-submit-btn" id="surveyorLoginSubmitBtn">
              Sign In to Agency
            </button>
          </form>

          <div class="auth-divider">
            <span>OR 1-TAP BIOMETRIC UNLOCK</span>
          </div>

          <div class="biometric-action-box">
            <button type="button" class="biometric-fingerprint-btn" id="biometricLoginBtn">
              <div class="fingerprint-sensor-icon">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"></path>
                  <path d="M14 13.12c0 2.38 0 6.38-1 8.88"></path>
                  <path d="M2 12a10 10 0 0 1 18-6"></path>
                  <path d="M2 16a7.98 7.98 0 0 0 6 2.69"></path>
                  <path d="M22 12c0 5.52-4.48 10-10 10a9.98 9.98 0 0 1-5-1.35"></path>
                  <path d="M9 10a3 3 0 0 1 6 0c0 1.95-.5 3.5-1 5"></path>
                  <path d="M7 11.5A5 5 0 0 1 17 9"></path>
                </svg>
              </div>
              <div class="biometric-btn-text">
                <strong>Touch Fingerprint Sensor</strong>
                <span>Instant Verified Biometric Access</span>
              </div>
            </button>
          </div>

          <!-- Quick Test Agency Staff -->
          <div class="demo-switch-bar">
            <span class="demo-label">Demo Staff:</span>
            <div class="demo-pills-row">
              ${employees.slice(0, 3).map(emp => `
                <button type="button" class="demo-emp-pill ${emp.id === currentSurveyor.id ? 'active' : ''}" data-emp-id="${emp.id}">
                  ${emp.name}
                </button>
              `).join('')}
            </div>
          </div>
        `}

      </div>

      <!-- Forgot Password Modal -->
      <div class="modal-overlay ${auth.isForgotPasswordModalOpen ? '' : 'hidden'}" id="forgotPasswordModal">
        <div class="modal-container forgot-password-card">
          <div class="modal-header-simple">
            <h4>Request Admin Password Reset</h4>
            <button class="close-modal-icon" id="closeForgotPassModalBtn">✕</button>
          </div>

          <div class="forgot-modal-content">
            <p class="forgot-help-text">
              Credentials are administered by your agency manager. Submitting this sends an alert to your company's live Radar.
            </p>

            <form id="forgotPasswordForm">
              <div class="form-group">
                <label class="input-label">Staff Username or Mobile Number</label>
                <input 
                  type="text" 
                  id="resetUsernameInput" 
                  class="text-input" 
                  placeholder="e.g. surveyor01 or +92 300 1122334" 
                  value="${currentSurveyor.username || ''}" 
                  required 
                />
              </div>

              <div id="forgotPassStatus" class="status-msg-box hidden"></div>

              <div class="modal-actions-footer">
                <button type="button" class="btn btn-secondary" id="cancelForgotPassBtn">Cancel</button>
                <button type="submit" class="btn btn-primary" id="sendResetReqBtn">Send Alert to Manager</button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  `;
}

export function bindLoginScreenEvents() {
  // Tab Switchers
  const tabSurveyor = document.getElementById('tabSelectSurveyor');
  const tabManager = document.getElementById('tabSelectManager');
  const modeLogin = document.getElementById('modeManagerLogin');
  const modeRegister = document.getElementById('modeManagerRegister');
  const switchMgrLoginBtn = document.getElementById('switchMgrLoginBtn');
  const switchMgrRegisterBtn = document.getElementById('switchMgrRegisterBtn');

  if (tabSurveyor) {
    tabSurveyor.onclick = () => {
      activeAuthTab = 'surveyor';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  if (tabManager) {
    tabManager.onclick = () => {
      activeAuthTab = 'manager';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  if (modeLogin) {
    modeLogin.onclick = () => {
      managerMode = 'login';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  if (modeRegister) {
    modeRegister.onclick = () => {
      managerMode = 'register';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  if (switchMgrLoginBtn) {
    switchMgrLoginBtn.onclick = () => {
      managerMode = 'login';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  if (switchMgrRegisterBtn) {
    switchMgrRegisterBtn.onclick = () => {
      managerMode = 'register';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // Surveyor Login Form
  const surveyorForm = document.getElementById('surveyorLoginForm');
  if (surveyorForm) {
    surveyorForm.onsubmit = async (e) => {
      e.preventDefault();
      const code = document.getElementById('loginCompanyCode').value.trim();
      const user = document.getElementById('loginUsername').value.trim();
      const pass = document.getElementById('loginPassword').value.trim();
      const errBox = document.getElementById('surveyorLoginError');
      const submitBtn = document.getElementById('surveyorLoginSubmitBtn');

      if (submitBtn) submitBtn.disabled = true;
      if (errBox) errBox.classList.add('hidden');

      const res = await state.loginAsSurveyor(code, user, pass);
      if (submitBtn) submitBtn.disabled = false;

      if (!res.success) {
        if (errBox) {
          errBox.innerText = res.error || 'Invalid credentials.';
          errBox.classList.remove('hidden');
        }
      } else {
        window.dispatchEvent(new CustomEvent('re-render-request'));
      }
    };
  }

  // Manager Login Form
  const mgrForm = document.getElementById('managerLoginForm');
  if (mgrForm) {
    mgrForm.onsubmit = async (e) => {
      e.preventDefault();
      const code = document.getElementById('mgrCompanyCode').value.trim();
      const email = document.getElementById('mgrEmail').value.trim();
      const pass = document.getElementById('mgrPassword').value.trim();
      const errBox = document.getElementById('managerLoginError');
      const submitBtn = document.getElementById('mgrLoginSubmitBtn');

      if (submitBtn) submitBtn.disabled = true;
      if (errBox) errBox.classList.add('hidden');

      const res = await state.loginAsManager(code, email, pass);
      if (submitBtn) submitBtn.disabled = false;

      if (!res.success) {
        if (errBox) {
          errBox.innerText = res.error || 'Failed to sign in as manager.';
          errBox.classList.remove('hidden');
        }
      } else {
        window.dispatchEvent(new CustomEvent('re-render-request'));
      }
    };
  }

  // Manager Register Form (Primary User Goal)
  const regForm = document.getElementById('managerRegisterForm');
  if (regForm) {
    regForm.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('regCompanyName').value.trim();
      const code = document.getElementById('regCompanyCode').value.trim().toUpperCase();
      const mgrName = document.getElementById('regManagerName')?.value.trim() || 'Agency Manager';
      const email = document.getElementById('regEmail').value.trim();
      const pass = document.getElementById('regPassword').value.trim();
      const errBox = document.getElementById('managerRegisterError');
      const submitBtn = document.getElementById('regSubmitBtn');

      if (!name || !code || !email || !pass) {
        if (errBox) {
          errBox.innerText = 'Please complete all required fields.';
          errBox.classList.remove('hidden');
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Creating Workspace...';
      }
      if (errBox) errBox.classList.add('hidden');

      const res = await state.registerNewCompany(name, code, email, pass, mgrName);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = '🚀 Register Agency & Open App';
      }

      if (!res.success) {
        if (errBox) {
          errBox.innerText = res.error || 'Could not complete registration.';
          errBox.classList.remove('hidden');
        }
      } else {
        window.dispatchEvent(new CustomEvent('re-render-request'));
      }
    };
  }

  // Demo Staff Pill select
  document.querySelectorAll('.demo-emp-pill').forEach(pill => {
    pill.onclick = () => {
      const empId = pill.getAttribute('data-emp-id');
      const emp = state.employees.find(e => e.id === empId);
      if (emp) {
        const uInput = document.getElementById('loginUsername');
        const pInput = document.getElementById('loginPassword');
        if (uInput) uInput.value = emp.username || emp.id;
        if (pInput) pInput.value = emp.password || 'Pass@2026';
        document.querySelectorAll('.demo-emp-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      }
    };
  });

  // Biometric Unlock
  const biometricBtn = document.getElementById('biometricLoginBtn');
  if (biometricBtn) {
    biometricBtn.onclick = () => {
      biometricBtn.classList.add('scanning');
      setTimeout(() => {
        state.loginWithBiometrics();
        window.dispatchEvent(new CustomEvent('re-render-request'));
      }, 350);
    };
  }

  // Forgot Password Modal
  const openForgotBtn = document.getElementById('openForgotPassBtn');
  const closeForgotBtn = document.getElementById('closeForgotPassModalBtn');
  const cancelForgotBtn = document.getElementById('cancelForgotPassBtn');
  const forgotForm = document.getElementById('forgotPasswordForm');

  if (openForgotBtn) {
    openForgotBtn.onclick = () => {
      state.openForgotPasswordModal(true);
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  const closeForgotHandler = () => {
    state.openForgotPasswordModal(false);
    window.dispatchEvent(new CustomEvent('re-render-request'));
  };

  if (closeForgotBtn) closeForgotBtn.onclick = closeForgotHandler;
  if (cancelForgotBtn) cancelForgotBtn.onclick = closeForgotHandler;

  if (forgotForm) {
    forgotForm.onsubmit = (e) => {
      e.preventDefault();
      const statusBox = document.getElementById('forgotPassStatus');
      const val = document.getElementById('resetUsernameInput').value.trim();
      state.requestPasswordReset(val);
      if (statusBox) {
        statusBox.innerText = `Alert dispatched to Agency Manager for "${val}". Temporary access password will be issued.`;
        statusBox.classList.remove('hidden');
      }
      setTimeout(() => {
        closeForgotHandler();
      }, 1800);
    };
  }
}
