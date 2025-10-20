/* empty css                                      */
import { c as createComponent, b as createAstro, m as maybeRenderHead, d as addAttribute, a as renderTemplate, r as renderComponent, F as Fragment, u as unescapeHTML } from '../../chunks/astro/server_CoapMQ39.mjs';
import 'kleur/colors';
import { g as getCollection } from '../../chunks/_astro_content_CuzDBXnp.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_BHsBBQfC.mjs';
import 'clsx';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { r as relatedByTags, $ as $$CardQuestion, f as formatDate } from '../../chunks/CardQuestion_CP39XPBB.mjs';
/* empty css                                     */
export { renderers } from '../../renderers.mjs';

const $$Astro$2 = createAstro();
const $$Breadcrumbs = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Breadcrumbs;
  const { items, class: className = "" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<nav aria-label="مسار التنقل"${addAttribute(`flex ${className}`, "class")}> <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse"> ${items.map((item, index) => renderTemplate`<li class="inline-flex items-center"> ${index > 0 && renderTemplate`<svg class="rtl:rotate-180 w-3 h-3 text-zinc-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"> <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"></path> </svg>`} ${item.href ? renderTemplate`<a${addAttribute(item.href, "href")} class="inline-flex items-center text-sm font-medium text-zinc-700 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"> ${index === 0 && renderTemplate`<svg class="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"> <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"></path> </svg>`} ${item.label} </a>` : renderTemplate`<span class="ms-1 text-sm font-medium text-zinc-500 md:ms-2 dark:text-zinc-400" aria-current="page"> ${item.label} </span>`} </li>`)} </ol> </nav>`;
}, "C:/Users/yacin/Documents/qa-mva/src/components/Breadcrumbs.astro", void 0);

function StarRating({ slug }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRating = localStorage.getItem(`rating:${slug}`);
      if (savedRating) {
        const parsedRating = parseInt(savedRating, 10);
        if (parsedRating >= 1 && parsedRating <= 5) {
          setRating(parsedRating);
          setHasRated(true);
        }
      }
    }
  }, [slug]);
  const handleRatingSubmit = async (newRating) => {
    if (isSubmitting || hasRated) return;
    setIsSubmitting(true);
    try {
      localStorage.setItem(`rating:${slug}`, newRating.toString());
      setRating(newRating);
      setHasRated(true);
      const response = await fetch(`/api/rate?slug=${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ rating: newRating })
      });
      if (!response.ok) {
        console.warn("Failed to submit rating to server, but saved locally");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleKeyDown = (event, starValue) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleRatingSubmit(starValue);
    }
  };
  const renderStar = (starValue) => {
    const isFilled = starValue <= (hoveredRating || rating);
    const isDisabled = hasRated || isSubmitting;
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: `
          text-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-indigo-400 dark:focus:ring-offset-zinc-900 rounded will-change-transform
          ${isDisabled ? "cursor-default" : "cursor-pointer hover:scale-110 transform"}
          ${isFilled ? "text-yellow-400 dark:text-yellow-300" : "text-zinc-300 dark:text-zinc-600"}
        `,
        onClick: () => !isDisabled && handleRatingSubmit(starValue),
        onMouseEnter: () => !isDisabled && setHoveredRating(starValue),
        onMouseLeave: () => !isDisabled && setHoveredRating(0),
        onKeyDown: (e) => handleKeyDown(e, starValue),
        disabled: isDisabled,
        "aria-label": `قيم بـ ${starValue} ${starValue === 1 ? "نجمة" : "نجوم"}`,
        "aria-pressed": starValue <= rating,
        children: "★"
      },
      starValue
    );
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 transition-colors duration-200", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-zinc-900 dark:text-zinc-100 transition-colors duration-200", children: "قيم هذا السؤال" }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "flex gap-1",
        role: "radiogroup",
        "aria-label": "تقييم السؤال من 1 إلى 5 نجوم",
        children: [1, 2, 3, 4, 5].map(renderStar)
      }
    ),
    hasRated && /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-600 dark:text-zinc-400 text-center transition-colors duration-200", children: [
      "شكراً لك! تم حفظ تقييمك (",
      rating,
      " ",
      rating === 1 ? "نجمة" : "نجوم",
      ")"
    ] }),
    isSubmitting && /* @__PURE__ */ jsx("p", { className: "text-sm text-indigo-600 dark:text-indigo-400 text-center transition-colors duration-200", children: "جاري الحفظ..." }),
    !hasRated && !isSubmitting && /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500 dark:text-zinc-500 text-center transition-colors duration-200", children: "اضغط على النجوم لإعطاء تقييم" })
  ] });
}

