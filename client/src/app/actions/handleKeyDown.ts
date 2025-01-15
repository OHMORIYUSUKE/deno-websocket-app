import { Dispatch, SetStateAction } from "react";

type UpdateSlideFunction = (
  socket: WebSocket | null,
  currentSlide: number
) => void;

type typeHandlePrevAndNext = (
  socket: WebSocket | null,
  setCurrentSlide: Dispatch<SetStateAction<number>>,
  updateSlide: UpdateSlideFunction
) => void;

/**
 * キーボード操作でスライドを前後に切り替え
 * @param socket
 * @param updateSlide
 * @param currentSlide
 * @param setCurrentSlide
 * @param event
 * @param handlePrev
 * @param handleNext
 */
export const handleKeyDown = (
  socket: WebSocket | null,
  updateSlide: UpdateSlideFunction,
  currentSlide: number,
  setCurrentSlide: Dispatch<SetStateAction<number>>,
  event: React.KeyboardEvent<HTMLDivElement>,
  handlePrev: typeHandlePrevAndNext,
  handleNext: typeHandlePrevAndNext
) => {
  if (event.key === "ArrowLeft" && currentSlide > 1) {
    handlePrev(socket, setCurrentSlide, updateSlide);
  } else if (event.key === "ArrowRight") {
    handleNext(socket, setCurrentSlide, updateSlide);
  }
};
