

## إضافة وضع المتفرج (Spectator) للعبة التخمين أونلاين

### الفكرة
إضافة زر مشاركة بالـ Lobby يرسل رابط خاص للمتفرجين. المتفرج يدخل على الرابط ويشوف كلمات اللاعبين والنتائج لحظياً بدون ما يلعب.

### التغييرات المطلوبة

**1. إضافة شاشة متفرج جديدة**
- ملف جديد: `src/components/game/guessing/online/GuessingSpectatorScreen.tsx`
- يعرض: كلمات اللاعبين (عبر RPC `get_guessing_round_words`)، النتيجة الحالية (wins)، رقم الجولة، حالة اللعبة (playing/round_result/finished)
- المتفرج يشوف كل شي بدون أزرار تحكم
- يشترك بـ realtime على `guessing_rooms` و `guessing_players` عشان يتابع التحديثات

**2. تعديل Context (`OnlineGuessingContext.tsx`)**
- إضافة شاشة `guessingSpectator` للـ screens
- إضافة دالة `joinAsSpectator(code)` — تجلب بيانات الغرفة بدون إضافة لاعب
- المتفرج ما بنضاف كـ player بالجدول، بس بيراقب الغرفة

**3. تعديل الـ Router (`OnlineGuessingGame.tsx`)**
- إضافة `GuessingSpectatorScreen` للـ screens map

**4. إضافة رابط المتفرج بالـ Lobby**
- إضافة زر مشاركة متفرج بالـ `GuessingLobbyScreen.tsx`
- الرابط: `?guessing_spectate=ROOMCODE`

**5. معالجة رابط المتفرج عند الدخول**
- بالـ Context، لو في `guessing_spectate` بالـ URL → يروح مباشرة على شاشة المتفرج

**6. RPC جديد للكلمات أثناء اللعب**
- حالياً `get_guessing_round_words` بترجع الكلمات بس لو الحالة `round_result` أو `finished`
- نحتاج RPC جديد `get_guessing_spectator_words` يرجع الكلمات حتى أثناء `playing` — لأنه المتفرج مش لاعب ومفيش غش
- أو نعدّل الـ RPC الحالي ليقبل حالة `playing` كمان

### شاشة المتفرج تعرض:
- أسماء اللاعبين وصورهم
- كلمة كل لاعب (ظاهرة للمتفرج)
- النتيجة الحالية (wins لكل لاعب)
- رقم الجولة من أصل كم
- حالة اللعبة (جاري اللعب / نتيجة الجولة / النتيجة النهائية)
- زر خروج

### ملاحظات تقنية
- المتفرج لا يُضاف لجدول `guessing_players` — يراقب فقط
- يستخدم `subscribeToGuessingRoom` الموجود أصلاً للمتابعة اللحظية
- الـ RPC الجديد `get_guessing_spectator_words` يكون SECURITY DEFINER ويرجع الكلمات بغض النظر عن حالة اللعبة (لأنه المتفرج مش لاعب)

