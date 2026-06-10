# RabbitaAI — Quick run

## 1. Backend (terminal 1)

```powershell
cd D:\RabbitaAI\backend
node index.js
```

- OK: http://localhost:8080 → `RabbitaAI backend is running`
- OK: `MongoDB connected` (if you see **failed**, fix Atlas first — see `CLAUDE_HANDOFF.md`)

## 2. Frontend (terminal 2)

```powershell
cd D:\RabbitaAI\frontend
npm run dev
```

Open the URL Vite prints, e.g. **http://localhost:5175/** (not always 5173).

## 3. If Google sign-in fails (CONFIGURATION_NOT_FOUND)

1. Open [Firebase Authentication](https://console.firebase.google.com/project/rabbita-ai/authentication) for project **rabbita-ai**
2. Click **Get started** (first time only)
3. **Sign-in method** → enable **Google**
4. **Settings** → **Authorized domains** → ensure `localhost` is listed
5. **Project settings** → **Your apps** → Web app → copy config into `frontend/.env` (save UTF-8 **without BOM**)
6. Restart `npm run dev`

## 4. If localhost looks broken

| Symptom | Fix |
|---------|-----|
| 5173 empty | Use the port from `npm run dev` output |
| Sign-in fails after Google | Restart backend; fix MongoDB in terminal |
| CORS / network error | Pull latest code (CORS + API proxy fix) |

Full details: **`CLAUDE_HANDOFF.md`**
