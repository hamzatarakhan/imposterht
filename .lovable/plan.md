

## Fix: Voting System Bug in Local Imposter Game

### Problem Found
The `calculateResult` function in `GameContext.tsx` has a **stale state bug**. On line 292, it reads `state.players` (the state at render time) instead of the latest state. Since the last voter's `voteForPlayer` call updates state via `setState`, and `calculateResult` is called immediately after via `setTimeout`, `state.players` still reflects the old state **without the last vote counted**.

This means the last player's vote is effectively ignored when determining the winner.

### Fix

**File: `src/context/GameContext.tsx`**

Refactor `calculateResult` to move all logic inside `setState(prev => ...)` so it uses the latest state (including the last vote):

```typescript
const calculateResult = () => {
  setState(prev => {
    const sortedByVotes = [...prev.players].sort((a, b) => b.votes - a.votes);
    const mostVoted = sortedByVotes[0];
    
    const imposterCaught = mostVoted.isImposter;
    const gameWinner: 'players' | 'imposters' = imposterCaught ? 'players' : 'imposters';
    
    // ... rest of scoring logic stays the same, already uses `prev`
  });
};
```

The key change: replace `state.players` with `prev.players` on lines 292-297, and merge the two separate operations (determine winner + update scores) into the single existing `setState` call.

### Impact
- Fixes: Last voter's vote being ignored
- Fixes: Potentially wrong winner being declared
- No UI changes needed — VotingScreen and ResultScreen work correctly once the state is accurate

