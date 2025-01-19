import { handleWebsocket } from "./handleWebsocket.ts";

export function websocketController(url: URL, req: Request) {
  if (url.pathname.startsWith("/ws/")) {
    const slideId = url.searchParams.get("slideId");
    const hostUserId = url.searchParams.get("hostUserId");
    if (!slideId || !hostUserId) {
      return new Response("Missing slideUrl parameter", { status: 400 });
    }
    const { socket, response } = Deno.upgradeWebSocket(req);
    handleWebsocket(socket, slideId, hostUserId);
    return response;
  }
}
