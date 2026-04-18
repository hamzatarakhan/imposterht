---
name: Unified User Identity
description: Single name + avatar persisted globally via useUserName hook for all online games (Imposter, Guessing). Auto-fills join/create screens, auto-saves on success.
type: feature
---
The app remembers the user's name and avatar globally across all online games via the `useUserName` hook (`src/hooks/useUserName.ts`).

**Storage keys:** `user_name`, `user_avatar` in localStorage.

**Behavior:**
- Name fields are pre-filled on every Imposter/Guessing Create & Join screen
- User can edit directly; changes save on input
- `persist()` is called explicitly on successful join/create as a safety net
- Cross-tab sync via `storage` event listener

**Why:** Avoids re-typing name every session. Friend opens shared link → name auto-fills.
