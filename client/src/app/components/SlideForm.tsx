import { Button, TextField, Typography, CircularProgress } from "@mui/material";
import { handleStartPresentation } from "../actions/handleStartPresentation";
import { Dispatch, SetStateAction, useState } from "react";
import { Slide } from "../fetch/types";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type SlideFormProps = {
  slideUrl: string;
  setSlideUrl: Dispatch<SetStateAction<string>>;
  slides: Slide[];
  userId: string;
  router: AppRouterInstance;
};

export const SlideForm: React.FC<SlideFormProps> = ({
  slideUrl,
  setSlideUrl,
  userId,
  router,
}) => {
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      await handleStartPresentation(slideUrl, userId, router);
    } catch (error) {
      console.error("Error starting presentation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ width: "50%", margin: "0 auto" }}>
        <TextField
          label="スライドURL"
          variant="outlined"
          fullWidth
          id="slideUrl"
          value={slideUrl}
          onChange={(e) => setSlideUrl(e.target.value)}
          placeholder="https://docs.google.com/presentation/d/e/.../pub?start=false&loop=false&delayms=3000"
          sx={{ marginBottom: 2 }}
        />
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ marginBottom: 2, marginTop: 0 }}
        >
          Google Slides の「ファイル」{">"}「共有」{">"}「ウェブに公開」
          {">"}「リンク」からスライド公開用のURLを取得し入力してください。
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleStart}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "プレゼンテーション開始"
          )}
        </Button>
      </div>
    </>
  );
};
