/* empty css                                 */
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../chunks/astro/server_XoOAQYhS.mjs';
import 'kleur/colors';
import { g as getCollection, $ as $$BaseLayout, a as $$CardQuestion } from '../chunks/CardQuestion_B-7HKMrJ.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const allQuestions = await getCollection("qa");
  const sortedQuestions = allQuestions.sort(
    (a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
  );
  const latestQuestions = sortedQuestions.slice(0, 6);
  const tagCounts = /* @__PURE__ */ new Map();
  allQuestions.forEach((question) => {
    question.data.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  const popularTags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag, count]) => ({ tag, count }));
  const title = "\u0645\u0648\u0642\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0623\u062C\u0648\u0628\u0629 - \u0625\u062C\u0627\u0628\u0627\u062A \u0634\u0627\u0645\u0644\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629";
  const description = "\u0645\u0648\u0642\u0639 \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0623\u062C\u0648\u0628\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629\u060C \u064A\u0642\u062F\u0645 \u0625\u062C\u0627\u0628\u0627\u062A \u0634\u0627\u0645\u0644\u0629 \u0648\u0645\u0641\u064A\u062F\u0629 \u0644\u0644\u0645\u0637\u0648\u0631\u064A\u0646 \u0648\u0627\u0644\u0645\u0647\u062A\u0645\u064A\u0646 \u0628\u0627\u0644\u062A\u0642\u0646\u064A\u0629. \u0627\u0643\u062A\u0634\u0641 \u0623\u062D\u062F\u062B \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0645\u0648\u0627\u0636\u064A\u0639 \u0627\u0644\u0634\u0627\u0626\u0639\u0629.";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="text-center mb-12"> <div class="max-w-2xl mx-auto"> <h1 class="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
مرحباً بك في موقع
<span class="text-indigo-600 dark:text-indigo-400">الأسئلة والأجوبة</span> </h1> <p class="text-lg md:text-xl text-zinc-600 dark:text-zinc-300 mb-8 leading-relaxed">
اكتشف إجابات شاملة ومفيدة لأسئلتك التقنية باللغة العربية. 
        نقدم محتوى عالي الجودة يساعدك في رحلتك التعليمية والمهنية.
</p> <div class="flex flex-col sm:flex-row gap-4 justify-center"> <a href="/tags" class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200 shadow-lg hover:shadow-xl">
تصفح المواضيع
</a> <a href="/page/1" class="inline-flex items-center justify-center px-6 py-3 border border-zinc-300 dark:border-zinc-600 text-base font-medium rounded-lg text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors duration-200">
جميع الأسئلة
</a> </div> </div> </section>  <section class="mb-12"> <div class="flex items-center justify-between mb-8"> <h2 class="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
أحدث الأسئلة
</h2> <a href="/page/1" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-200">
عرض الكل ←
</a> </div> ${latestQuestions.length > 0 ? renderTemplate`<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"> ${latestQuestions.map((question) => renderTemplate`${renderComponent($$result2, "CardQuestion", $$CardQuestion, { "href": `/q/${question.slug}`, "title": question.data.question, "description": question.data.shortAnswer, "date": question.data.pubDate, "tags": question.data.tags, "difficulty": question.data.difficulty })}`)} </div>` : renderTemplate`<div class="text-center py-12"> <p class="text-zinc-500 dark:text-zinc-400 text-lg">
لا توجد أسئلة متاحة حالياً
</p> </div>`} </section>  <section class="mb-12"> <div class="mb-8"> <h2 class="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
المواضيع الشائعة
</h2> <p class="text-zinc-600 dark:text-zinc-300">
اكتشف أكثر المواضيع بحثاً واهتماماً من قبل المجتمع
</p> </div> ${popularTags.length > 0 ? renderTemplate`<div class="flex flex-wrap gap-3"> ${popularTags.map(({ tag, count }) => renderTemplate`<a${addAttribute(`/tags/${tag}`, "href")} class="group inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all duration-200"> <span class="text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-medium">
#${tag} </span> <span class="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded-full"> ${count} </span> </a>`)} </div>` : renderTemplate`<div class="text-center py-8"> <p class="text-zinc-500 dark:text-zinc-400">
لا توجد وسوم متاحة حالياً
</p> </div>`} ${popularTags.length > 0 && renderTemplate`<div class="mt-6 text-center"> <a href="/tags" class="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-200">
عرض جميع المواضيع ←
</a> </div>`} </section>  <section class="text-center py-12 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-800/50"> <div class="max-w-xl mx-auto px-6"> <h3 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
ابدأ رحلة التعلم الآن
</h3> <p class="text-zinc-600 dark:text-zinc-300 mb-6">
انضم إلى مجتمعنا واكتشف المزيد من الإجابات المفيدة والمحتوى التعليمي المتميز
</p> <div class="flex flex-col sm:flex-row gap-3 justify-center"> <a href="/page/1" class="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
استكشف الأسئلة
</a> <a href="/tags" class="inline-flex items-center justify-center px-6 py-3 border border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 font-medium rounded-lg transition-colors duration-200">
تصفح حسب الموضوع
</a> </div> </div> </section> ` })}`;
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
