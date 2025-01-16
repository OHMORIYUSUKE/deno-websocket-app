import { corsHeaders } from "./controller/utils/corsHeader.ts";
import { createUser } from "./controller/user/createUser.ts";
import { getUserSlides } from "./controller/slide/getUserSlides.ts";
import { getUserSlide } from "./controller/slide/getUserSlide.ts";
import { addSlide } from "./controller/slide/addSlide.ts";
import { getSlideBySlideUrlAndUserId } from "./controller/slide/getSlideBySlideUrlAndUserId.ts";
import { handleWebSocket } from "./websocket/handleWebSocket.ts";

Deno.serve({
  port: 443,
  handler: async (req) => {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Web Socketのエンドポイント
    if (url.pathname.startsWith("/ws/")) {
      const slideId = url.searchParams.get("slideId");
      const hostUserId = url.searchParams.get("hostUserId");
      if (!slideId || !hostUserId) {
        return new Response("Missing slideUrl parameter", { status: 400 });
      }
      const { socket, response } = Deno.upgradeWebSocket(req);
      handleWebSocket(socket, slideId, hostUserId);
      return response;
    }

    // REST APIのエンドポイント
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
    } else if (
      url.pathname.startsWith("/user/") &&
      url.pathname.includes("/slide/")
    ) {
      const pathParts = url.pathname.split("/");
      const userId = pathParts[2];
      const slideId = pathParts[4];
      return await getUserSlide(req, userId, slideId);
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log("Server running on http://localhost:443/");
