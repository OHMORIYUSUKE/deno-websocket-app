import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { PresentationDescription } from "./PresentationDescription";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import VisibilityIcon from "@mui/icons-material/Visibility";

type PresentationDescriptionDialogProps = {
  isHost: boolean;
};

export const PresentationDescriptionDialog: React.FC<
  PresentationDescriptionDialogProps
> = ({ isHost }) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={isHost ? <SlideshowIcon /> : <VisibilityIcon />}
        onClick={handleClickOpen}
      >
        {isHost ? "発表の進め方" : "視聴方法"}
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {isHost ? "発表者へ" : "視聴者へ"}
        </DialogTitle>
        <DialogContent>
          <PresentationDescription isHost={isHost} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
