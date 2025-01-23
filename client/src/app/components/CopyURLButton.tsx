import { Alert, Button, Menu, MenuItem, Snackbar } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  handleCopiedSnackbarClose,
  handleCopyUrl,
} from "../actions/handleCopyUrl";
import { Dispatch, SetStateAction, useState } from "react";
import { Slide } from "../fetch/types";

type CopyURLButtonProps = {
  slide: Slide;
  copied: boolean;
  setCopied: Dispatch<SetStateAction<boolean>>;
};

export const CopyURLButton: React.FC<CopyURLButtonProps> = ({
  slide,
  copied,
  setCopied,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  type CopyOptionType = "url" | "urlAndTitle";
  const handleMenuItemClick = async (option: CopyOptionType) => {
    const text =
      option == "url"
        ? location.href
        : `「${slide.title}」の発表を聴く\n\n↓のURLから参加\n${location.href}`;
    const result = await handleCopyUrl(text);
    if (result) setCopied(result);
    setAnchorEl(null);
  };
  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        disableElevation
        startIcon={<ContentCopyIcon />}
        onClick={async (event) => {
          handleClick(event);
        }}
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        視聴者を招待
      </Button>
      {/* ボタンのメニュー */}
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={() => handleMenuItemClick("url")}>
          招待URLをコピー
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick("urlAndTitle")}>
          招待メッセージをコピー
        </MenuItem>
      </Menu>
      {/* コピーしましたアラート */}
      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => handleCopiedSnackbarClose(setCopied)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          コピーしました
        </Alert>
      </Snackbar>
    </>
  );
};
