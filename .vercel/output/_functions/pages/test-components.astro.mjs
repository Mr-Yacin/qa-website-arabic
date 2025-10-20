/* empty css                                 */
import { e as createComponent, f as createAstro, m as maybeRenderHead, h as addAttribute, r as renderTemplate, k as renderComponent, l as Fragment } from '../chunks/astro/server_DUthbzq1.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_Id6I23id.mjs';
import 'clsx';
/* empty css                                           */
export { renderers } from '../renderers.mjs';

function formatDate(date, locale = "ar-MA") {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

const $$Astro$6 = createAstro();
const $$CardQuestion = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$CardQuestion;
  const { href, title, description, date, tags, difficulty = "easy" } = Astro2.props;
  const difficultyColors = {
    easy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  };
  const difficultyLabels = {
    easy: "\u0633\u0647\u0644",
    medium: "\u0645\u062A\u0648\u0633\u0637",
    hard: "\u0635\u0639\u0628"
  };
  return renderTemplate`${maybeRenderHead()}<article class="group relative bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-600" data-astro-cid-dqkhqhod> <a${addAttribute(href, "href")} class="absolute inset-0 z-10"${addAttribute(`\u0627\u0642\u0631\u0623: ${title}`, "aria-label")} data-astro-cid-dqkhqhod> <span class="sr-only" data-astro-cid-dqkhqhod>اقرأ المقال الكامل</span> </a> <div class="flex flex-col h-full" data-astro-cid-dqkhqhod> <!-- Header with difficulty badge --> <div class="flex items-start justify-between mb-3" data-astro-cid-dqkhqhod> <span${addAttribute(`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColors[difficulty]}`, "class")} data-astro-cid-dqkhqhod> ${difficultyLabels[difficulty]} </span> <time${addAttribute(date.toISOString(), "datetime")} class="text-sm text-zinc-500 dark:text-zinc-400 flex-shrink-0 mr-3" data-astro-cid-dqkhqhod> ${formatDate(date)} </time> </div> <!-- Title --> <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2" data-astro-cid-dqkhqhod> ${title} </h3> <!-- Description --> <p class="text-zinc-600 dark:text-zinc-300 text-sm mb-4 flex-grow line-clamp-3" data-astro-cid-dqkhqhod> ${description} </p> <!-- Tags --> ${tags.length > 0 && renderTemplate`<div class="flex flex-wrap gap-2 mt-auto" data-astro-cid-dqkhqhod> ${tags.slice(0, 4).map((tag) => renderTemplate`<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors" data-astro-cid-dqkhqhod>
#${tag} </span>`)} ${tags.length > 4 && renderTemplate`<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-zinc-500 dark:text-zinc-400" data-astro-cid-dqkhqhod>
+${tags.length - 4} </span>`} </div>`} </div> </article> `;
}, "C:/Users/yacin/Documents/qa-mva/src/components/CardQuestion.astro", void 0);

const $$Astro$5 = createAstro();
const $$Breadcrumbs = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$Breadcrumbs;
  const { items, class: className = "" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<nav aria-label="مسار التنقل"${addAttribute(`flex ${className}`, "class")}> <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse"> ${items.map((item, index) => renderTemplate`<li class="inline-flex items-center"> ${index > 0 && renderTemplate`<svg class="rtl:rotate-180 w-3 h-3 text-zinc-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"> <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"></path> </svg>`} ${item.href ? renderTemplate`<a${addAttribute(item.href, "href")} class="inline-flex items-center text-sm font-medium text-zinc-700 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"> ${index === 0 && renderTemplate`<svg class="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"> <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"></path> </svg>`} ${item.label} </a>` : renderTemplate`<span class="ms-1 text-sm font-medium text-zinc-500 md:ms-2 dark:text-zinc-400" aria-current="page"> ${item.label} </span>`} </li>`)} </ol> </nav>`;
}, "C:/Users/yacin/Documents/qa-mva/src/components/Breadcrumbs.astro", void 0);

const $$Astro$4 = createAstro();
const $$QuestionMeta = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$QuestionMeta;
  const { pubDate, updatedDate, tags, difficulty, class: className = "" } = Astro2.props;
  const difficultyColors = {
    easy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  };
  const difficultyLabels = {
    easy: "\u0633\u0647\u0644",
    medium: "\u0645\u062A\u0648\u0633\u0637",
    hard: "\u0635\u0639\u0628"
  };
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`flex flex-col gap-4 ${className}`, "class")}> <!-- Date Information --> <div class="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400"> <div class="flex items-center gap-2"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg> <span>نُشر في:</span> <time${addAttribute(pubDate.toISOString(), "datetime")}> ${formatDate(pubDate)} </time> </div> ${updatedDate && renderTemplate`<div class="flex items-center gap-2"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path> </svg> <span>آخر تحديث:</span> <time${addAttribute(updatedDate.toISOString(), "datetime")}> ${formatDate(updatedDate)} </time> </div>`} </div> <!-- Difficulty Badge --> <div class="flex items-center gap-2"> <svg class="w-4 h-4 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path> </svg> <span class="text-sm text-zinc-600 dark:text-zinc-400">مستوى الصعوبة:</span> <span${addAttribute(`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColors[difficulty]}`, "class")}> ${difficultyLabels[difficulty]} </span> </div> <!-- Tags --> ${tags.length > 0 && renderTemplate`<div class="flex flex-col gap-2"> <div class="flex items-center gap-2"> <svg class="w-4 h-4 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path> </svg> <span class="text-sm text-zinc-600 dark:text-zinc-400">الوسوم:</span> </div> <div class="flex flex-wrap gap-2"> ${tags.map((tag) => renderTemplate`<a${addAttribute(`/tags/${tag}`, "href")} class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition-colors">
#${tag} </a>`)} </div> </div>`} </div>`;
}, "C:/Users/yacin/Documents/qa-mva/src/components/QuestionMeta.astro", void 0);

