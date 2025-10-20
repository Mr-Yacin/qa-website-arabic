import { c as createComponent, b as createAstro, m as maybeRenderHead, d as addAttribute, a as renderTemplate } from './astro/server_CoapMQ39.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                         */

function formatDate(date, locale = "ar-MA") {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}
function relatedByTags(currentQuestion, allQuestions, maxResults = 3) {
  const currentTags = currentQuestion.data.tags;
  const questionsWithScores = allQuestions.filter((q) => q.slug !== currentQuestion.slug).map((question) => {
    const commonTags = question.data.tags.filter(
      (tag) => currentTags.includes(tag)
    );
    return {
      question,
      score: commonTags.length
    };
  }).filter((item) => item.score > 0).sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    return new Date(b.question.data.pubDate).getTime() - new Date(a.question.data.pubDate).getTime();
  });
  return questionsWithScores.slice(0, maxResults).map((item) => item.question);
}

const $$Astro = createAstro();
const $$CardQuestion = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
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
  return renderTemplate`${maybeRenderHead()}<article class="group relative bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-indigo-400 dark:focus-within:ring-offset-zinc-950 will-change-transform" data-astro-cid-dqkhqhod> <a${addAttribute(href, "href")} class="absolute inset-0 z-10 focus-visible:outline-none"${addAttribute(`\u0627\u0642\u0631\u0623 \u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u0643\u0627\u0645\u0644: ${title}`, "aria-label")} data-astro-cid-dqkhqhod> <span class="sr-only" data-astro-cid-dqkhqhod>اقرأ السؤال الكامل: ${title}</span> </a> <div class="flex flex-col h-full" data-astro-cid-dqkhqhod> <!-- Header with difficulty badge --> <div class="flex items-start justify-between mb-3" data-astro-cid-dqkhqhod> <span${addAttribute(`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColors[difficulty]}`, "class")} data-astro-cid-dqkhqhod> ${difficultyLabels[difficulty]} </span> <time${addAttribute(date.toISOString(), "datetime")} class="text-sm text-zinc-500 dark:text-zinc-400 flex-shrink-0 mr-3" data-astro-cid-dqkhqhod> ${formatDate(date)} </time> </div> <!-- Title --> <h3 class="text-lg font-semibold text-zinc-950 dark:text-zinc-50 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2" data-astro-cid-dqkhqhod> ${title} </h3> <!-- Description --> <p class="text-zinc-600 dark:text-zinc-300 text-sm mb-4 flex-grow line-clamp-3" data-astro-cid-dqkhqhod> ${description} </p> <!-- Tags --> ${tags.length > 0 && renderTemplate`<div class="flex flex-wrap gap-2 mt-auto" data-astro-cid-dqkhqhod> ${tags.slice(0, 4).map((tag) => renderTemplate`<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-all duration-200 group-hover:scale-105" data-astro-cid-dqkhqhod>
#${tag} </span>`)} ${tags.length > 4 && renderTemplate`<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-zinc-500 dark:text-zinc-400" data-astro-cid-dqkhqhod>
+${tags.length - 4} </span>`} </div>`} </div> </article> `;
}, "C:/Users/yacin/Documents/qa-mva/src/components/CardQuestion.astro", void 0);

export { $$CardQuestion as $, formatDate as f, relatedByTags as r };