function generatePlaceholderUrl(options = {}) {
  const { width = 800, height = 450, text = "صورة", type = "question" } = options;
  return "/images/placeholder-question.svg";
}
function getPlaceholderColors(text) {
  const colorPairs = [
    { primary: "#6366f1", secondary: "#8b5cf6", gradient: "from-indigo-500 to-purple-500" },
    { primary: "#3b82f6", secondary: "#6366f1", gradient: "from-blue-500 to-indigo-500" },
    { primary: "#8b5cf6", secondary: "#ec4899", gradient: "from-purple-500 to-pink-500" },
    { primary: "#10b981", secondary: "#3b82f6", gradient: "from-emerald-500 to-blue-500" },
    { primary: "#f59e0b", secondary: "#ef4444", gradient: "from-amber-500 to-red-500" },
    { primary: "#ec4899", secondary: "#ef4444", gradient: "from-pink-500 to-red-500" },
    { primary: "#14b8a6", secondary: "#06b6d4", gradient: "from-teal-500 to-cyan-500" },
    { primary: "#f97316", secondary: "#ef4444", gradient: "from-orange-500 to-red-500" }
  ];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i) & 4294967295;
  }
  const colorIndex = Math.abs(hash) % colorPairs.length;
  return colorPairs[colorIndex];
}
function getFirstChar(text) {
  const arabicMatch = text.match(/[\u0600-\u06FF]/);
  if (arabicMatch) return arabicMatch[0];
  const englishMatch = text.match(/[A-Za-z]/);
  if (englishMatch) return englishMatch[0].toUpperCase();
  return "؟";
}
function formatTextForPlaceholder(text, maxLength = 120) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + "...";
  }
  return truncated + "...";
}
function getResponsiveFontSize(textLength) {
  if (textLength <= 30) return "text-xl md:text-2xl";
  if (textLength <= 60) return "text-lg md:text-xl";
  if (textLength <= 90) return "text-base md:text-lg";
  return "text-sm md:text-base";
}