const $$Astro$3 = createAstro();
const $$DateDisplay = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$DateDisplay;
  const { pubDate, updatedDate, showIcons = true, class: className = "" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400 ${className}`, "class")}> <div class="flex items-center gap-2"> ${showIcons && renderTemplate`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg>`} <span>نُشر في:</span> <time${addAttribute(pubDate.toISOString(), "datetime")}> ${formatDate(pubDate)} </time> </div> ${updatedDate && renderTemplate`<div class="flex items-center gap-2"> ${showIcons && renderTemplate`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path> </svg>`} <span>آخر تحديث:</span> <time${addAttribute(updatedDate.toISOString(), "datetime")}> ${formatDate(updatedDate)} </time> </div>`} </div>`;
}, "C:/Users/yacin/Documents/qa-mva/src/components/DateDisplay.astro", void 0);

const $$Astro$2 = createAstro();
const $$TagList = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$TagList;
  const {
    tags,
    showIcon = true,
    showLabel = true,
    linkable = true,
    maxTags,
    size = "md",
    class: className = ""
  } = Astro2.props;
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const remainingCount = maxTags && tags.length > maxTags ? tags.length - maxTags : 0;
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2"
  };
  const tagClass = `inline-flex items-center rounded-md font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition-colors ${sizeClasses[size]}`;
  return renderTemplate`${tags.length > 0 && renderTemplate`${maybeRenderHead()}<div${addAttribute(`flex flex-col gap-2 ${className}`, "class")}>${showLabel && renderTemplate`<div class="flex items-center gap-2">${showIcon && renderTemplate`<svg class="w-4 h-4 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>`}<span class="text-sm text-zinc-600 dark:text-zinc-400">الوسوم:</span></div>`}<div class="flex flex-wrap gap-2">${displayTags.map((tag) => linkable ? renderTemplate`<a${addAttribute(`/tags/${tag}`, "href")}${addAttribute(tagClass, "class")}>
#${tag}</a>` : renderTemplate`<span${addAttribute(tagClass, "class")}>
#${tag}</span>`)}${remainingCount > 0 && renderTemplate`<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-zinc-500 dark:text-zinc-400">
+${remainingCount}</span>`}</div></div>`}`;
}, "C:/Users/yacin/Documents/qa-mva/src/components/TagList.astro", void 0);

const $$Astro$1 = createAstro();
const $$DifficultyBadge = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$DifficultyBadge;
  const {
    difficulty,
    showIcon = true,
    showLabel = true,
    size = "md",
    class: className = ""
  } = Astro2.props;
  const difficultyColors = {
    easy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  };
  const difficultyLabels = {
    easy: "\u0633\u0647\u0644",
    medium: "\u0645\u062A\u0648\u0633\u0637",
    hard: "\u0635\u0639\u0628"
  };
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1"
  };
  const badgeClass = `inline-flex items-center rounded-full font-medium ${difficultyColors[difficulty]} ${sizeClasses[size]}`;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`flex items-center gap-2 ${className}`, "class")}> ${showLabel && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${showIcon && renderTemplate`<svg class="w-4 h-4 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path> </svg>`}<span class="text-sm text-zinc-600 dark:text-zinc-400">مستوى الصعوبة:</span> ` })}`} <span${addAttribute(badgeClass, "class")}> ${difficultyLabels[difficulty]} </span> </div>`;
}, "C:/Users/yacin/Documents/qa-mva/src/components/DifficultyBadge.astro", void 0);

