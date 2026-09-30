const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
const output = process.env.QA_OUTPUT || '/tmp/246-acceptance';
const { ids, days, token } = JSON.parse(fs.readFileSync(path.join(output, 'fixtures.json')));
const pool = new Pool({ connectionString: 'postgresql://qa_admin@127.0.0.1:55462/sports_qa' });
const results = [];
async function check(name, action) { await action(); results.push(name); console.log('PASS', name); }
async function api(route, options = {}, expected = 200) {
  const res = await fetch('http://127.0.0.1:4409/api/v1' + route, options);
  const data = await res.json(); assert.equal(res.status, expected, JSON.stringify(data)); return data;
}
async function upload(route, csv, sport, expected = 200) {
  const body = new FormData(); body.append('file', new Blob([csv], { type: 'text/csv' }), 'qa.csv'); body.append('sport', sport);
  return api(route, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body }, expected);
}
const fixtureCsv = (id = '', date = days.later, status = 'SCHEDULED') => `id,competition_id,home_team_id,away_team_id,venue_id,date,time,status\n${id},${ids.CricketCompetition},${ids.CricketHome},${ids.CricketAway},${ids.venue},${date},16:45,${status}`;
(async () => {
  await check('public expiry and total count execute against PostgreSQL', async () => {
    const data = await api('/fixtures?public=true&limit=100');
    assert.deepEqual(data.data.map((row) => row.id).sort(), [ids.today, ids.future, ids.live].sort()); assert.equal(data.pagination.total, 3);
    assert.match(data.data[0].date_time, /-04:00$/);
  });
  await check('sport filter and Barbados today/upcoming filters', async () => {
    const sport = await api('/fixtures?public=true&sport=Cricket'); assert.equal(sport.pagination.total, 2);
    const today = await api('/fixtures?public=true&period=today'); assert.equal(today.pagination.total, 2);
    const upcoming = await api('/fixtures?public=true&period=upcoming'); assert.equal(upcoming.data[0].id, ids.future); assert.equal(upcoming.pagination.total, 1);
  });
  await check('expired detail hidden and admin history retained', async () => {
    await api(`/fixtures/${ids.past}?public=true`, {}, 404);
    const admin = await api('/fixtures?limit=100', { headers: { Authorization: `Bearer ${token}` } }); assert.equal(admin.pagination.total, 6);
  });
  await check('calendar keeps multi-day current events and hides expired/drafts for admins', async () => {
    const result = await api('/latest-updates?public=true', { headers: { Authorization: `Bearer ${token}` } });
    assert.deepEqual(result.data.map((e) => e.title).sort(), ['QA current regatta', 'QA ongoing event']);
  });
  await check('fixture dry-run performs no writes', async () => {
    const result = await upload('/bulk-import/fixtures/upload?apply=false', fixtureCsv(), 'Cricket'); assert.equal(result.data.errors.length, 0); assert.equal(result.data.created, 1);
    assert.equal(Number((await pool.query('SELECT COUNT(*) FROM fixtures')).rows[0].count), 6);
  });
  await check('valid fixture import creates a real persisted row', async () => {
    const result = await upload('/bulk-import/fixtures/upload?apply=true', fixtureCsv(), 'Cricket'); assert.equal(result.data.errors.length, 0);
    ids.imported = result.data.actions[0].id; assert.ok(ids.imported);
    const fixture = (await api(`/fixtures/${ids.imported}?public=true`)).data; assert.equal(fixture.date_time, days.later + 'T16:45:00-04:00');
  });
  await check('failed multi-row import rolls back earlier successful rows', async () => {
    const csv = fixtureCsv('', days.later, 'LIVE') + `\n,${ids.CricketCompetition},${ids.CricketHome},${ids.CricketAway},${ids.venue},${days.later},18:00,INVALID`;
    const result = await upload('/bulk-import/fixtures/upload?apply=true', csv, 'Cricket'); assert.equal(result.data.errors.length, 1);
    assert.equal((await pool.query('SELECT status FROM fixtures WHERE id=$1', [ids.imported])).rows[0].status, 'SCHEDULED');
  });
  await check('fixture reschedule updates by ID without duplicate', async () => {
    const result = await upload('/bulk-import/fixtures/upload?apply=true', fixtureCsv(ids.imported, days.tomorrow), 'Cricket'); assert.equal(result.data.updated, 1);
    assert.equal(Number((await pool.query('SELECT COUNT(*) FROM fixtures')).rows[0].count), 7);
  });
  await check('sport mismatch is rejected in real import', async () => {
    const result = await upload('/bulk-import/fixtures/upload?apply=true', fixtureCsv(), 'Football'); assert.equal(result.data.errors.length, 1);
  });
  const eventCsv = `title,start_date,end_date,venue\nQA imported regatta,${days.today},${days.tomorrow},QA Harbour`;
  await check('calendar CSV saves draft then publishes through actual API', async () => {
    const result = await upload('/latest-updates/import?publish=false', eventCsv, 'Sailing', 201); ids.event = result.data.updates[0].id;
    assert.equal((await api('/latest-updates?public=true&search=QA%20imported')).data.length, 0);
    await api(`/latest-updates/${ids.event}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'PUBLISHED' }) });
    assert.equal((await api('/latest-updates?public=true&search=QA%20imported')).data.length, 1);
  });
  await check('calendar re-import deduplicates and reschedules by event ID', async () => {
    await upload('/latest-updates/import?publish=true', eventCsv, 'Sailing', 201);
    assert.equal(Number((await pool.query('SELECT COUNT(*) FROM latest_updates WHERE title=$1', ['QA imported regatta'])).rows[0].count), 1);
    await upload('/latest-updates/import?publish=true', `id,title,start_date,end_date\n${ids.event},QA imported regatta,${days.tomorrow},${days.later}`, 'Sailing', 201);
    assert.equal(Number((await pool.query('SELECT COUNT(*) FROM latest_updates WHERE title=$1', ['QA imported regatta'])).rows[0].count), 1);
  });
  await check('invalid calendar date and missing fixture sport return 400', async () => {
    await upload('/latest-updates/import', 'title,start_date\nBad,2026-02-30', 'Sailing', 400);
    await upload('/bulk-import/fixtures/upload', fixtureCsv(), '', 400);
  });
  fs.writeFileSync(path.join(output, 'fixtures.json'), JSON.stringify({ ids, days, token }, null, 2), { mode: 0o600 });
  fs.writeFileSync(path.join(output, 'api-results.json'), JSON.stringify({ passed: results.length, checks: results }, null, 2));
})().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => pool.end());
