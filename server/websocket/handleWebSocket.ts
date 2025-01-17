import { Slide } from "../types/slide.ts";
import { kv } from "../utils/kv.ts";

const slideIds = new Map(); // WebSocket接続の管理用

export function handleWebsocket(
  socket: WebSocket,
  slideId: string,
  userId: string
) {
  if (!slideIds.has(slideId)) {
    slideIds.set(slideId, new Map());
  }

  const clients = slideIds.get(slideId);
  const clientId = crypto.randomUUID();
  clients.set(clientId, socket);

  socket.onopen = async () => {
    // スライド情報を取得
    const currentSlide = (
      await kv.get<Slide>(["users", userId, "slides", slideId])
    ).value;

    socket.send(
      JSON.stringify({ action: "slide", slide: currentSlide?.currentPage })
    );
  };

  socket.onmessage = async (event) => {
    //kvから取得
    // スライド情報を取得
    const slide = (await kv.get<Slide>(["users", userId, "slides", slideId]))
      .value;
    const data = JSON.parse(event.data);
    if (data.action === "slide") {
      const currentSlide = data.slide;
      await kv.set(["users", userId, "slides", slideId], {
        id: slideId,
        url: slide?.url,
        title: slide?.title,
        currentPage: currentSlide,
        createdAt: slide?.createdAt,
      } as Slide);
      for (const client of clients.values()) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ action: "slide", slide: currentSlide }));
        }
      }
    }
  };

  socket.onclose = () => {
    clients.delete(clientId);
    if (clients.size === 0) {
      slideIds.delete(slideId);
    }
  };

  socket.onerror = () => {
    clients.delete(clientId);
  };
}
