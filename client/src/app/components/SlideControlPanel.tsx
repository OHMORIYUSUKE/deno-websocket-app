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
        marginTop: 2,
      }}
    >
      <Button
        variant="contained"
        onClick={() => handlePrev(socket, setCurrentSlide, updateSlide)}
        startIcon={<ArrowBack />}
        disabled={currentSlide <= 1}
        sx={{ width: "15em", height: "3.5em" }} // 横幅を指定
      >
        前のページ
      </Button>
      <Button
        variant="contained"
        onClick={() => handleNext(socket, setCurrentSlide, updateSlide)}
        endIcon={<ArrowForward />}
        sx={{ width: "15em" }} // 横幅を指定
      >
        次のページ
      </Button>
    </Box>
  );
};
