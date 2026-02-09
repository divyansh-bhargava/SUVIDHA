// Mock data for admin dashboard
import type { AdminUser, ServiceRequest, DepartmentStats, AuditEntry, Department } from '@/types/admin';

export const mockAdminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    name: 'Dr. Meera Sharma',
    nameHi: 'डॉ. मीरा शर्मा',
    email: 'meera.sharma@suvidha.gov.in',
    role: 'master',
    city: 'New Delhi',
    cityHi: 'नई दिल्ली',
  },
  {
    id: 'admin-2',
    name: 'Rakesh Gupta',
    nameHi: 'राकेश गुप्ता',
    email: 'rakesh.gupta@suvidha.gov.in',
    role: 'department',
    department: 'electricity',
    city: 'New Delhi',
    cityHi: 'नई दिल्ली',
  },
  {
    id: 'admin-3',
    name: 'Priya Verma',
    nameHi: 'प्रिया वर्मा',
    email: 'priya.verma@suvidha.gov.in',
    role: 'staff',
    department: 'electricity',
    city: 'New Delhi',
    cityHi: 'नई दिल्ली',
  },
  {
    id: 'admin-4',
    name: 'Suresh Kumar',
    nameHi: 'सुरेश कुमार',
    email: 'suresh.kumar@suvidha.gov.in',
    role: 'department',
    department: 'water',
    city: 'New Delhi',
    cityHi: 'नई दिल्ली',
  },
];

