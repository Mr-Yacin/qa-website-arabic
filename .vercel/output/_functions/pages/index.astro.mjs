/* empty css                                 */
import { A as AstroError, U as UnknownContentCollectionError, c as createComponent, R as RenderUndefinedEntryError, u as unescapeHTML, r as renderTemplate, a as renderUniqueStylesheet, b as renderScriptElement, d as createHeadAndContent, e as renderComponent, f as createAstro, g as addAttribute, m as maybeRenderHead, h as renderHead, i as renderSlot } from '../chunks/astro/server_BXK1D7lC.mjs';
import 'kleur/colors';
import { escape } from 'html-escaper';
import { Traverse } from 'neotraverse/modern';
import pLimit from 'p-limit';
import { z } from 'zod';
import { r as removeBase, i as isRemotePath, p as prependForwardSlash } from '../chunks/path_tbLlI_c1.mjs';
import { V as VALID_INPUT_FORMATS } from '../chunks/consts_BmVDRGlB.mjs';
import * as devalue from 'devalue';
import 'clsx';
export { renderers } from '../renderers.mjs';

const CONTENT_IMAGE_FLAG = "astroContentImageFlag";
const IMAGE_IMPORT_PREFIX = "__ASTRO_IMAGE_";

function imageSrcToImportId(imageSrc, filePath) {
  imageSrc = removeBase(imageSrc, IMAGE_IMPORT_PREFIX);
  if (isRemotePath(imageSrc)) {
    return;
  }
  const ext = imageSrc.split(".").at(-1)?.toLowerCase();
  if (!ext || !VALID_INPUT_FORMATS.includes(ext)) {
    return;
  }
  const params = new URLSearchParams(CONTENT_IMAGE_FLAG);
  if (filePath) {
    params.set("importer", filePath);
  }
  return `${imageSrc}?${params.toString()}`;
}

