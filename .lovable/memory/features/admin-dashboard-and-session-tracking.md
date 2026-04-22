---
name: Admin Dashboard & Session Tracking
description: PIN-protected /admin page showing all app sessions and feedback. Sessions logged on every app open via log_app_session RPC; reads gated by admin_read_sessions/admin_read_feedback RPCs with shared PIN.
type: feature
---
**Page:** `/admin` — protected by PIN `fa3aliyat-2026` (stored in sessionStorage).

**Tracking:** `bootstrapSessionTracking()` runs in `main.tsx` on every app boot and on tab focus/visibility. Calls `log_app_session` RPC which UPSERTs by `session_key` (per-tab unique key in sessionStorage). Captures: user_name, user_avatar, user_id, app_version, user_agent, language, is_pwa, referrer.

**Reads:** `admin_read_sessions(pin)` and `admin_read_feedback(pin)` are SECURITY DEFINER RPCs that return rows only if PIN matches. The `app_sessions` table has NO SELECT policy — direct reads are blocked.

**UI:** Tabs for Sessions + Feedback, search box, 6 stat cards (total, unique users, named, PWA, today, feedback), refresh button, logout. RTL Jordanian Arabic.

**Why no email:** User asked for per-launch notifications which would flood inbox; admin dashboard offers same insight without spam risk.
