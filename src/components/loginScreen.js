// EstateRadar — Clean, Human-Designed Mobile Authentication & Onboarding
// Material 3 compliant — Zero Dummy Data — No Auto-fill Bugs — High Contrast UI
import { state } from '../state.js';
import { storage } from '../services/storage.js';

let activeRoleTab = 'manager'; // 'manager' | 'employee'
let managerMode = 'login'; // 'login' | 'register'
let employeeMode = 'login'; // 'login' | 'register'
let resetModalOpen = false;

export function renderLoginScreen() {
  return `
    <div class="auth-viewport animate-fade-in">
      
      <!-- Top Brand Header -->
      <div class="auth-brand-block">
        <div class="auth-brand-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <polyline points="9 12 11 14 15 10"></polyline>
          </svg>
        </div>
        <h1 class="auth-brand-name">EstateRadar</h1>
        <p class="auth-brand-tagline">Workforce & Property Survey Radar</p>
      </div>

      <!-- Main Clean Card -->
      <div class="auth-main-card">
        
        <!-- Primary Role Selector (Manager vs Employee) -->
        <div class="auth-role-segmented-box" role="tablist">
          <button 
            type="button" 
            class="role-segment-btn ${activeRoleTab === 'manager' ? 'active' : ''}" 
            id="authRoleManagerBtn"
            role="tab"
            aria-selected="${activeRoleTab === 'manager'}"
          >
            <span class="role-btn-icon">🏢</span>
            <span>Agency Manager</span>
          </button>
          
          <button 
            type="button" 
            class="role-segment-btn ${activeRoleTab === 'employee' ? 'active' : ''}" 
            id="authRoleEmployeeBtn"
            role="tab"
            aria-selected="${activeRoleTab === 'employee'}"
          >
            <span class="role-btn-icon">👷</span>
            <span>Field Employee</span>
          </button>
        </div>

        ${activeRoleTab === 'manager' ? `
          <!-- ================= MANAGER PANEL ================= -->
          <div class="auth-sub-nav">
            <button type="button" class="sub-nav-btn ${managerMode === 'login' ? 'active' : ''}" id="mgrSubTabLogin">
              Sign In
            </button>
            <button type="button" class="sub-nav-btn ${managerMode === 'register' ? 'active' : ''}" id="mgrSubTabRegister">
              + Create Agency
            </button>
          </div>

          ${managerMode === 'login' ? `
            <!-- MANAGER SIGN IN FORM -->
            <form id="managerSignInForm" class="auth-form-flow" autocomplete="off">
              <div class="form-input-block">
                <label class="form-label" for="mgrCodeInput">Agency Code</label>
                <input 
                  type="text" 
                  id="mgrCodeInput" 
                  class="clean-input uppercase-text" 
                  placeholder="e.g. SKYLINE" 
                  maxlength="12"
                  autocomplete="off"
                  required 
                />
              </div>

              <div class="form-input-block">
                <label class="form-label" for="mgrEmailInput">Manager Email</label>
                <input 
                  type="email" 
                  id="mgrEmailInput" 
                  class="clean-input" 
                  placeholder="name@agency.com" 
                  autocomplete="off"
                  required 
                />
              </div>

              <div class="form-input-block">
                <div class="form-label-row">
                  <label class="form-label" for="mgrPasswordInput">Password</label>
                  <button type="button" class="text-link-btn" id="openForgotPassBtn">Forgot password?</button>
                </div>
                <input 
                  type="password" 
                  id="mgrPasswordInput" 
                  class="clean-input" 
                  placeholder="Enter your password" 
                  autocomplete="current-password"
                  required 
                />
              </div>

              <div id="mgrSignInAlert" class="auth-alert-message hidden"></div>

              <button type="submit" class="btn btn-primary btn-full submit-cta-btn" id="mgrSignInSubmitBtn">
                Sign In as Manager
              </button>

              <div class="auth-bottom-switch-row">
                <span class="switch-helper-text">Don't have an agency workspace yet?</span>
                <button type="button" class="switch-action-btn" id="switchToCreateAgencyBtn">
                  Create New Agency
                </button>
              </div>
            </form>
          ` : `
            <!-- CREATE NEW AGENCY FORM -->
            <form id="managerCreateAgencyForm" class="auth-form-flow" autocomplete="off">
              <div class="form-input-block">
                <label class="form-label" for="newAgencyName">Agency / Company Name</label>
                <input 
                  type="text" 
                  id="newAgencyName" 
                  class="clean-input" 
                  placeholder="e.g. Skyline Real Estate" 
                  autocomplete="off"
                  required 
                />
              </div>

              <div class="form-input-block">
                <label class="form-label" for="newAgencyCode">Choose Unique Agency Code</label>
                <input 
                  type="text" 
                  id="newAgencyCode" 
                  class="clean-input uppercase-text" 
                  placeholder="e.g. SKYLINE" 
                  maxlength="8"
                  autocomplete="off"
                  required 
                />
                <span class="input-help-caption">Your field surveyors will use this short code to log in.</span>
              </div>

              <div class="form-input-block">
                <label class="form-label" for="newManagerName">Manager Full Name</label>
                <input 
                  type="text" 
                  id="newManagerName" 
                  class="clean-input" 
                  placeholder="e.g. Alex Morgan" 
                  autocomplete="off"
                  required 
                />
              </div>

              <div class="form-input-block">
                <label class="form-label" for="newManagerEmail">Manager Email</label>
                <input 
                  type="email" 
                  id="newManagerEmail" 
                  class="clean-input" 
                  placeholder="manager@agency.com" 
                  autocomplete="off"
                  required 
                />
              </div>

              <div class="form-input-block">
                <label class="form-label" for="newManagerPassword">Manager Password</label>
                <input 
                  type="password" 
                  id="newManagerPassword" 
                  class="clean-input" 
                  placeholder="Minimum 6 characters" 
                  minlength="6"
                  autocomplete="new-password"
                  required 
                />
              </div>

              <div id="mgrRegisterAlert" class="auth-alert-message hidden"></div>

              <button type="submit" class="btn btn-primary btn-full submit-cta-btn" id="mgrCreateAgencySubmitBtn">
                Create Agency & Launch
              </button>

              <div class="auth-bottom-switch-row">
                <span class="switch-helper-text">Already have an agency?</span>
                <button type="button" class="switch-action-btn" id="switchToMgrSignInBtn">
                  Sign In here
                </button>
              </div>
            </form>
          `}
        ` : `
          <!-- ================= EMPLOYEE PANEL ================= -->
          <div class="auth-sub-nav">
            <button type="button" class="sub-nav-btn ${employeeMode === 'login' ? 'active' : ''}" id="empSubTabLogin">
              Sign In
            </button>
            <button type="button" class="sub-nav-btn ${employeeMode === 'register' ? 'active' : ''}" id="empSubTabRegister">
              Request to Join Agency
            </button>
          </div>

          ${employeeMode === 'login' ? `
            <!-- EMPLOYEE SIGN IN FORM -->
            <form id="employeeSignInForm" class="auth-form-flow" autocomplete="off">
              <div class="form-input-block">
                <label class="form-label" for="empCodeInput">Agency Code</label>
                <input 
                  type="text" 
                  id="empCodeInput" 
                  class="clean-input uppercase-text" 
                  placeholder="e.g. SKYLINE" 
                  maxlength="12"
                  autocomplete="off"
                  required 
                />
              </div>

              <div class="form-input-block">
                <label class="form-label" for="empUsernameInput">Staff Username or Email</label>
                <input 
                  type="text" 
                  id="empUsernameInput" 
                  class="clean-input" 
                  placeholder="e.g. hamza or staff@agency.com" 
                  autocomplete="off"
                  required 
                />
              </div>

              <div class="form-input-block">
                <div class="form-label-row">
                  <label class="form-label" for="empPasswordInput">Password</label>
                  <button type="button" class="text-link-btn" id="openForgotPassBtn2">Forgot password?</button>
                </div>
                <input 
                  type="password" 
                  id="empPasswordInput" 
                  class="clean-input" 
                  placeholder="Enter staff password" 
                  autocomplete="current-password"
                  required 
                />
              </div>

              <div id="empSignInAlert" class="auth-alert-message hidden"></div>

              <button type="submit" class="btn btn-primary btn-full submit-cta-btn" id="empSignInSubmitBtn">
                Sign In as Employee
              </button>

              <div class="auth-bottom-switch-row">
                <span class="switch-helper-text">Not registered in your agency yet?</span>
                <button type="button" class="switch-action-btn" id="switchToJoinRequestBtn">
                  Request to Join Agency
                </button>
              </div>
            </form>
          ` : `
            <!-- EMPLOYEE REQUEST TO JOIN AGENCY FORM -->
            <form id="employeeJoinRequestForm" class="auth-form-flow" autocomplete="off">
              <div class="form-input-block">
                <label class="form-label" for="joinAgencyCode">Agency Code to Join</label>
                <input 
                  type="text" 
                  id="joinAgencyCode" 
                  class="clean-input uppercase-text" 
                  placeholder="e.g. SKYLINE" 
                  maxlength="12"
                  autocomplete="off"
                  required 
                />
                <span class="input-help-caption">Ask your agency manager for this code.</span>
              </div>

              <div class="form-input-block">
                <label class="form-label" for="joinFullName">Your Full Name</label>
                <input 
                  type="text" 
                  id="joinFullName" 
                  class="clean-input" 
                  placeholder="e.g. Hamza Tariq" 
                  autocomplete="off"
                  required 
                />
              </div>

              <div class="form-input-block">
                <label class="form-label" for="joinUsername">Choose Username</label>
                <input 
                  type="text" 
                  id="joinUsername" 
                  class="clean-input" 
                  placeholder="e.g. hamza" 
                  autocomplete="off"
                  required 
                />
              </div>

              <div class="form-input-block">
                <label class="form-label" for="joinPassword">Create Password</label>
                <input 
                  type="password" 
                  id="joinPassword" 
                  class="clean-input" 
                  placeholder="Password for signing in" 
                  minlength="4"
                  autocomplete="new-password"
                  required 
                />
              </div>

              <div class="form-input-block">
                <label class="form-label" for="joinPhone">Phone Number (Optional)</label>
                <input 
                  type="tel" 
                  id="joinPhone" 
                  class="clean-input" 
                  placeholder="+92 300 1234567" 
                  autocomplete="off"
                />
              </div>

              <div id="joinRequestAlert" class="auth-alert-message hidden"></div>

              <button type="submit" class="btn btn-primary btn-full submit-cta-btn" id="joinRequestSubmitBtn">
                Send Request to Manager
              </button>

              <div class="auth-bottom-switch-row">
                <span class="switch-helper-text">Already accepted by manager?</span>
                <button type="button" class="switch-action-btn" id="switchToEmpSignInBtn">
                  Sign In here
                </button>
              </div>
            </form>
          `}
        `}

      </div>

      <!-- Clean Password Reset Modal -->
      <div class="auth-modal-backdrop ${resetModalOpen ? '' : 'hidden'}" id="resetPasswordModalBackdrop">
        <div class="auth-modal-box animate-slide-up">
          <div class="modal-title-row">
            <h3>Reset Account Password</h3>
            <button type="button" class="modal-close-cross" id="closeResetModalBtn">✕</button>
          </div>
          <p class="modal-desc-text">
            Enter your Agency Code and registered Email or Username to reset your password.
          </p>

          <form id="passwordResetForm" class="auth-form-flow">
            <div class="form-input-block">
              <label class="form-label" for="resetAgencyCode">Agency Code</label>
              <input type="text" id="resetAgencyCode" class="clean-input uppercase-text" placeholder="e.g. SKYLINE" required />
            </div>

            <div class="form-input-block">
              <label class="form-label" for="resetEmailOrUser">Email or Username</label>
              <input type="text" id="resetEmailOrUser" class="clean-input" placeholder="Registered email or username" required />
            </div>

            <div class="form-input-block">
              <label class="form-label" for="resetNewPass">New Password</label>
              <input type="password" id="resetNewPass" class="clean-input" placeholder="Minimum 6 characters" minlength="6" required />
            </div>

            <div id="resetStatusAlert" class="auth-alert-message hidden"></div>

            <div class="modal-btn-actions">
              <button type="submit" class="btn btn-primary btn-full">
                Save New Password
              </button>
              <button type="button" class="btn btn-secondary btn-full" id="cancelResetModalBtn" style="margin-top: 8px;">
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
  // 1. Role Toggle (Manager vs Employee)
  const roleMgrBtn = document.getElementById('authRoleManagerBtn');
  const roleEmpBtn = document.getElementById('authRoleEmployeeBtn');

  if (roleMgrBtn) {
    roleMgrBtn.onclick = () => {
      activeRoleTab = 'manager';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  if (roleEmpBtn) {
    roleEmpBtn.onclick = () => {
      activeRoleTab = 'employee';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }

  // 2. Manager Sub-tabs
  const mgrTabLogin = document.getElementById('mgrSubTabLogin');
  const mgrTabReg = document.getElementById('mgrSubTabRegister');
  const switchCreate = document.getElementById('switchToCreateAgencyBtn');
  const switchMgrSign = document.getElementById('switchToMgrSignInBtn');

  if (mgrTabLogin) {
    mgrTabLogin.onclick = () => {
      managerMode = 'login';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }
  if (mgrTabReg) {
    mgrTabReg.onclick = () => {
      managerMode = 'register';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }
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
  const empTabLogin = document.getElementById('empSubTabLogin');
  const empTabReg = document.getElementById('empSubTabRegister');
  const switchJoin = document.getElementById('switchToJoinRequestBtn');
  const switchEmpSign = document.getElementById('switchToEmpSignInBtn');

  if (empTabLogin) {
    empTabLogin.onclick = () => {
      employeeMode = 'login';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }
  if (empTabReg) {
    empTabReg.onclick = () => {
      employeeMode = 'register';
      window.dispatchEvent(new CustomEvent('re-render-request'));
    };
  }
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
          alertBox.innerText = 'Password is required to sign in.';
          alertBox.className = 'auth-alert-message error';
          alertBox.classList.remove('hidden');
        }
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      if (alertBox) alertBox.classList.add('hidden');

      const res = await state.loginAsSurveyor(code, user, pass);
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

  // 7. Employee Request to Join Agency Submission
  const empJoinForm = document.getElementById('employeeJoinRequestForm');
  if (empJoinForm) {
    empJoinForm.onsubmit = (e) => {
      e.preventDefault();
      const code = document.getElementById('joinAgencyCode').value.trim();
      const name = document.getElementById('joinFullName').value.trim();
      const username = document.getElementById('joinUsername').value.trim();
      const password = document.getElementById('joinPassword').value;
      const phone = document.getElementById('joinPhone').value.trim();
      const alertBox = document.getElementById('joinRequestAlert');
      const submitBtn = document.getElementById('joinRequestSubmitBtn');

      if (submitBtn) submitBtn.disabled = true;
      if (alertBox) alertBox.classList.add('hidden');

      const res = state.requestJoinAgency(code, { name, username, password, phone });
      if (submitBtn) submitBtn.disabled = false;

      if (!res.success) {
        if (alertBox) {
          alertBox.innerText = res.error || 'Failed to submit request.';
          alertBox.className = 'auth-alert-message error';
          alertBox.classList.remove('hidden');
        }
      } else {
        if (alertBox) {
          alertBox.innerText = '✓ ' + res.message;
          alertBox.className = 'auth-alert-message success';
          alertBox.classList.remove('hidden');
        }
        empJoinForm.reset();
      }
    };
  }

  // 8. Password Reset Modal Triggers
  const openReset1 = document.getElementById('openForgotPassBtn');
  const openReset2 = document.getElementById('openForgotPassBtn2');
  const closeReset = document.getElementById('closeResetModalBtn');
  const cancelReset = document.getElementById('cancelResetModalBtn');
  const resetForm = document.getElementById('passwordResetForm');

  const toggleResetModal = (open) => {
    resetModalOpen = open;
    const backdrop = document.getElementById('resetPasswordModalBackdrop');
    if (backdrop) {
      backdrop.classList.toggle('hidden', !open);
    }
  };

  if (openReset1) openReset1.onclick = () => toggleResetModal(true);
  if (openReset2) openReset2.onclick = () => toggleResetModal(true);
  if (closeReset) closeReset.onclick = () => toggleResetModal(false);
  if (cancelReset) cancelReset.onclick = () => toggleResetModal(false);

  if (resetForm) {
    resetForm.onsubmit = (e) => {
      e.preventDefault();
      const code = document.getElementById('resetAgencyCode').value.trim();
      const target = document.getElementById('resetEmailOrUser').value.trim();
      const newPass = document.getElementById('resetNewPass').value;
      const statusBox = document.getElementById('resetStatusAlert');

      const res = storage.resetPassword(code, target, newPass);
      if (!res.success) {
        if (statusBox) {
          statusBox.innerText = res.message;
          statusBox.className = 'auth-alert-message error';
          statusBox.classList.remove('hidden');
        }
      } else {
        if (statusBox) {
          statusBox.innerText = '✓ ' + res.message;
          statusBox.className = 'auth-alert-message success';
          statusBox.classList.remove('hidden');
        }
        setTimeout(() => {
          toggleResetModal(false);
          resetForm.reset();
          if (statusBox) statusBox.classList.add('hidden');
        }, 1200);
      }
    };
  }
}
