

## Push Notifications للتطبيق (يدوية + تلقائية)

### كيف بتشتغل
Push Notifications بتشتغل عن طريق **Web Push API** — المستخدم بوافق على الإشعارات، المتصفح بسجّل اشتراك، وبنبعثله إشعارات حتى لو التطبيق مسكّر.

### المطلوب

**1. توليد مفاتيح VAPID**
- بنحتاج مفتاح عام (public) ومفتاح خاص (private) عشان نبعث إشعارات آمنة
- المفتاح الخاص بنحطه كـ secret بالباك اند
- المفتاح العام بنحطه بالكود

**2. جدول جديد: `push_subscriptions`**
- بيخزّن اشتراكات المستخدمين (endpoint, keys, device info)
- كل جهاز بسجّل اشتراكه لما يوافق على الإشعارات

**3. Edge Function: `send-push-notification`**
- بتستقبل رسالة + نوع (broadcast للكل أو targeted لجهاز معين)
- بتجيب الاشتراكات من الجدول وبتبعث الإشعارات عن طريق web-push

**4. تعديل Service Worker (`sw.js`)**
- إضافة `push` event listener عشان يعرض الإشعار
- إضافة `notificationclick` event عشان يفتح التطبيق لما يكبس عالإشعار

**5. كود العميل (Client-side)**
- طلب إذن الإشعارات من المستخدم بعد ما ينزّل التطبيق
- تسجيل الاشتراك وإرساله للداتابيس
- Hook جديد: `usePushNotifications`

**6. إشعارات تلقائية من اللعبة**
- لما حد يعملك غرفة أو يبعثلك دعوة
- ممكن نضيف المزيد لاحقاً (دورك تلعب، نتيجة، الخ)

**7. إشعارات يدوية (Admin)**
- صفحة بسيطة محمية بباسوورد (نفس نظام الدول) تبعث إشعار لكل المشتركين

### الملفات المتأثرة

| ملف | تغيير |
|------|--------|
| `push_subscriptions` table | جدول جديد بالداتابيس |
| `supabase/functions/send-push-notification/index.ts` | Edge function جديدة |
| `public/sw.js` | إضافة push + notificationclick events |
| `src/hooks/usePushNotifications.ts` | Hook جديد لإدارة الاشتراك |
| `src/components/game/HubScreen.tsx` | طلب إذن الإشعارات |
| `src/components/game/AdminNotificationsScreen.tsx` | صفحة إرسال إشعارات يدوية |

### ملاحظات
- الإشعارات بتشتغل بس على HTTPS (المنشور) مش بالـ preview
- بنحتاج منك تضيف VAPID secret key كـ secret جديد
- على iOS (Safari) الإشعارات بتشتغل بس إذا التطبيق منزّل عالشاشة الرئيسية

