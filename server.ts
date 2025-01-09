const slideUrls = new Map(); // Map to manage rooms

Deno.serve({
  port: 443,
  handler: (req) => {
    const url = new URL(req.url);
    const slideUrl = url.searchParams.get("slideUrl");

    if (!slideUrl) {
      return new Response("Missing slideUrl parameter", { status: 400 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);

    if (!slideUrls.has(slideUrl)) {
      slideUrls.set(slideUrl, new Map());
    }

    const clients = slideUrls.get(slideUrl);
    const clientId = crypto.randomUUID();
    clients.set(clientId, socket);

    console.log(`Client ${clientId} joined room ${slideUrl}`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // メッセージの内容がスライド情報かどうか確認
      if (data.action === "slide") {
        const currentSlide = data.slide;
        // ルーム内の全クライアントにスライド情報を送信
        for (const [_, clientSocket] of clients) {
          if (clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.send(
              JSON.stringify({ action: "slide", slide: currentSlide })
            );
          }
        }
      }
    };

    socket.onclose = () => {
      console.log(`Client ${clientId} left slideUrl ${slideUrl}`);
      clients.delete(clientId);
      if (clients.size === 0) {
        slideUrls.delete(slideUrl);
      }
    };

    socket.onerror = (err) => {
      console.error(
        `Error on client ${clientId} in slideUrl ${slideUrl}:`,
        err
      );
      clients.delete(clientId);
    };

    return response;
  },
});

console.log("WebSocket server running on ws://localhost:443/");
