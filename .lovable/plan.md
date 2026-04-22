

# تحديث منطق ظهور التقييم — حسب نوع المستخدم والوقت

## القواعد الجديدة

### 👴 المستخدمين القدامى (لعبوا قبل اليوم)
- **أول مرة يفتحوا التطبيق بعد التحديث** → يطلع التقييم فوراً (ما نستنى جولة)
- بعدها → **كل 3 أيام** (مش كل 5 جولات)
- استثناء: لعبة التخمين → **كل 15-20 جولة** (نختار 18 كنقطة وسط) أو 3 أيام، أيهما أقرب

### 🆕 المستخدمين الجدد (أول مرة يفتحوا التطبيق)
- **بعد أول لعبة كاملة** (إمبوستر / تخمين / دول — أي وحدة) → يطلع التقييم
- بعدها → **كل 3 أيام**
- نفس استثناء التخمين: كل 18 جولة أو 3 أيام أيهما أقرب

### كيف نميّز القديم من الجديد؟
- المستخدم **قديم** = عنده اسم محفوظ مسبقاً بـ `localStorage` (`user_name`) **أو** عنده `feedback_state_v1` موجود قبل التحديث
- نحفظ علم `feedback_user_classified_v2` أول مرة يفتح التطبيق بعد التحديث، يحدد فيه نوعه

---

## التغييرات التقنية

### 1. `src/hooks/useRoundCounter.ts` — إعادة هيكلة كاملة

نوسّع `FeedbackState` ليصير:
```ts
{
  rounds_completed: number;           // عام (إمبوستر + دول)
  guessing_rounds_completed: number;  // جديد — جولات التخمين فقط
  last_feedback_at: number | null;    // جديد — timestamp بدل رقم جولة
  is_returning_user: boolean;         // جديد — قديم/جديد
  classified: boolean;                // جديد — هل صنفناه؟
}
```

دوال جديدة/معدّلة:
- `classifyUserOnce()` — يستدعى مرة وحدة عند تحميل التطبيق:
  - لو `classified === true` → ما يعمل شي
  - وإلا: يفحص `localStorage.getItem('user_name')` أو وجود `feedback_state_v1` قديم → `is_returning_user = true`
  - يحفظ `classified = true`
  - **مهم**: لو قديم → نخلي `last_feedback_at = null` عشان يطلعله أول فتح

- `incrementRound(sessionKey, gameType: 'imposter' | 'guessing' | 'countries')` — يضيف للعدّاد المناسب
- `shouldShowFeedback()` يصير منطقه:
  ```
  const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  
  // مستخدم قديم لسه ما شاف أي تقييم بعد التحديث
  if (is_returning_user && last_feedback_at === null) return true;
  
  // مستخدم جديد خلّص أول جولة (أي لعبة)
  if (!is_returning_user && total_rounds >= 1 && last_feedback_at === null) return true;
  
  // 3 أيام مرّت
  if (last_feedback_at !== null && now - last_feedback_at >= THREE_DAYS) return true;
  
  // (احتياطي) مستخدم بيلعب تخمين بكثافة: 18 جولة تخمين من آخر تقييم
  if (guessing_rounds_since_last_feedback >= 18) return true;
  
  return false;
  ```
  > ملاحظة: نخزّن أيضاً `guessing_rounds_at_last_feedback` للمقارنة.

- `markFeedbackGiven()` — يخزّن `last_feedback_at = Date.now()` و`guessing_rounds_at_last_feedback`
- نحافظ على التوافق مع `feedback_state_v1` القديم (نقرأ منه ونرحّل بياناته للنسخة v2 تلقائياً)

### 2. `src/context/FeedbackContext.tsx` — إصلاح وتحسين

- **حذف** الـ `useEffect` الإشكالي (lines 23-27) اللي بيفتح الـ modal على كل mount مع `skipMarkOnSubmit=true` (سلوك مش مرغوب)
- استبداله بـ `useEffect` نظيف:
  - يستدعي `classifyUserOnce()` أول mount
  - بعدها يفحص `shouldShowFeedback()` مرة وحدة على فتح التطبيق → لو true يفتح الـ modal (للمستخدم القديم/أو لمن مرّت 3 أيام)
- توسيع التوقيع:
  ```ts
  notifyRoundCompleted: (sessionKey: string, gameType: 'imposter' | 'guessing' | 'countries') => void
  ```

### 3. تحديث 5 نقاط الاستدعاء — تمرير `gameType`

| ملف | gameType |
|---|---|
| `ResultScreen.tsx` | `'imposter'` |
| `OnlineResultScreen.tsx` | `'imposter'` |
| `GuessingFinalResultScreen.tsx` | `'guessing'` |
| `GuessingOnlineFinalResultScreen.tsx` | `'guessing'` |
| `CountriesAdminScreen.tsx` | `'countries'` |

> **مهم بالتخمين**: `GuessingFinalResultScreen` و`GuessingOnlineFinalResultScreen` بتشتغل بنهاية كل **مباراة** (3/5/7 جولات)، مش بعد كل جولة. عشان منعد الجولات الفعلية صح، نمرّر عدد الجولات مع الاستدعاء:
> ```ts
> notifyRoundCompleted(sessionKey, 'guessing', roundsInMatch)
> ```
> ونحدّث `incrementRound` يقبل `count` اختياري (default = 1).

### 4. تحديث الذاكرة
تحديث `mem://features/app-feedback-system` بالقواعد الجديدة (3 أيام / 18 جولة تخمين / تمييز قديم vs جديد).

---

## التدفق المتوقع لكل سيناريو

```text
مستخدم قديم (عنده user_name محفوظ):
  يفتح التطبيق بعد التحديث → modal فوراً
  بعد 3 أيام من التقييم → modal تاني
  لو لعب 18 جولة تخمين خلال يوم → modal

مستخدم جديد (أول مرة):
  يفتح التطبيق → ما يصير شي
  يخلّص أول لعبة (أي نوع) → modal
  بعد 3 أيام → modal تاني

كل المستخدمين خلال جلسة لعب تخمين مكثف:
  18 جولة تخمين منذ آخر تقييم → modal (حتى لو ما عدّت 3 أيام)
```

## الملفات المعدّلة (3 ملفات + ذاكرة + 5 تحديثات استدعاء صغيرة)
- `src/hooks/useRoundCounter.ts` (إعادة هيكلة)
- `src/context/FeedbackContext.tsx` (تنظيف + توقيع جديد)
- `src/components/game/ResultScreen.tsx` (تمرير `'imposter'`)
- `src/components/game/online/OnlineResultScreen.tsx` (تمرير `'imposter'`)
- `src/components/game/guessing/GuessingFinalResultScreen.tsx` (تمرير `'guessing', roundsCount`)
- `src/components/game/guessing/online/GuessingOnlineFinalResultScreen.tsx` (تمرير `'guessing', roundsCount`)
- `src/components/game/countries/CountriesAdminScreen.tsx` (تمرير `'countries'`)
- `.lovable/memory/features/app-feedback-system.md` (تحديث القواعد)

