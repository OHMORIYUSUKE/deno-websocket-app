import { Dispatch, SetStateAction } from "react";
import { host, port, protocol } from "../fetch/commonConstants";

/**
 * webソケットのセットアップ
 * @param slideId
 * @param userId
 */
export const setupWebSocket = (
  slideId: string,
  userId: string,
  setCurrentSlide: Dispatch<SetStateAction<number>>,
  setSocket: Dispatch<SetStateAction<WebSocket | null>>
) => {
  const socketUrl = `${protocol}${host}:${port}/ws/?slideId=${encodeURIComponent(
    slideId
  )}&hostUserId=${userId}`;
  const newSocket = new WebSocket(socketUrl);
  setSocket(newSocket);

  newSocket.onopen = () => {
    console.log("WebSocket接続中...");
  };

  newSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.action === "slide") {
      const pageNumber = data.slide;
      setCurrentSlide(pageNumber);
    }
  };

  newSocket.onerror = (error) => {
    console.log("WebSocketエラー:", error);
  };

  newSocket.onclose = () => {
    console.log("WebSocket接続終了");
  };
};