const $$Astro$1 = createAstro();
const $$ImageWithFallback = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$ImageWithFallback;
  const {
    src,
    alt,
    class: className = "",
    width = 800,
    height = 450,
    loading = "lazy",
    decoding = "async",
    showPlaceholder = true,
    placeholderType = "generated",
    questionText,
    showQuestionText = true
  } = Astro2.props;
  const firstChar = getFirstChar(alt);
  const colors = getPlaceholderColors(alt);
  const defaultPlaceholder = generatePlaceholderUrl({ width, height, text: alt, type: "question" });
  const displayText = questionText ? formatTextForPlaceholder(questionText, 100) : formatTextForPlaceholder(alt, 100);
  const shouldShowText = showQuestionText && (questionText || alt);
  const textFontSize = getResponsiveFontSize(displayText.length);
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`relative aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 ${className}`, "class")} data-astro-cid-6pkksaab> ${src ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-6pkksaab": true }, { "default": ($$result2) => renderTemplate`  <img${addAttribute(src, "src")}${addAttribute(alt, "alt")} class="w-full h-full object-cover transition-opacity duration-300 image-main"${addAttribute(width, "width")}${addAttribute(height, "height")}${addAttribute(loading, "loading")}${addAttribute(decoding, "decoding")} style="opacity: 0;" onload="this.style.opacity='1'; this.nextElementSibling?.style && (this.nextElementSibling.style.display='none');" onerror="this.style.display='none'; this.nextElementSibling?.style && (this.nextElementSibling.style.display='flex');" data-astro-cid-6pkksaab>  ${showPlaceholder && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-6pkksaab": true }, { "default": ($$result3) => renderTemplate`${placeholderType === "default" ? renderTemplate`<div class="absolute inset-0 image-fallback" data-astro-cid-6pkksaab> <img${addAttribute(defaultPlaceholder, "src")} alt="صورة افتراضية" class="w-full h-full object-cover"${addAttribute(width, "width")}${addAttribute(height, "height")} data-astro-cid-6pkksaab> </div>` : placeholderType === "generated" ? renderTemplate`<div${addAttribute(`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${colors.gradient} image-fallback p-8`, "class")} data-astro-cid-6pkksaab> <div class="text-center text-white max-w-full" data-astro-cid-6pkksaab> ${shouldShowText ? renderTemplate`${renderComponent($$result3, "Fragment", Fragment, { "data-astro-cid-6pkksaab": true }, { "default": ($$result4) => renderTemplate`  <div class="mb-6" data-astro-cid-6pkksaab> <div class="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm" data-astro-cid-6pkksaab> <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24" data-astro-cid-6pkksaab> <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" data-astro-cid-6pkksaab></path> </svg> </div> </div>  <div class="bg-black/20 backdrop-blur-sm rounded-lg p-4 mb-4 mx-4" data-astro-cid-6pkksaab> <div${addAttribute(`${textFontSize} font-semibold leading-relaxed text-center`, "class")} data-astro-cid-6pkksaab> ${displayText} </div> </div>  <div class="text-sm opacity-75 px-4" data-astro-cid-6pkksaab>
صورة توضيحية للسؤال
</div> ` })}` : renderTemplate`${renderComponent($$result3, "Fragment", Fragment, { "data-astro-cid-6pkksaab": true }, { "default": ($$result4) => renderTemplate`  <div class="text-6xl font-bold mb-2 opacity-90" data-astro-cid-6pkksaab> ${firstChar} </div> <div class="text-sm opacity-75 px-4" data-astro-cid-6pkksaab>
صورة توضيحية
</div> ` })}`} </div> </div>` : null}` })}`}` })}` : showPlaceholder ? renderTemplate`<!-- Only Placeholder (no src provided) -->
    ${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-6pkksaab": true }, { "default": ($$result2) => renderTemplate`${placeholderType === "default" ? renderTemplate`<img${addAttribute(defaultPlaceholder, "src")} alt="صورة افتراضية" class="w-full h-full object-cover"${addAttribute(width, "width")}${addAttribute(height, "height")}${addAttribute(loading, "loading")} data-astro-cid-6pkksaab>` : placeholderType === "generated" ? renderTemplate`<div${addAttribute(`flex items-center justify-center bg-gradient-to-br ${colors.gradient} h-full p-8`, "class")} data-astro-cid-6pkksaab> <div class="text-center text-white max-w-full" data-astro-cid-6pkksaab> ${shouldShowText ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-6pkksaab": true }, { "default": ($$result3) => renderTemplate`  <div class="mb-6" data-astro-cid-6pkksaab> <div class="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm" data-astro-cid-6pkksaab> <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24" data-astro-cid-6pkksaab> <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" data-astro-cid-6pkksaab></path> </svg> </div> </div>  <div class="bg-black/20 backdrop-blur-sm rounded-lg p-4 mb-4 mx-4" data-astro-cid-6pkksaab> <div${addAttribute(`${textFontSize} font-semibold leading-relaxed text-center`, "class")} data-astro-cid-6pkksaab> ${displayText} </div> </div>  <div class="text-sm opacity-75 px-4" data-astro-cid-6pkksaab>
صورة توضيحية للسؤال
</div> ` })}` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-6pkksaab": true }, { "default": ($$result3) => renderTemplate`  <div class="text-6xl font-bold mb-2 opacity-90" data-astro-cid-6pkksaab> ${firstChar} </div> <div class="text-sm opacity-75 px-4" data-astro-cid-6pkksaab>
صورة توضيحية
</div> ` })}`} </div> </div>` : null}` })}` : null} </div> `;
}, "C:/Users/yacin/Documents/qa-mva/src/components/ImageWithFallback.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const qaEntries = await getCollection("qa");
  const entry = qaEntries.find((entry2) => entry2.slug === slug);
  if (!entry) {
    return new Response(null, {
      status: 404,
      statusText: "Not found"
    });
  }
  const { Content } = await entry.render();
  const { question, shortAnswer, pubDate, updatedDate, tags, difficulty, heroImage } = entry.data;
  const allQuestions = await getCollection("qa");
  const relatedQuestions = relatedByTags(entry, allQuestions, 3);
  const breadcrumbItems = [
    { label: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629", href: "/" },
    { label: question }
  ];
  const difficultyLabels = {
    easy: "\u0633\u0647\u0644",
    medium: "\u0645\u062A\u0648\u0633\u0637",
    hard: "\u0635\u0639\u0628"
  };
  const difficultyColors = {
    easy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  };
  const pageTitle = `${question} - \u0645\u0648\u0642\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0623\u062C\u0648\u0628\u0629`;
  const pageDescription = shortAnswer;
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": {
      "@type": "Question",
      "name": question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": shortAnswer
      }
    }
  };
  const blogPostingStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": question,
    "description": shortAnswer,
    "datePublished": pubDate.toISOString(),
    "dateModified": updatedDate ? updatedDate.toISOString() : pubDate.toISOString(),
    "author": {
      "@type": "Organization",
      "name": "\u0645\u0648\u0642\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0623\u062C\u0648\u0628\u0629"
    },
    "publisher": {
      "@type": "Organization",
      "name": "\u0645\u0648\u0642\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0623\u062C\u0648\u0628\u0629"
    },
    "keywords": tags.join(", "),
    "articleSection": "\u0623\u0633\u0626\u0644\u0629 \u0648\u0623\u062C\u0648\u0628\u0629"
  };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": pageTitle, "description": pageDescription, "ogImage": heroImage }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template(['  <script type="application/ld+json">', '<\/script> <script type="application/ld+json">', "<\/script>  ", " ", '<article class="space-y-8"> <!-- Question Header --> <header class="space-y-4"> <h1 class="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight"> ', ' </h1> <!-- Metadata --> <div class="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400"> <div class="flex items-center gap-2"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg> <time', ">\n\u0646\u064F\u0634\u0631 \u0641\u064A ", " </time> </div> ", " <span", "> ", " </span> </div> <!-- Tags --> ", " </header> <!-- Hero Image with Fallback --> ", ' <!-- Short Answer Highlight --> <div class="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6"> <h2 class="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-3 flex items-center gap-2"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path> </svg>\n\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0645\u062E\u062A\u0635\u0631\u0629\n</h2> <p class="text-indigo-800 dark:text-indigo-200 text-lg leading-relaxed"> ', ' </p> </div> <!-- Star Rating Component --> <div class="flex justify-center"> ', ' </div> <!-- Detailed Content --> <div class="prose prose-lg prose-zinc dark:prose-invert max-w-none prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100"> ', " </div> <!-- Related Questions --> ", " </article> "])), unescapeHTML(JSON.stringify(faqStructuredData)), unescapeHTML(JSON.stringify(blogPostingStructuredData)), renderComponent($$result2, "Breadcrumbs", $$Breadcrumbs, { "items": breadcrumbItems, "class": "mb-6" }), maybeRenderHead(), question, addAttribute(pubDate.toISOString(), "datetime"), formatDate(pubDate), updatedDate && renderTemplate`<div class="flex items-center gap-2"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path> </svg> <time${addAttribute(updatedDate.toISOString(), "datetime")}>
