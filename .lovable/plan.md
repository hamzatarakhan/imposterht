

# إضافة محادثة صوتية بين اللاعبين باستخدام LiveKit

## الفكرة
إضافة زر ميكروفون في شاشة المواجهة (Play Screen) وشاشة اللوبي يسمح للاعبين بالتحدث مع بعضهم بالصوت مباشرة أثناء اللعب.

## المتطلبات
- **حساب LiveKit Cloud** (مجاني): تحتاج تسجل في [LiveKit Cloud](https://cloud.livekit.io) وتاخذ:
  - `LIVEKIT_API_KEY`
  - `LIVEKIT_API_SECRET`
  - `LIVEKIT_URL` (مثل `wss://your-app.livekit.cloud`)

## الخطوات التقنية

### 1. تخزين المفاتيح
- إضافة 3 secrets: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`

### 2. Edge Function لتوليد Token
- إنشاء `supabase/functions/livekit-token/index.ts`
- يستقبل `roomCode` و `playerName` ويرجع JWT token للاعب
- يستخدم LiveKit Server SDK لتوليد التوكن

### 3. تثبيت LiveKit Client SDK
- إضافة `livekit-client` كـ dependency
- استخدامه للاتصال بالغرفة الصوتية

### 4. React Hook: `useVoiceChat`
- هوك مشترك يدير الاتصال الصوتي
- يتصل بالغرفة تلقائياً عند الدخول
- زر كتم/تشغيل الميكروفون
- يعرض مؤشر لمن يتكلم حالياً

### 5. تعديل الشاشات
- **GuessingLobbyScreen**: إضافة زر صوت + مؤشر المتكلم
- **GuessingOnlinePlayScreen**: إضافة زر صوت في الـ header
- **LobbyScreen** (الإمبوستر): نفس الإضافة

### 6. واجهة المستخدم
- زر ميكروفون صغير في الـ header (🎙️ / 🔇)
- مؤشر بصري على أفاتار اللاعب لما يتكلم (حلقة متحركة)
- الصوت يشتغل تلقائي والميكروفون مكتوم بالبداية

## ملاحظات
- الخطة المجانية من LiveKit تدعم عدد محدود من المشاركين والدقائق شهرياً
- لازم أول شي تسجل بـ LiveKit Cloud وتعطيني المفاتيح عشان أقدر أكمل التنفيذ

