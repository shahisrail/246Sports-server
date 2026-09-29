import { parseCsv } from '../bulk-import/bulk-import.service';

function validDate(value: string, field: string, row: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) {
    throw new Error(`Row ${row}: ${field} must be a valid YYYY-MM-DD date`);
  }
  return value;
}

export function parseScheduleCsv(text: string) {
  return parseCsv(text).map((row, index) => {
    const line = index + 2;
    const title = row.title || row.name;
    if (!title) throw new Error(`Row ${line}: title is required`);
    const startDate = validDate(row.start_date || row.startdate || row.date || '', 'start_date', line);
    const endDate = validDate(row.end_date || row.enddate || startDate, 'end_date', line);
    if (endDate < startDate) throw new Error(`Row ${line}: end_date cannot precede start_date`);
    if (row.id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id)) throw new Error(`Row ${line}: invalid event id`);
    return {
      id: row.id || undefined, title: title.slice(0, 255), description: row.description || title,
      sport: row.sport, event_type: row.event_type || row.category || 'EVENT',
      start_date: startDate, end_date: endDate, time: row.time, venue: row.venue,
      location: row.location, home_team: row.home_team, away_team: row.away_team, confidence_score: 1,
    };
  });
}
