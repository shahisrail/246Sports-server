"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BARBADOS_TODAY_SQL = exports.PUBLIC_FIXTURE_SQL = void 0;
// Stored fixture timestamps represent the published Barbados schedule.
// Keep today's scheduled/live events; hide completed events and past dates.
exports.PUBLIC_FIXTURE_SQL = `f.date_time >= (CURRENT_TIMESTAMP AT TIME ZONE 'America/Barbados')::date
  AND f.status IN ('SCHEDULED', 'LIVE', 'POSTPONED')`;
exports.BARBADOS_TODAY_SQL = `(CURRENT_TIMESTAMP AT TIME ZONE 'America/Barbados')::date`;
//# sourceMappingURL=fixture-visibility.js.map