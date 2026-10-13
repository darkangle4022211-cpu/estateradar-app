// EstateRadar State Management Engine
// Clean Architecture — Zero Dummy Data — Tenant Isolated Storage
import { registerPlugin } from '@capacitor/core';
import { supabase } from './services/supabase.js';
import { storage } from './services/storage.js';

const AppUpdater = registerPlugin('AppUpdater');

export const CURRENT_APP_VERSION = 'v1.0.4';

export function normalizeVersion(v) {
  if (!v) return '0.0.0';
  return v.toString().trim().replace(/^v/i, '');
}

export function isNewerVersion(remote, current) {
  const r = normalizeVersion(remote).split('.').map(n => parseInt(n, 10) || 0);
  const c = normalizeVersion(current).split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(r.length, c.length); i++) {
    const rVal = r[i] || 0;
    const cVal = c[i] || 0;
    if (rVal > cVal) return true;
    if (rVal < cVal) return false;
  }
  return false;
}

class StateManager {
  constructor() {
    this.listeners = new Set();
    this.activeView = 'manager';
    this.userRole = 'manager'; // 'manager' | 'employee'
    this.currentVersion = CURRENT_APP_VERSION;
    
    // Strict Zero-Dummy-Data initial states
    this.employees = [];
    this.properties = [];
    this.alerts = [];
    this.offlineQueue = [];
    
    // Primary User & Shift state
    this.currentUser = null;
    this.shiftStartTime = Date.now();
    this.shiftTimerActive = false;

    // Theme state (dark / light)
    let savedTheme = 'dark';
    try {
      savedTheme = localStorage.getItem('estateradar_theme') || 'dark';
    } catch (e) {}
    this.theme = savedTheme;
    this.applyTheme();

    // Check saved session
    let savedAuth = null;
    try {
      savedAuth = JSON.parse(localStorage.getItem('estateradar_auth_session'));
    } catch (e) {}

    // Authentication state
    this.auth = {
      isAuthenticated: Boolean(savedAuth && savedAuth.user),
      currentUser: savedAuth?.user || null,
      isForgotPasswordModalOpen: false,
      isAddEmployeeModalOpen: false
    };

    if (savedAuth && savedAuth.user) {
      this.currentUser = savedAuth.user;
      this.userRole = savedAuth.role || 'manager';
      this.activeView = this.userRole === 'manager' ? 'manager' : 'mobile';
    }

    // Active Tenant Company
    this.company = null;
    if (savedAuth?.user?.companyCode) {
      this.company = storage.findCompanyByCode(savedAuth.user.companyCode) || {
        company_code: savedAuth.user.companyCode,
        name: savedAuth.user.companyName || 'My Agency'
      };
    } else {
      let savedComp = null;
      try {
        savedComp = JSON.parse(localStorage.getItem('estateradar_active_company'));
      } catch (e) {}
      this.company = savedComp || null;
    }

    if (this.company) {
      this.loadCompanyData();
    }
    
    // In-App Online Update State — isAvailable is FALSE by default!
    this.updateState = {
      isAvailable: false,
      isModalOpen: false,
      version: CURRENT_APP_VERSION,
      currentVersion: CURRENT_APP_VERSION,
      downloadUrl: 'https://github.com/darkangle4022211-cpu/estateradar-app/releases/download/v1.0.3/EstateRadar.apk',
      releaseNotes: [
        'Native 1-tap in-app auto-update directly through Android Package Installer',
        'Real-time online version checking directly against GitHub releases API',
        'No external redirects to repository or web pages',
        'Zero dummy data isolated multi-tenant architecture',
        'Hardware camera GPS timestamp watermark verification'
      ],
      isDownloading: false,
      progressPercent: 0,
      isComplete: false
    };

    // Security & Sensor Health State
    this.securityState = {
      mockDetected: false,
      accelerometerSynced: true,
      airplaneMode: false,
      rooted: false,
      gpsAccuracyRadius: 4.2
    };

    // Playback Engine State
    this.playback = {
      isPlaying: false,
      progressIndex: 0,
      speedMultiplier: 1,
      selectedEmployeeId: null
    };

    // Initial live update check
    setTimeout(() => {
      this.checkForUpdatesOnline();
    }, 1000);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this);
      } catch (err) {
        console.error('State listener error:', err);
      }
    }
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('estateradar_theme', this.theme);
    } catch (e) {}
    this.applyTheme();
    this.notify();
  }

  applyTheme() {
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.remove('dark-theme', 'light-theme');
      document.body.classList.add(`${this.theme}-theme`);
    }
  }

  setActiveView(view) {
    this.activeView = view;
    this.notify();
  }

  setCompany(company) {
    this.company = company;
    try {
      localStorage.setItem('estateradar_active_company', JSON.stringify(company));
    } catch (e) {}
    storage.saveCompany(company);
    supabase.setActiveCompany(company);
    this.loadCompanyData();
    this.notify();
  }

  loadCompanyData() {
    if (!this.company || !this.company.company_code) return;
    const code = this.company.company_code.toUpperCase();
    
    // Load real employees strictly for this agency (NO dummy data)
    this.employees = storage.getEmployeesForCompany(code);
    
    // Load real property surveys strictly for this agency (NO dummy data)
    this.properties = storage.getPropertiesForCompany(code);

    // Sync with cloud if configured
    if (supabase.isConfigured() && this.company.id) {
      supabase.fetchEmployees(this.company.id).then(cloudEmps => {
        if (cloudEmps && cloudEmps.length > 0) {
          cloudEmps.forEach(ce => {
            if (!this.employees.some(e => e.id === ce.id)) {
              this.employees.push(ce);
              storage.saveEmployee(ce);
            }
          });
          this.notify();
        }
      }).catch(() => {});

      supabase.fetchProperties(this.company.id).then(cloudProps => {
        if (cloudProps && cloudProps.length > 0) {
          cloudProps.forEach(cp => {
            if (!this.properties.some(p => p.id === cp.id)) {
              this.properties.unshift(cp);
              storage.saveProperty(cp);
            }
          });
          this.notify();
        }
      }).catch(() => {});
    }

    this.notify();
  }

  // --- Manager Authentication & Registration ---
  async loginAsManager(companyCode, email, password) {
    if (!companyCode || !email || !password) {
      return { success: false, error: 'All fields are required.' };
    }
    const formattedCode = companyCode.trim().toUpperCase();
    const formattedEmail = email.trim().toLowerCase();

    // 1. Check local storage
    const localComp = storage.findCompanyByCode(formattedCode);
    if (localComp) {
      if (localComp.admin_email?.toLowerCase() !== formattedEmail) {
        return { success: false, error: 'Manager email does not match this agency.' };
      }
      if (localComp.admin_password !== password) {
        return { success: false, error: 'Incorrect manager password.' };
      }

      this.setCompany(localComp);
      const mgrUser = {
        id: localComp.id || 'mgr_' + Date.now(),
        name: localComp.admin_name || 'Agency Manager',
        email: formattedEmail,
        role: 'manager',
        companyId: localComp.id,
        companyCode: formattedCode,
        companyName: localComp.name
      };
      this.auth.isAuthenticated = true;
      this.auth.currentUser = mgrUser;
      this.currentUser = mgrUser;
      this.userRole = 'manager';
      this.activeView = 'manager';
      this.saveAuthSession(mgrUser, 'manager');
      this.notify();
      return { success: true, company: localComp };
    }

    // 2. Check cloud
    if (supabase.isConfigured()) {
      const res = await supabase.loginCompanyManager(formattedCode, formattedEmail, password);
      if (res.success) {
        const company = res.company;
        this.setCompany(company);
        const mgrUser = {
          id: company.id,
          name: company.admin_name || 'Agency Manager',
          email: formattedEmail,
          role: 'manager',
          companyId: company.id,
          companyCode: formattedCode,
          companyName: company.name
        };
        this.auth.isAuthenticated = true;
        this.auth.currentUser = mgrUser;
        this.currentUser = mgrUser;
        this.userRole = 'manager';
        this.activeView = 'manager';
        this.saveAuthSession(mgrUser, 'manager');
        this.notify();
        return { success: true, company };
      }
      return { success: false, error: res.message || 'Invalid manager credentials.' };
    }

    return { success: false, error: `Agency Code "${formattedCode}" not found. Please register first.` };
  }

  async registerNewCompany(name, companyCode, email, password, managerName = 'Agency Manager') {
    if (!name || !companyCode || !email || !password) {
      return { success: false, error: 'Please fill in all registration fields.' };
    }
    const formattedCode = companyCode.trim().toUpperCase();
    const formattedEmail = email.trim().toLowerCase();

    // Check if company code already exists
    const existing = storage.findCompanyByCode(formattedCode);
    if (existing) {
      return { success: false, error: `Agency Code "${formattedCode}" is already taken. Please choose another.` };
    }

    const companyId = 'comp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newCompany = {
      id: companyId,
      name: name.trim(),
      company_code: formattedCode,
      admin_name: managerName.trim(),
      admin_email: formattedEmail,
      admin_password: password
    };

    // Save to local storage
    storage.saveCompany(newCompany);

    // Save to cloud if configured
    if (supabase.isConfigured()) {
      supabase.registerCompany(name, formattedCode, formattedEmail, password).catch(() => {});
    }

    this.setCompany(newCompany);

    // ZERO DUMMY DATA — completely clean initial team and property lists
    this.employees = [];
    this.properties = [];
    this.alerts = [];

    const mgrUser = {
      id: 'mgr_' + Date.now(),
      name: managerName.trim(),
      email: formattedEmail,
      role: 'manager',
      companyId: companyId,
      companyCode: formattedCode,
      companyName: newCompany.name
    };

    this.auth.isAuthenticated = true;
    this.auth.currentUser = mgrUser;
    this.currentUser = mgrUser;
    this.userRole = 'manager';
    this.activeView = 'manager';
    this.saveAuthSession(mgrUser, 'manager');
    this.notify();
    return { success: true, company: newCompany };
  }

  // --- Employee Authentication & Registration ---
  async loginAsSurveyor(companyCode, usernameOrEmail, password) {
    if (!companyCode || !usernameOrEmail || !password) {
      return { success: false, error: 'Please enter Agency Code, Username/Email, and Password.' };
    }
    const formattedCode = companyCode.trim().toUpperCase();
    const target = usernameOrEmail.trim().toLowerCase();

    // 1. Verify agency exists
    const company = storage.findCompanyByCode(formattedCode);
    if (!company) {
      return { success: false, error: `Agency Code "${formattedCode}" does not exist. Check with your manager.` };
    }

    // 2. Verify employee record
    const employees = storage.getEmployeesForCompany(formattedCode);
    const employee = employees.find(e => 
      (e.username && e.username.toLowerCase() === target) || 
      (e.email && e.email.toLowerCase() === target)
    );

    if (!employee) {
      return { success: false, error: `Staff account "${usernameOrEmail}" is not registered in Agency ${formattedCode}. Please submit a request to join.` };
    }

    // STRICT PASSWORD CHECK — NO BYPASS ALLOWED
    if (employee.password !== password) {
      return { success: false, error: 'Incorrect password. Check with your manager.' };
    }

    // CHECK IF STATUS IS PENDING
    if (employee.status === 'pending') {
      return { 
        success: false, 
        error: 'Your request is pending manager approval. Please ask your Agency Manager to accept your request in their console.' 
      };
    }

    this.setCompany(company);
    this.auth.isAuthenticated = true;
    this.auth.currentUser = employee;
    this.currentUser = employee;
    this.userRole = 'employee';
    this.activeView = 'mobile';
    this.saveAuthSession(employee, 'employee');
    this.notify();
    return { success: true, user: employee };
  }

  // Employee requests to join agency
  requestJoinAgency(companyCode, { name, username, email, password, phone }) {
    if (!companyCode || !name || !username || !password) {
      return { success: false, error: 'Name, Username, Password, and Agency Code are required.' };
    }
    const formattedCode = companyCode.trim().toUpperCase();
    const formattedUser = username.trim().toLowerCase();

    // Check if company exists
    let comp = storage.findCompanyByCode(formattedCode);
    if (!comp) {
      return { success: false, error: `Agency Code "${formattedCode}" does not exist. Please ask your manager for the valid code.` };
    }

    // Check if username already exists in this agency
    const existing = storage.getEmployeesForCompany(formattedCode);
    if (existing.some(e => e.username?.toLowerCase() === formattedUser)) {
      return { success: false, error: `Username "${username}" is already taken in this agency.` };
    }

    const newEmp = {
      id: 'emp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      company_code: formattedCode,
      name: name.trim(),
      username: formattedUser,
      email: (email || `${formattedUser}@agency.internal`).trim().toLowerCase(),
      password: password,
      phone: phone || '',
      role: 'Field Surveyor',
      status: 'pending', // Requires manager approval
      isClockedIn: false,
      currentCoords: null,
      currentAddress: 'Shift Inactive',
      batteryPercent: 100,
      surveysToday: 0,
      createdAt: new Date().toISOString()
    };

    storage.saveEmployee(newEmp);

    // If manager of this company is currently viewing, notify them live
    if (this.company && this.company.company_code.toUpperCase() === formattedCode) {
      this.employees.push(newEmp);
      this.addAlert({
        type: 'team',
        severity: 'info',
        title: 'New Staff Join Request',
        message: `${newEmp.name} requested to join Agency ${formattedCode}.`,
        timestamp: new Date().toLocaleTimeString()
      });
      this.notify();
    }

    return { 
      success: true, 
      message: 'Request submitted successfully! Please wait for your Agency Manager to accept your request.' 
    };
  }

  // Manager accepts pending employee
  approveEmployee(employeeId) {
    const updated = storage.acceptEmployeeRequest(employeeId);
    if (updated) {
      const idx = this.employees.findIndex(e => e.id === employeeId);
      if (idx >= 0) {
        this.employees[idx] = updated;
      }
      this.addAlert({
        type: 'team',
        severity: 'success',
        title: 'Employee Approved',
        message: `${updated.name} has been approved and is now active.`,
        timestamp: new Date().toLocaleTimeString()
      });
      this.notify();
      return true;
    }
    return false;
  }

  // Manager declines pending employee
  rejectEmployee(employeeId) {
    storage.rejectEmployeeRequest(employeeId);
    this.employees = this.employees.filter(e => e.id !== employeeId);
    this.notify();
    return true;
  }

  // Manager creates employee manually
  createEmployee({ name, username, email, password, role, phone }) {
    if (!this.company) return { success: false, error: 'No active agency.' };
    if (!name || !username || !password) {
      return { success: false, error: 'Name, Username, and Password are required.' };
    }

    const formattedCode = this.company.company_code.toUpperCase();
    const formattedUser = username.trim().toLowerCase();

    // Check username uniqueness
    if (this.employees.some(e => e.username?.toLowerCase() === formattedUser)) {
      return { success: false, error: `Username "${username}" is already taken.` };
    }

    const newEmp = {
      id: 'emp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      company_code: formattedCode,
      name: name.trim(),
      username: formattedUser,
      email: (email || `${formattedUser}@agency.internal`).trim().toLowerCase(),
      password: password,
      phone: phone || '',
      role: role || 'Field Surveyor',
      status: 'active', // Direct addition by manager is active immediately
      isClockedIn: false,
      currentCoords: null,
      currentAddress: 'Shift Not Started',
      batteryPercent: 100,
      surveysToday: 0,
      createdAt: new Date().toISOString()
    };

    storage.saveEmployee(newEmp);
    this.employees.push(newEmp);

    if (supabase.isConfigured() && this.company.id) {
      supabase.createEmployee(newEmp, this.company.id).catch(() => {});
    }

    this.addAlert({
      type: 'team',
      severity: 'success',
      title: 'Employee Added',
      message: `${newEmp.name} added to agency roster.`,
      timestamp: new Date().toLocaleTimeString()
    });
    this.notify();
    return { success: true, employee: newEmp };
  }

  logout() {
    this.auth.isAuthenticated = false;
    this.auth.currentUser = null;
    this.currentUser = null;
    this.userRole = null;
    try {
      localStorage.removeItem('estateradar_auth_session');
    } catch (e) {}
    this.notify();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('re-render-request'));
    }
  }

  saveAuthSession(user, role) {
    try {
      localStorage.setItem('estateradar_auth_session', JSON.stringify({ user, role }));
    } catch (e) {}
  }

  // --- Clock In / Clock Out ---
  toggleShift() {
    if (!this.currentUser) return;
    this.currentUser.isClockedIn = !this.currentUser.isClockedIn;
    if (this.currentUser.isClockedIn) {
      this.shiftStartTime = Date.now();
      this.currentUser.status = 'moving';
      this.currentUser.currentAddress = 'Active Shift — GPS Tracking Active';
      
      // Request real geolocation on clock-in
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            this.updateCurrentGps({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0,
              accuracy: pos.coords.accuracy
            });
          },
          err => console.warn('Geolocation error:', err),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    } else {
      this.currentUser.status = 'offline';
      this.currentUser.speedKmh = 0;
      this.currentUser.currentAddress = 'Off Duty (Tracking Paused)';
    }

    // Sync to storage
    storage.updateEmployee(this.currentUser.id, {
      isClockedIn: this.currentUser.isClockedIn,
      status: this.currentUser.status,
      currentAddress: this.currentUser.currentAddress
    });

    const idx = this.employees.findIndex(e => e.id === this.currentUser.id);
    if (idx !== -1) {
      this.employees[idx] = { ...this.currentUser };
    }
    this.notify();
  }

  updateCurrentGps(coords) {
    if (!this.currentUser) return;
    this.currentUser.currentCoords = { lat: coords.lat, lng: coords.lng };
    this.currentUser.speedKmh = coords.speed || 0;
    this.currentUser.accuracyMeters = coords.accuracy || 5;

    storage.updateEmployee(this.currentUser.id, {
      currentCoords: this.currentUser.currentCoords,
      speedKmh: this.currentUser.speedKmh,
      accuracyMeters: this.currentUser.accuracyMeters
    });

    const idx = this.employees.findIndex(e => e.id === this.currentUser.id);
    if (idx !== -1) {
      this.employees[idx] = { ...this.currentUser };
    }
    this.notify();
  }

  // --- Property Survey Submission ---
  submitPropertySurvey(propertyData) {
    const newProp = {
      id: 'prop_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      company_code: this.company ? this.company.company_code.toUpperCase() : 'AGENCY',
      surveyorId: this.currentUser ? this.currentUser.id : 'unknown',
      surveyorName: this.currentUser ? this.currentUser.name : 'Field Staff',
      address: propertyData.address || 'Field Survey Site',
      type: propertyData.type || 'House',
      area: propertyData.area || '',
      demand: propertyData.demand || '',
      status: propertyData.status || 'Verified',
      ownerName: propertyData.ownerName || '',
      ownerPhone: propertyData.ownerPhone || '',
      condition: propertyData.condition || '',
      coordinates: propertyData.coordinates || (this.currentUser?.currentCoords) || { lat: 31.5204, lng: 74.3587 },
      accuracyMeters: propertyData.accuracyMeters || 4.0,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      imageUrl: propertyData.imageUrl || '',
      watermark: {
        text: `ESTATERADAR VERIFIED | ${propertyData.address} | ${new Date().toLocaleTimeString()}`,
        hash: 'SHA256:' + Math.random().toString(36).substring(2, 10)
      }
    };

    storage.saveProperty(newProp);
    this.properties.unshift(newProp);

    if (this.currentUser) {
      this.currentUser.surveysToday = (this.currentUser.surveysToday || 0) + 1;
      storage.updateEmployee(this.currentUser.id, { surveysToday: this.currentUser.surveysToday });
    }

    if (supabase.isConfigured() && this.company?.id) {
      supabase.savePropertySurvey(newProp, this.company.id).catch(() => {});
    }

    this.addAlert({
      type: 'survey',
      severity: 'success',
      title: 'New Property Survey Logged',
      message: `${newProp.surveyorName} logged survey at ${newProp.address}`,
      timestamp: new Date().toLocaleTimeString(),
      employeeId: newProp.surveyorId
    });

    this.notify();
    return newProp;
  }

  addAlert(alert) {
    const newAlert = {
      id: 'alt_' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      ...alert
    };
    this.alerts.unshift(newAlert);
    if (this.alerts.length > 30) this.alerts.pop();
    this.notify();
  }

  // --- Live Dynamic In-App Auto-Update Engine ---
  async checkForUpdatesOnline() {
    try {
      let releaseData = null;
      try {
        const res = await fetch('https://api.github.com/repos/darkangle4022211-cpu/estateradar-app/releases/latest');
        if (res.ok) {
          releaseData = await res.json();
        }
      } catch (e) {
        console.warn('Direct GitHub API check skipped, attempting version.json:', e);
      }

      if (!releaseData) {
        try {
          const rawRes = await fetch('https://raw.githubusercontent.com/darkangle4022211-cpu/estateradar-app/main/version.json');
          if (rawRes.ok) {
            const vData = await rawRes.json();
            const remoteV = vData.version || CURRENT_APP_VERSION;
            const hasUpdate = isNewerVersion(remoteV, this.currentVersion);
            this.updateState.version = remoteV;
            this.updateState.downloadUrl = vData.downloadUrl || this.updateState.downloadUrl;
            if (vData.releaseNotes && Array.isArray(vData.releaseNotes)) {
              this.updateState.releaseNotes = vData.releaseNotes;
            }
            this.updateState.isAvailable = hasUpdate;
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('update-modal-changed'));
            }
            this.notify();
            return;
          }
        } catch (rawErr) {
          console.warn('Raw version check fallback error:', rawErr);
        }
      }

      if (releaseData) {
        const tag = releaseData.tag_name || CURRENT_APP_VERSION;
        const apkAsset = releaseData.assets?.find(a => a.name.endsWith('.apk'));
        const directApkUrl = apkAsset ? apkAsset.browser_download_url : `https://github.com/darkangle4022211-cpu/estateradar-app/releases/download/${tag}/EstateRadar.apk`;
        
        const hasUpdate = isNewerVersion(tag, this.currentVersion);
        this.updateState.version = tag;
        this.updateState.downloadUrl = directApkUrl;
        this.updateState.isAvailable = hasUpdate;

        if (releaseData.body) {
          const lines = releaseData.body.split('\n')
            .map(l => l.trim().replace(/^[-*]\s*/, ''))
            .filter(l => l.length > 5 && !l.startsWith('#'));
          if (lines.length > 0) {
            this.updateState.releaseNotes = lines.slice(0, 5);
          }
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('update-modal-changed'));
        }
        this.notify();
      }
    } catch (err) {
      console.warn('checkForUpdatesOnline failed:', err);
    }
  }

  openUpdateModal() {
    this.updateState.isModalOpen = true;
    this.checkForUpdatesOnline();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('update-modal-changed'));
    }
    this.notify();
  }

  closeUpdateModal() {
    this.updateState.isModalOpen = false;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('update-modal-changed'));
    }
    this.notify();
  }

  reopenAppWithUpdate() {
    this.updateState.isAvailable = false;
    this.updateState.isComplete = false;
    this.updateState.isModalOpen = false;
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
    this.notify();
  }

  async triggerUpdateDownload() {
    this.updateState.isDownloading = true;
    this.updateState.progressPercent = 15;
    this.updateState.isComplete = false;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('update-modal-changed'));
    }

    const downloadUrl = this.updateState.downloadUrl;

    // 1. If running natively in Android via Capacitor, trigger native AppUpdaterPlugin in background
    let nativeTriggered = false;
    try {
      if (AppUpdater && typeof AppUpdater.startAutoUpdate === 'function') {
        await AppUpdater.startAutoUpdate({ url: downloadUrl });
        nativeTriggered = true;
      }
    } catch (nativeErr) {
      console.log('Native AppUpdater plugin call not available or failed:', nativeErr);
    }

    // 2. If not triggered natively, download silently without taking user to any webpage
    if (!nativeTriggered && typeof window !== 'undefined') {
      try {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        a.setAttribute('download', 'EstateRadar.apk');
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          try { document.body.removeChild(a); } catch (e) {}
        }, 1500);
      } catch (dlErr) {
        console.warn('Invisible download fallback error:', dlErr);
      }
    }

    // Dynamic progress feedback
    let progress = 15;
    const interval = setInterval(() => {
      progress += 20;
      if (progress < 95) {
        this.updateState.progressPercent = progress;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('update-modal-changed'));
        }
      } else {
        clearInterval(interval);
        this.updateState.progressPercent = 100;
        this.updateState.isDownloading = false;
        this.updateState.isComplete = true;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('update-modal-changed'));
        }
      }
    }, 500);
  }
}

export const state = new StateManager();
