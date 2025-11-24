// src/services/demoStore.ts

type EmergencyContact = { name: string; phone: string };

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  dob?: string;
  phone?: string;
  agent?: string;
  email?: string;
  emergencyContacts?: EmergencyContact[];
  joinedDate?: string; 
  panicCount?: number;
};

export type PanicLog = {
  id: string;
  userName: string;
  userPhone: string;
  agent: string;
  timestamp: string; // ISO string
  location?: string;
};

// --- MOCK DATA ---

const MOCK_DB_USERS: User[] = [
  { id: 'u1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '+15610000001', agent: 'Agent Smith', joinedDate: '2025-02-10', panicCount: 3 },
  { id: 'u2', firstName: 'Alice', lastName: 'Wonder', email: 'alice@example.com', phone: '+15610000002', agent: 'Agent Carter', joinedDate: '2025-02-15', panicCount: 0 },
  { id: 'u3', firstName: 'Bob', lastName: 'Builder', email: 'bob@example.com', phone: '+15610000003', agent: 'Agent Smith', joinedDate: '2025-02-20', panicCount: 5 },
  { id: 'u4', firstName: 'Charlie', lastName: 'Chaplin', email: 'charlie@example.com', phone: '+15610000004', agent: 'Agent Bond', joinedDate: '2025-02-22', panicCount: 1 },
  { id: 'u5', firstName: 'David', lastName: 'Goggins', email: 'david@example.com', phone: '+15610000005', agent: 'Agent Smith', joinedDate: '2025-02-23', panicCount: 8 },
  { id: 'u6', firstName: 'Eve', lastName: 'Polastri', email: 'eve@example.com', phone: '+15610000006', agent: 'Agent Carter', joinedDate: '2025-02-24', panicCount: 2 },
];

const MOCK_PANIC_LOGS: PanicLog[] = [
  { id: 'p1', userName: 'Bob Builder', userPhone: '+15610000003', agent: 'Agent Smith', timestamp: '2025-02-24T14:30:00Z' },
  { id: 'p2', userName: 'John Doe', userPhone: '+15610000001', agent: 'Agent Smith', timestamp: '2025-02-24T12:15:00Z' },
  { id: 'p3', userName: 'Bob Builder', userPhone: '+15610000003', agent: 'Agent Smith', timestamp: '2025-02-23T09:45:00Z' },
  { id: 'p4', userName: 'Charlie Chaplin', userPhone: '+15610000004', agent: 'Agent Bond', timestamp: '2025-02-22T18:20:00Z' },
  { id: 'p5', userName: 'Bob Builder', userPhone: '+15610000003', agent: 'Agent Smith', timestamp: '2025-02-21T22:10:00Z' },
  { id: 'p6', userName: 'David Goggins', userPhone: '+15610000005', agent: 'Agent Smith', timestamp: '2025-02-25T08:00:00Z' },
  { id: 'p7', userName: 'Eve Polastri', userPhone: '+15610000006', agent: 'Agent Carter', timestamp: '2025-02-25T09:15:00Z' },
];

const MOCK_METRICS = {
  last7Days: { newSignups: 12, activeUsers: 45 },
  lastMonth: { newSignups: 58, activeUsers: 120 },
  allTime: { newSignups: 1450, activeUsers: 890 },
};

let _currentUser: User | null = null;
let _primaryAgentNumber = '+15611231234';
let _smsRecipients = [
  { id: 'r1', name: 'Dispatch Center', phone: '+15619990001' },
  { id: 'r2', name: 'Regional Manager', phone: '+15619990002' },
];

export const demoStore = {
  setUser(u: User) { _currentUser = u; },
  getUser(): User | null { return _currentUser; },
  clear() { _currentUser = null; },

  getRecipients() { return { primary: _primaryAgentNumber, list: _smsRecipients }; },
  updatePrimaryNumber(num: string) { _primaryAgentNumber = num; },
  addRecipient(name: string, phone: string) {
    _smsRecipients.push({ id: Math.random().toString(36).substr(2, 9), name, phone });
  },
  removeRecipient(id: string) {
    _smsRecipients = _smsRecipients.filter(r => r.id !== id);
  },

  getAllUsers() { return [...MOCK_DB_USERS]; },
  
  deleteUser(id: string) {
    const idx = MOCK_DB_USERS.findIndex(u => u.id === id);
    if (idx > -1) MOCK_DB_USERS.splice(idx, 1);
  },

  updateUser(updatedUser: User) {
    const idx = MOCK_DB_USERS.findIndex(u => u.id === updatedUser.id);
    if (idx > -1) MOCK_DB_USERS[idx] = updatedUser;
    if (_currentUser && _currentUser.id === updatedUser.id) _currentUser = updatedUser;
  },

  async fetchMetrics(period: '7d' | '30d' | 'all') {
    await new Promise(r => setTimeout(r, 400)); 
    
    let stats;
    if (period === '7d') stats = MOCK_METRICS.last7Days;
    else if (period === '30d') stats = MOCK_METRICS.lastMonth;
    else stats = MOCK_METRICS.allTime;

    // Return ALL users with panic count > 0, sorted descending
    const topUsers = MOCK_DB_USERS
      .filter(u => (u.panicCount || 0) > 0)
      .sort((a, b) => (b.panicCount || 0) - (a.panicCount || 0));

    // In a real app, filter logs by date 'period' here
    const recentLogs = [...MOCK_PANIC_LOGS];

    return { ...stats, topUsers, recentLogs };
  }
};