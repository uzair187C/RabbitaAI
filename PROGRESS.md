# RabbitaAI Progress

## Working
- Backend on :8080, frontend on Vite (check terminal for port — often **5175** not 5173)
- Day 2–3 code: Login, ProfileSetup, auth API routes
- CORS + dev API proxy fix for any localhost port

## Blocker
- **MongoDB:** `querySrv ECONNREFUSED` — user has Atlas IP `14.1.105.173/32` only; should add `0.0.0.0/0`

## Day 4 (code ready)
- `GET http://localhost:8080/api/test/maps` — needs `GOOGLE_MAPS_API_KEY` in backend/.env

## Next
- Fix MongoDB → test sign-in → add Maps API key → test /api/test/maps

## Docs for Claude
- **`CLAUDE_HANDOFF.md`** — full status (paste this to Claude)
- **`RUN.md`** — quick start URLs
