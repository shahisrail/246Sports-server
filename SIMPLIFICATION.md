# Site simplification

## Agreed scope
- Public navigation: Home, News, Live, Calendar, Fixtures.
- Remove past-dated and completed/cancelled fixtures from public views; retain administrative history.
- Use Barbados local dates for expiry. A scheduled fixture remains visible on its date until marked finished, and disappears after that date.
- Update fixtures by sport using the existing CSV document workflow, with preview and transactional import. Calendar uses the same fixture records.
- Keep existing document extraction scripts; arbitrary PDF/Excel parsing is outside this change.
- Preserve authentication and administrative management.

## Delivery steps
1. Simplify public navigation, routes and Home.
2. Apply consistent public fixture visibility, sport filters and refresh.
3. Add sport-scoped document import and operational instructions.
4. Run builds and targeted regression checks; record results.

Each implementation step is committed separately in its respective repository.
