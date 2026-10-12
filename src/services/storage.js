// EstateRadar Local Multi-Tenant Storage Service
// Handles strict tenant isolation, zero dummy data, and local offline persistence

const STORAGE_COMPANIES = 'estateradar_companies_v3';
const STORAGE_EMPLOYEES = 'estateradar_employees_v3';
const STORAGE_PROPERTIES = 'estateradar_properties_v3';

class StorageService {
  // --- Companies / Agencies ---
  getCompanies() {
    try {
      const data = localStorage.getItem(STORAGE_COMPANIES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveCompany(company) {
    const list = this.getCompanies();
    const formattedCode = company.company_code.trim().toUpperCase();
    const existingIndex = list.findIndex(c => c.company_code.toUpperCase() === formattedCode);
    const updatedCompany = {
      ...company,
      company_code: formattedCode,
      updated_at: new Date().toISOString()
    };
    if (existingIndex >= 0) {
      list[existingIndex] = updatedCompany;
    } else {
      list.push(updatedCompany);
    }
    try {
      localStorage.setItem(STORAGE_COMPANIES, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save company to localStorage', e);
    }
    return updatedCompany;
  }

  findCompanyByCode(code) {
    if (!code) return null;
    const formatted = code.trim().toUpperCase();
    const list = this.getCompanies();
    return list.find(c => c.company_code.toUpperCase() === formatted) || null;
  }

  // --- Employees & Join Requests ---
  getAllEmployees() {
    try {
      const data = localStorage.getItem(STORAGE_EMPLOYEES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  getEmployeesForCompany(companyCode) {
    if (!companyCode) return [];
    const formatted = companyCode.trim().toUpperCase();
    return this.getAllEmployees().filter(e => e.company_code.toUpperCase() === formatted);
  }

  saveEmployee(employee) {
    const list = this.getAllEmployees();
    const existingIndex = list.findIndex(e => e.id === employee.id);
    const updated = {
      ...employee,
      company_code: employee.company_code.trim().toUpperCase(),
      updated_at: new Date().toISOString()
    };
    if (existingIndex >= 0) {
      list[existingIndex] = updated;
    } else {
      list.push(updated);
    }
    try {
      localStorage.setItem(STORAGE_EMPLOYEES, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save employee to localStorage', e);
    }
    return updated;
  }

  updateEmployee(employeeId, updates) {
    const list = this.getAllEmployees();
    const index = list.findIndex(e => e.id === employeeId);
    if (index >= 0) {
      list[index] = { ...list[index], ...updates, updated_at: new Date().toISOString() };
      try {
        localStorage.setItem(STORAGE_EMPLOYEES, JSON.stringify(list));
      } catch (e) {}
      return list[index];
    }
    return null;
  }

  deleteEmployee(employeeId) {
    const list = this.getAllEmployees().filter(e => e.id !== employeeId);
    try {
      localStorage.setItem(STORAGE_EMPLOYEES, JSON.stringify(list));
    } catch (e) {}
    return true;
  }

  // Accept employee request
  acceptEmployeeRequest(employeeId) {
    return this.updateEmployee(employeeId, { status: 'active' });
  }

  // Reject / Delete employee request
  rejectEmployeeRequest(employeeId) {
    return this.deleteEmployee(employeeId);
  }

  // --- Properties ---
  getAllProperties() {
    try {
      const data = localStorage.getItem(STORAGE_PROPERTIES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  getPropertiesForCompany(companyCode) {
    if (!companyCode) return [];
    const formatted = companyCode.trim().toUpperCase();
    return this.getAllProperties().filter(p => p.company_code && p.company_code.toUpperCase() === formatted);
  }

  saveProperty(property) {
    const list = this.getAllProperties();
    const existingIndex = list.findIndex(p => p.id === property.id);
    const updated = {
      ...property,
      company_code: (property.company_code || '').trim().toUpperCase(),
      created_at: property.created_at || new Date().toISOString()
    };
    if (existingIndex >= 0) {
      list[existingIndex] = updated;
    } else {
      list.unshift(updated);
    }
    try {
      localStorage.setItem(STORAGE_PROPERTIES, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save property', e);
    }
    return updated;
  }

  // --- Password Reset ---
  resetPassword(companyCode, emailOrUsername, newPassword) {
    const formattedCode = (companyCode || '').trim().toUpperCase();
    const target = (emailOrUsername || '').trim().toLowerCase();

    // Check if manager of the company
    const company = this.findCompanyByCode(formattedCode);
    if (company && (company.admin_email?.toLowerCase() === target || company.company_code.toLowerCase() === target)) {
      company.admin_password = newPassword;
      this.saveCompany(company);
      return { success: true, role: 'manager', message: 'Manager password updated successfully.' };
    }

    // Check if employee
    const employees = this.getEmployeesForCompany(formattedCode);
    const employee = employees.find(e => 
      e.email?.toLowerCase() === target || 
      e.username?.toLowerCase() === target
    );
    if (employee) {
      this.updateEmployee(employee.id, { password: newPassword });
      return { success: true, role: 'employee', message: 'Employee password updated successfully.' };
    }

    return { success: false, message: 'No account found matching this Agency Code and Email/Username.' };
  }
}

export const storage = new StorageService();
