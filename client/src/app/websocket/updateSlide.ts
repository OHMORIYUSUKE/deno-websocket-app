/**
 * スライドのページを更新、同期
 * @param currentSlide
 */
export const updateSlide = (socket: WebSocket | null, currentSlide: number) => {
  if (socket) {
    socket.send(JSON.stringify({ action: "slide", slide: currentSlide }));
  }
};