class ImmutableDataStore {
  _collections = /* @__PURE__ */ new Map();
  constructor() {
    this._collections = /* @__PURE__ */ new Map();
  }
  get(collectionName, key) {
    return this._collections.get(collectionName)?.get(String(key));
  }
  entries(collectionName) {
    const collection = this._collections.get(collectionName) ?? /* @__PURE__ */ new Map();
    return [...collection.entries()];
  }
  values(collectionName) {
    const collection = this._collections.get(collectionName) ?? /* @__PURE__ */ new Map();
    return [...collection.values()];
  }
  keys(collectionName) {
    const collection = this._collections.get(collectionName) ?? /* @__PURE__ */ new Map();
    return [...collection.keys()];
  }
  has(collectionName, key) {
    const collection = this._collections.get(collectionName);
    if (collection) {
      return collection.has(String(key));
    }
    return false;
  }
  hasCollection(collectionName) {
    return this._collections.has(collectionName);
  }
  collections() {
    return this._collections;
  }
  /**
   * Attempts to load a DataStore from the virtual module.
   * This only works in Vite.
   */
  static async fromModule() {
    try {
      const data = await import('../chunks/_astro_data-layer-content_pngTJw5o.mjs');
      if (data.default instanceof Map) {
        return ImmutableDataStore.fromMap(data.default);
      }
      const map = devalue.unflatten(data.default);
      return ImmutableDataStore.fromMap(map);
    } catch {
    }
    return new ImmutableDataStore();
  }
  static async fromMap(data) {
    const store = new ImmutableDataStore();
    store._collections = data;
    return store;
  }
}
function dataStoreSingleton() {
  let instance = void 0;
  return {
    get: async () => {
      if (!instance) {
        instance = ImmutableDataStore.fromModule();
      }
      return instance;
    },
    set: (store) => {
      instance = store;
    }
  };
}
const globalDataStore = dataStoreSingleton();

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": "https://example.com", "SSR": true};
function createCollectionToGlobResultMap({
  globResult,
  contentDir
}) {
  const collectionToGlobResultMap = {};
  for (const key in globResult) {
    const keyRelativeToContentDir = key.replace(new RegExp(`^${contentDir}`), "");
    const segments = keyRelativeToContentDir.split("/");
    if (segments.length <= 1) continue;
    const collection = segments[0];
    collectionToGlobResultMap[collection] ??= {};
    collectionToGlobResultMap[collection][key] = globResult[key];
  }
  return collectionToGlobResultMap;
}
z.object({
  tags: z.array(z.string()).optional(),
  lastModified: z.date().optional()
});
function createGetCollection({
  contentCollectionToEntryMap,
  dataCollectionToEntryMap,
  getRenderEntryImport,
  cacheEntriesByCollection,
  liveCollections
}) {
  return async function getCollection(collection, filter) {
    if (collection in liveCollections) {
      throw new AstroError({
        ...UnknownContentCollectionError,
        message: `Collection "${collection}" is a live collection. Use getLiveCollection() instead of getCollection().`
      });
    }
    const hasFilter = typeof filter === "function";
    const store = await globalDataStore.get();
    let type;
    if (collection in contentCollectionToEntryMap) {
      type = "content";
    } else if (collection in dataCollectionToEntryMap) {
      type = "data";
    } else if (store.hasCollection(collection)) {
      const { default: imageAssetMap } = await import('../chunks/content-assets_DleWbedO.mjs');
      const result = [];
      for (const rawEntry of store.values(collection)) {
        const data = updateImageReferencesInData(rawEntry.data, rawEntry.filePath, imageAssetMap);
        let entry = {
          ...rawEntry,
          data,
          collection
        };
        if (entry.legacyId) {
          entry = emulateLegacyEntry(entry);
        }
        if (hasFilter && !filter(entry)) {
          continue;
        }
        result.push(entry);
      }
      return result;
    } else {
      console.warn(
        `The collection ${JSON.stringify(
          collection
        )} does not exist or is empty. Please check your content config file for errors.`
      );
      return [];
    }
    const lazyImports = Object.values(
      type === "content" ? contentCollectionToEntryMap[collection] : dataCollectionToEntryMap[collection]
    );
    let entries = [];
    if (!Object.assign(__vite_import_meta_env__, { Path: process.env.Path })?.DEV && cacheEntriesByCollection.has(collection)) {
      entries = cacheEntriesByCollection.get(collection);
    } else {
      const limit = pLimit(10);
      entries = await Promise.all(
        lazyImports.map(
          (lazyImport) => limit(async () => {
            const entry = await lazyImport();
            return type === "content" ? {
              id: entry.id,
              slug: entry.slug,
              body: entry.body,
              collection: entry.collection,
              data: entry.data,
              async render() {
                return render({
                  collection: entry.collection,
                  id: entry.id,
                  renderEntryImport: await getRenderEntryImport(collection, entry.slug)
                });
              }
            } : {
              id: entry.id,
              collection: entry.collection,
              data: entry.data
            };
          })
        )
      );
      cacheEntriesByCollection.set(collection, entries);
    }
    if (hasFilter) {
      return entries.filter(filter);
    } else {
      return entries.slice();
    }
  };
}
function emulateLegacyEntry({ legacyId, ...entry }) {
  const legacyEntry = {
    ...entry,
    id: legacyId,
    slug: entry.id
  };
  return {
    ...legacyEntry,
    // Define separately so the render function isn't included in the object passed to `renderEntry()`
    render: () => renderEntry(legacyEntry)
  };
}
const CONTENT_LAYER_IMAGE_REGEX = /__ASTRO_IMAGE_="([^"]+)"/g;
async function updateImageReferencesInBody(html, fileName) {
  const { default: imageAssetMap } = await import('../chunks/content-assets_DleWbedO.mjs');
  const imageObjects = /* @__PURE__ */ new Map();
  const { getImage } = await import('../chunks/_astro_assets_CrmdbZln.mjs').then(n => n._);
  for (const [_full, imagePath] of html.matchAll(CONTENT_LAYER_IMAGE_REGEX)) {
    try {
      const decodedImagePath = JSON.parse(imagePath.replaceAll("&#x22;", '"'));
      let image;
      if (URL.canParse(decodedImagePath.src)) {
        image = await getImage(decodedImagePath);
      } else {
        const id = imageSrcToImportId(decodedImagePath.src, fileName);
        const imported = imageAssetMap.get(id);
        if (!id || imageObjects.has(id) || !imported) {
          continue;
        }
        image = await getImage({ ...decodedImagePath, src: imported });
      }
      imageObjects.set(imagePath, image);
    } catch {
      throw new Error(`Failed to parse image reference: ${imagePath}`);
    }
  }
  return html.replaceAll(CONTENT_LAYER_IMAGE_REGEX, (full, imagePath) => {
    const image = imageObjects.get(imagePath);
    if (!image) {
      return full;
    }
    const { index, ...attributes } = image.attributes;
    return Object.entries({
      ...attributes,
      src: image.src,
      srcset: image.srcSet.attribute,
      // This attribute is used by the toolbar audit
      ...Object.assign(__vite_import_meta_env__, { Path: process.env.Path }).DEV ? { "data-image-component": "true" } : {}
    }).map(([key, value]) => value ? `${key}="${escape(value)}"` : "").join(" ");
  });
}
function updateImageReferencesInData(data, fileName, imageAssetMap) {
  return new Traverse(data).map(function(ctx, val) {
    if (typeof val === "string" && val.startsWith(IMAGE_IMPORT_PREFIX)) {
      const src = val.replace(IMAGE_IMPORT_PREFIX, "");
      const id = imageSrcToImportId(src, fileName);
      if (!id) {
        ctx.update(src);
        return;
      }
      const imported = imageAssetMap?.get(id);
      if (imported) {
        ctx.update(imported);
      } else {
        ctx.update(src);
      }
    }
  });
}
async function renderEntry(entry) {
  if (!entry) {
    throw new AstroError(RenderUndefinedEntryError);
  }
  if ("render" in entry && !("legacyId" in entry)) {
    return entry.render();
  }
  if (entry.deferredRender) {
    try {
      const { default: contentModules } = await import('../chunks/content-modules_Dz-S_Wwv.mjs');
      const renderEntryImport = contentModules.get(entry.filePath);
      return render({
        collection: "",
        id: entry.id,
        renderEntryImport
      });
    } catch (e) {
      console.error(e);
    }
  }
  const html = entry?.rendered?.metadata?.imagePaths?.length && entry.filePath ? await updateImageReferencesInBody(entry.rendered.html, entry.filePath) : entry?.rendered?.html;
  const Content = createComponent(() => renderTemplate`${unescapeHTML(html)}`);
  return {
    Content,
    headings: entry?.rendered?.metadata?.headings ?? [],
    remarkPluginFrontmatter: entry?.rendered?.metadata?.frontmatter ?? {}
  };
}
async function render({
  collection,
  id,
  renderEntryImport
}) {
  const UnexpectedRenderError = new AstroError({
    ...UnknownContentCollectionError,
    message: `Unexpected error while rendering ${String(collection)} → ${String(id)}.`
  });
  if (typeof renderEntryImport !== "function") throw UnexpectedRenderError;
  const baseMod = await renderEntryImport();
  if (baseMod == null || typeof baseMod !== "object") throw UnexpectedRenderError;
  const { default: defaultMod } = baseMod;
  if (isPropagatedAssetsModule(defaultMod)) {
    const { collectedStyles, collectedLinks, collectedScripts, getMod } = defaultMod;
    if (typeof getMod !== "function") throw UnexpectedRenderError;
    const propagationMod = await getMod();
    if (propagationMod == null || typeof propagationMod !== "object") throw UnexpectedRenderError;
    const Content = createComponent({
      factory(result, baseProps, slots) {
        let styles = "", links = "", scripts = "";
        if (Array.isArray(collectedStyles)) {
          styles = collectedStyles.map((style) => {
            return renderUniqueStylesheet(result, {
              type: "inline",
              content: style
            });
          }).join("");
        }
        if (Array.isArray(collectedLinks)) {
          links = collectedLinks.map((link) => {
            return renderUniqueStylesheet(result, {
              type: "external",
              src: prependForwardSlash(link)
            });
          }).join("");
        }
        if (Array.isArray(collectedScripts)) {
          scripts = collectedScripts.map((script) => renderScriptElement(script)).join("");
        }
        let props = baseProps;
        if (id.endsWith("mdx")) {
          props = {
            components: propagationMod.components ?? {},
            ...baseProps
          };
        }
        return createHeadAndContent(
          unescapeHTML(styles + links + scripts),
          renderTemplate`${renderComponent(
            result,
            "Content",
            propagationMod.Content,
            props,
            slots
          )}`
        );
      },
      propagation: "self"
    });
    return {
      Content,
      headings: propagationMod.getHeadings?.() ?? [],
      remarkPluginFrontmatter: propagationMod.frontmatter ?? {}
    };
  } else if (baseMod.Content && typeof baseMod.Content === "function") {
    return {
      Content: baseMod.Content,
      headings: baseMod.getHeadings?.() ?? [],
      remarkPluginFrontmatter: baseMod.frontmatter ?? {}
    };
  } else {
    throw UnexpectedRenderError;
  }
}
function isPropagatedAssetsModule(module) {
  return typeof module === "object" && module != null && "__astroPropagation" in module;
}

