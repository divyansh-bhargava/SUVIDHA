import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { AdminRole, Department, AdminUser, ServiceRequest } from '@/types/admin';
import { mockAdminUsers, mockServiceRequests } from '@/data/mockAdminData';

type Language = 'en' | 'hi';

interface Citizen {
  id: string;
  name: string;
  nameHi: string;
  suvidhaId: string;
  phone: string;
  email: string;
  address: string;
  addressHi: string;
  city: string;
  cityHi: string;
  ward: string;
  aadhaarLast4: string;
  documents: Document[];
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  status: 'valid' | 'invalid' | 'pending';
  lastUsed?: string;
  expiryDate?: string;
}

interface Complaint {
  id: string;
  ticketId: string;
  department: string;
  type: string;
  description: string;
  status: 'pending' | 'processing' | 'resolved' | 'rejected';
  createdAt: string;
  citizenId: string;
}

interface Bill {
  id: string;
  service: string;
  consumerNumber: string;
  amount: number;
  dueDate: string;
  status: 'unpaid' | 'paid';
  period: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  voiceTranscript: string;
  setVoiceTranscript: (transcript: string) => void;
  citizen: Citizen | null;
  setCitizen: (citizen: Citizen | null) => void;
  login: (suvidhaId: string) => boolean;
  logout: () => void;
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, 'id' | 'ticketId' | 'createdAt' | 'citizenId'>) => string;
  getComplaintByTicketId: (ticketId: string) => Complaint | undefined;
  bills: Bill[];
  payBill: (billId: string) => void;
  // Admin state
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  adminUser: AdminUser | null;
  adminRole: AdminRole | null;
  adminDepartment: Department | null;
  serviceRequests: ServiceRequest[];
  updateRequestStatus: (requestId: string, status: ServiceRequest['status'], remarks?: string) => void;
  // Session
  sessionTimeout: number;
  resetSessionTimeout: () => void;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    welcome: 'Welcome to SUVIDHA',
    subtitle: 'Unified Civic Services',
    selectLanguage: 'Select Language',
    english: 'English',
    hindi: 'हिंदी',
    scanId: 'Scan SUVIDHA ID',
    enterId: 'Enter SUVIDHA ID',
    login: 'Login',
    logout: 'Logout',
    dashboard: 'Dashboard',
    hello: 'Hello',
    yourId: 'Your SUVIDHA ID',
    services: 'Services',
    electricity: 'Electricity',
    water: 'Water',
    gas: 'Gas',
    municipal: 'Municipal Services',
    pressSpeak: 'Press & Speak',
    listening: 'Listening...',
    youSaid: 'You said',
    billPayment: 'Bill Payment',
    enterConsumerNo: 'Enter Consumer Number',
    viewBill: 'View Bill',
    payNow: 'Pay Now',
    payViaUpi: 'Pay via UPI',
    scanQr: 'Scan QR to Pay',
    paymentSuccess: 'Payment Successful!',
    downloadReceipt: 'Download Receipt',
    registerComplaint: 'Register Complaint',
    selectDepartment: 'Select Department',
    complaintType: 'Complaint Type',
    description: 'Description',
    submit: 'Submit',
    ticketGenerated: 'Ticket Generated',
    trackStatus: 'Track Status',
    enterTicketId: 'Enter Ticket/Request ID',
    checkStatus: 'Check Status',
    currentStatus: 'Current Status',
    pending: 'Pending',
    processing: 'Processing',
    resolved: 'Resolved',
    rejected: 'Rejected',
    approved: 'Approved',
    needs_correction: 'Needs Correction',
    documents: 'Documents',
    uploadNew: 'Upload New',
    reuse: 'Reuse',
    replace: 'Replace',
    aiCheck: 'AI Pre-Check',
    valid: 'Valid',
    invalid: 'Invalid',
    adminDashboard: 'Admin Dashboard',
    requests: 'Requests',
    approve: 'Approve',
    reject: 'Reject',
    remarks: 'Remarks',
    back: 'Back',
    home: 'Home',
    amount: 'Amount',
    dueDate: 'Due Date',
    period: 'Period',
    consumerNo: 'Consumer No',
    paid: 'Paid',
    unpaid: 'Unpaid',
    viewDocuments: 'View Documents',
    profile: 'Profile',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    confirmSubmit: 'Confirm & Submit',
    editDetails: 'Edit Details',
    voiceAssist: 'Voice Assist',
    autoLogout: 'Auto-logout in',
    seconds: 'seconds',
    sessionExpired: 'Session Expired',
    loginAgain: 'Please login again',
    or: 'OR',
    admin: 'Admin',
    scanQrCode: 'Scan QR Code',
    placeQrHere: 'Place QR code in front of camera',
    newConnection: 'New Connection',
    selectServiceType: 'Select Service Type',
    documentsRequired: 'Documents Required',
    previouslyUploaded: 'Previously Uploaded',
    scanToUpload: 'Scan QR to Upload',
    aiPreCheckActive: 'AI Pre-Check Active',
    reviewBeforeSubmit: 'Review Before Submission',
    saveToProfile: 'Save to Profile',
    applicationSubmitted: 'Application Submitted',
    trackApplication: 'Track Application',
  },
  hi: {
    welcome: 'सुविधा में आपका स्वागत है',
    subtitle: 'एकीकृत नागरिक सेवाएं',
    selectLanguage: 'भाषा चुनें',
    english: 'English',
    hindi: 'हिंदी',
    scanId: 'सुविधा ID स्कैन करें',
    enterId: 'सुविधा ID दर्ज करें',
    login: 'लॉगिन',
    logout: 'लॉगआउट',
    dashboard: 'डैशबोर्ड',
    hello: 'नमस्ते',
    yourId: 'आपकी सुविधा ID',
    services: 'सेवाएं',
    electricity: 'बिजली',
    water: 'पानी',
    gas: 'गैस',
    municipal: 'नगरपालिका सेवाएं',
    pressSpeak: 'दबाएं और बोलें',
    listening: 'सुन रहा है...',
    youSaid: 'आपने कहा',
    billPayment: 'बिल भुगतान',
    enterConsumerNo: 'उपभोक्ता नंबर दर्ज करें',
    viewBill: 'बिल देखें',
    payNow: 'अभी भुगतान करें',
    payViaUpi: 'UPI से भुगतान करें',
    scanQr: 'भुगतान के लिए QR स्कैन करें',
    paymentSuccess: 'भुगतान सफल!',
    downloadReceipt: 'रसीद डाउनलोड करें',
    registerComplaint: 'शिकायत दर्ज करें',
    selectDepartment: 'विभाग चुनें',
    complaintType: 'शिकायत का प्रकार',
    description: 'विवरण',
    submit: 'जमा करें',
    ticketGenerated: 'टिकट जनरेट हुआ',
    trackStatus: 'स्थिति ट्रैक करें',
    enterTicketId: 'टिकट/अनुरोध ID दर्ज करें',
    checkStatus: 'स्थिति जांचें',
    currentStatus: 'वर्तमान स्थिति',
    pending: 'लंबित',
    processing: 'प्रक्रियाधीन',
    resolved: 'हल किया गया',
    rejected: 'अस्वीकृत',
    approved: 'स्वीकृत',
    needs_correction: 'सुधार आवश्यक',
    documents: 'दस्तावेज़',
    uploadNew: 'नया अपलोड करें',
    reuse: 'पुनः उपयोग',
    replace: 'बदलें',
    aiCheck: 'AI जांच',
    valid: 'वैध',
    invalid: 'अवैध',
    adminDashboard: 'व्यवस्थापक डैशबोर्ड',
    requests: 'अनुरोध',
    approve: 'स्वीकृत',
    reject: 'अस्वीकृत',
    remarks: 'टिप्पणी',
    back: 'वापस',
    home: 'होम',
    amount: 'राशि',
    dueDate: 'देय तिथि',
    period: 'अवधि',
    consumerNo: 'उपभोक्ता नंबर',
    paid: 'भुगतान हो गया',
    unpaid: 'अवैतनिक',
    viewDocuments: 'दस्तावेज़ देखें',
    profile: 'प्रोफ़ाइल',
    name: 'नाम',
    phone: 'फ़ोन',
    email: 'ईमेल',
    address: 'पता',
    confirmSubmit: 'पुष्टि करें और जमा करें',
    editDetails: 'विवरण संपादित करें',
    voiceAssist: 'आवाज सहायता',
    autoLogout: 'स्वतः लॉगआउट',
    seconds: 'सेकंड में',
    sessionExpired: 'सत्र समाप्त',
    loginAgain: 'कृपया फिर से लॉगिन करें',
    or: 'या',
    admin: 'व्यवस्थापक',
    scanQrCode: 'QR कोड स्कैन करें',
    placeQrHere: 'कैमरे के सामने QR कोड रखें',
    newConnection: 'नया कनेक्शन',
    selectServiceType: 'सेवा प्रकार चुनें',
    documentsRequired: 'दस्तावेज़ आवश्यक',
    previouslyUploaded: 'पहले अपलोड किया गया',
    scanToUpload: 'अपलोड के लिए QR स्कैन करें',
    aiPreCheckActive: 'AI पूर्व-जांच सक्रिय',
    reviewBeforeSubmit: 'जमा करने से पहले समीक्षा करें',
    saveToProfile: 'प्रोफ़ाइल में सहेजें',
    applicationSubmitted: 'आवेदन जमा हो गया',
    trackApplication: 'आवेदन ट्रैक करें',
  },
};

