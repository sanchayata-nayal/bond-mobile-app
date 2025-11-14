type EmergencyContact = { name: string; phone: string };
type User = {
  id: string;
  firstName: string;
  lastName: string;
  dob?: string;
  phone?: string;
  agent?: string;
  emergencyContacts?: EmergencyContact[];
};

let _user: User | null = null;

export const demoStore = {
  setUser(u: User) { _user = u; },
  getUser(): User | null { return _user; },
  clear() { _user = null; }
};
