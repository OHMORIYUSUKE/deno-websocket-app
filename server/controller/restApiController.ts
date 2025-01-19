import { createUser } from "./user/createUser.ts";
import { getUserSlides } from "./slide/getUserSlides.ts";
import { getUserSlide } from "./slide/getUserSlide.ts";
import { addSlide } from "./slide/addSlide.ts";
import { getSlideBySlideUrlAndUserId } from "./slide/getSlideBySlideUrlAndUserId.ts";

export async function restApiController(
  url: URL,
  req: Request
): Promise<Response | undefined> {
  if (url.pathname === "/user/create") {
    return await createUser(req);
  } else if (url.pathname === "/slide") {
    return await getSlideBySlideUrlAndUserId(req);
  } else if (url.pathname === "/slide/add") {
    return await addSlide(req);
  } else if (
    url.pathname.startsWith("/user/") &&
    url.pathname.endsWith("/slides")
  ) {
    const userId = url.pathname.split("/")[2];
    return await getUserSlides(req, userId);
  } else if (url.pathname.startsWith("/slide/")) {
    const pathParts = url.pathname.split("/");
    const slideId = pathParts[2];
    return await getUserSlide(req, slideId);
  }
}