// astro-head-inject

const liveCollections = {};

const contentDir = '/src/content/';

const contentEntryGlob = "";
const contentCollectionToEntryMap = createCollectionToGlobResultMap({
	globResult: contentEntryGlob,
	contentDir,
});

const dataEntryGlob = "";
const dataCollectionToEntryMap = createCollectionToGlobResultMap({
	globResult: dataEntryGlob,
	contentDir,
});
createCollectionToGlobResultMap({
	globResult: { ...contentEntryGlob, ...dataEntryGlob },
	contentDir,
});

let lookupMap = {};
lookupMap = {};

new Set(Object.keys(lookupMap));

function createGlobLookup(glob) {
	return async (collection, lookupId) => {
		const filePath = lookupMap[collection]?.entries[lookupId];

		if (!filePath) return undefined;
		return glob[collection][filePath];
	};
}

const renderEntryGlob = "";
const collectionToRenderEntryMap = createCollectionToGlobResultMap({
	globResult: renderEntryGlob,
	contentDir,
});

const cacheEntriesByCollection = new Map();
const getCollection = createGetCollection({
	contentCollectionToEntryMap,
	dataCollectionToEntryMap,
	getRenderEntryImport: createGlobLookup(collectionToRenderEntryMap),
	cacheEntriesByCollection,
	liveCollections,
});

