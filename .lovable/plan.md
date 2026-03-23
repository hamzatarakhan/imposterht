

## لعبة الدول - خطة التنفيذ

### الفكرة
لعبة جماعية فيها Admin واحد يتحكم بكل شي، والباقين يشوفوا حالة اللعبة لحظياً. اللاعبين يبنوا اسم دولة حرف بحرف، وفي نظام تحدي وأرواح وتبديل.

### المكونات الرئيسية

**1. قاعدة البيانات (3 جداول جديدة)**
- `countries_rooms` — غرفة اللعب (كود، حالة، admin)
- `countries_players` — اللاعبين (اسم، أرواح 3، حالة active/eliminated، ترتيب)
- `countries_burned` — الدول المحترقة (اسم الدولة، وقت الإضافة)
- Views عامة + RLS + RPC functions للتعديل الآمن

**2. Context Provider**
- `CountriesGameContext` — إدارة حالة اللعبة والمزامنة اللحظية عبر Supabase Realtime

**3. الشاشات**
- `CountriesModeSelect` — اختيار إنشاء غرفة أو انضمام
- `CountriesCreateRoom` — Admin يضيف أسماء اللاعبين ويبدأ
- `CountriesJoinRoom` — المتابعين يدخلوا بكود الغرفة
- `CountriesAdminScreen` — شاشة التحكم الكاملة للـ Admin:
  - قائمة اللاعبين مع قلوب (❤️) وأزرار +/- أرواح
  - إضافة دولة محترقة + حذفها
  - قسم التبديل: اختيار لاعب برا + لاعب داخل → تبديل
  - الحروف الحالية (اختياري)
- `CountriesSpectatorScreen` — شاشة المتابعين (قراءة فقط):
  - قائمة اللاعبين وأرواحهم
  - الدول المحترقة
  - تحديث لحظي

**4. التكامل**
- إضافة اللعبة في `HubScreen` كخيار ثالث (🌍 دول)
- إضافة routing في `Game.tsx`
- إضافة Provider في سلسلة Providers

### التفاصيل التقنية

**DB Functions (RPC):**
- `create_countries_room` — إنشاء غرفة
- `add_countries_player` — إضافة لاعب
- `update_player_lives` — تعديل أرواح (+/-)
- `add_burned_country` — إضافة دولة محترقة
- `remove_burned_country` — حذف دولة
- `swap_players` — تبديل لاعب داخل بلاعب برا (نقل الأرواح)
- `eliminate_player` / `revive_player`

**Realtime:** تفعيل على الجداول الثلاثة عبر `supabase_realtime`

**ملفات جديدة:**
- `src/context/CountriesGameContext.tsx`
- `src/components/game/countries/CountriesModeSelect.tsx`
- `src/components/game/countries/CountriesCreateRoom.tsx`
- `src/components/game/countries/CountriesJoinRoom.tsx`
- `src/components/game/countries/CountriesAdminScreen.tsx`
- `src/components/game/countries/CountriesSpectatorScreen.tsx`
- `src/components/game/countries/CountriesGame.tsx`
- `src/services/countriesRoomService.ts`
- Migration SQL file

