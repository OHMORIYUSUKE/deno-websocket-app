import { getAllSlides } from "../../repository/getAllSlides.ts";
import { corsHeaders } from "../utils/corsHeader.ts";

export async function getSlideById(req: Request, slideId: string) {
  if (req.method === "GET") {
    const allSlides = await getAllSlides();

    // slideIdにマッチするスライドデータを返す
    allSlides.map((slide) => {
      if (slide.slide?.id === slideId) {
        return new Response(JSON.stringify(slide), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    });

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  return new Response("Not Found", {
    status: 404,
    headers: corsHeaders,
  });
}
