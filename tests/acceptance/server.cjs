// Disposable local PostgreSQL only. Run after building the backend.
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const output = process.env.QA_OUTPUT || '/tmp/246-acceptance';
const connection = process.env.QA_DATABASE_URL || 'postgresql://qa_admin@127.0.0.1:55462/sports_qa';
const url = new URL(connection);
if (url.hostname !== '127.0.0.1' || url.port !== '55462' || url.pathname !== '/sports_qa') throw new Error('Use the isolated localhost sports_qa database on port 55462');
fs.mkdirSync(output, { recursive: true });
process.chdir(output); // Do not load a project .env or write project runtime logs.
Object.assign(process.env, {
  DATABASE_URL: connection, JWT_SECRET: '246-local-acceptance-only', JWT_REFRESH_SECRET: '246-local-refresh-only',
  CORS_ORIGIN: 'http://127.0.0.1:5179', NODE_ENV: 'test', SMTP_HOST: '127.0.0.1', SMTP_PORT: '9',
  CLOUDINARY_CLOUD_NAME: 'local-test', CLOUDINARY_API_KEY: 'local-test', CLOUDINARY_API_SECRET: 'local-test',
});
const { pool } = require(path.join(root, 'dist/config/database'));
const { initializeDatabase } = require(path.join(root, 'dist/config/database-init'));
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
(async () => {
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public');
  await initializeDatabase(pool);
  const ids = {};
  const insert = async (table, values) => {
    const id = randomUUID();
    const fields = ['id', ...Object.keys(values)];
    await pool.query(`INSERT INTO ${table} (${fields.join(',')}) VALUES (${fields.map((_, i) => '$' + (i + 1)).join(',')})`, [id, ...Object.values(values)]);
    return id;
  };
  ids.association = await insert('associations', { name: 'QA Sports Association' });
  ids.otherAssociation = await insert('associations', { name: 'QA Other Association' });
  ids.admin = await insert('users', { name: 'QA Administrator', email: 'qa-admin@example.test', password: await bcrypt.hash('Local-QA-246!', 4), role: 'SUPER_ADMIN' });
  for (const sport of ['Cricket', 'Football', 'Sailing']) ids[sport] = await insert('sports', { name: sport, slug: sport.toLowerCase(), is_active: true });
  for (const sport of ['Cricket', 'Football']) {
    ids[sport + 'Competition'] = await insert('competitions', { name: `QA ${sport} Cup`, sport, sport_id: ids[sport], association_id: ids.association, status: 'UPCOMING', category: 'CUP' });
    ids[sport + 'Home'] = await insert('teams', { name: `QA ${sport} Home`, competition_id: ids[sport + 'Competition'] });
    ids[sport + 'Away'] = await insert('teams', { name: `QA ${sport} Away`, competition_id: ids[sport + 'Competition'] });
  }
  ids.venue = await insert('venues', { name: 'QA Stadium' });
  const days = (await pool.query(`SELECT to_char((CURRENT_TIMESTAMP AT TIME ZONE 'America/Barbados')::date,'YYYY-MM-DD') AS today,
    to_char((CURRENT_TIMESTAMP AT TIME ZONE 'America/Barbados')::date - 1,'YYYY-MM-DD') AS yesterday,
    to_char((CURRENT_TIMESTAMP AT TIME ZONE 'America/Barbados')::date + 1,'YYYY-MM-DD') AS tomorrow,
    to_char((CURRENT_TIMESTAMP AT TIME ZONE 'America/Barbados')::date + 2,'YYYY-MM-DD') AS later`)).rows[0];
  for (const [name, sport, date, status] of [
    ['past', 'Cricket', days.yesterday, 'SCHEDULED'], ['today', 'Cricket', days.today, 'SCHEDULED'],
    ['future', 'Cricket', days.tomorrow, 'SCHEDULED'], ['finished', 'Cricket', days.tomorrow, 'FINISHED'],
    ['cancelled', 'Cricket', days.tomorrow, 'CANCELLED'], ['live', 'Football', days.today, 'LIVE'],
  ]) ids[name] = await insert('fixtures', { competition_id: ids[sport + 'Competition'], home_team_id: ids[sport + 'Home'], away_team_id: ids[sport + 'Away'], venue_id: ids.venue, date_time: date + ' 15:00:00', status, round: name, stream_url: name === 'live' ? 'https://example.test/live' : null });
  for (const [title, start, end, status] of [
    ['QA current regatta', days.today, days.tomorrow, 'PUBLISHED'],
    ['QA ongoing event', days.yesterday, days.today, 'PUBLISHED'],
    ['QA expired event', days.yesterday, days.yesterday, 'PUBLISHED'],
    ['QA secret draft', days.tomorrow, days.tomorrow, 'DRAFT'],
  ]) await insert('latest_updates', { title, sport: 'Sailing', event_type: 'EVENT', start_date: start, end_date: end, status, venue: 'QA Harbour' });
  await insert('news', { title: 'QA Published News', slug: 'qa-published-news', content: '<p>Local acceptance story.</p>', status: 'PUBLISHED', published_at: new Date(), created_by: ids.admin });
  const token = jwt.sign({ userId: ids.admin, email: 'qa-admin@example.test', role: 'SUPER_ADMIN' }, process.env.JWT_SECRET, { expiresIn: '4h' });
  fs.writeFileSync(path.join(output, 'fixtures.json'), JSON.stringify({ ids, days, token }, null, 2), { mode: 0o600 });
  const app = require(path.join(root, 'dist/app')).default;
  const server = app.listen(4409, '127.0.0.1', () => console.log('QA_READY http://127.0.0.1:4409'));
  async function stop() { server.close(); await pool.end(); process.exit(0); }
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
})().catch(async (error) => { console.error(error); await pool.end(); process.exit(1); });
