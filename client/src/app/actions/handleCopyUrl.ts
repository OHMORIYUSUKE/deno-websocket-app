import { SnackbarCloseReason } from "@mui/material";
import { SetStateAction } from "react";

/**
 * URLをコピー
 * @returns
 */
export const handleCopyUrl = async (): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(location.href);
    return true;
  } catch (err) {
    console.log("URLのコピーに失敗しました: ", err);
    return false;
  }
};

/**
 * コピー時のスナックバーを閉じる
 * @param setCopied
 * @param reason
 * @returns
 */
export const handleCopiedSnackbarClose = (
  setCopied: (value: SetStateAction<boolean>) => void,
  reason?: SnackbarCloseReason
) => {
  if (reason === "clickaway") {
    return;
  }
  setCopied(false);
};
