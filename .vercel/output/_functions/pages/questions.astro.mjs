/* empty css                                   */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CoapMQ39.mjs';
import 'kleur/colors';
import { g as getCollection } from '../chunks/_astro_content_CuzDBXnp.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BHsBBQfC.mjs';
import { $ as $$CardQuestion } from '../chunks/CardQuestion_CP39XPBB.mjs';
import { p as paginate } from '../chunks/paginate__--Aod_g.mjs';
export { renderers } from '../renderers.mjs';

const $$Questions = createComponent(async ($$result, $$props, $$slots) => {
  const allQuestions = await getCollection("qa");
  const sortedQuestions = allQuestions.sort(
    (a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
  );
  const paginationResult = paginate(sortedQuestions, 1, 10);
  const title = "\u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0623\u062C\u0648\u0628\u0629";
  const description = "\u062A\u0635\u0641\u062D \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0623\u062C\u0648\u0628\u0629 \u0627\u0644\u0645\u062A\u0627\u062D\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0648\u0642\u0639. \u0627\u0643\u062A\u0634\u0641 \u0627\u0644\u0645\u0632\u064A\u062F \u0645\u0646 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A \u0648\u0627\u0644\u0625\u062C\u0627\u0628\u0627\u062A \u0627\u0644\u0645\u0641\u064A\u062F\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629.";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="mb-8"> <div class="flex items-center justify-between mb-4"> <h1 class="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
جميع الأسئلة
</h1> <div class="text-sm text-zinc-500 dark:text-zinc-400"> ${paginationResult.total} سؤال
</div> </div> <p class="text-zinc-600 dark:text-zinc-300 text-lg">
تصفح مجموعة شاملة من الأسئلة والأجوبة المفيدة في مختلف المجالات التقنية
</p> </div>  ${paginationResult.items.length > 0 ? renderTemplate`<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12"> ${paginationResult.items.map((question) => renderTemplate`${renderComponent($$result2, "CardQuestion", $$CardQuestion, { "href": `/q/${question.slug}`, "title": question.data.question, "description": question.data.shortAnswer, "date": question.data.pubDate, "tags": question.data.tags, "difficulty": question.data.difficulty })}`)} </div>` : renderTemplate`<div class="text-center py-12"> <p class="text-zinc-500 dark:text-zinc-400 text-lg">
لا توجد أسئلة متاحة حالياً
</p> </div>`} ${paginationResult.pages > 1 && renderTemplate`<div class="text-center mb-12"> <div class="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700"> <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
المزيد من الأسئلة
</h3> <p class="text-zinc-600 dark:text-zinc-300 mb-4">
يوجد ${paginationResult.total - 10} سؤال إضافي متاح للتصفح
</p> <a href="/page/2" class="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-zinc-950 hover:scale-105 will-change-transform">
عرض المزيد من الأسئلة
</a> </div> </div>`} <div class="text-center"> <div class="flex flex-col sm:flex-row gap-4 justify-center"> <a href="/tags" class="inline-flex items-center justify-center px-6 py-3 border border-zinc-300 dark:border-zinc-600 text-base font-medium rounded-lg text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-zinc-950 hover:scale-105 will-change-transform">
تصفح حسب الموضوع
</a> <a href="/" class="inline-flex items-center justify-center px-6 py-3 border border-zinc-300 dark:border-zinc-600 text-base font-medium rounded-lg text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-zinc-950 hover:scale-105 will-change-transform">
العودة للرئيسية
</a> </div> </div> ` })}`;
}, "C:/Users/yacin/Documents/qa-mva/src/pages/questions.astro", void 0);

const $$file = "C:/Users/yacin/Documents/qa-mva/src/pages/questions.astro";
const $$url = "/questions";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Questions,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
