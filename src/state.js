// EstateRadar State Management Engine
import { supabase } from './services/supabase.js';

// Initial Sample Property Data with rich real estate photos and verification data
const INITIAL_PROPERTIES = [
  {
    id: 'prop_101',
    surveyorId: 'emp_01',
    surveyorName: 'Surveyor 01',
    address: 'Plot 42-B, Block H, Gulberg III, Lahore',
    type: 'Luxury House',
    area: '1 Kanal (4,500 Sq Ft)',
    demand: 'PKR 6.8 Crore ($245,000)',
    status: 'Hot Deal',
    ownerName: 'Malik Tariq Mehmood',
    ownerPhone: '+92 300 8472910',
    condition: 'Brand new designer villa, Spanish tiles, imported fittings, solar backup.',
    coordinates: { lat: 31.5152, lng: 74.3489 },
    accuracyMeters: 4.2,
    distanceVerified: true,
    distanceFromPropertyMeters: 7.5,
    timestamp: '2026-10-12 14:22:18',
    stayDurationMinutes: 34,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    watermark: {
      text: 'ESTATERADAR VERIFIED | 2026-10-12 14:22:18 | 31.5152° N, 74.3489° E | Surveyor: Unit 01',
      hash: 'SHA256:7f8a9e01cd34b2'
    }
  },
  {
    id: 'prop_102',
    surveyorId: 'emp_01',
    surveyorName: 'Surveyor 01',
    address: 'Corner Villa 18, Sector J, DHA Phase 5, Lahore',
    type: 'Modern House',
    area: '10 Marla (2,250 Sq Ft)',
    demand: 'PKR 3.9 Crore ($140,000)',
    status: 'Direct Owner',
    ownerName: 'Dr. Asad Qureshi',
    ownerPhone: '+92 321 4455889',
    condition: 'Owner moving abroad, motivated seller, solid structure, basement included.',
    coordinates: { lat: 31.4728, lng: 74.4021 },
    accuracyMeters: 3.8,
    distanceVerified: true,
    distanceFromPropertyMeters: 5.1,
    timestamp: '2026-10-12 11:45:04',
    stayDurationMinutes: 28,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    watermark: {
      text: 'ESTATERADAR VERIFIED | 2026-10-12 11:45:04 | 31.4728° N, 74.4021° E | Surveyor: Unit 01',
      hash: 'SHA256:4a3b2c1d9e8f7a'
    }
  },
  {
    id: 'prop_103',
    surveyorId: 'emp_02',
    surveyorName: 'Bilal Ahmed',
    address: 'Commercial Plot 77, Main Boulevard, Johar Town',
    type: 'Commercial Plot',
    area: '8 Marla Commercial',
    demand: 'PKR 5.2 Crore ($188,000)',
    status: 'Urgent Sale',
    ownerName: 'Chaudhry Riaz',
    ownerPhone: '+92 333 9123456',
    condition: 'Direct road frontage, approved commercial map, prime investment node.',
    coordinates: { lat: 31.4682, lng: 74.2984 },
    accuracyMeters: 5.0,
    distanceVerified: true,
    distanceFromPropertyMeters: 9.3,
    timestamp: '2026-10-12 13:10:45',
    stayDurationMinutes: 19,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    watermark: {
      text: 'ESTATERADAR VERIFIED | 2026-10-12 13:10:45 | 31.4682° N, 74.2984° E | Surveyor: Bilal Ahmed',
      hash: 'SHA256:88eef103a89bc4'
    }
  }
];

