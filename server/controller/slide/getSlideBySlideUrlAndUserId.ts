import { Slide } from "../../types/slide.ts";
import { kv } from "../../utils/kv.ts";
import { corsHeaders } from "../utils/corsHeader.ts";

export async function getSlideBySlideUrlAndUserId(req: Request) {
  const url = new URL(req.url);
  const slideUrl = url.searchParams.get("slideUrl");
  const userId = url.searchParams.get("userId");

  if (!slideUrl || !userId) {
    return new Response(
      JSON.stringify({ error: "Missing url or userId parameter" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  const iterator = kv.list({ prefix: ["users", userId, "slides"] });

  for await (const entry of iterator) {
    const slide = entry.value as Slide;
    if (slide.url === slideUrl) {
      return new Response(JSON.stringify({ slideId: slide.id, slideUrl }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Slide not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
