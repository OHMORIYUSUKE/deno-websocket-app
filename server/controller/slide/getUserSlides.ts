import { getSlidesByUserId } from "../../repository/getSlidesByUserId.ts";
import { corsHeaders } from "../utils/corsHeader.ts";

export async function getUserSlides(req: Request, userId: string) {
  if (req.method === "GET") {
    const slides = await getSlidesByUserId(userId);
    return new Response(JSON.stringify({ userId, slides: slides }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  return new Response("Not Found", {
    status: 404,
    headers: corsHeaders,
  });
}
