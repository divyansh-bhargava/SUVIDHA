// Admin role types and interfaces for SUVIDHA

export type AdminRole = 'master' | 'department' | 'staff';
export type Department = 'electricity' | 'water' | 'gas' | 'municipal';

export interface AdminUser {
  id: string;
  name: string;
  nameHi: string;
  email: string;
  role: AdminRole;
  department?: Department; // Only for department/staff roles
  city: string;
  cityHi: string;
}

export interface ServiceRequest {
  id: string;
  ticketId: string;
  citizenId: string;
  citizenName: string;
  suvidhaId: string;
  department: Department;
  serviceType: string;
  description: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'needs_correction';
  createdAt: string;
  updatedAt: string;
  documents: RequestDocument[];
  aiCheckResult: AICheckResult;
  assignedTo?: string;
  remarks?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface RequestDocument {
  id: string;
  name: string;
  type: string;
  url?: string;
  aiStatus: 'passed' | 'needs_review' | 'failed';
  aiChecks: AICheck[];
  staffStatus?: 'valid' | 'invalid' | 'pending';
  staffRemarks?: string;
}

export interface AICheck {
  name: string;
  passed: boolean;
  message: string;
}

export interface AICheckResult {
  overallStatus: 'passed' | 'needs_review' | 'failed';
  checks: AICheck[];
}

export interface DepartmentStats {
  department: Department;
  totalRequests: number;
  pendingRequests: number;
  pendingDocs: number;
  approvedToday: number;
  avgProcessingTime: string;
  complaintVolume: number;
}

export interface AuditEntry {
  id: string;
  requestId: string;
  action: 'created' | 'reviewed' | 'approved' | 'rejected' | 'updated';
  staffId: string;
  staffName: string;
  department: Department;
  timestamp: string;
  remarks?: string;
}

// Service type to department mapping
export const SERVICE_DEPARTMENT_MAP: Record<string, Department> = {
  'Electricity Bill': 'electricity',
  'New Meter Connection': 'electricity',
  'Meter Reading Issue': 'electricity',
  'Power Outage': 'electricity',
  'Load Enhancement': 'electricity',
  'Name Transfer': 'electricity',
  'Disconnection': 'electricity',
  'Water Bill': 'water',
  'New Water Connection': 'water',
  'Water Quality Issue': 'water',
  'Leakage Complaint': 'water',
  'Pipeline Issue': 'water',
  'Gas Bill': 'gas',
  'New Gas Connection': 'gas',
  'Gas Leakage': 'gas',
  'Property Tax': 'municipal',
  'Birth Certificate': 'municipal',
  'Death Certificate': 'municipal',
  'Trade License': 'municipal',
  'Building Permission': 'municipal',
  'Drainage Issue': 'municipal',
  'Pothole': 'municipal',
};

// Department labels
export const DEPARTMENT_LABELS: Record<Department, { en: string; hi: string }> = {
  electricity: { en: 'Electricity', hi: 'बिजली' },
  water: { en: 'Water', hi: 'पानी' },
  gas: { en: 'Gas', hi: 'गैस' },
  municipal: { en: 'Municipal Services', hi: 'नगरपालिका सेवाएं' },
};

// Admin role labels
export const ROLE_LABELS: Record<AdminRole, { en: string; hi: string }> = {
  master: { en: 'Master Admin', hi: 'मुख्य व्यवस्थापक' },
  department: { en: 'Department Admin', hi: 'विभाग व्यवस्थापक' },
  staff: { en: 'Verifier', hi: 'सत्यापनकर्ता' },
};
