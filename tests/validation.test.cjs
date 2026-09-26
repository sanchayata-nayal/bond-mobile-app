const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText,
    filename,
  );
const { registrationSchema, profileSchema } = require('../src/utils/registrationSchema.ts');
const { normalizeContacts } = require('../src/utils/contacts.ts');
const { AGENT_NOT_LISTED_VALUE } = require('../src/utils/agents.ts');

const valid = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  dob: '01/01/1990',
  phone: '2025550100',
  password: 'A long passphrase! 123',
  agent: 'Agent A',
  requestedAgentName: '',
  ec1Name: 'Mary Ann',
  ec1Phone: '2025550101',
  ec2Name: 'John Smith',
  ec2Phone: '2025550102',
  ec3Name: 'Susan Doe',
  ec3Phone: '2025550103',
};

test('registration accepts passphrases and trims personal fields', async () => {
  const parsed = await registrationSchema.validate({ ...valid, firstName: ' Jane ' });
  assert.equal(parsed.firstName, 'Jane');
});
test('blank, invalid dates, underage, missing requests, and short passwords are rejected', async () => {
  for (const change of [
    { firstName: '   ' },
    { dob: '02/30/1990' },
    { dob: '01/01/2020' },
    { password: 'abc123' },
    { agent: AGENT_NOT_LISTED_VALUE, requestedAgentName: ' ' },
  ]) {
    await assert.rejects(registrationSchema.validate({ ...valid, ...change }));
  }
});
test('leap-year birthday and a requested agent are accepted', async () => {
  await registrationSchema.validate({
    ...valid,
    dob: '02/29/2000',
    agent: AGENT_NOT_LISTED_VALUE,
    requestedAgentName: 'New Agent',
  });
});
test('duplicates are rejected at registration AND profile editing', async () => {
  for (const schema of [registrationSchema, profileSchema]) {
    for (const change of [
      { ec2Name: '  MARY   ANN ' },
      { ec3Name: 'MaryAnn' },
      { ec3Phone: valid.ec1Phone },
    ]) {
      await assert.rejects(schema.validate({ ...valid, ...change }));
    }
  }
});
test('contact service normalizes phones and rejects formatting-based duplicates', () => {
  const contacts = [
    { name: ' Mary Ann ', phone: '(202) 555-0101' },
    { name: 'John', phone: '+1 202 555 0102' },
    { name: 'Susan', phone: '2025550103' },
  ];
  assert.equal(normalizeContacts(contacts)[0].phone, '+12025550101');
  assert.equal(normalizeContacts(contacts)[0].nameKey, 'maryann');
  assert.throws(() =>
    normalizeContacts([contacts[0], { name: 'Someone', phone: '+12025550101' }, contacts[2]]),
  );
  assert.throws(() =>
    normalizeContacts([contacts[0], { name: 'MARYANN', phone: '+12025550104' }, contacts[2]]),
  );
});
test('production config refuses a release without required values', () => {
  const previous = process.env.EAS_BUILD_PROFILE;
  process.env.EAS_BUILD_PROFILE = 'production';
  try {
    assert.throws(() => require('../app.config.js')(), /Release configuration missing/);
  } finally {
    if (previous) process.env.EAS_BUILD_PROFILE = previous;
    else delete process.env.EAS_BUILD_PROFILE;
  }
});
