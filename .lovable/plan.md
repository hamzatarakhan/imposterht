

# Add Replay Buttons to Online Guessing Final Result Screen

## What We're Building
After finishing all rounds, the host sees two replay buttons plus home. Guests auto-navigate when the room resets.

## Changes

### 1. New Database RPC: `replay_guessing_room`
```sql
CREATE FUNCTION replay_guessing_room(
  p_room_id uuid, p_host_player_id uuid, 
  p_word1 text, p_word2 text,
  p_categories text DEFAULT NULL
)
```
- Verifies caller is host
- Resets both players' `wins` to 0
- Resets `current_round` to 1, `round_winner_id` to NULL
- Optionally updates `categories` (for "play with another category")
- Sets new words (`player1_word`, `player2_word`)
- Sets `status` back to `playing`

### 2. Service Layer (`guessingRoomService.ts`)
Add `replayGuessingRoom(roomId, categories)` — generates 2 random words, calls the new RPC.

### 3. Context (`OnlineGuessingContext.tsx`)
- Add `replayRoom(newCategories?)` method
- If `newCategories` provided, use those; otherwise use current room categories
- Expose in context type

### 4. UI (`GuessingOnlineFinalResultScreen.tsx`)
Host sees three buttons:
```text
[🔄 العب كمان مرة]        → replayRoom() with same categories
[🔀 العب بفئة ثانية]       → leaveRoom + reset + navigate to guessingCreateRoom
[🏠 الرئيسية]              → leaveRoom + reset + hub
```

Guest sees "⏳ بانتظار المضيف..." — the existing realtime status watcher auto-navigates them when status changes from `finished` back to `playing`.

