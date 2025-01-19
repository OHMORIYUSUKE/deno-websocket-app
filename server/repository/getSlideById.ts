import { Slide } from "../types/slide.ts";
import { User } from "../types/user.ts";
import { getAllSlides } from "./getAllSlides.ts";

export async function getSlideById(slideId: string): Promise<{
  user: User;
  slide: Slide;
} | null> {
  const allSlides = await getAllSlides();
  const slide = allSlides.find((slide) => String(slide.slide.id) === slideId);
  if (slide) {
    return slide;
  }
  // slideが見つからなかった場合はnullを返す
  return null;
}
