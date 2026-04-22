---
name: App Feedback System
description: Mandatory in-app rating modal triggered after first completed round, then every 5 rounds. Stored in app_feedback table. 5 Jordanian-style rating options + conditional improvement textarea + post-submit thank-you screen with share for positive ratings.
type: feature
---
نظام تقييم إجباري للتطبيق بعد إكمال أول جولة، وبعدها كل 5 جولات إضافية.

**Storage:**
- جدول `app_feedback` (Supabase): `rating`, `improvement_text`, `app_version`, `rounds_completed`, `user_id`, `created_at`. RLS: INSERT مفتوح للجميع، القراءة/التعديل/الحذف عبر service role فقط.
- localStorage key: `feedback_state_v1` = `{ rounds_completed, last_feedback_at_round }`.
- sessionStorage flag: `feedback_round_counted_<sessionKey>` لمنع احتساب نفس الجولة مرتين.

**Trigger Cadence:**
- أول مرة: لما `rounds_completed === 1` و`last_feedback_at_round === null`.
- بعدها: لما `rounds_completed - last_feedback_at_round >= 5`.

**Trigger Points (call `notifyRoundCompleted(sessionKey)` from `useFeedbackTrigger()`):**
- `ResultScreen.tsx` (Imposter محلي) — key: `local-imposter-${roundNumber}-${secretWord}`
- `OnlineResultScreen.tsx` (Imposter أونلاين) — key: `online-imposter-${room.id}` (بعد تحميل imposters)
- `GuessingFinalResultScreen.tsx` (تخمين محلي) — key: `local-guessing-${Date.now()}`
- `GuessingOnlineFinalResultScreen.tsx` (تخمين أونلاين) — key: `online-guessing-${room.id}`
- `CountriesAdminScreen.tsx` — مع تأكيد المغادرة (handleConfirmLeave)

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
- `src/hooks/useRoundCounter.ts` — `incrementRound`, `shouldShowFeedback`, `markFeedbackGiven`.
- `src/context/FeedbackContext.tsx` — `FeedbackProvider` + `useFeedbackTrigger()`.
- `src/components/feedback/FeedbackModal.tsx` — UI الـ modal + شاشة ما بعد الإرسال.
- `FeedbackProvider` ملفوف داخل `Game.tsx` (داخل كل الـ providers).
