import * as yup from 'yup';
import { AGENT_NOT_LISTED_VALUE } from './agents';
import { EMAIL_ERROR, EMAIL_REGEX } from './validation';

/* ---------- Validation Logic ---------- */
const parseDate = (str: string) => {
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const m = parseInt(parts[0], 10);
  const d = parseInt(parts[1], 10);
  const y = parseInt(parts[2], 10);

  if (m < 1 || m > 12) return null;
  if (d < 1 || d > 31) return null;
  if (y < 1900 || y > new Date().getFullYear()) return null;

  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() + 1 !== m || date.getDate() !== d) {
    return null;
  }
  return date;
};

const normalizeName = (name?: string) => name?.trim().replace(/\s+/g, '').toLowerCase() || '';
const normalizePhone = (phone?: string) => phone?.replace(/\D/g, '') || '';

const uniqueEmergencyValue = (values: string[]) => {
  const filled = values.filter(Boolean);
  return filled.length === new Set(filled).size;
};

export const registrationSchema = yup
  .object({
    firstName: yup.string().trim().required('First name is required').max(100),
    lastName: yup.string().trim().required('Last name is required').max(100),
    email: yup
      .string()
      .trim()
      .lowercase()
      .required('Email is required')
      .matches(EMAIL_REGEX, { message: EMAIL_ERROR, excludeEmptyString: true }),
    dob: yup
      .string()
      .required('Date of birth required')
      .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'Format: MM/DD/YYYY')
      .test('is-valid-date', 'Invalid date', (val) => !!(val && parseDate(val)))
      .test('is-18', 'Must be at least 18 years old', (val) => {
        if (!val) return false;
        const date = parseDate(val);
        if (!date) return false;
        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const m = today.getMonth() - date.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
          age--;
        }
        return age >= 18;
      }),
    phone: yup
      .string()
      .required('Phone required')
      .matches(/^\d{10}$/, 'Must be 10 digits'),
    password: yup
      .string()
      .required('Password required')
      .min(12, 'Use at least 12 characters')
      .max(128, 'Use at most 128 characters'),
    agent: yup.string().required('Agent name required').max(200),
    requestedAgentName: yup
      .string()
      .trim()
      .max(200)
      .test(
        'required-when-agent-missing',
        'Enter the agent name for admin review',
        function (value) {
          return this.parent.agent !== AGENT_NOT_LISTED_VALUE || !!value?.trim();
        },
      ),

    ec1Name: yup
      .string()
      .trim()
      .max(100)
      .required('Contact 1 name required')
      .test('unique-emergency-name', 'Emergency contact names must be unique', function () {
        const parent = this.parent;
        return uniqueEmergencyValue([
          normalizeName(parent.ec1Name),
          normalizeName(parent.ec2Name),
          normalizeName(parent.ec3Name),
        ]);
      }),
    ec1Phone: yup
      .string()
      .trim()
      .max(100)
      .required('Contact 1 phone required')
      .matches(/^\d{10}$/, 'Must be 10 digits')
      .test('unique-emergency-phone', 'Emergency contact phones must be unique', function () {
        const parent = this.parent;
        return uniqueEmergencyValue([
          normalizePhone(parent.ec1Phone),
          normalizePhone(parent.ec2Phone),
          normalizePhone(parent.ec3Phone),
        ]);
      }),

    ec2Name: yup
      .string()
      .trim()
      .max(100)
      .required('Contact 2 name required')
      .test('unique-emergency-name', 'Emergency contact names must be unique', function () {
        const parent = this.parent;
        return uniqueEmergencyValue([
          normalizeName(parent.ec1Name),
          normalizeName(parent.ec2Name),
          normalizeName(parent.ec3Name),
        ]);
      }),
    ec2Phone: yup
      .string()
      .trim()
      .max(100)
      .required('Contact 2 phone required')
      .matches(/^\d{10}$/, 'Must be 10 digits')
      .test('unique-emergency-phone', 'Emergency contact phones must be unique', function () {
        const parent = this.parent;
        return uniqueEmergencyValue([
          normalizePhone(parent.ec1Phone),
          normalizePhone(parent.ec2Phone),
          normalizePhone(parent.ec3Phone),
        ]);
      }),

    ec3Name: yup
      .string()
      .trim()
      .max(100)
      .required('Contact 3 name required')
      .test('unique-emergency-name', 'Emergency contact names must be unique', function () {
        const parent = this.parent;
        return uniqueEmergencyValue([
          normalizeName(parent.ec1Name),
          normalizeName(parent.ec2Name),
          normalizeName(parent.ec3Name),
        ]);
      }),
    ec3Phone: yup
      .string()
      .trim()
      .max(100)
      .required('Contact 3 phone required')
      .matches(/^\d{10}$/, 'Must be 10 digits')
      .test('unique-emergency-phone', 'Emergency contact phones must be unique', function () {
        const parent = this.parent;
        return uniqueEmergencyValue([
          normalizePhone(parent.ec1Phone),
          normalizePhone(parent.ec2Phone),
          normalizePhone(parent.ec3Phone),
        ]);
      }),
  })
  .required();

export const profileSchema = registrationSchema.omit(['email', 'password', 'requestedAgentName']);
