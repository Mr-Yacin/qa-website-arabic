import { c as createComponent, b as createAstro, d as addAttribute, a as renderTemplate, m as maybeRenderHead, h as renderScript, r as renderComponent, i as renderHead, j as renderSlot } from './astro/server_CoapMQ39.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                           */

const $$Astro$2 = createAstro();
const $$SEO = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$SEO;
  const { title, description, ogImage, canonical, noindex } = Astro2.props;
  const canonicalURL = canonical || new URL(Astro2.url.pathname, Astro2.site);
  const ogImageURL = ogImage || new URL("/favicon.svg", Astro2.site);
  return renderTemplate`<!-- Primary Meta Tags --><title>${title}</title><meta name="title"${addAttribute(title, "content")}><meta name="description"${addAttribute(description, "content")}><meta name="generator"${addAttribute(Astro2.generator, "content")}><!-- Canonical URL --><link rel="canonical"${addAttribute(canonicalURL, "href")}><!-- Open Graph / Facebook --><meta property="og:type" content="website"><meta property="og:url"${addAttribute(canonicalURL, "content")}><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:image"${addAttribute(ogImageURL, "content")}><!-- Twitter --><meta property="twitter:card" content="summary_large_image"><meta property="twitter:url"${addAttribute(canonicalURL, "content")}><meta property="twitter:title"${addAttribute(title, "content")}><meta property="twitter:description"${addAttribute(description, "content")}><meta property="twitter:image"${addAttribute(ogImageURL, "content")}><!-- Robots -->${noindex && renderTemplate`<meta name="robots" content="noindex, nofollow">`}<!-- Viewport --><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta charset="UTF-8"><!-- Favicon --><link rel="icon" type="image/svg+xml" href="/favicon.svg">`;
}, "C:/Users/yacin/Documents/qa-mva/src/components/SEO.astro", void 0);

const $$Astro$1 = createAstro();
const $$Navbar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Navbar;
  const navLinks = [
    { href: "/", label: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629" },
    { href: "/tags", label: "\u0627\u0644\u0648\u0633\u0648\u0645" }
  ];
  const currentPath = Astro2.url.pathname;
  return renderTemplate`${maybeRenderHead()}<header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 dark:bg-zinc-950/80 dark:border-zinc-800"> <nav class="max-w-3xl mx-auto px-3 sm:px-4 md:px-6"> <div class="flex items-center justify-between h-14 sm:h-16"> <!-- Site Title --> <div class="flex-shrink-0 min-w-0"> <a href="/" class="text-base sm:text-lg md:text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-zinc-950 rounded-md px-1 sm:px-2 py-1 hover:scale-105 truncate" title="موقع الأسئلة والأجوبة"> <span class="hidden sm:inline">موقع الأسئلة والأجوبة</span> <span class="sm:hidden">الأسئلة والأجوبة</span> </a> </div> <!-- Navigation Links --> <div class="flex items-center gap-2 sm:gap-4 md:gap-6 space-x-reverse"> ${navLinks.map(({ href, label }) => {
    const isActive = currentPath === href || href === "/tags" && currentPath.startsWith("/tags");
    return renderTemplate`<a${addAttribute(href, "href")}${addAttribute(`text-sm sm:text-base font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-zinc-950 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 hover:scale-105 relative will-change-transform ${isActive ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20" : "text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"}`, "class")}> ${label} ${isActive && renderTemplate`<span class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"></span>`} </a>`;
  })} </div> </div> </nav> </header>`;
}, "C:/Users/yacin/Documents/qa-mva/src/components/Navbar.astro", void 0);

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const footerLinks = [
    { href: "/contact", label: "\u0627\u062A\u0635\u0644 \u0628\u0646\u0627" },
    { href: "/privacy", label: "\u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u062E\u0635\u0648\u0635\u064A\u0629" },
    { href: "/terms", label: "\u0627\u0644\u0634\u0631\u0648\u0637 \u0648\u0627\u0644\u0623\u062D\u0643\u0627\u0645" }
  ];
  return renderTemplate`${maybeRenderHead()}<footer class="mt-12 sm:mt-16 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"> <div class="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8"> <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"> <!-- Copyright --> <div class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 text-center sm:text-right order-2 sm:order-1">
© ${currentYear} موقع الأسئلة والأجوبة. جميع الحقوق محفوظة.
</div> <!-- Essential Links --> <div class="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 order-1 sm:order-2"> ${footerLinks.map(({ href, label }) => renderTemplate`<a${addAttribute(href, "href")} class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-zinc-900 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 will-change-transform"> ${label} </a>`)} </div> </div> </div> </footer>`;
}, "C:/Users/yacin/Documents/qa-mva/src/components/Footer.astro", void 0);

const $$BackToTop = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<button id="back-to-top" type="button" class="fixed bottom-6 left-6 z-50 p-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 opacity-0 translate-y-4 pointer-events-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 will-change-transform will-change-opacity" aria-label="العودة إلى أعلى الصفحة" title="العودة إلى أعلى الصفحة"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path> </svg> </button> ${renderScript($$result, "C:/Users/yacin/Documents/qa-mva/src/components/BackToTop.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/yacin/Documents/qa-mva/src/components/BackToTop.astro", void 0);

const $$Astro = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title = "\u0645\u0648\u0642\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0623\u062C\u0648\u0628\u0629",
    description = "\u0645\u0648\u0642\u0639 \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0623\u062C\u0648\u0628\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629\u060C \u064A\u0642\u062F\u0645 \u0625\u062C\u0627\u0628\u0627\u062A \u0634\u0627\u0645\u0644\u0629 \u0648\u0645\u0641\u064A\u062F\u0629 \u0644\u0644\u0645\u0637\u0648\u0631\u064A\u0646 \u0648\u0627\u0644\u0645\u0647\u062A\u0645\u064A\u0646 \u0628\u0627\u0644\u062A\u0642\u0646\u064A\u0629.",
    ogImage,
    canonical,
    noindex = false
  } = Astro2.props;
  return renderTemplate`<html lang="ar" dir="rtl"> <head>${renderComponent($$result, "SEO", $$SEO, { "title": title, "description": description, "ogImage": ogImage, "canonical": canonical, "noindex": noindex })}${renderHead()}</head> <body class="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"> <!-- Skip to main content for screen readers --> <a href="#main-content" class="skip-to-main">تخطي إلى المحتوى الرئيسي</a> <div class="flex flex-col min-h-screen"> ${renderComponent($$result, "Navbar", $$Navbar, {})} <main id="main-content" class="flex-1" tabindex="-1"> <div class="max-w-3xl mx-auto px-4 md:px-6 py-8"> ${renderSlot($$result, $$slots["default"])} </div> </main> ${renderComponent($$result, "Footer", $$Footer, {})} </div> <!-- Back to Top Button --> ${renderComponent($$result, "BackToTop", $$BackToTop, {})} <!-- Image Loading Optimization Script --> ${renderScript($$result, "C:/Users/yacin/Documents/qa-mva/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "C:/Users/yacin/Documents/qa-mva/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
