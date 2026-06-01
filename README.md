# MotorDashboard

Motor Control Dashboard - React + Vite + Firebase RTDB + ESP32 integration.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build & Deploy

### Local Deploy
```bash
npm run build  # → dist/
firebase deploy --only hosting
```

### GitHub Actions (auto)
- **PR**: Preview deploys (hosting channel).
- **main merge**: Live deploy to motordashboard.web.app (or Hosting URL).
- Workflow runs `npm run build && firebase deploy --only hosting`.

View workflows: https://github.com/Achuaswin457/MotorDashboard/actions

**First push workflows**:
```bash
git add .github/workflows/
git commit -m "Add Firebase Hosting GitHub Actions"
git push origin main
```

### Firebase Config
- Project: motordashboard
- Hosting public: dist (no SPA rewrites)
- Configs: firebase.json, .firebaserc
- Revoke CLI GitHub auth if needed: https://github.com/settings/connections/applications/89cf50f02ac6aaed3484

## Features
- Motor/Phase/GPIO controls
- Event logging
- System info
- Firebase RTDB sync (src/firebase.js, hooks/useFirebaseESP32.js)

