export function normalizeContacts(contacts: { name: string; phone: string }[]) {
  if (!Array.isArray(contacts) || contacts.length !== 3)
    throw new Error('Three emergency contacts are required.');
  const normalized = contacts.map((contact) => {
    const name = contact.name.trim().replace(/\s+/g, ' ');
    const digits = contact.phone.replace(/\D/g, '');
    const phone = `+1${digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits}`;
    if (!name || name.length > 100 || !/^\+1\d{10}$/.test(phone))
      throw new Error('Each contact needs a name and a valid 10-digit phone number.');
    return { name, phone, nameKey: name.toLowerCase().replace(/\s+/g, '') };
  });
  if (
    new Set(normalized.map((c) => c.nameKey)).size !== 3 ||
    new Set(normalized.map((c) => c.phone)).size !== 3
  ) {
    throw new Error('Emergency contact names and phone numbers must each be unique.');
  }
  return normalized;
}
