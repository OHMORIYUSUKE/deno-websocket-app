import { Button } from "@mui/material";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type ToSlideFormButtonProps = {
  isHost: boolean;
  router: AppRouterInstance;
};

export const ToSlideFormButton: React.FC<ToSlideFormButtonProps> = ({
  isHost,
  router,
}) => {
  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={() => router.push("/")}
    >
      {isHost
        ? "プレゼンテーション開始画面に戻る"
        : "あなたもプレゼンテーション開始する"}
    </Button>
  );
};
