// Stored fixture timestamps represent the published Barbados schedule.
// Keep today's scheduled/live events; hide completed events and past dates.
export const PUBLIC_FIXTURE_SQL = `f.date_time >= (CURRENT_TIMESTAMP AT TIME ZONE 'America/Barbados')::date
  AND f.status IN ('SCHEDULED', 'LIVE', 'POSTPONED')`;

export const BARBADOS_TODAY_SQL = `(CURRENT_TIMESTAMP AT TIME ZONE 'America/Barbados')::date`;
