

## نظام التقييم الإجباري

نظام يطلب من المستخدم تقييم التطبيق بعد أول جولة، وبعدها كل فترة (مرة كل 5 جولات لاحقة)، بدون خيار تخطي.

### تجربة المستخدم

**متى يظهر الـ Modal؟**
- **أول مرة**: بعد ما يكمل أول جولة كاملة بأي لعبة (يوصل لشاشة نتيجة).
- **بعدها**: كل 5 جولات إضافية (الجولة 6، 11، 16...).
- **أين**: Modal فل-سكرين (React Portal) فوق شاشة النتيجة، ما إله زر إغلاق ولا backdrop click.

**شو بشوف المستخدم؟**

شاشة التقييم تحتوي:
- عنوان: "🌟 قيّم تجربتك بفعاليات"
- نص فرعي: "رأيك بيهمنا، اختار اللي بحس فيه"
- 5 أزرار اختيار (Radio-like، اختيار واحد فقط):
  1. ✨ **رائع**
  2. 🔥 **أكثر من رائع**
  3. 🤯 **خُزعبلي**
  4. 🤲 **صلاة النبي ما عليه حكي**
  5. 🛠️ **بدك الصحيح بده شوية تحسين**

**الفرع الشرطي (Conditional Branch):**
- لو اختار أي خيار من أول 4 (إيجابي): يظهر زر "إرسال" → بعد الإرسال شكر + يقفل تلقائياً.
- لو اختار **"بده شوية تحسين"**: تظهر `Textarea` تحتها بـ placeholder:
  > **"يلا تفضل اهرج، شو التحسينات؟ شو مشكلتك عشان نرستكلك الأمور 🛠️"**
  - Textarea إجبارية (10-1000 حرف) قبل تفعيل زر الإرسال.

**بعد الإرسال:**
- شاشة شكر سريعة (1.5 ثانية): "🙏 شكراً، رأيك وصلنا!" → يقفل الـ modal تلقائياً.

### الخريطة التقنية

**1. قاعدة البيانات** (migration جديد):

```text
app_feedback
  id              uuid PK (gen_random_uuid)
  user_id         uuid    -- localStorage user ID (Casual Identity)
  rating          text    -- 'amazing' | 'more_amazing' | 'khoz3boli' | 'salat_nabi' | 'needs_improvement'
  improvement_text text   -- nullable, only for 'needs_improvement'
  app_version     text    -- from version.json
  rounds_completed int    -- which round triggered this
  created_at      timestamptz default now()
```

RLS: 
- INSERT: مفتوح للجميع (`anon, authenticated`) — نموذج Casual Identity زي باقي الجداول.
- SELECT/UPDATE/DELETE: مغلقة (admin فقط عبر service role) — التقييمات خاصة.

**2. Hook جديد: `src/hooks/useRoundCounter.ts`**
- يخزن في localStorage:
  - `rounds_completed` (عدد الجولات الكاملة)
  - `last_feedback_at_round` (آخر جولة قُيّمت)
- دالة `incrementRound()` تستدعى عند الوصول لشاشة نتيجة (مرة وحدة لكل جولة عبر `sessionStorage` flag).
- دالة `shouldShowFeedback()` ترجع `true` لو:
  - `rounds_completed === 1` ولا في `last_feedback_at_round`، **أو**
  - `rounds_completed - last_feedback_at_round >= 5`.

**3. Component: `src/components/feedback/FeedbackModal.tsx`**
- Modal عبر React Portal (`z-[200]`, `fixed inset-0`, backdrop-blur, no close on backdrop click، no Escape key dismiss).
- 5 أزرار راديو بستايل cards مع icons.
- لو اختار "needs_improvement" → يظهر `<Textarea>` (من shadcn) مع placeholder الجوردني المطلوب.
- زر "📤 إرسال" مُعطّل لحد ما يختار + (لو تحسين) يكتب ≥10 حرف.
- Validation: zod schema (`rating` enum + `improvement_text` min 10 max 1000).
- بعد success: يحفظ `last_feedback_at_round` في localStorage ويعرض شكر ثم يقفل.

**4. Provider: `src/context/FeedbackContext.tsx`**
- يلف `GameContent` في `Game.tsx` (داخل الـ providers الموجودة).
- يفتح `FeedbackModal` تلقائياً لما `shouldShowFeedback()` ترجع true بعد جولة جديدة.
- Hook عام `useFeedbackTrigger()` يُستدعى من شاشات النتيجة:
  - `ResultScreen.tsx` (Imposter محلي)
  - `OnlineResultScreen.tsx` (Imposter أونلاين)
  - `GuessingFinalResultScreen.tsx` (تخمين محلي)
  - `GuessingOnlineFinalResultScreen.tsx` (تخمين أونلاين)
  - `CountriesGame.tsx` (نقطة خروج اللعبة)

**5. Service: `src/services/feedbackService.ts`**
- `submitFeedback({ rating, improvement_text })` → يكتب في `app_feedback` مباشرة (RLS تسمح INSERT).
- يجيب `user_id` من localStorage (نفس الموجود حالياً)، ويجيب `app_version` من `/version.json`.

### تفاصيل صغيرة

- **اللغة**: كل النصوص بالعامية الأردنية (نفس روح التطبيق).
- **الأصوات والاهتزاز**: `playSound('click')` عند الاختيار، `playSound('win')` عند نجاح الإرسال، `vibrate(50)` عند فتح الـ modal.
- **عدم التطفل المفرط**: لو فشل الإرسال (مشكلة شبكة)، يبقى الـ modal مفتوح مع toast خطأ — لا يُحسب التقييم لحد ما ينجح.
- **تخزين أمين**: مفتاح localStorage = `feedback_state_v1` (JSON) → يسمح بترحيل مستقبلي.
- **التيمات**: يلتزم بـ `mem://style/theme-support` (flat بالـ light، glow بالـ dark) و`mem://style/modals/standard-pattern` (React Portal).
- **تحديث المذكرة**: إضافة `mem://features/app-feedback-system` مع وصف للنظام والـ trigger cadence.

### ملخص الملفات

**جديدة**:
- `supabase/migrations/<timestamp>_app_feedback.sql`
- `src/services/feedbackService.ts`
- `src/hooks/useRoundCounter.ts`
- `src/context/FeedbackContext.tsx`
- `src/components/feedback/FeedbackModal.tsx`
- `mem://features/app-feedback-system`

**معدّلة**:
- `src/components/game/Game.tsx` (إضافة `FeedbackProvider`)
- `src/components/game/ResultScreen.tsx` + `OnlineResultScreen.tsx`
- `src/components/game/guessing/GuessingFinalResultScreen.tsx` + `GuessingOnlineFinalResultScreen.tsx`
- `src/components/game/countries/CountriesGame.tsx` (عند الخروج)
- `mem://index.md` (إضافة سطر للنظام الجديد)

