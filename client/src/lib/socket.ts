export const setupWebSocket = (
  slideUrl: string,
  setCurrentSlide: (slide: number) => void
) => {
  const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
  const host = "localhost";
  const port = 443;
  const socketUrl = `${protocol}${host}:${port}/?slideUrl=${encodeURIComponent(
    slideUrl
  )}`;

  const socket = new WebSocket(socketUrl);

  socket.onopen = () => {
    console.log("WebSocket接続中...");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.action === "slide") {
      setCurrentSlide(data.slide);
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocketエラー:", error);
  };

  socket.onclose = () => {
    console.log("WebSocket接続終了");
  };

  return socket;
};
