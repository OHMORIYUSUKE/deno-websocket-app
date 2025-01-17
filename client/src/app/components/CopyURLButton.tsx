import { Alert, Button, Snackbar } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  handleCopiedSnackbarClose,
  handleCopyUrl,
} from "../actions/handleCopyUrl";
import { Dispatch, SetStateAction } from "react";

type CopyURLButtonProps = {
  copied: boolean;
  setCopied: Dispatch<SetStateAction<boolean>>;
};

export const CopyURLButton: React.FC<CopyURLButtonProps> = ({
  copied,
  setCopied,
}) => {
  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        startIcon={<ContentCopyIcon />}
        onClick={async () => {
          const result = await handleCopyUrl();
          if (result) setCopied(result);
        }}
      >
        このページのURLをコピー
      </Button>
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
