/* empty css                                    */
import { c as createComponent, a as createAstro, r as renderComponent, b as renderTemplate, m as maybeRenderHead, d as addAttribute, F as Fragment } from '../../chunks/astro/server_DYpdScgV.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout, g as getCollection } from '../../chunks/BaseLayout_yosFqUFg.mjs';
import { $ as $$CardQuestion } from '../../chunks/CardQuestion_15u53b_A.mjs';
import { p as paginate } from '../../chunks/paginate__--Aod_g.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
async function getStaticPaths() {
  const allQuestions = await getCollection("qa");
  const sortedQuestions = allQuestions.sort(
    (a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
  );
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedQuestions.length / itemsPerPage);
  const paths = [];
  for (let i = 2; i <= totalPages; i++) {
    const paginationResult = paginate(sortedQuestions, i, itemsPerPage);
    paths.push({
      params: { page: i.toString() },
      props: {
        paginationResult,
        allQuestions: sortedQuestions
      }
    });
  }
  return paths;
}
const $$page = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$page;
  const { page } = Astro2.params;
  const { paginationResult, allQuestions } = Astro2.props;
  if (page === "1") {
    return Astro2.redirect("/", 301);
  }
  const pageNum = parseInt(page);
  if (isNaN(pageNum) || pageNum < 1) {
    return Astro2.redirect("/", 301);
  }
  const totalPages = Math.ceil(allQuestions.length / 10);
  if (pageNum > totalPages) {
    return Astro2.redirect("/", 301);
  }
  const title = `\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u2013 \u0635\u0641\u062D\u0629 ${paginationResult.page}`;
  const description = `\u062A\u0635\u0641\u062D \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0623\u062C\u0648\u0628\u0629 - \u0627\u0644\u0635\u0641\u062D\u0629 ${paginationResult.page} \u0645\u0646 ${paginationResult.pages}. \u0627\u0643\u062A\u0634\u0641 \u0627\u0644\u0645\u0632\u064A\u062F \u0645\u0646 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A \u0648\u0627\u0644\u0625\u062C\u0627\u0628\u0627\u062A \u0627\u0644\u0645\u0641\u064A\u062F\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629.`;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="mb-8"> <div class="flex items-center justify-between mb-4"> <h1 class="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
جميع الأسئلة
</h1> <div class="text-sm text-zinc-500 dark:text-zinc-400">
صفحة ${paginationResult.page} من ${paginationResult.pages} </div> </div> <p class="text-zinc-600 dark:text-zinc-300 text-lg">
تصفح مجموعة شاملة من الأسئلة والأجوبة المفيدة في مختلف المجالات التقنية
</p> <!-- Results summary --> <div class="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
عرض ${(paginationResult.page - 1) * 10 + 1} - ${Math.min(paginationResult.page * 10, paginationResult.total)} من أصل ${paginationResult.total} سؤال
</div> </div>  ${paginationResult.items.length > 0 ? renderTemplate`<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12"> ${paginationResult.items.map((question) => renderTemplate`${renderComponent($$result2, "CardQuestion", $$CardQuestion, { "href": `/q/${question.slug}`, "title": question.data.question, "description": question.data.shortAnswer, "date": question.data.pubDate, "tags": question.data.tags, "difficulty": question.data.difficulty })}`)} </div>` : renderTemplate`<div class="text-center py-12"> <p class="text-zinc-500 dark:text-zinc-400 text-lg">
لا توجد أسئلة في هذه الصفحة
</p> </div>`} ${paginationResult.pages > 1 && renderTemplate`<nav class="flex items-center justify-center space-x-2 space-x-reverse" aria-label="تنقل بين الصفحات"> <div class="flex items-center space-x-1 space-x-reverse"> <!-- Previous Page Button --> ${paginationResult.hasPrev ? renderTemplate`<a${addAttribute(paginationResult.page === 2 ? "/" : `/page/${paginationResult.page - 1}`, "href")} class="inline-flex items-center px-3 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors duration-200" aria-label="الصفحة السابقة">
← السابق
</a>` : renderTemplate`<span class="inline-flex items-center px-3 py-2 text-sm font-medium text-zinc-300 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md cursor-not-allowed">
← السابق
</span>`} <!-- Page Numbers --> <div class="flex items-center space-x-1 space-x-reverse mx-4">  ${paginationResult.page > 3 && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <a href="/" class="inline-flex items-center px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors duration-200">
1
</a> ${paginationResult.page > 4 && renderTemplate`<span class="px-2 text-zinc-500 dark:text-zinc-400">...</span>`}` })}`}  ${Array.from({ length: paginationResult.pages }, (_, i) => i + 1).filter(
    (pageNum2) => pageNum2 === 1 || pageNum2 === paginationResult.pages || Math.abs(pageNum2 - paginationResult.page) <= 1
  ).filter((pageNum2) => pageNum2 <= paginationResult.page + 1 && pageNum2 >= paginationResult.page - 1).map((pageNum2) => pageNum2 === paginationResult.page ? renderTemplate`<span class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 border border-indigo-600 dark:border-indigo-500 rounded-md" aria-current="page"> ${pageNum2} </span>` : renderTemplate`<a${addAttribute(pageNum2 === 1 ? "/" : `/page/${pageNum2}`, "href")} class="inline-flex items-center px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors duration-200"> ${pageNum2} </a>`)}  ${paginationResult.page < paginationResult.pages - 2 && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`${paginationResult.page < paginationResult.pages - 3 && renderTemplate`<span class="px-2 text-zinc-500 dark:text-zinc-400">...</span>`}<a${addAttribute(`/page/${paginationResult.pages}`, "href")} class="inline-flex items-center px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors duration-200"> ${paginationResult.pages} </a> ` })}`} </div> <!-- Next Page Button --> ${paginationResult.hasNext ? renderTemplate`<a${addAttribute(`/page/${paginationResult.page + 1}`, "href")} class="inline-flex items-center px-3 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors duration-200" aria-label="الصفحة التالية">
التالي →
</a>` : renderTemplate`<span class="inline-flex items-center px-3 py-2 text-sm font-medium text-zinc-300 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md cursor-not-allowed">
التالي →
</span>`} </div> </nav>`} <div class="mt-12 text-center"> <div class="flex flex-col sm:flex-row gap-4 justify-center"> <a href="/tags" class="inline-flex items-center justify-center px-6 py-3 border border-zinc-300 dark:border-zinc-600 text-base font-medium rounded-lg text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors duration-200">
تصفح حسب الموضوع
</a> <a href="/" class="inline-flex items-center justify-center px-6 py-3 border border-zinc-300 dark:border-zinc-600 text-base font-medium rounded-lg text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors duration-200">
العودة للرئيسية
</a> </div> </div> ` })} `;
}, "C:/Users/yacin/Documents/qa-mva/src/pages/page/[page].astro", void 0);

const $$file = "C:/Users/yacin/Documents/qa-mva/src/pages/page/[page].astro";
const $$url = "/page/[page]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$page,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
