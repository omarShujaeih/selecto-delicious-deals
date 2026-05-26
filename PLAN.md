# Selecto App - Project Handoff

آخر تحديث: 2026-05-26

## فكرة المشروع

Selecto هو تطبيق عروض طعام محلي. الزبون يستعرض العروض، يضيفها إلى السلة، ثم يؤكد الطلب. المطعم يدير عروضه وطلباته من لوحة تحكم. الأدمن يدير المطاعم والعروض على مستوى المنصة.

قاعدة التسعير الحالية:

- المطعم يدخل مستحقاته في `offers.discounted_price`.
- سعر الزبون النهائي = مستحقات المطعم + عمولة Selecto بنسبة 20%.
- منطق العرض في الواجهة موجود في `src/features/offers/offers.service.ts` عبر `toCustomerPrice`.
- مصدر الحقيقة عند الشراء هو Supabase RPC (`place_order`) و Database Triggers (`set_commission`).

## التقنية والتشغيل

- Frontend: React + TypeScript.
- Runtime/build: Vite + TanStack Start.
- Routing: TanStack Router file-based routes.
- Data/backend: Supabase Auth/Postgres/RPC.
- Styling: Tailwind CSS v4 + Radix UI primitives.
- Deploy target: Cloudflare عبر Wrangler.
- Mobile: Capacitor جاهز للاستخدام، لذلك تبقى مجلدات `android/` و`ios/` (الأولوية حالياً لنسخة الويب PWA).

أوامر مهمة:

```bash
npm install
npm run dev
npm run build
npm run lint
npm run check:db
npm run deploy:cloudflare:dry-run
```

لا ترفع `.env` أو مفاتيح Supabase الخاصة. `SUPABASE_SERVICE_ROLE_KEY` يجب أن يبقى server-only.

## الهيكلة الحالية

```text
src/
  app/                 مداخل TanStack Start: router/server/start
  routes/              ملفات الراوت، أغلبها wrappers خفيفة للميزات
  features/
    admin/             إدارة الأدمن (اللوحة، العروض، المطاعم)
    auth/              تسجيل الدخول، الأدوار، AuthProvider، حماية المسارات (Guards)
    cart/              السلة وعمليات الدفع (Checkout)
    customer/          profile/favorites/explore/support
    dashboard/         لوحة المطعم (إدارة الطلبات، العروض، والإعدادات)
    home/              الصفحة الأولى
    legal/             privacy/terms/delete-account
    offers/            عروض الزبائن، الأسعار، OfferCard
    orders/            طلبات الزبون
    push/              push notifications
    restaurants/       صفحة المطاعم
  shared/
    hooks/             hooks مشتركة
    layout/            BottomNav و SelectoLogo
    lib/               utilities مشتركة
    ui/                مكونات UI العامة (مثل SplashScreen)
  integrations/
    supabase/          clients, auth middleware, generated types
  scripts/             أدوات seed/check/demo
supabase/
  migrations/          تغييرات قاعدة البيانات
```

## حالة المشروع الحالية (ما تم إنجازه مؤخراً)

التطبيق الآن في أقصى درجات النظافة والاستقرار (Stable 100%):
- **بناء التطبيق (Build):** يعمل `npm run build` و `npm run lint` بنجاح تام وبدون أي أخطاء (0 Errors).
- **الشاشة الترحيبية (Splash Screen):** تم إنشاء شاشة ترحيبية فخمة (Mobile-First) بخاصية Micro-animations بمدة 8 ثوانٍ، وتم توحيد استيرادها في كامل المشروع.
- **طلبات الزبائن (Cart & Checkout):** 
  - تم إضافة خيارات طريقة التوصيل (`fulfillment_type`: Delivery/Pickup).
  - تم إضافة خيار لكتابة ملاحظات للطلب (`customer_note`).
  - عمليات الدفع والشراء تتحدث مباشرة في الـ Database دون مشاكل في Typescript.
- **إدارة المطاعم (Restaurant Dashboard):** تدعم اللوحة حالياً عرض خيارات التوصيل والملاحظات القادمة من الزبون بشكل سليم.
- **الحماية والصلاحيات (Role Guards):** الـ Redirects تعمل بشكل ممتاز ولا يمكن للزبون الدخول لصفحات المطعم/الأدمن، والعكس صحيح (محمية بـ `useCustomerGuard` وغيره).
- **تم عمل اختبار جودة كامل (QA Report):** موجود في `SELECTO_QA_REPORT.md` ويثبت جاهزية المشروع للمرحلة القادمة.

## ما المتبقي للمبرمج القادم (Next Steps)

1. **نظام الإشعارات (Push Notifications):**
   - إضافة نظام إشعارات (FCM) أو رسائل واتساب لإرسال تنبيه فوري للمطعم عند وصول طلب جديد، وللزبون عند تغيير حالة طلبه (مقبول، جاهز، تم الاستلام).
2. **تحسينات واجهة المطعم:**
   - إضافة تصميم (Badge) مميز في صفحة `DashboardOrdersPage` ليفرق العاملون في المطعم بين طلبات التوصيل (Delivery) وطلبات الاستلام من الفرع (Pickup) بوضوح وسرعة.
3. **تحليلات الأدمن (Admin Analytics):**
   - إضافة فلتر زمني (تاريخ محدد، هذا الشهر، هذا الأسبوع) لإحصائيات الإيرادات والعمولات في لوحة تحكم الإدارة `AdminHomePage`.
4. **الدفع الإلكتروني (Online Payment):**
   - بوابة الدفع (Visa/Mastercard) متوقفة حالياً (يظهر عليها علامة قريباً). يجب تفعيل ربط الـ API الخاص ببوابة الدفع.
