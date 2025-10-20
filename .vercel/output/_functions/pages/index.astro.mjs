/* empty css                                 */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DUthbzq1.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_Id6I23id.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 - \u0645\u0648\u0642\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0623\u062C\u0648\u0628\u0629", "description": "\u0645\u0648\u0642\u0639 \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0623\u062C\u0648\u0628\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629\u060C \u064A\u0642\u062F\u0645 \u0625\u062C\u0627\u0628\u0627\u062A \u0634\u0627\u0645\u0644\u0629 \u0648\u0645\u0641\u064A\u062F\u0629 \u0644\u0644\u0645\u0637\u0648\u0631\u064A\u0646 \u0648\u0627\u0644\u0645\u0647\u062A\u0645\u064A\u0646 \u0628\u0627\u0644\u062A\u0642\u0646\u064A\u0629." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="text-center"> <h1 class="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
مرحباً بك في موقع الأسئلة والأجوبة
</h1> <p class="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
اكتشف إجابات شاملة للأسئلة التقنية باللغة العربية
</p> </div> ` })}`;
}, "C:/Users/yacin/Documents/qa-mva/src/pages/index.astro", void 0);

const $$file = "C:/Users/yacin/Documents/qa-mva/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
