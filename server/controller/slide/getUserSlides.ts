import { Slide } from "../../types/slide.ts";
import { kv } from "../../utils/kv.ts";
import { corsHeaders } from "../utils/corsHeader.ts";

export async function getUserSlides(req: Request, userId: string) {
  if (req.method === "GET") {
    const iterator = kv.list({ prefix: ["users", userId, "slides"] });
    const userSlides: Slide[] = [];

    for await (const entry of iterator) {
      const slide = entry.value as Slide;
      userSlides.push(slide);
    }

    return new Response(JSON.stringify({ userId, slides: userSlides }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  return new Response("Not Found", {
    status: 404,
    headers: corsHeaders,
  });
}