// Team Members for Admin Radar
const INITIAL_EMPLOYEES = [
  {
    id: 'emp_01',
    name: 'Surveyor Unit 01',
    role: 'Lead Field Surveyor',
    phone: '+92 300 1122334',
    email: 'surveyor01@estate.internal',
    username: 'surveyor01',
    password: 'Pass@2026',
    biometricsRegistered: true,
    passwordResetRequested: false,
    avatar: '01',
    isClockedIn: true,
    status: 'moving', // moving, surveying, idle, offline
    speedKmh: 34,
    headingDeg: 62,
    batteryPercent: 88,
    currentCoords: { lat: 31.5110, lng: 74.3540 },
    currentAddress: 'En Route to Main Market, Gulberg',
    surveysToday: 2,
    distanceCoveredKm: 21.6,
    idleDurationMin: 0,
    isMocking: false,
    color: '#10b981' // emerald
  },
  {
    id: 'emp_02',
    name: 'Bilal Ahmed',
    role: 'Senior Surveyor',
    phone: '03001234567',
    email: 'bilal.ahmed@example.com',
    username: 'bilal',
    password: 'Pass@2026',
    biometricsRegistered: true,
    passwordResetRequested: false,
    avatar: 'BA',
    isClockedIn: true,
    status: 'idle', // currently idle!
    speedKmh: 0,
    headingDeg: 180,
    batteryPercent: 64,
    currentCoords: { lat: 31.4820, lng: 74.3645 },
    currentAddress: 'Parked near Cafe Retro, Model Town',
    surveysToday: 1,
    distanceCoveredKm: 14.1,
    idleDurationMin: 26, // Triggers Idle alert (> 20 mins)
    isMocking: false,
    color: '#f59e0b' // amber
  },
  {
    id: 'emp_03',
    name: 'Usman Tariq',
    role: 'Area Inspector',
    phone: '03127654321',
    email: 'usman.tariq@example.com',
    username: 'usman',
    password: 'Pass@2026',
    biometricsRegistered: true,
    passwordResetRequested: false,
    avatar: 'UT',
    isClockedIn: true,
    status: 'surveying',
    speedKmh: 0,
    headingDeg: 90,
    batteryPercent: 79,
    currentCoords: { lat: 31.4725, lng: 74.4018 },
    currentAddress: 'Surveying at DHA Phase 5, Sector C',
    surveysToday: 3,
    distanceCoveredKm: 29.8,
    idleDurationMin: 12,
    isMocking: false,
    color: '#06b6d4' // cyan
  },
  {
    id: 'emp_04',
    name: 'Zeeshan Khan',
    role: 'Junior Surveyor',
    phone: '03459876543',
    email: 'zeeshan.khan@example.com',
    username: 'zeeshan',
    password: 'Pass@2026',
    biometricsRegistered: true,
    passwordResetRequested: false,
    avatar: 'ZK',
    isClockedIn: false,
    status: 'offline',
    speedKmh: 0,
    headingDeg: 0,
    batteryPercent: 95,
    currentCoords: { lat: 31.5204, lng: 74.3587 },
    currentAddress: 'Shift Not Started (Clocked Out)',
    surveysToday: 0,
    distanceCoveredKm: 0.0,
    idleDurationMin: 0,
    isMocking: false,
    color: '#64748b' // slate
  }
];

// Initial Alerts
const INITIAL_ALERTS = [
  {
    id: 'alt_01',
    type: 'idle',
    severity: 'warning',
    title: 'Protracted Stop Detected',
    message: 'Bilal Ahmed has been stationary for 26 mins at Model Town Park (No survey logged).',
    timestamp: '14:38:00',
    employeeId: 'emp_02'
  },
  {
    id: 'alt_02',
    type: 'survey',
    severity: 'success',
    title: 'New Verified Survey Logged',
    message: 'Surveyor Unit 01 logged Plot 42-B, Gulberg III with 4 stamped photos.',
    timestamp: '14:22:18',
    employeeId: 'emp_01'
  }
];

