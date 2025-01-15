import { Dispatch, SetStateAction } from "react";

type UpdateSlideFunction = (
  socket: WebSocket | null,
  currentSlide: number
) => void;

/**
 * スライドのページを一枚戻す
 * @param socket
 * @param setCurrentSlide
 * @param updateSlide
 */
export const handlePrev = (
  socket: WebSocket | null,
  setCurrentSlide: Dispatch<SetStateAction<number>>,
  updateSlide: UpdateSlideFunction
) => {
  setCurrentSlide((prevSlide) => {
    const newSlide = Math.max(prevSlide - 1, 1);
    updateSlide(socket, newSlide); // スライド更新を即座に送信
    return newSlide;
  });
};

/**
 * スライドのページを一枚進める
 * @param socket
 * @param setCurrentSlide
 * @param updateSlide
 */
export const handleNext = (
  socket: WebSocket | null,
  setCurrentSlide: Dispatch<SetStateAction<number>>,
  updateSlide: UpdateSlideFunction
) => {
  setCurrentSlide((prevSlide) => {
    const newSlide = prevSlide + 1;
    updateSlide(socket, newSlide); // スライド更新を即座に送信
    return newSlide;
  });
};
