export { renderers } from '../../renderers.mjs';

const POST = async ({ request, url }) => {
  try {
    const slug = url.searchParams.get("slug");
    const body = await request.json();
    const rating = body.rating;
    if (!slug) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: "Missing slug parameter"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: "Invalid rating value. Must be between 1 and 5"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    console.log(`Rating received: ${rating} stars for question: ${slug}`);
    return new Response(
      JSON.stringify({
        ok: true,
        message: "Rating submitted successfully"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // Add basic security headers
          "X-Content-Type-Options": "nosniff"
        }
      }
    );
  } catch (error) {
    console.error("Error processing rating:", error);
    return new Response(
      JSON.stringify({
        ok: false,
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
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
