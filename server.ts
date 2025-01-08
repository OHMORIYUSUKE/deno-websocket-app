const rooms = new Map(); // Map to manage rooms

Deno.serve({
  port: 443,
  handler: (req) => {
    const url = new URL(req.url);
    const roomId = url.searchParams.get("roomId");

    if (!roomId) {
      return new Response("Missing roomId parameter", { status: 400 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }

    const clients = rooms.get(roomId);
    const clientId = crypto.randomUUID();
    clients.set(clientId, socket);

    console.log(`Client ${clientId} joined room ${roomId}`);

    socket.onmessage = (event) => {
      console.log(
        `Message from client ${clientId} in room ${roomId}: ${event.data}`
      );
      for (const [_, clientSocket] of clients) {
        if (clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.send(`Client ${clientId}: ${event.data}`);
        }
      }
    };

    socket.onclose = () => {
      console.log(`Client ${clientId} left room ${roomId}`);
      clients.delete(clientId);
      if (clients.size === 0) {
        rooms.delete(roomId);
      }
    };

    socket.onerror = (err) => {
      console.error(`Error on client ${clientId} in room ${roomId}:`, err);
      clients.delete(clientId);
    };

    return response;
  },
});

console.log("WebSocket server running on ws://localhost:443/");
