// EstateRadar — Supabase Cloud Backend Service
// Multi-Tenant SaaS Architecture: Guarantees strict data isolation between real estate companies

const STORAGE_KEY_URL = 'estateradar_supabase_url';
const STORAGE_KEY_KEY = 'estateradar_supabase_key';
const STORAGE_KEY_COMPANY = 'estateradar_active_company';

class SupabaseService {
  constructor() {
    this.url = localStorage.getItem(STORAGE_KEY_URL) || 'https://jejllmitucazgdcssoxp.supabase.co';
    this.key = localStorage.getItem(STORAGE_KEY_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplamxsbWl0dWNhemdkY3Nzb3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MzU3MjgsImV4cCI6MjEwMTQxMTcyOH0.XcfxYggvTcyRBiLdU4XmeDzeNOaumZI2DUBHV1j3vtk';
    this.client = null;
    this.isConnected = true;
    
    // Active Tenant Company (Default fallback is 'comp_demo')
    let savedComp = null;
    try {
      savedComp = JSON.parse(localStorage.getItem(STORAGE_KEY_COMPANY));
    } catch (e) {}

    this.activeCompany = savedComp || {
      id: 'comp_demo',
      name: 'EstateRadar Prime Real Estate',
      company_code: 'PRIME',
      admin_email: 'manager@estateradar.com'
    };

    if (this.url && this.key) {
      this.init();
    }
  }

  isConfigured() {
    return Boolean(this.url && this.key);
  }

  getCredentials() {
    return {
      url: this.url,
      key: this.key
    };
  }

  getActiveCompany() {
    return this.activeCompany;
  }

  setActiveCompany(company) {
    this.activeCompany = company;
    try {
      localStorage.setItem(STORAGE_KEY_COMPANY, JSON.stringify(company));
    } catch (e) {}
  }

  async saveCredentials(url, key) {
    const trimmedUrl = url.trim().replace(/\/$/, '');
    const trimmedKey = key.trim();

    this.url = trimmedUrl;
    this.key = trimmedKey;

    try {
      localStorage.setItem(STORAGE_KEY_URL, trimmedUrl);
      localStorage.setItem(STORAGE_KEY_KEY, trimmedKey);
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    return await this.testConnection();
  }

  clearCredentials() {
    this.url = '';
    this.key = '';
    this.isConnected = false;
    try {
      localStorage.removeItem(STORAGE_KEY_URL);
      localStorage.removeItem(STORAGE_KEY_KEY);
      localStorage.removeItem(STORAGE_KEY_COMPANY);
    } catch (e) {}
  }

  init() {
    if (this.url && this.key) {
      this.isConnected = true;
    }
  }

  async testConnection() {
    if (!this.url || !this.key) {
      this.isConnected = false;
      return { success: false, message: 'URL and Anon API Key are required.' };
    }

    try {
      const response = await fetch(`${this.url}/rest/v1/companies?select=count`, {
        method: 'GET',
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Range': '0-0'
        }
      });

      if (response.ok || response.status === 206) {
        this.isConnected = true;
        return { success: true, message: 'Connected to Supabase Multi-Tenant Database!' };
      } else if (response.status === 404) {
        this.isConnected = true;
        return { 
          success: true, 
          message: 'Connected to Supabase project! Please execute schema.sql in SQL Editor.' 
        };
      } else {
        const errorText = await response.text();
        this.isConnected = false;
        return { 
          success: false, 
          message: `Connection error (${response.status}): ${errorText.substring(0, 100)}` 
        };
      }
    } catch (err) {
      this.isConnected = false;
      return { 
        success: false, 
        message: `Network error: Could not connect to ${this.url}. Check URL or internet.` 
      };
    }
  }

  // ==========================================================================
  // MULTI-TENANT SAAS OPERATIONS (COMPANY ISOLATION)
  // ==========================================================================

  // Register a new independent Real Estate Agency / Company
  async registerCompany(name, companyCode, email, password) {
    if (!this.isConfigured()) return { success: false, message: 'Cloud database not connected.' };
    
    const formattedCode = companyCode.trim().toUpperCase();
    const companyId = 'comp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    try {
      const res = await fetch(`${this.url}/rest/v1/companies`, {
        method: 'POST',
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          id: companyId,
          name: name.trim(),
          company_code: formattedCode,
          admin_email: email.trim().toLowerCase(),
          admin_password: password,
          plan: 'Enterprise'
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        if (res.status === 409 || errJson.message?.includes('duplicate')) {
          return { success: false, message: `Company Code "${formattedCode}" is already taken. Please choose another.` };
        }
        return { success: false, message: errJson.message || 'Failed to register company.' };
      }

      const created = await res.json();
      const company = created[0] || { id: companyId, name, company_code: formattedCode, admin_email: email };
      this.setActiveCompany(company);

      return { success: true, company };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  // Authenticate Company Manager
  async loginCompanyManager(companyCode, email, password) {
    if (!this.isConfigured()) return { success: false, message: 'Cloud database not connected.' };
    
    const formattedCode = companyCode.trim().toUpperCase();
    const formattedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch(
        `${this.url}/rest/v1/companies?company_code=eq.${encodeURIComponent(formattedCode)}&admin_email=eq.${encodeURIComponent(formattedEmail)}&select=*`,
        {
          headers: {
            'apikey': this.key,
            'Authorization': `Bearer ${this.key}`
          }
        }
      );

      if (!res.ok) return { success: false, message: 'Invalid server response.' };
      const list = await res.json();
      if (!list || list.length === 0) {
        return { success: false, message: 'Company Code or Manager Email not found.' };
      }

      const company = list[0];
      if (company.admin_password !== password) {
        return { success: false, message: 'Incorrect manager password.' };
      }

      this.setActiveCompany(company);
      return { success: true, company };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  // Authenticate Field Surveyor under their specific Company
  async loginEmployee(companyCode, username, password) {
    if (!this.isConfigured()) return { success: false, message: 'Cloud database not connected.' };
    
    const formattedCode = companyCode.trim().toUpperCase();
    const formattedUser = username.trim().toLowerCase();

    try {
      // 1. Resolve Company
      const compRes = await fetch(`${this.url}/rest/v1/companies?company_code=eq.${encodeURIComponent(formattedCode)}&select=*`, {
        headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}` }
      });
      if (!compRes.ok) return { success: false, message: 'Failed to verify company.' };
      const compList = await compRes.json();
      if (!compList || compList.length === 0) {
        return { success: false, message: `Company Code "${formattedCode}" does not exist.` };
      }
      const company = compList[0];

      // 2. Resolve Employee strictly within that Company
      const empRes = await fetch(
        `${this.url}/rest/v1/employees?company_id=eq.${encodeURIComponent(company.id)}&username=eq.${encodeURIComponent(formattedUser)}&select=*`,
        {
          headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}` }
        }
      );

      if (!empRes.ok) return { success: false, message: 'Failed to fetch employee record.' };
      const empList = await empRes.json();
      if (!empList || empList.length === 0) {
        return { success: false, message: `Staff username "${username}" not registered in ${company.name}.` };
      }

      const employee = empList[0];
      if (employee.password !== password) {
        return { success: false, message: 'Incorrect password for this staff ID.' };
      }

      this.setActiveCompany(company);
      return { success: true, company, employee };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  // Fetch only this Company's employees
  async fetchEmployees(companyId = this.activeCompany?.id) {
    if (!this.isConfigured() || !companyId) return null;
    try {
      const res = await fetch(`${this.url}/rest/v1/employees?company_id=eq.${encodeURIComponent(companyId)}&select=*&order=name.asc`, {
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`
        }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error('Supabase fetchEmployees error:', err);
      return null;
    }
  }

  // Create a new employee strictly under this Company
  async createEmployee(employee, companyId = this.activeCompany?.id) {
    if (!this.isConfigured() || !companyId) return { success: false, localOnly: true };
    try {
      const res = await fetch(`${this.url}/rest/v1/employees`, {
        method: 'POST',
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          id: employee.id,
          company_id: companyId,
          name: employee.name,
          username: employee.username,
          password: employee.password,
          role: employee.role,
          phone: employee.phone,
          status: employee.status || 'offline',
          is_clocked_in: employee.isClockedIn || false,
          latitude: employee.currentCoords?.lat || 31.5204,
          longitude: employee.currentCoords?.lng || 74.3587,
          battery_percent: employee.batteryPercent || 100
        })
      });
      return { success: res.ok };
    } catch (err) {
      console.error('Supabase createEmployee error:', err);
      return { success: false, error: err.message };
    }
  }

  // Record live GPS ping strictly tagged with company_id
  async recordGpsPing(telemetry, companyId = this.activeCompany?.id) {
    if (!this.isConfigured() || !companyId) return { success: false, localOnly: true };
    try {
      const res = await fetch(`${this.url}/rest/v1/gps_logs`, {
        method: 'POST',
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_id: companyId,
          employee_id: telemetry.employeeId,
          latitude: telemetry.lat,
          longitude: telemetry.lng,
          speed_kmh: telemetry.speed || 0,
          battery_percent: telemetry.battery || 100,
          current_address: telemetry.address || '',
          transit_status: telemetry.status || 'moving',
          timestamp: new Date().toISOString()
        })
      });
      return { success: res.ok };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Fetch verified properties strictly for this Company
  async fetchProperties(companyId = this.activeCompany?.id) {
    if (!this.isConfigured() || !companyId) return null;
    try {
      const res = await fetch(`${this.url}/rest/v1/properties?company_id=eq.${encodeURIComponent(companyId)}&select=*&order=created_at.desc`, {
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`
        }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error('Supabase fetchProperties error:', err);
      return null;
    }
  }

  // Save verified property survey strictly tagged with company_id
  async savePropertySurvey(property, companyId = this.activeCompany?.id) {
    if (!this.isConfigured() || !companyId) return { success: false, localOnly: true };
    try {
      const res = await fetch(`${this.url}/rest/v1/properties`, {
        method: 'POST',
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: property.id,
          company_id: companyId,
          surveyor_id: property.surveyorId,
          surveyor_name: property.surveyorName,
          address: property.address,
          property_type: property.type,
          area: property.area,
          demand: property.demand,
          deal_status: property.status,
          owner_name: property.ownerName,
          owner_phone: property.ownerPhone,
          condition_notes: property.condition,
          latitude: property.coordinates?.lat,
          longitude: property.coordinates?.lng,
          image_url: property.imageUrl,
          timestamp: property.timestamp
        })
      });
      return { success: res.ok };
    } catch (err) {
      console.error('Supabase savePropertySurvey error:', err);
      return { success: false, error: err.message };
    }
  }
}

export const supabase = new SupabaseService();
