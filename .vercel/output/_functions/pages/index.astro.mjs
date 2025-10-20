/* empty css                                 */
import { e as createComponent, f as createAstro, h as addAttribute, r as renderTemplate, m as maybeRenderHead, k as renderComponent, l as renderHead, n as renderSlot } from '../chunks/astro/server_DC5jLdQH.mjs';
import 'kleur/colors';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Astro$1 = createAstro();
const $$SEO = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$SEO;
  const { title, description, ogImage, canonical, noindex } = Astro2.props;
  const canonicalURL = canonical || new URL(Astro2.url.pathname, Astro2.site);
  const ogImageURL = ogImage || new URL("/favicon.svg", Astro2.site);
  return renderTemplate`<!-- Primary Meta Tags --><title>${title}</title><meta name="title"${addAttribute(title, "content")}><meta name="description"${addAttribute(description, "content")}><meta name="generator"${addAttribute(Astro2.generator, "content")}><!-- Canonical URL --><link rel="canonical"${addAttribute(canonicalURL, "href")}><!-- Open Graph / Facebook --><meta property="og:type" content="website"><meta property="og:url"${addAttribute(canonicalURL, "content")}><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:image"${addAttribute(ogImageURL, "content")}><!-- Twitter --><meta property="twitter:card" content="summary_large_image"><meta property="twitter:url"${addAttribute(canonicalURL, "content")}><meta property="twitter:title"${addAttribute(title, "content")}><meta property="twitter:description"${addAttribute(description, "content")}><meta property="twitter:image"${addAttribute(ogImageURL, "content")}><!-- Robots -->${noindex && renderTemplate`<meta name="robots" content="noindex, nofollow">`}<!-- Viewport --><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta charset="UTF-8"><!-- Favicon --><link rel="icon" type="image/svg+xml" href="/favicon.svg">`;
}, "C:/Users/yacin/Documents/qa-mva/src/components/SEO.astro", void 0);

const $$Navbar = createComponent(($$result, $$props, $$slots) => {
  const navLinks = [
    { href: "/", label: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629" },
    { href: "/tags", label: "\u0627\u0644\u0648\u0633\u0648\u0645" }
  ];
  return renderTemplate`${maybeRenderHead()}<header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 dark:bg-zinc-950/80 dark:border-zinc-800"> <nav class="max-w-3xl mx-auto px-4 md:px-6"> <div class="flex items-center justify-between h-16"> <!-- Site Title --> <div class="flex-shrink-0"> <a href="/" class="text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
موقع الأسئلة والأجوبة
</a> </div> <!-- Navigation Links --> <div class="flex items-center space-x-6 space-x-reverse"> ${navLinks.map(({ href, label }) => renderTemplate`<a${addAttribute(href, "href")} class="text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 rounded-sm px-2 py-1"> ${label} </a>`)} </div> </div> </nav> </header>`;
}, "C:/Users/yacin/Documents/qa-mva/src/components/Navbar.astro", void 0);

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const footerLinks = [
    { href: "/rss.xml", label: "RSS" },
    { href: "/tags", label: "\u0627\u0644\u0648\u0633\u0648\u0645" }
  ];
  return renderTemplate`${maybeRenderHead()}<footer class="mt-16 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"> <div class="max-w-3xl mx-auto px-4 md:px-6 py-8"> <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"> <!-- Copyright --> <div class="text-sm text-zinc-600 dark:text-zinc-400">
© ${currentYear} موقع الأسئلة والأجوبة. جميع الحقوق محفوظة.
</div> <!-- Essential Links --> <div class="flex items-center space-x-6 space-x-reverse"> ${footerLinks.map(({ href, label }) => renderTemplate`<a${addAttribute(href, "href")} class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 rounded-sm px-2 py-1"> ${label} </a>`)} </div> </div> </div> </footer>`;
}, "C:/Users/yacin/Documents/qa-mva/src/components/Footer.astro", void 0);

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
  return renderTemplate`<html lang="ar" dir="rtl"> <head>${renderComponent($$result, "SEO", $$SEO, { "title": title, "description": description, "ogImage": ogImage, "canonical": canonical, "noindex": noindex })}${renderHead()}</head> <body class="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"> <div class="flex flex-col min-h-screen"> ${renderComponent($$result, "Navbar", $$Navbar, {})} <main class="flex-1"> <div class="max-w-3xl mx-auto px-4 md:px-6 py-8"> ${renderSlot($$result, $$slots["default"])} </div> </main> ${renderComponent($$result, "Footer", $$Footer, {})} </div> </body></html>`;
}, "C:/Users/yacin/Documents/qa-mva/src/layouts/BaseLayout.astro", void 0);

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
