export { renderers } from '../../renderers.mjs';

const GET = async ({ url }) => {
  try {
    const slug = url.searchParams.get("slug");
    if (!slug) {
      return new Response(
        JSON.stringify({
          avg: null,
          message: "Missing slug parameter"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    console.log(`Average rating requested for question: ${slug}`);
    return new Response(
      JSON.stringify({
        avg: null,
        // Will be calculated from database in future
        count: 0
        // Number of ratings
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
          // Cache for 5 minutes
          "X-Content-Type-Options": "nosniff"
        }
      }
    );
  } catch (error) {
    console.error("Error fetching average rating:", error);
    return new Response(
      JSON.stringify({
        avg: null,
        message: "Internal server error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