آخر تحديث ${formatDate(updatedDate)} </time> </div>`, addAttribute(`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColors[difficulty]}`, "class"), difficultyLabels[difficulty], tags.length > 0 && renderTemplate`<div class="flex flex-wrap gap-2"> ${tags.map((tag) => renderTemplate`<a${addAttribute(`/tags/${tag}`, "href")} class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-zinc-950 hover:scale-105"${addAttribute(`\u0639\u0631\u0636 \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0645\u062A\u0639\u0644\u0642\u0629 \u0628\u0648\u0633\u0645 ${tag}`, "aria-label")}>
#${tag} </a>`)} </div>`, renderComponent($$result2, "ImageWithFallback", $$ImageWithFallback, { "src": heroImage, "alt": `\u0635\u0648\u0631\u0629 \u062A\u0648\u0636\u064A\u062D\u064A\u0629 \u0644\u0644\u0633\u0624\u0627\u0644: ${question}`, "questionText": question, "width": 800, "height": 450, "loading": "lazy", "decoding": "async", "showPlaceholder": true, "placeholderType": "generated", "showQuestionText": true }), shortAnswer, renderComponent($$result2, "StarRating", StarRating, { "slug": entry.slug, "client:visible": true, "client:component-hydration": "visible", "client:component-path": "C:/Users/yacin/Documents/qa-mva/src/components/StarRating.jsx", "client:component-export": "default" }), renderComponent($$result2, "Content", Content, {}), relatedQuestions.length > 0 && renderTemplate`<section class="border-t border-zinc-200 dark:border-zinc-800 pt-8"> <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path> </svg>
أسئلة ذات صلة
</h2> <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"> ${relatedQuestions.map((relatedQuestion) => renderTemplate`${renderComponent($$result2, "CardQuestion", $$CardQuestion, { "href": `/q/${relatedQuestion.slug}`, "title": relatedQuestion.data.question, "description": relatedQuestion.data.shortAnswer, "date": relatedQuestion.data.pubDate, "tags": relatedQuestion.data.tags, "difficulty": relatedQuestion.data.difficulty })}`)} </div> </section>`) })}`;
}, "C:/Users/yacin/Documents/qa-mva/src/pages/q/[slug].astro", void 0);

const $$file = "C:/Users/yacin/Documents/qa-mva/src/pages/q/[slug].astro";
const $$url = "/q/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
