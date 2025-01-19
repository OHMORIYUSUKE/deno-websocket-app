import { getSlideById } from "../../repository/getSlideById.ts";
import { corsHeaders } from "../utils/corsHeader.ts";

export async function getUserSlide(req: Request, slideId: string) {
  if (req.method === "GET") {
    const slide = await getSlideById(slideId);
    return new Response(JSON.stringify(slide), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  return new Response("Not Found", {
    status: 404,
    headers: corsHeaders,
  });
}
