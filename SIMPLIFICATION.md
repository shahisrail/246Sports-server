# Simplified public website and schedule updates

## Public site

The main sections are Home, News, Live, Calendar, Fixtures and Updates. Updates was restored at the owner's request on 30 September 2026, at `/latest-updates` with `/updates` as an alias. Existing news and fixture detail URLs remain available. `/streams` redirects to `/live`; retired public sections fall back to Home. Authentication, administrative management and footer Privacy/Terms pages remain available.

Fixtures are shown when dated today or later in America/Barbados and their status is SCHEDULED, LIVE or POSTPONED. FINISHED/CANCELLED fixtures disappear immediately on the next fetch. Past dates disappear automatically, with no delete job and no loss of admin history. Open Fixtures, Live, Calendar and fixture-detail views refresh every 30 seconds; Home refreshes every 60 seconds.

Standalone calendar events must be PUBLISHED and their end date (or start date when no end is supplied) must be today or later. Multi-day events remain visible through their final date. Public views use these rules even when an administrator is signed in.

## Updating fixtures by sport

1. Open Dashboard > Bulk Import > Fixtures.
2. Select the sport for the document. Download the fixture template and IDs Reference.
3. Prepare one CSV per sport, using existing competitions, teams and venues. Export Excel schedules as CSV. For PDF/Word fixture tables, transfer the schedule into the template; the existing offline client extraction scripts remain available for supported source documents.
4. Use YYYY-MM-DD dates and 24-hour HH:mm times in Barbados time.
5. For new fixtures, leave `id` blank. To change the date/time of an existing fixture, copy its `id` from IDs Reference. A new date with no ID is a new fixture.
6. Run Preview Dry Run, resolve errors, then Confirm Import. Changing sport, file or entity resets the preview.

All fixture rows must belong to the selected sport. Competition IDs cannot bypass the sport check. Association-admin fixture imports are checked against their association. Invalid dates, times, statuses and identical home/away teams are rejected during preview. An import with errors is rolled back in full. Imported fixture records appear in both Fixtures and Calendar.

## Updating standalone calendar events

Open Dashboard > Calendar Documents (existing `/dashboard/latest-updates` route).

- Upload DOCX, TXT or structured CSV. Download the Calendar CSV template from this screen.
- Choose a sport to assign to the document, or detect/use the sports included in the document.
- For DOCX/TXT, use clear date headings; extracted drafts require review.
- CSV columns: `id,title,sport,start_date,end_date,time,venue,description`. `title` and `start_date` are required. `end_date` defaults to `start_date`. Existing extraction headers `name,startDate,endDate` are also accepted.
- Leave Publish Now unchecked to save drafts, then review and publish. Published events appear in Calendar, including events without teams.
- Re-importing the same title, sport and start date updates that event rather than creating a duplicate. Re-importing as a draft removes it from the public calendar until republished.
- To reschedule an event, copy the Event ID shown in the dashboard into the CSV `id` column and use the same sport. Change the dates and re-import.
- Archive an event to remove it before its end date.

Direct PDF import is not supported by the existing server parser, so the upload UI no longer advertises it. Excel should be exported to CSV. This change does not add general-purpose PDF/Excel parsing.

## Validation and release

- Frontend: `npm run build` — passed.
- Backend: `npm run build` — passed; `npm run test:schedules` — all 18 tests passed.
- Schedule tests stub the database boundary and cover public visibility filters, admin history, published-only events, sport/association checks, input validation, ID-based fixture rescheduling, CSV parsing, multi-day dates and calendar re-imports.
- No new schema migration or external package is required. Deploy both repositories together, since the frontend relies on the new API filters and document CSV support.
- Local real-database and desktop/mobile browser acceptance checks have passed; see the results below. Production deployment has not been performed.

## Acceptance verification — 30 September 2026

Verified against an isolated PostgreSQL 18 instance and the actual Express API, with seeded disposable records. Headless Chrome used desktop (1440px) and mobile (390px) viewports, including Asia/Dhaka browser time to check Barbados schedule handling. Production data was not used.

- 18 schedule regression tests passed.
- 12 real-database/API checks passed: expiry, pagination totals, sport/date filters, admin history, dry-run without writes, persisted imports, full rollback on invalid rows, rescheduling by ID, sport validation, calendar drafts/publication, deduplication and invalid dates.
- 9 browser checks passed: five public pages, navigation, calendar visibility, filters, expired detail/legacy redirects, mobile layout/navigation, actual login, fixture CSV preview/import and calendar document upload/publication.
- No JavaScript page errors or API 5xx responses occurred in the final browser run.

Issues found and fixed: fresh database schema ordering and a SQL typo, missing incremental tables on first startup, expired fixture details stuck loading, missing filter accessible names, and obsolete Home metrics.

Acceptance scripts are under `tests/acceptance/` in each repository. Backend `server.cjs` is restricted to the disposable `sports_qa` database on 127.0.0.1:55462 and recreates only that test schema. Run it first, then backend `api.cjs`, then frontend `browser.cjs`. Frontend must run on 127.0.0.1:5179 with VITE_API_BASE_URL=http://127.0.0.1:4409. Browser testing requires Playwright (QA_PLAYWRIGHT_PATH) and Chrome (QA_CHROME); temporary QA artifacts use QA_OUTPUT, defaulting to /tmp/246-acceptance. Tests must use a fresh test server to avoid stale seeded IDs and prior run data.

Production deployment has not been performed.

## Updates restored — 30 September 2026

Updates is included in desktop/mobile navigation, footer and sitemap. It displays only current published events, even for signed-in administrators, and refreshes every 30 seconds. Today/week/month filters use Barbados dates and retain ongoing multi-day events. Error states allow retry. CMS heading separators are rendered as spaces.

Expanded local verification passed: 20 regression tests, 13 PostgreSQL/API checks and 10 desktop/mobile browser checks. Live-site checks are read-only except for signing in; production imports are not performed.
