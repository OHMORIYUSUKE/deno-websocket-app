import React from "react";
import { Skeleton } from "@mui/material";
import { removeQueryParams } from "../utils/removeQueryParams";

type GoogleSlideProps = {
  slideUrl: string;
  currentSlide: number;
};

export const GoogleSlide: React.FC<GoogleSlideProps> = ({
  slideUrl,
  currentSlide,
}) => {
  if (!slideUrl) {
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
      src={`${removeQueryParams(slideUrl).replace(
        "pub",
        "embed"
      )}?start=false&slide=${currentSlide}`}
      style={{
        width: "100%",
        height: "100%",
        flexGrow: 1,
        border: "none",
      }}
      allowFullScreen
    />
  );
};
