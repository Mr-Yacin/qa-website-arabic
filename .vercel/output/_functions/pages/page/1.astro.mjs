/* empty css                                    */
import { c as createComponent, a as createAstro } from '../../chunks/astro/server_B4x8f0ED.mjs';
import 'kleur/colors';
import 'clsx';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$1 = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$1;
  return Astro2.redirect("/", 301);
}, "C:/Users/yacin/Documents/qa-mva/src/pages/page/1.astro", void 0);

const $$file = "C:/Users/yacin/Documents/qa-mva/src/pages/page/1.astro";
const $$url = "/page/1";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$1,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
