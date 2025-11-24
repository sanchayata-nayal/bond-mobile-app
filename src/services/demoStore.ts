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

// Mock Data
const MOCK_DB_USERS: User[] = [
  { id: 'u1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '+15610000001', agent: 'Agent Smith', joinedDate: '2025-02-10', panicCount: 2 },
  { id: 'u2', firstName: 'Alice', lastName: 'Wonder', email: 'alice@example.com', phone: '+15610000002', agent: 'Agent Carter', joinedDate: '2025-02-15', panicCount: 0 },
  { id: 'u3', firstName: 'Bob', lastName: 'Builder', email: 'bob@example.com', phone: '+15610000003', agent: 'Agent Smith', joinedDate: '2025-02-20', panicCount: 5 },
  { id: 'u4', firstName: 'Charlie', lastName: 'Chaplin', email: 'charlie@example.com', phone: '+15610000004', agent: 'Agent Bond', joinedDate: '2025-02-22', panicCount: 1 },
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

  // --- ADMIN API SIMULATION ---

  getRecipients() { return { primary: _primaryAgentNumber, list: _smsRecipients }; },
  updatePrimaryNumber(num: string) { _primaryAgentNumber = num; },
  addRecipient(name: string, phone: string) {
    _smsRecipients.push({ id: Math.random().toString(36).substr(2, 9), name, phone });
  },
  removeRecipient(id: string) {
    _smsRecipients = _smsRecipients.filter(r => r.id !== id);
  },

  // User Management
  getAllUsers() { return [...MOCK_DB_USERS]; },
  
  deleteUser(id: string) {
    const idx = MOCK_DB_USERS.findIndex(u => u.id === id);
    if (idx > -1) MOCK_DB_USERS.splice(idx, 1);
  },

  updateUser(updatedUser: User) {
    // 1. Update in DB list
    const idx = MOCK_DB_USERS.findIndex(u => u.id === updatedUser.id);
    if (idx > -1) {
      MOCK_DB_USERS[idx] = updatedUser;
    }
    // 2. Update current session if it's the same user
    if (_currentUser && _currentUser.id === updatedUser.id) {
      _currentUser = updatedUser;
    }
  },

  async fetchMetrics(period: '7d' | '30d' | 'all') {
    await new Promise(r => setTimeout(r, 600)); 
    let data;
    if (period === '7d') data = MOCK_METRICS.last7Days;
    else if (period === '30d') data = MOCK_METRICS.lastMonth;
    else data = MOCK_METRICS.allTime;

    const topUsers = MOCK_DB_USERS
      .sort((a, b) => (b.panicCount || 0) - (a.panicCount || 0))
      .slice(0, 5);

    return { ...data, topUsers };
  }
};