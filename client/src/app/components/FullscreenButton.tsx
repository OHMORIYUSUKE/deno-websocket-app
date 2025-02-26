import { Button } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { handleFullscreenByTagId } from "../actions/handleFullscreenByTagId";

export const FullscreenButton: React.FC = () => {
  return (
    <Button
      disableElevation
      variant="contained"
      color="primary"
      startIcon={<FullscreenIcon />}
      onClick={() => handleFullscreenByTagId("slideFrame")}
    >
      スライドをフルスクリーンで表示
    </Button>
  );
};