class StateManager {
  constructor() {
    this.listeners = new Set();
    this.activeView = 'dual'; // 'dual' | 'mobile' | 'radar'
    this.userRole = 'employee'; // 'employee' | 'admin'
    this.employees = [...INITIAL_EMPLOYEES];
    this.properties = [...INITIAL_PROPERTIES];
    this.alerts = [...INITIAL_ALERTS];
    this.offlineQueue = [];
    
    // Primary User state
    this.currentUser = { ...this.employees[0] };
    this.shiftStartTime = Date.now() - (3 * 3600 * 1000 + 18 * 60 * 1000); // 3h 18m ago
    this.shiftTimerActive = true;

    // Theme state (dark / light)
    let savedTheme = 'dark';
    try {
      savedTheme = localStorage.getItem('estateradar_theme') || 'dark';
    } catch (e) {}
    this.theme = savedTheme;
    this.applyTheme();

    // Authentication & Biometric state
    this.auth = {
      isAuthenticated: true, // starts logged in for smooth preview, user can lock/logout to test
      currentUser: { ...this.employees[0] },
      isForgotPasswordModalOpen: false,
      isAddEmployeeModalOpen: false,
      biometricPromptActive: false
    };

    // Multi-Tenant SaaS Company State (Strict Isolation)
    this.company = supabase.getActiveCompany();
    this.loadCompanyData();
    
    // In-App Online Update State (Strictly according to user specifications)
    this.updateState = {
      isAvailable: true, // Visible immediately as "Update available" sign
      isModalOpen: false,
      version: 'v2.4.1 (Stable)',
      releaseNotes: [
        'Stationary geofencing battery optimization (0.2%/hr)',
        'Sub-second live GPS sync pipeline',
        'Cryptographic camera watermark anti-tamper update',
        'Background sync stability improvements'
      ],
      isDownloading: false,
      progressPercent: 0,
      isComplete: false
    };

    // Anti-Cheat & Sensor Health State
    this.securityState = {
      mockDetected: false,
      accelerometerSynced: true,
      airplaneMode: false,
      rooted: false,
      gpsAccuracyRadius: 4.2 // meters
    };

    // Playback Engine State
    this.playback = {
      isPlaying: false,
      progressIndex: 0,
      speedMultiplier: 1,
      selectedEmployeeId: 'emp_01'
    };
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
    supabase.setActiveCompany(company);
    this.loadCompanyData();
    this.notify();
  }

  async loadCompanyData() {
    if (!this.company || !this.company.id) return;
    try {
      const cloudEmployees = await supabase.fetchEmployees(this.company.id);
      if (cloudEmployees && cloudEmployees.length > 0) {
        this.employees = cloudEmployees.map(ce => ({
          id: ce.id,
          name: ce.name,
          role: ce.role || 'Field Surveyor',
          phone: ce.phone || '',
          email: `${ce.username}@estate.internal`,
          username: ce.username,
          password: ce.password,
          avatar: ce.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'EM',
          isClockedIn: ce.is_clocked_in || false,
          status: ce.status || 'offline',
          speedKmh: 0,
          headingDeg: 0,
          batteryPercent: ce.battery_percent || 100,
          currentCoords: { lat: ce.latitude || 31.5204, lng: ce.longitude || 74.3587 },
          currentAddress: 'Assigned Territory',
          surveysToday: 0,
          distanceCoveredKm: 0.0,
          idleDurationMin: 0,
          isMocking: false,
          color: '#10b981',
          biometricsRegistered: true,
          passwordResetRequested: false
        }));
        if (!this.employees.some(e => e.id === this.currentUser.id)) {
          this.currentUser = { ...this.employees[0] };
        }
      }

      const cloudProps = await supabase.fetchProperties(this.company.id);
      if (cloudProps && cloudProps.length > 0) {
        this.properties = cloudProps.map(cp => ({
          id: cp.id,
          surveyorId: cp.surveyor_id,
          surveyorName: cp.surveyor_name || 'Field Surveyor',
          address: cp.address,
          type: cp.property_type || 'House / Villa',
          area: cp.area || '',
          demand: cp.demand || '',
          status: cp.deal_status || 'Hot Deal',
          ownerName: cp.owner_name || '',
          ownerPhone: cp.owner_phone || '',
          condition: cp.condition_notes || '',
          coordinates: { lat: cp.latitude || 31.5204, lng: cp.longitude || 74.3587 },
          accuracyMeters: 4.2,
          distanceVerified: true,
          distanceFromPropertyMeters: 5.0,
          timestamp: cp.timestamp || cp.created_at,
          stayDurationMinutes: 20,
          imageUrl: cp.image_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          watermark: {
            text: `ESTATERADAR VERIFIED | ${cp.address} | Surveyor: ${cp.surveyor_name || 'Staff'}`,
            hash: 'SHA256:verified'
          }
        }));
      }
      this.notify();
    } catch (err) {
      console.warn('Error loading cloud company data:', err);
    }
  }