const $$Astro$2 = createAstro();
const $$SEO = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
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

const $$Astro$1 = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
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

function formatDate(date, locale = "ar-MA") {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
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
  return renderTemplate`${maybeRenderHead()}<article class="group relative bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-600" data-astro-cid-dqkhqhod> <a${addAttribute(href, "href")} class="absolute inset-0 z-10"${addAttribute(`\u0627\u0642\u0631\u0623: ${title}`, "aria-label")} data-astro-cid-dqkhqhod> <span class="sr-only" data-astro-cid-dqkhqhod>اقرأ المقال الكامل</span> </a> <div class="flex flex-col h-full" data-astro-cid-dqkhqhod> <!-- Header with difficulty badge --> <div class="flex items-start justify-between mb-3" data-astro-cid-dqkhqhod> <span${addAttribute(`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColors[difficulty]}`, "class")} data-astro-cid-dqkhqhod> ${difficultyLabels[difficulty]} </span> <time${addAttribute(date.toISOString(), "datetime")} class="text-sm text-zinc-500 dark:text-zinc-400 flex-shrink-0 mr-3" data-astro-cid-dqkhqhod> ${formatDate(date)} </time> </div> <!-- Title --> <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2" data-astro-cid-dqkhqhod> ${title} </h3> <!-- Description --> <p class="text-zinc-600 dark:text-zinc-300 text-sm mb-4 flex-grow line-clamp-3" data-astro-cid-dqkhqhod> ${description} </p> <!-- Tags --> ${tags.length > 0 && renderTemplate`<div class="flex flex-wrap gap-2 mt-auto" data-astro-cid-dqkhqhod> ${tags.slice(0, 4).map((tag) => renderTemplate`<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors" data-astro-cid-dqkhqhod>
#${tag} </span>`)} ${tags.length > 4 && renderTemplate`<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-zinc-500 dark:text-zinc-400" data-astro-cid-dqkhqhod>
+${tags.length - 4} </span>`} </div>`} </div> </article> `;
}, "C:/Users/yacin/Documents/qa-mva/src/components/CardQuestion.astro", void 0);

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
