import React from "react";
import { Skeleton } from "@mui/material";
import { removeQueryParams } from "../utils/removeQueryParams";
import { Slide } from "../fetch/types";

type GoogleSlideProps = {
  slide: Slide;
  currentSlide: number;
};

export const GoogleSlide: React.FC<GoogleSlideProps> = ({
  slide,
  currentSlide,
}) => {
  if (!slide.url) {
    return (
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        style={{ flexGrow: 1 }}
      />
    );
  }

  return (
    <iframe
      id="slideFrame"
      src={`${removeQueryParams(slide.url).replace(
        "pub",
        "embed"
      )}?start=false&slide=${currentSlide}`}
      style={{
        width: "100%", // 横幅を親要素いっぱいに
        height: "100%", // 高さを親要素いっぱいに
        flexGrow: 1,
        border: "none",
      }}
      allowFullScreen
    />
  );
};