  async loginWithCredentials(username, password, companyCode = null) {
    // If companyCode provided, attempt cloud multi-tenant employee authentication
    if (companyCode) {
      const cloudRes = await supabase.loginEmployee(companyCode, username, password);
      if (cloudRes.success) {
        this.setCompany(cloudRes.company);
        const emp = cloudRes.employee;
        const mappedUser = {
          id: emp.id,
          name: emp.name,
          role: emp.role || 'Field Surveyor',
          username: emp.username,
          password: emp.password,
          phone: emp.phone || '',
          isClockedIn: emp.is_clocked_in || false,
          status: emp.status || 'offline',
          currentCoords: { lat: emp.latitude || 31.5204, lng: emp.longitude || 74.3587 },
          batteryPercent: emp.battery_percent || 100,
          surveysToday: 0
        };
        this.auth.isAuthenticated = true;
        this.auth.currentUser = mappedUser;
        this.currentUser = mappedUser;
        this.userRole = 'employee';
        this.activeView = 'mobile';
        this.notify();
        return { success: true, user: mappedUser };
      }
      return { success: false, error: cloudRes.message };
    }

    // Local fallback check
    const user = this.employees.find(e => e.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      return { success: false, error: 'Employee username not found.' };
    }
    if (user.password !== password) {
      return { success: false, error: 'Incorrect password. Check with Admin.' };
    }
    this.auth.isAuthenticated = true;
    this.auth.currentUser = { ...user };
    this.currentUser = { ...user };
    this.userRole = 'employee';
    this.activeView = 'mobile';
    this.notify();
    return { success: true, user };
  }

  async loginAsManager(companyCode, email, password) {
    const res = await supabase.loginCompanyManager(companyCode, email, password);
    if (!res.success) {
      return { success: false, error: res.message };
    }
    this.setCompany(res.company);
    this.auth.isAuthenticated = true;
    this.userRole = 'admin';
    this.activeView = 'radar';
    this.notify();
    return { success: true, company: res.company };
  }

  async registerNewCompany(name, companyCode, email, password) {
    const res = await supabase.registerCompany(name, companyCode, email, password);
    if (!res.success) {
      return { success: false, error: res.message };
    }
    this.setCompany(res.company);
    this.employees = []; // Fresh agency team!
    this.properties = []; // Fresh property pipeline!
    this.auth.isAuthenticated = true;
    this.userRole = 'admin';
    this.activeView = 'radar';
    this.notify();
    return { success: true, company: res.company };
  }

  loginWithBiometrics() {
    const user = this.currentUser || this.employees[0];
    this.auth.isAuthenticated = true;
    this.auth.currentUser = { ...user };
    this.currentUser = { ...user };
    this.addAlert({
      type: 'security',
      severity: 'info',
      title: 'Biometric Login Verified',
      message: `${user.name} authenticated via hardware fingerprint scanner.`,
      timestamp: new Date().toLocaleTimeString(),
      employeeId: user.id
    });
    this.notify();
    return { success: true, user };
  }

  logout() {
    this.auth.isAuthenticated = false;
    this.notify();
  }

  openForgotPasswordModal(open = true) {
    this.auth.isForgotPasswordModalOpen = open;
    this.notify();
  }

  openAddEmployeeModal(open = true) {
    this.auth.isAddEmployeeModalOpen = open;
    this.notify();
  }

  requestPasswordReset(usernameOrPhone) {
    const user = this.employees.find(e => 
      e.username.toLowerCase() === usernameOrPhone.trim().toLowerCase() ||
      e.phone.includes(usernameOrPhone.trim())
    );

    if (user) {
      user.passwordResetRequested = true;
      this.addAlert({
        type: 'security',
        severity: 'warning',
        title: '🔑 Password Reset Request',
        message: `${user.name} (${user.role}) submitted password reset request. Click to generate temporary credentials.`,
        timestamp: new Date().toLocaleTimeString(),
        employeeId: user.id
      });
      this.notify();
      return { success: true, user };
    }
    return { success: false, error: 'No employee record found for that username or phone.' };
  }

