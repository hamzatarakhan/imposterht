---
name: App Feedback System
description: Time-based + first-game + per-update feedback modal. Returning users see it on first open after each app update, new users after first finished game post-update. Recurs every 3 days, with extra trigger every 18 guessing rounds. Stored in app_feedback table. 5 Jordanian rating options + conditional improvement textarea + optional submitter name + post-submit thank-you with share for positive ratings.
type: feature
---
نظام تقييم للتطبيق يعتمد على **الوقت + نوع المستخدم** (مش عدد الجولات الثابت).

**Storage:**
- جدول `app_feedback` (Supabase): `rating`, `improvement_text`, `app_version`, `rounds_completed`, `user_id`, `created_at`. RLS: INSERT مفتوح للجميع، القراءة/التعديل/الحذف عبر service role فقط.
- localStorage key: `feedback_state_v2` =
  ```
  {
    rounds_completed,                  // إمبوستر + دول
    guessing_rounds_completed,         // جولات تخمين فقط
    guessing_rounds_at_last_feedback,  // للمقارنة
    last_feedback_at,                  // timestamp ms (null = ما شاف تقييم)
    is_returning_user,                 // قديم/جديد
    classified                         // هل صنّفناه؟
  }
  ```
- localStorage القديم `feedback_state_v1` يُقرأ مرة وحدة وقت التصنيف، تنتقل بياناته (`rounds_completed`) للنسخة v2.
- sessionStorage flag: `feedback_round_counted_<sessionKey>` لمنع احتساب نفس الجولة مرتين.

**User Classification (`classifyUserOnce()` في `useRoundCounter.ts`):**
- يستدعى مرة وحدة عند تحميل التطبيق (أول mount لـ `FeedbackProvider`).
- `is_returning_user = true` لو:
  - `localStorage.user_name` موجود ومش فاضي، **أو**
  - `feedback_state_v1` موجود (مستخدم قديم من قبل التحديث).
- بعد التصنيف يُحفظ `classified = true` و `last_feedback_at = null` (عشان يظهر للقديم أول فتح).

**Trigger Cadence (`shouldShowFeedback()`):**
- مستخدم قديم + `last_feedback_at === null` → ✅ فوراً (أول فتح بعد التحديث).
- مستخدم جديد + إجمالي الجولات >= 1 + `last_feedback_at === null` → ✅ بعد أول لعبة.
- مرّت **3 أيام** على آخر تقييم → ✅.
- لاعبي تخمين كثيف: **18 جولة تخمين** منذ آخر تقييم → ✅ (احتياطي يضمن تقييم خلال جلسات اللعب الطويلة).

**Trigger Points (`notifyRoundCompleted(sessionKey, gameType, count?)` من `useFeedbackTrigger()`):**
- `ResultScreen.tsx` (Imposter محلي) — `'imposter'`، key: `local-imposter-${roundNumber}-${secretWord}`.
- `OnlineResultScreen.tsx` (Imposter أونلاين) — `'imposter'`، key: `online-imposter-${room.id}` (بعد تحميل imposters).
- `GuessingFinalResultScreen.tsx` (تخمين محلي) — `'guessing'`، count = `totalRounds`، key: `local-guessing-${Date.now()}`.
- `GuessingOnlineFinalResultScreen.tsx` (تخمين أونلاين) — `'guessing'`، count = `room.total_rounds`، key: `online-guessing-${room.id}`.
- `CountriesAdminScreen.tsx` — `'countries'`، يطلق عند تأكيد المغادرة (handleConfirmLeave).
- `FeedbackProvider` نفسه يفحص `shouldShowFeedback()` على mount واحد لإطلاق الـ modal للمستخدمين القدامى أو من مرّت عليهم 3 أيام بدون لعب.

**On-mount auto-open:** بدل الـ `useEffect` القديم اللي كان يفتح الـ modal على كل mount مع `skipMarkOnSubmit=true`، صار في `useRef` يضمن فحص واحد بس عند التحميل، و`markFeedbackGiven()` تنفّذ دايماً عند الإغلاق.

**UI:**
- `FeedbackModal.tsx` عبر React Portal (`z-[200]`, no backdrop close, no Escape).
- 5 خيارات: amazing ✨ / more_amazing 🔥 / khoz3boli 🤯 / salat_nabi 💯 / needs_improvement 🛠️.
- لو اختار `needs_improvement` → Textarea إجبارية (1-1000 حرف).
- بعد الإرسال الناجح → شاشة شكر مخصصة (نفس الـ modal، state داخلي `submittedRating`):
  - **إيجابي** (أول 4): إيموجي 🎉 + "اوف ما احسنك خلص ضلك العب ببلاش 💛" + نص "شارك التطبيق مع صحابك عشان تكمل معروفك" + زر مشاركة (`navigator.share` مع fallback `clipboard.writeText` و toast) + زر ثانوي "يلا عاللعبة".
  - **سلبي** (`needs_improvement`): إيموجي 😍 + "والله بطلع منك أفكار" + نص "ذكرني فيك بعدين عشان أشكرك بعنف 🔫" + زر واحد "يلا عاللعبة".
- زر "يلا عاللعبة" يستدعي `onSubmitted()` اللي بيقفل الـ modal و`markFeedbackGiven()`.
- نص المشاركة: "جرب فعاليات — أحلى ألعاب جماعية بتلعبوها مع رفقاتكم! 🔥" + الرابط `https://imposter.my`.

**Files:**
- `src/services/feedbackService.ts` — `submitFeedback()` يكتب لـ Supabase.
- `src/hooks/useRoundCounter.ts` — `classifyUserOnce`, `incrementRound(key, gameType, count?)`, `shouldShowFeedback`, `markFeedbackGiven`, `getRoundsCompleted`.
- `src/context/FeedbackContext.tsx` — `FeedbackProvider` (يفحص shouldShow على mount) + `useFeedbackTrigger()`.
- `src/components/feedback/FeedbackModal.tsx` — UI الـ modal + شاشة ما بعد الإرسال.
- `FeedbackProvider` ملفوف داخل `Game.tsx` (داخل كل الـ providers).
