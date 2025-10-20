import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CBhO_b-E.mjs';
import { manifest } from './manifest_Biqzyq0U.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/avg.astro.mjs');
const _page2 = () => import('./pages/api/rate.astro.mjs');
const _page3 = () => import('./pages/page/1.astro.mjs');
const _page4 = () => import('./pages/page/_page_.astro.mjs');
const _page5 = () => import('./pages/q/_slug_.astro.mjs');
const _page6 = () => import('./pages/questions.astro.mjs');
const _page7 = () => import('./pages/robots.txt.astro.mjs');
const _page8 = () => import('./pages/rss.xml.astro.mjs');
const _page9 = () => import('./pages/tags/_tag_.astro.mjs');
const _page10 = () => import('./pages/tags.astro.mjs');
const _page11 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/avg.ts", _page1],
    ["src/pages/api/rate.ts", _page2],
    ["src/pages/page/1.astro", _page3],
    ["src/pages/page/[page].astro", _page4],
    ["src/pages/q/[slug].astro", _page5],
    ["src/pages/questions.astro", _page6],
    ["src/pages/robots.txt.ts", _page7],
    ["src/pages/rss.xml.js", _page8],
    ["src/pages/tags/[tag].astro", _page9],
    ["src/pages/tags/index.astro", _page10],
    ["src/pages/index.astro", _page11]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "7891b45d-2084-47c0-8637-720248878a2a",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