// Mock data
const mockCitizen: Citizen = {
  id: '1',
  name: 'Rajesh Kumar',
  nameHi: 'राजेश कुमार',
  suvidhaId: 'SUV2024001234',
  phone: '+91 98765 43210',
  email: 'rajesh.kumar@email.com',
  address: '45, MG Road, Sector 12, New Delhi - 110001',
  addressHi: '45, एमजी रोड, सेक्टर 12, नई दिल्ली - 110001',
  city: 'New Delhi',
  cityHi: 'नई दिल्ली',
  ward: 'Ward 12',
  aadhaarLast4: '4567',
  documents: [
    { id: '1', name: 'Aadhaar Card', type: 'identity', uploadDate: '2024-01-15', status: 'valid', lastUsed: '2024-01-20' },
    { id: '2', name: 'PAN Card', type: 'identity', uploadDate: '2024-01-15', status: 'valid', lastUsed: '2024-01-18' },
    { id: '3', name: 'Address Proof', type: 'address', uploadDate: '2024-02-10', status: 'valid', expiryDate: '2025-02-10' },
    { id: '4', name: 'Income Certificate', type: 'income', uploadDate: '2024-03-01', status: 'pending' },
    { id: '5', name: 'Property Tax Receipt', type: 'property', uploadDate: '2023-06-15', status: 'valid', expiryDate: '2024-03-31' },
  ],
};

