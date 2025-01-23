import { Button } from "@mui/material";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type ToSlideFormButtonProps = {
  router: AppRouterInstance;
};

export const ToSlideFormButton: React.FC<ToSlideFormButtonProps> = ({
  router,
}) => {
  return (
    <Button
      variant="outlined"
      color="secondary"
      disableElevation
      onClick={() => router.push("/")}
    >
      プレゼンテーション開始画面に戻る
    </Button>
  );
};
