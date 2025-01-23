import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { handleNext, handlePrev } from "../actions/handleSlidePage";
import { Dispatch, SetStateAction } from "react";

type SlideControlPanelProps = {
  socket: WebSocket | null;
  currentSlide: number;
  setCurrentSlide: Dispatch<SetStateAction<number>>;
  updateSlide: (socket: WebSocket | null, currentSlide: number) => void;
};

export const SlideControlPanel: React.FC<SlideControlPanelProps> = ({
  socket,
  currentSlide,
  setCurrentSlide,
  updateSlide,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 3,
        flexWrap: "wrap", // 狭い画面でボタンが折り返し可能に
        padding: { xs: "0.5em", sm: "1em" },
      }}
    >
      <Button
        variant="contained"
        size="large"
        disableElevation
        onClick={() => handlePrev(socket, setCurrentSlide, updateSlide)}
        startIcon={<ArrowBack />}
        disabled={currentSlide <= 1}
        sx={{
          fontSize: "1rem", // ボタンの文字サイズを一定化
          padding: "0.7em 1.5em", // ボタンの内側の余白を固定
          minWidth: "150px", // 最小幅を固定
          maxWidth: "200px", // 最大幅を設定して横に伸びすぎないように
        }}
      >
        前のページ
      </Button>
      <Button
        variant="contained"
        size="large"
        disableElevation
        onClick={() => handleNext(socket, setCurrentSlide, updateSlide)}
        endIcon={<ArrowForward />}
        sx={{
          fontSize: "1rem",
          padding: "0.7em 1.5em",
          minWidth: "150px", // 最小幅を固定
          maxWidth: "200px",
        }}
      >
        次のページ
      </Button>
    </Box>
  );
};
