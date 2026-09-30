const assert = require('node:assert/strict');
const { test } = require('node:test');
// Stub only the database boundary; exercise the real request handlers.
const databasePath = require.resolve('../src/config/database');
const calls = [];
let resultRows = [];
require.cache[databasePath] = { id: databasePath, filename: databasePath, loaded: true, exports: {
  query: async (sql, params) => { calls.push({ sql, params }); return { rows: sql.includes('COUNT(*)') ? [{ count: '0' }] : resultRows }; },
} };
const { getFixtures, getFixtureById } = require('../src/modules/fixtures/fixtures.controller');
function response() { return { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } }; }

test('public list and pagination share expiry and sport filters', async () => {
  calls.length = 0;
  const res = response();
  await getFixtures({ query: { public: 'true', sport: 'Cricket', period: 'today' } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(calls.length, 2);
  for (const call of calls) {
    assert.match(call.sql, /America\/Barbados/);
    assert.match(call.sql, /f.status IN \('SCHEDULED', 'LIVE', 'POSTPONED'\)/);
    assert.match(call.sql, /lower\(c.sport\) = lower\(\$1\)/);
    assert.match(call.sql, /INTERVAL '1 day'/);
    assert.equal(call.params[0], 'Cricket');
  }
});

test('administrative listing can still request finished historical fixtures', async () => {
  calls.length = 0;
  await getFixtures({ query: { status: 'FINISHED' } }, response());
  assert.equal(calls.length, 2);
  for (const call of calls) {
    assert.doesNotMatch(call.sql, /America\/Barbados/);
    assert.equal(call.params[0], 'FINISHED');
  }
});

test('public fixture detail applies the same visibility rule and returns 404', async () => {
  calls.length = 0;
  resultRows = [];
  const res = response();
  await getFixtureById({ params: { id: 'expired-fixture' }, query: { public: 'true' } }, res);
  assert.equal(res.statusCode, 404);
  assert.match(calls[0].sql, /America\/Barbados/);
  assert.match(calls[0].sql, /f.status IN/);
});

test('upcoming list begins tomorrow in Barbados', async () => {
  calls.length = 0;
  await getFixtures({ query: { public: 'true', period: 'upcoming' } }, response());
  for (const call of calls) assert.match(call.sql, /f.date_time >= .*::date \+ INTERVAL '1 day'/);
});

const { getLatestUpdates } = require('../src/modules/latest-updates/latest-updates.controller');
test('calendar uses end date and forces published status even for signed-in admins', async () => {
  calls.length = 0;
  await getLatestUpdates({ query: { public: 'true', status: 'DRAFT' }, user: { role: 'SUPER_ADMIN' } }, response());
  assert.match(calls[0].sql, /COALESCE\(end_date, start_date\) >= .*America\/Barbados/);
  assert.equal(calls[0].params[0], 'PUBLISHED');
});
test('anonymous event requests cannot expose drafts or past events', async () => {
  calls.length = 0;
  await getLatestUpdates({ query: { status: 'DRAFT' } }, response());
  assert.match(calls[0].sql, /COALESCE\(end_date, start_date\)/);
  assert.equal(calls[0].params[0], 'PUBLISHED');
});
test('calendar administrators retain access to expired drafts in their dashboard', async () => {
  calls.length = 0;
  await getLatestUpdates({ query: { status: 'DRAFT' }, user: { role: 'SUPER_ADMIN' } }, response());
  assert.doesNotMatch(calls[0].sql, /COALESCE\(end_date, start_date\)/);
  assert.equal(calls[0].params[0], 'DRAFT');
});

test('Updates Today includes ongoing multi-day events in Barbados time', async () => {
  calls.length = 0;
  await getLatestUpdates({ query: { public: 'true', period: 'today' } }, response());
  assert.match(calls[0].sql, /start_date <= .*America\/Barbados/);
  assert.match(calls[0].sql, /COALESCE\(end_date, start_date\) >=/);
});
test('Updates week and month use date overlap in Barbados time', async () => {
  for (const period of ['week', 'month']) {
    calls.length = 0;
    await getLatestUpdates({ query: { public: 'true', period } }, response());
    assert.match(calls[0].sql, /America\/Barbados/);
    assert.match(calls[0].sql, /start_date </);
    assert.doesNotMatch(calls[0].sql, /CURRENT_DATE/);
  }
});
