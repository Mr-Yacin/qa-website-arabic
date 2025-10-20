/* empty css                                   */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CoapMQ39.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BHsBBQfC.mjs';
export { renderers } from '../renderers.mjs';

const $$Privacy = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u062E\u0635\u0648\u0635\u064A\u0629 - \u0645\u0648\u0642\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0623\u062C\u0648\u0628\u0629", "description": "\u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u062E\u0635\u0648\u0635\u064A\u0629 \u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0623\u062C\u0648\u0628\u0629 - \u0643\u064A\u0641 \u0646\u062D\u0645\u064A \u0628\u064A\u0627\u0646\u0627\u062A\u0643 \u0627\u0644\u0634\u062E\u0635\u064A\u0629 \u0648\u0646\u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u062E\u0635\u0648\u0635\u064A\u062A\u0643" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<article class="prose prose-zinc dark:prose-invert max-w-none"> <h1>سياسة الخصوصية</h1> <p class="text-lg text-zinc-600 dark:text-zinc-400">
نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات على موقعنا.
</p> <h2>المعلومات التي نجمعها</h2> <p>
نحن نجمع المعلومات التالية عند استخدامك لموقعنا:
</p> <ul> <li><strong>معلومات الاستخدام:</strong> صفحات الموقع التي تزورها، الوقت المستغرق، ونوع المتصفح</li> <li><strong>التقييمات:</strong> تقييماتك للأسئلة والأجوبة (مخزنة محلياً في متصفحك)</li> <li><strong>معلومات تقنية:</strong> عنوان IP، نوع الجهاز، ونظام التشغيل</li> </ul> <h2>كيف نستخدم المعلومات</h2> <p>نستخدم المعلومات المجمعة للأغراض التالية:</p> <ul> <li>تحسين تجربة المستخدم وأداء الموقع</li> <li>تحليل استخدام الموقع وتطوير المحتوى</li> <li>ضمان أمان الموقع ومنع الاستخدام غير المشروع</li> </ul> <h2>حماية البيانات</h2> <p>
نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به أو التغيير أو الكشف أو التدمير.
</p> <h2>ملفات تعريف الارتباط (Cookies)</h2> <p>
نستخدم ملفات تعريف الارتباط لتحسين تجربتك على الموقع. يمكنك تعطيل هذه الملفات من إعدادات متصفحك.
</p> <h2>مشاركة المعلومات</h2> <p>
نحن لا نبيع أو نؤجر أو نشارك معلوماتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:
</p> <ul> <li>عند الحصول على موافقتك الصريحة</li> <li>عندما يتطلب القانون ذلك</li> <li>لحماية حقوقنا أو سلامة المستخدمين</li> </ul> <h2>حقوقك</h2> <p>لديك الحق في:</p> <ul> <li>الوصول إلى معلوماتك الشخصية</li> <li>تصحيح أو تحديث معلوماتك</li> <li>طلب حذف معلوماتك</li> <li>الاعتراض على معالجة معلوماتك</li> </ul> <h2>التغييرات على هذه السياسة</h2> <p>
قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سيتم نشر أي تغييرات على هذه الصفحة مع تاريخ التحديث.
</p> <h2>اتصل بنا</h2> <p>
إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر الموقع.
</p> <p class="text-sm text-zinc-500 dark:text-zinc-500 mt-8">
آخر تحديث: ${(/* @__PURE__ */ new Date()).toLocaleDateString("ar-SA")} </p> </article> ` })}`;
}, "C:/Users/yacin/Documents/qa-mva/src/pages/privacy.astro", void 0);

const $$file = "C:/Users/yacin/Documents/qa-mva/src/pages/privacy.astro";
const $$url = "/privacy";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Privacy,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
