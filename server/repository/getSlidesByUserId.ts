import { Slide } from "../types/slide.ts";
import { kv } from "../utils/kv.ts";

export async function getSlidesByUserId(userId: string): Promise<Slide[]> {
  const iterator = kv.list({ prefix: ["users", userId, "slides"] });
  const slides: Slide[] = [];

  for await (const entry of iterator) {
    const slide = entry.value as Slide;
    slides.push(slide);
  }
  return slides;
}