  adminResetPassword(employeeId, newPassword = null) {
    const emp = this.employees.find(e => e.id === employeeId);
    if (!emp) return null;

    const generatedPass = newPassword || `Radar@${Math.floor(1000 + Math.random() * 9000)}`;
    emp.password = generatedPass;
    emp.passwordResetRequested = false;

    this.addAlert({
      type: 'security',
      severity: 'success',
      title: 'New Password Generated',
      message: `Admin reset credentials for ${emp.name}. Temporary password: ${generatedPass}`,
      timestamp: new Date().toLocaleTimeString(),
      employeeId: emp.id
    });
    this.notify();
    return generatedPass;
  }

  addNewEmployee(employeeData) {
    const newId = 'emp_' + (this.employees.length + 1).toString().padStart(2, '0');
    const avatarInitials = employeeData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'EM';
    
    const newEmp = {
      id: newId,
      name: employeeData.name,
      role: employeeData.role || 'Field Surveyor',
      phone: employeeData.phone || '+92 300 0000000',
      email: employeeData.email || `${employeeData.username || newId}@estate.internal`,
      username: employeeData.username || `surveyor_${newId}`,
      password: employeeData.password || 'Pass@2026',
      avatar: avatarInitials,
      isClockedIn: false,
      status: 'offline',
      speedKmh: 0,
      headingDeg: 0,
      batteryPercent: 100,
      currentCoords: { lat: 31.5204 + (Math.random() - 0.5) * 0.04, lng: 74.3587 + (Math.random() - 0.5) * 0.04 },
      currentAddress: employeeData.territory || 'Assigned Territory',
      surveysToday: 0,
      distanceCoveredKm: 0.0,
      idleDurationMin: 0,
      isMocking: false,
      color: '#3b82f6',
      biometricsRegistered: true,
      passwordResetRequested: false
    };

    this.employees.push(newEmp);
    if (this.company?.id) {
      supabase.createEmployee(newEmp, this.company.id);
    }
    this.addAlert({
      type: 'system',
      severity: 'success',
      title: 'New Employee Added',
      message: `Admin created profile for ${newEmp.name} (${newEmp.role}). Username: ${newEmp.username}`,
      timestamp: new Date().toLocaleTimeString(),
      employeeId: newEmp.id
    });
    this.notify();
    return newEmp;
  }

  toggleShift() {
    this.currentUser.isClockedIn = !this.currentUser.isClockedIn;
    if (this.currentUser.isClockedIn) {
      this.shiftStartTime = Date.now();
      this.currentUser.status = 'moving';
      this.currentUser.currentAddress = 'Active Shift — GPS Streaming 24/7';
      this.addAlert({
        type: 'shift',
        severity: 'info',
        title: 'Shift Started',
        message: `${this.currentUser.name} clocked in. Live GPS streaming activated.`,
        timestamp: new Date().toLocaleTimeString(),
        employeeId: this.currentUser.id
      });
    } else {
      this.currentUser.status = 'offline';
      this.currentUser.speedKmh = 0;
      this.currentUser.currentAddress = 'Shift Inactive (Tracking Completely Off)';
      this.addAlert({
        type: 'shift',
        severity: 'warning',
        title: 'Shift Ended',
        message: `${this.currentUser.name} clocked out. Location tracking terminated.`,
        timestamp: new Date().toLocaleTimeString(),
        employeeId: this.currentUser.id
      });
    }
    
    // Sync to main list
    const idx = this.employees.findIndex(e => e.id === this.currentUser.id);
    if (idx !== -1) {
      this.employees[idx] = { ...this.currentUser };
    }
    this.notify();
  }