export const mockServiceRequests: ServiceRequest[] = [
  {
    id: 'req-1',
    ticketId: 'TKT2024000001',
    citizenId: '1',
    citizenName: 'Rajesh Kumar',
    suvidhaId: 'SUV2024001234',
    department: 'electricity',
    serviceType: 'New Meter Connection',
    description: 'Requesting new electricity meter connection for residential property at Sector 12.',
    status: 'pending',
    createdAt: '2024-01-25T10:30:00',
    updatedAt: '2024-01-25T10:30:00',
    documents: [
      {
        id: 'doc-1',
        name: 'Aadhaar Card',
        type: 'identity',
        aiStatus: 'passed',
        aiChecks: [
          { name: 'Format Check', passed: true, message: 'Valid PDF format' },
          { name: 'Clarity Check', passed: true, message: 'Image is clear' },
          { name: 'Required Fields', passed: true, message: 'All fields visible' },
        ],
      },
      {
        id: 'doc-2',
        name: 'Address Proof',
        type: 'address',
        aiStatus: 'passed',
        aiChecks: [
          { name: 'Format Check', passed: true, message: 'Valid JPG format' },
          { name: 'Clarity Check', passed: true, message: 'Image is clear' },
          { name: 'Required Fields', passed: true, message: 'Address visible' },
        ],
      },
      {
        id: 'doc-3',
        name: 'Property Document',
        type: 'property',
        aiStatus: 'needs_review',
        aiChecks: [
          { name: 'Format Check', passed: true, message: 'Valid PDF format' },
          { name: 'Clarity Check', passed: false, message: 'Some sections appear blurry' },
          { name: 'Required Fields', passed: true, message: 'Property details visible' },
        ],
      },
    ],
    aiCheckResult: {
      overallStatus: 'needs_review',
      checks: [
        { name: 'All Documents Present', passed: true, message: '3/3 required documents uploaded' },
        { name: 'Identity Verified', passed: true, message: 'Aadhaar card validated' },
        { name: 'Document Quality', passed: false, message: '1 document needs review' },
      ],
    },
  },
  {
    id: 'req-2',
    ticketId: 'TKT2024000002',
    citizenId: '2',
    citizenName: 'Priya Sharma',
    suvidhaId: 'SUV2024005678',
    department: 'water',
    serviceType: 'Water Quality Issue',
    description: 'Contaminated water supply in our colony for the past week.',
    status: 'processing',
    createdAt: '2024-01-24T09:15:00',
    updatedAt: '2024-01-25T14:20:00',
    assignedTo: 'admin-4',
    documents: [
      {
        id: 'doc-4',
        name: 'ID Proof',
        type: 'identity',
        aiStatus: 'passed',
        aiChecks: [
          { name: 'Format Check', passed: true, message: 'Valid format' },
          { name: 'Clarity Check', passed: true, message: 'Clear image' },
        ],
      },
      {
        id: 'doc-5',
        name: 'Water Test Report',
        type: 'supporting',
        aiStatus: 'needs_review',
        aiChecks: [
          { name: 'Format Check', passed: true, message: 'Valid PDF' },
          { name: 'Lab Verification', passed: false, message: 'Lab certificate not detected' },
        ],
      },
    ],
    aiCheckResult: {
      overallStatus: 'needs_review',
      checks: [
        { name: 'Documents Present', passed: true, message: '2/2 documents uploaded' },
        { name: 'Supporting Evidence', passed: false, message: 'Lab report needs verification' },
      ],
    },
  },
  {
    id: 'req-3',
    ticketId: 'TKT2024000003',
    citizenId: '3',
    citizenName: 'Amit Patel',
    suvidhaId: 'SUV2024009012',
    department: 'municipal',
    serviceType: 'Pothole',
    description: 'Large pothole on main road near Sector 15 causing accidents.',
    status: 'pending',
    createdAt: '2024-01-23T16:45:00',
    updatedAt: '2024-01-23T16:45:00',
    documents: [
      {
        id: 'doc-6',
        name: 'Location Photo',
        type: 'evidence',
        aiStatus: 'passed',
        aiChecks: [
          { name: 'Format Check', passed: true, message: 'Valid JPG format' },
          { name: 'Clarity Check', passed: true, message: 'Clear photo' },
          { name: 'Location Visible', passed: true, message: 'Landmark visible in photo' },
        ],
      },
    ],
    aiCheckResult: {
      overallStatus: 'passed',
      checks: [
        { name: 'Evidence Provided', passed: true, message: 'Photo evidence uploaded' },
        { name: 'Location Identifiable', passed: true, message: 'Location can be verified' },
      ],
    },
  },
  {
    id: 'req-4',
    ticketId: 'TKT2024000004',
    citizenId: '4',
    citizenName: 'Sunita Devi',
    suvidhaId: 'SUV2024003456',
    department: 'electricity',
    serviceType: 'Power Outage',
    description: 'Frequent power cuts in evening hours for past 3 days.',
    status: 'pending',
    createdAt: '2024-01-25T08:00:00',
    updatedAt: '2024-01-25T08:00:00',
    documents: [],
    aiCheckResult: {
      overallStatus: 'passed',
      checks: [
        { name: 'Complaint Valid', passed: true, message: 'No documents required for outage report' },
      ],
    },
  },
  {
    id: 'req-5',
    ticketId: 'TKT2024000005',
    citizenId: '5',
    citizenName: 'Mohammed Khan',
    suvidhaId: 'SUV2024007890',
    department: 'gas',
    serviceType: 'New Gas Connection',
    description: 'New PNG connection request for residential flat.',
    status: 'pending',
    createdAt: '2024-01-24T11:30:00',
    updatedAt: '2024-01-24T11:30:00',
    documents: [
      {
        id: 'doc-7',
        name: 'Aadhaar Card',
        type: 'identity',
        aiStatus: 'passed',
        aiChecks: [
          { name: 'Format Check', passed: true, message: 'Valid format' },
          { name: 'Clarity Check', passed: true, message: 'Clear' },
        ],
      },
      {
        id: 'doc-8',
        name: 'NOC from Society',
        type: 'noc',
        aiStatus: 'failed',
        aiChecks: [
          { name: 'Format Check', passed: true, message: 'Valid PDF' },
          { name: 'Signature Check', passed: false, message: 'Signature not detected' },
          { name: 'Stamp Check', passed: false, message: 'Official stamp not visible' },
        ],
      },
    ],
    aiCheckResult: {
      overallStatus: 'failed',
      checks: [
        { name: 'Identity Verified', passed: true, message: 'ID proof valid' },
        { name: 'NOC Verification', passed: false, message: 'NOC document issues detected' },
      ],
    },
  },
  {
    id: 'req-6',
    ticketId: 'TKT2024000006',
    citizenId: '6',
    citizenName: 'Anita Roy',
    suvidhaId: 'SUV2024002345',
    department: 'electricity',
    serviceType: 'Name Transfer',
    description: 'Transfer meter ownership after property purchase.',
    status: 'approved',
    createdAt: '2024-01-20T10:00:00',
    updatedAt: '2024-01-22T15:30:00',
    verifiedBy: 'admin-3',
    verifiedAt: '2024-01-22T15:30:00',
    remarks: 'All documents verified. Transfer approved.',
    documents: [
      {
        id: 'doc-9',
        name: 'Sale Deed',
        type: 'property',
        aiStatus: 'passed',
        staffStatus: 'valid',
        aiChecks: [
          { name: 'Format Check', passed: true, message: 'Valid PDF' },
          { name: 'Registration', passed: true, message: 'Registration stamp visible' },
        ],
      },
    ],
    aiCheckResult: {
      overallStatus: 'passed',
      checks: [
        { name: 'Documents Complete', passed: true, message: 'All required documents present' },
      ],
    },
  },
];

