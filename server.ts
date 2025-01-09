const slideUrls = new Map(); // WebSocket接続の管理用
const kv = await Deno.openKv(); // Deno KVでスライド管理

Deno.serve({
  port: 443,
  handler: async (req) => {
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

    // 現在のスライド番号をKVから取得
    let currentSlide = (await kv.get(["slides", slideUrl])).value || 0;

    // 新しく接続したクライアントに現在のスライド番号を通知
    try {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action: "slide", slide: currentSlide }));
      }
    } catch (error) {
      console.error(
        `Error sending initial message to client ${clientId}:`,
        error
      );
    }

    socket.onopen = () => {
      socket.send(JSON.stringify({ action: "slide", slide: currentSlide }));
    };

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.action === "slide") {
        currentSlide = data.slide;

        // KVにスライド番号を更新
        await kv.set(["slides", slideUrl], currentSlide);

        // 全てのクライアントにスライド更新を通知
        for (const [_, clientSocket] of clients) {
          if (clientSocket.readyState === WebSocket.OPEN) {
            try {
              clientSocket.send(
                JSON.stringify({ action: "slide", slide: currentSlide })
              );
            } catch (error) {
              console.error(
                `Error sending message to client ${clientId}:`,
                error
              );
              clients.delete(clientId); // ソケットが閉じられている場合はクライアントを削除
            }
          } else {
            console.log(`Socket not open. Skipping client.`);
            clients.delete(clientId); // 接続が切れたクライアントは削除
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

    return response; // 正しくアップグレードされたWebSocketのレスポンスを返す
  },
});

console.log("WebSocket server running on ws://localhost:443/");