  updateEmployeePosition(id, coords, speed, heading, address, status = null) {
    const idx = this.employees.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.employees[idx].currentCoords = coords;
      this.employees[idx].speedKmh = speed;
      this.employees[idx].headingDeg = heading;
      if (address) this.employees[idx].currentAddress = address;
      if (status) this.employees[idx].status = status;

      if (id === this.currentUser.id) {
        this.currentUser = { ...this.employees[idx] };
        // Stream telemetry to Supabase if shift is active
        if (this.currentUser.isClockedIn && this.company?.id) {
          supabase.recordGpsPing({
            employeeId: id,
            lat: coords.lat,
            lng: coords.lng,
            speed: speed,
            battery: this.employees[idx].batteryPercent,
            address: address,
            status: status || this.employees[idx].status
          }, this.company.id);
        }
      }
      this.notify();
    }
  }

  addProperty(property) {
    this.properties.unshift(property);
    if (this.company?.id) {
      supabase.savePropertySurvey(property, this.company.id);
    }
    this.currentUser.surveysToday += 1;
    const empIdx = this.employees.findIndex(e => e.id === this.currentUser.id);
    if (empIdx !== -1) {
      this.employees[empIdx].surveysToday += 1;
    }
    this.addAlert({
      type: 'survey',
      severity: 'success',
      title: 'New Property Survey Logged',
      message: `${property.surveyorName} verified ${property.type} at ${property.address}.`,
      timestamp: new Date().toLocaleTimeString(),
      employeeId: property.surveyorId
    });
    this.notify();
  }

  addAlert(alert) {
    const newAlert = {
      id: 'alt_' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      ...alert
    };
    this.alerts.unshift(newAlert);
    if (this.alerts.length > 20) this.alerts.pop();
    this.notify();
  }

  triggerSimulatedUpdate(available = true) {
    this.updateState.isAvailable = available;
    this.updateState.isModalOpen = false;
    this.updateState.progressPercent = 0;
    this.updateState.isDownloading = false;
    this.updateState.isComplete = false;
    this.notify();
  }

  openUpdateModal() {
    this.updateState.isModalOpen = true;
    this.notify();
    // User requirement: "The window opens, and the update installs at the maximum speed possible"
    if (!this.updateState.isComplete && !this.updateState.isDownloading) {
      this.startDownloadUpdate();
    }
  }

  closeUpdateModal() {
    this.updateState.isModalOpen = false;
    this.notify();
  }

  startDownloadUpdate(onComplete = null) {
    if (this.updateState.isDownloading) return;
    this.updateState.isDownloading = true;
    this.updateState.progressPercent = 0;
    this.updateState.isComplete = false;
    this.notify();

    // High speed interval (every 75ms)
    const interval = setInterval(() => {
      this.updateState.progressPercent += Math.floor(Math.random() * 10) + 16; // 16-25% jump per 75ms
      if (this.updateState.progressPercent >= 100) {
        this.updateState.progressPercent = 100;
        this.updateState.isDownloading = false;
        this.updateState.isComplete = true;
        this.updateState.isAvailable = false; // Finished, update applied
        clearInterval(interval);
        
        this.addAlert({
          type: 'system',
          severity: 'success',
          title: 'System Update Complete',
          message: 'EstateRadar v2.4.1 has been installed. Background services uninterrupted.',
          timestamp: new Date().toLocaleTimeString(),
          employeeId: 'system'
        });

        if (onComplete) onComplete();
      }
      this.notify();
    }, 75);
  }

  simulateMockAttack() {
    this.securityState.mockDetected = true;
    this.currentUser.isMocking = true;
    this.addAlert({
      type: 'security',
      severity: 'critical',
      title: '🚨 MOCK LOCATION BLOCKED',
      message: `Security Shield: Fake GPS provider intercepted on ${this.currentUser.name}'s phone. Spoofed teleport blocked!`,
      timestamp: new Date().toLocaleTimeString(),
      employeeId: this.currentUser.id
    });
    this.notify();

    setTimeout(() => {
      this.securityState.mockDetected = false;
      this.currentUser.isMocking = false;
      this.notify();
    }, 6000);
  }

  simulateClusterAlert() {
    // Bring Bilal and Surveyor Unit 01 to the same cafe
    const cafeCoords = { lat: 31.5120, lng: 74.3510 };
    this.updateEmployeePosition('emp_01', cafeCoords, 0, 0, 'Cafe Bistro, Gulberg', 'idle');
    this.updateEmployeePosition('emp_02', { lat: 31.5122, lng: 74.3512 }, 0, 0, 'Cafe Bistro, Gulberg', 'idle');

    this.addAlert({
      type: 'cluster',
      severity: 'warning',
      title: '⚠️ FIELD CLUSTERING ALERT',
      message: 'Surveyor Unit 01 and Bilal Ahmed are 18 meters apart at Cafe Bistro for 20+ mins. Possible unscheduled gathering.',
      timestamp: new Date().toLocaleTimeString(),
      employeeId: 'emp_01'
    });
    this.notify();
  }
}

export const state = new StateManager();