export const mockDepartmentStats: DepartmentStats[] = [
  {
    department: 'electricity',
    totalRequests: 156,
    pendingRequests: 14,
    pendingDocs: 6,
    approvedToday: 8,
    avgProcessingTime: '2.5 days',
    complaintVolume: 23,
  },
  {
    department: 'water',
    totalRequests: 89,
    pendingRequests: 8,
    pendingDocs: 3,
    approvedToday: 5,
    avgProcessingTime: '1.8 days',
    complaintVolume: 15,
  },
  {
    department: 'gas',
    totalRequests: 45,
    pendingRequests: 5,
    pendingDocs: 2,
    approvedToday: 3,
    avgProcessingTime: '3.2 days',
    complaintVolume: 4,
  },
  {
    department: 'municipal',
    totalRequests: 210,
    pendingRequests: 22,
    pendingDocs: 8,
    approvedToday: 12,
    avgProcessingTime: '4.1 days',
    complaintVolume: 45,
  },
];

export const mockAuditEntries: AuditEntry[] = [
  {
    id: 'audit-1',
    requestId: 'req-6',
    action: 'approved',
    staffId: 'admin-3',
    staffName: 'Priya Verma',
    department: 'electricity',
    timestamp: '2024-01-22T15:30:00',
    remarks: 'All documents verified. Transfer approved.',
  },
  {
    id: 'audit-2',
    requestId: 'req-2',
    action: 'reviewed',
    staffId: 'admin-4',
    staffName: 'Suresh Kumar',
    department: 'water',
    timestamp: '2024-01-25T14:20:00',
    remarks: 'Assigned for field verification.',
  },
];

// Helper function to get stats by department
export const getStatsByDepartment = (department: Department): DepartmentStats | undefined => {
  return mockDepartmentStats.find(s => s.department === department);
};

// Helper function to get requests by department
export const getRequestsByDepartment = (department: Department): ServiceRequest[] => {
  return mockServiceRequests.filter(r => r.department === department);
};

// Helper function to get total stats across all departments
export const getTotalStats = () => {
  return {
    totalRequests: mockDepartmentStats.reduce((sum, d) => sum + d.totalRequests, 0),
    pendingRequests: mockDepartmentStats.reduce((sum, d) => sum + d.pendingRequests, 0),
    approvedToday: mockDepartmentStats.reduce((sum, d) => sum + d.approvedToday, 0),
    avgProcessingTime: '2.9 days',
  };
};