const $$Astro = createAstro();
const $$TestComponents = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$TestComponents;
  const sampleQuestion = {
    title: "\u0645\u0627 \u0647\u0648 Astro \u0648\u0643\u064A\u0641 \u064A\u0639\u0645\u0644\u061F",
    description: "Astro \u0647\u0648 \u0625\u0637\u0627\u0631 \u0639\u0645\u0644 \u062D\u062F\u064A\u062B \u0644\u0628\u0646\u0627\u0621 \u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u0648\u064A\u0628 \u0627\u0644\u0633\u0631\u064A\u0639\u0629 \u0645\u0639 \u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u0623\u062F\u0627\u0621 \u0648\u0627\u0644\u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u062C\u0632\u0626\u064A \u0644\u0644\u0645\u0643\u0648\u0646\u0627\u062A \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629.",
    pubDate: /* @__PURE__ */ new Date("2024-01-15"),
    updatedDate: /* @__PURE__ */ new Date("2024-01-20"),
    tags: ["astro", "web-development", "javascript", "performance"],
    difficulty: "medium"
  };
  const breadcrumbItems = [
    { label: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629", href: "/" },
    { label: "\u0627\u0644\u0623\u0633\u0626\u0644\u0629", href: "/questions" },
    { label: "\u0645\u0627 \u0647\u0648 Astro\u061F" }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0645\u0643\u0648\u0646\u0627\u062A", "description": "\u0635\u0641\u062D\u0629 \u0627\u062E\u062A\u0628\u0627\u0631 \u0644\u0644\u0645\u0643\u0648\u0646\u0627\u062A \u0627\u0644\u062C\u062F\u064A\u062F\u0629" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-8"> <h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-100">اختبار المكونات</h1> <!-- Breadcrumbs Test --> <section> <h2 class="text-xl font-semibold mb-4">مسار التنقل (Breadcrumbs)</h2> ${renderComponent($$result2, "Breadcrumbs", $$Breadcrumbs, { "items": breadcrumbItems })} </section> <!-- CardQuestion Test --> <section> <h2 class="text-xl font-semibold mb-4">بطاقة السؤال (CardQuestion)</h2> <div class="max-w-md"> ${renderComponent($$result2, "CardQuestion", $$CardQuestion, { "href": "/q/what-is-astro", "title": sampleQuestion.title, "description": sampleQuestion.description, "date": sampleQuestion.pubDate, "tags": sampleQuestion.tags, "difficulty": sampleQuestion.difficulty })} </div> </section> <!-- QuestionMeta Test --> <section> <h2 class="text-xl font-semibold mb-4">معلومات السؤال الكاملة (QuestionMeta)</h2> ${renderComponent($$result2, "QuestionMeta", $$QuestionMeta, { "pubDate": sampleQuestion.pubDate, "updatedDate": sampleQuestion.updatedDate, "tags": sampleQuestion.tags, "difficulty": sampleQuestion.difficulty })} </section> <!-- Individual Components Tests --> <section> <h2 class="text-xl font-semibold mb-4">المكونات الفردية</h2> <div class="space-y-6"> <div> <h3 class="text-lg font-medium mb-2">عرض التاريخ (DateDisplay)</h3> ${renderComponent($$result2, "DateDisplay", $$DateDisplay, { "pubDate": sampleQuestion.pubDate, "updatedDate": sampleQuestion.updatedDate })} </div> <div> <h3 class="text-lg font-medium mb-2">قائمة الوسوم (TagList)</h3> ${renderComponent($$result2, "TagList", $$TagList, { "tags": sampleQuestion.tags })} </div> <div> <h3 class="text-lg font-medium mb-2">شارة الصعوبة (DifficultyBadge)</h3> ${renderComponent($$result2, "DifficultyBadge", $$DifficultyBadge, { "difficulty": sampleQuestion.difficulty })} </div> </div> </section> <!-- Component Variations --> <section> <h2 class="text-xl font-semibold mb-4">تنويعات المكونات</h2> <div class="space-y-6"> <div> <h3 class="text-lg font-medium mb-2">وسوم بدون روابط</h3> ${renderComponent($$result2, "TagList", $$TagList, { "tags": sampleQuestion.tags, "linkable": false })} </div> <div> <h3 class="text-lg font-medium mb-2">وسوم محدودة العدد</h3> ${renderComponent($$result2, "TagList", $$TagList, { "tags": sampleQuestion.tags, "maxTags": 2 })} </div> <div> <h3 class="text-lg font-medium mb-2">شارة صعوبة بدون تسمية</h3> ${renderComponent($$result2, "DifficultyBadge", $$DifficultyBadge, { "difficulty": "hard", "showLabel": false })} </div> <div> <h3 class="text-lg font-medium mb-2">تاريخ بدون أيقونات</h3> ${renderComponent($$result2, "DateDisplay", $$DateDisplay, { "pubDate": sampleQuestion.pubDate, "showIcons": false })} </div> </div> </section> </div> ` })}`;
}, "C:/Users/yacin/Documents/qa-mva/src/pages/test-components.astro", void 0);

const $$file = "C:/Users/yacin/Documents/qa-mva/src/pages/test-components.astro";
const $$url = "/test-components";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$TestComponents,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