const mockBills: Bill[] = [
  { id: '1', service: 'electricity', consumerNumber: 'DEL123456789', amount: 2450, dueDate: '2024-02-15', status: 'unpaid', period: 'Jan 2024' },
  { id: '2', service: 'water', consumerNumber: 'WTR987654321', amount: 580, dueDate: '2024-02-20', status: 'unpaid', period: 'Jan 2024' },
  { id: '3', service: 'gas', consumerNumber: 'GAS456789123', amount: 890, dueDate: '2024-02-25', status: 'paid', period: 'Jan 2024' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: '1',
      ticketId: 'TKT2024000001',
      department: 'electricity',
      type: 'Power Outage',
      description: 'Frequent power cuts in Sector 12',
      status: 'processing',
      createdAt: '2024-01-25',
      citizenId: '1',
    },
  ]);
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(mockServiceRequests);
  const [sessionTimeout, setSessionTimeout] = useState(300);

  const t = useCallback((key: string): string => {
    return translations[language][key] || key;
  }, [language]);

  const login = useCallback((suvidhaId: string): boolean => {
    // Admin logins with role-based access
    if (suvidhaId === 'MASTER') {
      setIsAdmin(true);
      setAdminUser(mockAdminUsers.find(u => u.role === 'master') || null);
      setCitizen(mockCitizen);
      setSessionTimeout(300);
      return true;
    }
    if (suvidhaId === 'DEPT_ELEC') {
      setIsAdmin(true);
      setAdminUser(mockAdminUsers.find(u => u.role === 'department' && u.department === 'electricity') || null);
      setCitizen(mockCitizen);
      setSessionTimeout(300);
      return true;
    }
    if (suvidhaId === 'DEPT_WATER') {
      setIsAdmin(true);
      setAdminUser(mockAdminUsers.find(u => u.role === 'department' && u.department === 'water') || null);
      setCitizen(mockCitizen);
      setSessionTimeout(300);
      return true;
    }
    if (suvidhaId === 'STAFF') {
      setIsAdmin(true);
      setAdminUser(mockAdminUsers.find(u => u.role === 'staff') || null);
      setCitizen(mockCitizen);
      setSessionTimeout(300);
      return true;
    }
    // Legacy admin login
    if (suvidhaId === 'ADMIN') {
      setIsAdmin(true);
      setAdminUser(mockAdminUsers.find(u => u.role === 'department' && u.department === 'electricity') || null);
      setCitizen(mockCitizen);
      setSessionTimeout(300);
      return true;
    }
    // Citizen login
    if (suvidhaId === 'SUV2024001234') {
      setCitizen(mockCitizen);
      setSessionTimeout(300);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCitizen(null);
    setIsAdmin(false);
    setAdminUser(null);
    setSessionTimeout(300);
  }, []);

  const addComplaint = useCallback((complaint: Omit<Complaint, 'id' | 'ticketId' | 'createdAt' | 'citizenId'>): string => {
    const ticketId = `TKT${Date.now().toString().slice(-10)}`;
    const newComplaint: Complaint = {
      ...complaint,
      id: Date.now().toString(),
      ticketId,
      createdAt: new Date().toISOString().split('T')[0],
      citizenId: citizen?.id || '',
    };
    setComplaints(prev => [...prev, newComplaint]);
    return ticketId;
  }, [citizen]);

  const getComplaintByTicketId = useCallback((ticketId: string): Complaint | undefined => {
    return complaints.find(c => c.ticketId === ticketId);
  }, [complaints]);

  const payBill = useCallback((billId: string) => {
    setBills(prev => prev.map(bill => 
      bill.id === billId ? { ...bill, status: 'paid' as const } : bill
    ));
  }, []);

  const updateRequestStatus = useCallback((
    requestId: string, 
    status: ServiceRequest['status'], 
    remarks?: string
  ) => {
    setServiceRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status, 
            remarks: remarks || req.remarks,
            updatedAt: new Date().toISOString(),
            verifiedBy: adminUser?.id,
            verifiedAt: new Date().toISOString(),
          } 
        : req
    ));
  }, [adminUser]);

  const resetSessionTimeout = useCallback(() => {
    setSessionTimeout(300);
  }, []);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isListening,
        setIsListening,
        voiceTranscript,
        setVoiceTranscript,
        citizen,
        setCitizen,
        login,
        logout,
        complaints,
        addComplaint,
        getComplaintByTicketId,
        bills,
        payBill,
        isAdmin,
        setIsAdmin,
        adminUser,
        adminRole: adminUser?.role || null,
        adminDepartment: adminUser?.department || null,
        serviceRequests,
        updateRequestStatus,
        sessionTimeout,
        resetSessionTimeout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
