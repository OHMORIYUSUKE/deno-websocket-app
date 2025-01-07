const clients = new Map<number, WebSocket>();
let clientId = 0;

Deno.serve({
  port: 443,
  handler: (req) => {
    const { socket, response } = Deno.upgradeWebSocket(req);

    const id = clientId++;
    clients.set(id, socket);

    console.log(`Client ${id} connected`);

    socket.onmessage = (event) => {
      console.log(`Message from client ${id}: ${event.data}`);
      for (const [_, clientSocket] of clients) {
        if (clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.send(`Client ${id}: ${event.data}`);
        }
      }
    };

    socket.onclose = () => {
      console.log(`Client ${id} disconnected`);
      clients.delete(id);
    };

    socket.onerror = (err) => {
      console.error(`Error on client ${id}:`, err);
      clients.delete(id);
    };

    return response;
  },
});

console.log("WebSocket server running on ws://localhost:443/");
