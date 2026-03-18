

## Plan: Add English Language Support (i18n)

### Scope Analysis
The app has ~30+ screens with hardcoded Arabic text, plus two word databases (`words.ts` ~605 lines, `guessingWords.ts` ~485 lines). Every UI string, category name, button label, and game word needs an English equivalent.

### Architecture

**1. Language Context (`src/context/LanguageContext.tsx`)**
- Add `language: 'ar' | 'en'` to settings, persisted in localStorage
- Provide a `t(key)` translation function and `isRTL` boolean
- When `en` is selected: `dir="ltr"`, font changes, all text flips to English

**2. Translation Files (`src/data/translations/`)**
- `ar.ts` — all Arabic UI strings (extracted from current hardcoded text)
- `en.ts` — English equivalents
- Organized by screen/section keys, e.g.:
```typescript
hub: {
  title: "Activities" / "فعاليات",
  chooseGame: "Choose your game!" / "اختر لعبتك وابدأ المرح!",
  imposter: "Imposter" / "الإمبوستر",
  guessing: "Guessing" / "التخمين",
  ...
}
```

**3. English Word Databases**
- `src/data/words_en.ts` — English words for Imposter (same categories: things, places, food, jobs, animals, sports, celebrities, movies)
- `src/data/guessingWords_en.ts` — English words for Guessing (things, sport players, countries, food, animals)
- Word selection functions (`getRandomWord`, `getGuessingRandomWord`) will check current language and pull from the correct database

**4. UI Direction Handling**
- Arabic = `dir="rtl"`, English = `dir="ltr"`
- Set on `<html>` element when language changes
- Arrow icons (ArrowRight for back) flip direction based on language
- Layout adjustments for LTR (margins, text alignment)

**5. Language Toggle in Settings**
- Add a language toggle (🌐) in `SettingsScreen.tsx` with Arabic/English switch
- Also add a quick language toggle button in the Hub header for easy access

### Files to Create
| File | Purpose |
|------|---------|
| `src/context/LanguageContext.tsx` | Language state, `t()` function, direction |
| `src/data/translations/ar.ts` | All Arabic UI strings |
| `src/data/translations/en.ts` | All English UI strings |
| `src/data/words_en.ts` | English Imposter words (~same count per category) |
| `src/data/guessingWords_en.ts` | English Guessing words |

### Files to Modify
| File | Changes |
|------|---------|
| `src/main.tsx` | Wrap app in `LanguageProvider` |
| `src/context/SettingsContext.tsx` | Add language setting |
| `src/data/words.ts` | Export language-aware word functions |
| `src/data/guessingWords.ts` | Export language-aware word functions |
| `src/components/game/SettingsScreen.tsx` | Add language toggle |
| `src/components/game/HubScreen.tsx` | Replace hardcoded Arabic with `t()` |
| `src/components/game/HomeScreen.tsx` | Replace hardcoded Arabic with `t()` |
| `src/components/game/HowToPlayScreen.tsx` | Replace hardcoded Arabic with `t()` |
| `src/components/game/SplashScreen.tsx` | Replace hardcoded Arabic with `t()` |
| `src/components/game/SetupScreen.tsx` | Replace hardcoded Arabic with `t()` |
| `src/components/game/PlayerNamesScreen.tsx` | Replace hardcoded Arabic with `t()` |
| `src/components/game/ShowRoleScreen.tsx` | Replace hardcoded Arabic with `t()` |
| `src/components/game/PassPhoneScreen.tsx` | Replace hardcoded Arabic with `t()` |
| `src/components/game/DiscussionScreen.tsx` | Replace hardcoded Arabic with `t()` |
| `src/components/game/VotingScreen.tsx` | Replace hardcoded Arabic with `t()` |
| `src/components/game/ResultScreen.tsx` | Replace hardcoded Arabic with `t()` |
| `src/components/game/WordGuessScreen.tsx` | Replace hardcoded Arabic with `t()` |
| All `online/` screens | Replace hardcoded Arabic with `t()` |
| All `guessing/` screens | Replace hardcoded Arabic with `t()` |
| `src/context/PresenceContext.tsx` | Translate away banner text |
| `index.html` | Dynamic `dir` attribute |

### Implementation Order
1. Create `LanguageContext` + translation files (ar/en)
2. Create English word databases
3. Add language toggle to Settings
4. Update word selection functions to be language-aware
5. Replace hardcoded strings across all screens with `t()` calls
6. Handle RTL/LTR direction switching
7. Test all screens in both languages

This is a large task and will be done incrementally across multiple steps.

