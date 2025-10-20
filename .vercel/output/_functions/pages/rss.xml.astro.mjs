import rss from '@astrojs/rss';
import { g as getCollection } from '../chunks/_astro_content_DuxOKI3h.mjs';
export { renderers } from '../renderers.mjs';

async function GET(context) {
  const qaEntries = await getCollection('qa');
  
  // Sort by publication date (newest first) and take latest 20
  const sortedEntries = qaEntries
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .slice(0, 20);

  return rss({
    title: 'موقع الأسئلة والأجوبة',
    description: 'أحدث الأسئلة والأجوبة في مختلف المواضيع التقنية',
    site: context.site,
    items: sortedEntries.map((entry) => ({
      title: entry.data.question,
      description: entry.data.shortAnswer,
      pubDate: entry.data.pubDate,
      link: `/q/${entry.slug}/`,
      categories: entry.data.tags,
    })),
    customData: `<language>ar</language>`,
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
