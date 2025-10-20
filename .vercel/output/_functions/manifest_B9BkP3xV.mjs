import 'kleur/colors';
import { j as decodeKey } from './chunks/astro/server_B4x8f0ED.mjs';
import 'clsx';
import 'cookie';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_EMUFeTQu.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/Users/yacin/Documents/qa-mva/","cacheDir":"file:///C:/Users/yacin/Documents/qa-mva/node_modules/.astro/","outDir":"file:///C:/Users/yacin/Documents/qa-mva/dist/","srcDir":"file:///C:/Users/yacin/Documents/qa-mva/src/","publicDir":"file:///C:/Users/yacin/Documents/qa-mva/public/","buildClientDir":"file:///C:/Users/yacin/Documents/qa-mva/dist/client/","buildServerDir":"file:///C:/Users/yacin/Documents/qa-mva/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"never"}}},{"file":"tags/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/tags","isIndex":true,"type":"page","pattern":"^\\/tags$","segments":[[{"content":"tags","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/tags/index.astro","pathname":"/tags","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/avg","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/avg$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"avg","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/avg.ts","pathname":"/api/avg","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/rate","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/rate$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"rate","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/rate.ts","pathname":"/api/rate","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.-R2bW68R.css"}],"routeData":{"route":"/page/1","isIndex":false,"type":"page","pattern":"^\\/page\\/1$","segments":[[{"content":"page","dynamic":false,"spread":false}],[{"content":"1","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/page/1.astro","pathname":"/page/1","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.-R2bW68R.css"},{"type":"inline","content":".line-clamp-2[data-astro-cid-dqkhqhod]{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.line-clamp-3[data-astro-cid-dqkhqhod]{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}\n"},{"type":"external","src":"/_astro/index.Dby412ov.css"}],"routeData":{"route":"/page/[page]","isIndex":false,"type":"page","pattern":"^\\/page\\/([^/]+?)$","segments":[[{"content":"page","dynamic":false,"spread":false}],[{"content":"page","dynamic":true,"spread":false}]],"params":["page"],"component":"src/pages/page/[page].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.-R2bW68R.css"},{"type":"external","src":"/_astro/index.Dby412ov.css"},{"type":"inline","content":".line-clamp-2[data-astro-cid-dqkhqhod]{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.line-clamp-3[data-astro-cid-dqkhqhod]{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}\n"}],"routeData":{"route":"/q/[slug]","isIndex":false,"type":"page","pattern":"^\\/q\\/([^/]+?)$","segments":[[{"content":"q","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/q/[slug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.-R2bW68R.css"},{"type":"inline","content":".line-clamp-2[data-astro-cid-dqkhqhod]{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.line-clamp-3[data-astro-cid-dqkhqhod]{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}\n"},{"type":"external","src":"/_astro/index.Dby412ov.css"}],"routeData":{"route":"/questions","isIndex":false,"type":"page","pattern":"^\\/questions$","segments":[[{"content":"questions","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/questions.astro","pathname":"/questions","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/robots.txt","isIndex":false,"type":"endpoint","pattern":"^\\/robots\\.txt\\/?$","segments":[[{"content":"robots.txt","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/robots.txt.ts","pathname":"/robots.txt","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/rss.xml","isIndex":false,"type":"endpoint","pattern":"^\\/rss\\.xml\\/?$","segments":[[{"content":"rss.xml","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/rss.xml.js","pathname":"/rss.xml","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.-R2bW68R.css"},{"type":"inline","content":".line-clamp-2[data-astro-cid-dqkhqhod]{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.line-clamp-3[data-astro-cid-dqkhqhod]{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}\n"},{"type":"external","src":"/_astro/index.Dby412ov.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}}],"site":"https://example.com","base":"/","trailingSlash":"never","compressHTML":true,"componentMetadata":[["C:/Users/yacin/Documents/qa-mva/src/pages/index.astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/yacin/Documents/qa-mva/src/pages/page/[page].astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/yacin/Documents/qa-mva/src/pages/q/[slug].astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/yacin/Documents/qa-mva/src/pages/questions.astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/yacin/Documents/qa-mva/src/pages/tags/[tag].astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/yacin/Documents/qa-mva/src/pages/tags/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/page/[page]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/q/[slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/questions@_@astro",{"propagation":"in-tree","containsHead":false}],["C:/Users/yacin/Documents/qa-mva/src/pages/rss.xml.js",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/rss.xml@_@js",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/tags/[tag]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/tags/index@_@astro",{"propagation":"in-tree","containsHead":false}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/api/avg@_@ts":"pages/api/avg.astro.mjs","\u0000@astro-page:src/pages/api/rate@_@ts":"pages/api/rate.astro.mjs","\u0000@astro-page:src/pages/page/1@_@astro":"pages/page/1.astro.mjs","\u0000@astro-page:src/pages/page/[page]@_@astro":"pages/page/_page_.astro.mjs","\u0000@astro-page:src/pages/q/[slug]@_@astro":"pages/q/_slug_.astro.mjs","\u0000@astro-page:src/pages/questions@_@astro":"pages/questions.astro.mjs","\u0000@astro-page:src/pages/robots.txt@_@ts":"pages/robots.txt.astro.mjs","\u0000@astro-page:src/pages/rss.xml@_@js":"pages/rss.xml.astro.mjs","\u0000@astro-page:src/pages/tags/[tag]@_@astro":"pages/tags/_tag_.astro.mjs","\u0000@astro-page:src/pages/tags/index@_@astro":"pages/tags.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_B9BkP3xV.mjs","C:/Users/yacin/Documents/qa-mva/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_BJfVoFG2.mjs","C:\\Users\\yacin\\Documents\\qa-mva\\.astro\\content-assets.mjs":"chunks/content-assets_DleWbedO.mjs","C:\\Users\\yacin\\Documents\\qa-mva\\.astro\\content-modules.mjs":"chunks/content-modules_Dz-S_Wwv.mjs","\u0000astro:data-layer-content":"chunks/_astro_data-layer-content_pngTJw5o.mjs","C:/Users/yacin/Documents/qa-mva/src/components/StarRating.jsx":"_astro/StarRating.DeY_lzt1.js","@astrojs/react/client.js":"_astro/client.BfPWZUkF.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/index.-R2bW68R.css","/_astro/index.Dby412ov.css","/favicon.svg","/_astro/client.BfPWZUkF.js","/_astro/index.Cd_vQiNd.js","/_astro/StarRating.DeY_lzt1.js","/images/astro-hero.jpg","/images/seo-optimization.jpg","/tags/index.html"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"gM2rliTnM02rYEfweHckEtrg8O3QpttJWpX2PxXvpuU="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
