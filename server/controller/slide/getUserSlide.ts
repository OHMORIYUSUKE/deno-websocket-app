import { Slide } from "../../types/slide.ts";
import { kv } from "../../utils/kv.ts";
import { corsHeaders } from "../utils/corsHeader.ts";

export async function getUserSlide(
  req: Request,
  userId: string,
  slideId: string
) {
  if (req.method === "GET") {
    const slide =
      (await kv.get(["users", userId, "slides", slideId])).value ||
      ({} as Slide);

    return new Response(JSON.stringify(slide), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  if (req.method === "OPTIONS") {
    return new Response("", { status: 204, headers: corsHeaders });
  }

  return new Response("Not Found", {
    status: 404,
    headers: corsHeaders,
  });
}
