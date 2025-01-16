import { Slide } from "../../types/slide.ts";
import { getMetaTitle } from "../../utils/getMetaTitle.ts";
import { kv } from "../../utils/kv.ts";
import { corsHeaders } from "../utils/corsHeader.ts";

export async function addSlide(req: Request) {
  if (req.method === "POST") {
    try {
      const topPageNumber = 1;
      const data = await req.json();
      const { userId, slide } = data;

      if (!userId || !slide) {
        return new Response("Missing userId or slide URL", {
          status: 400,
          headers: corsHeaders,
        });
      }

      const slideId = crypto.randomUUID();
      const iterator = kv.list({ prefix: ["users", userId, "slides"] });
      const userSlides: Slide[] = [];

      for await (const entry of iterator) {
        const slide = entry.value as Slide;
        userSlides.push(slide);
      }

      const existSlides = userSlides.filter(
        (userSlide) => userSlide.url === slide
      );

      if (existSlides.length !== 0) {
        await kv.set(["users", userId, "slides", existSlides[0].id], {
          ...existSlides[0],
          createdAt: new Date(),
        } as Slide);
        return new Response("Slide already exists", {
          status: 409,
          headers: corsHeaders,
        });
      }

      const slideTitle = await getMetaTitle(slide);
      await kv.set(["users", userId, "slides", slideId], {
        id: slideId,
        url: slide,
        title: slideTitle,
        currentPage: topPageNumber,
        createdAt: new Date(),
      } as Slide);

      return new Response(JSON.stringify({ userId, slides: userSlides }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch {
      return new Response("Invalid request body", {
        status: 400,
        headers: corsHeaders,
      });
    }
  }

  if (req.method === "OPTIONS") {
    return new Response("", { status: 204, headers: corsHeaders });
  }

  return new Response("Not Found", { status: 404 });
}
