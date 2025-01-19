import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { handlePostSlideUrl } from "../fetch/handlePostSlideUrl";
import { getSlideIdByUserIdAndSlideUrl } from "../fetch/getSlideIdByUserIdAndSlideUrl";
import { removeQueryParams } from "../utils/removeQueryParams";

/**
 * プレゼンを開始する
 * @param slideUrl
 * @param userId
 */
export const handleStartPresentation = async (
  slideUrl: string,
  userId: string,
  router: AppRouterInstance
) => {
  // スライドを登録
  try {
    await handlePostSlideUrl(userId, slideUrl);
  } catch (error) {
    if (error instanceof Error) {
      window.alert(error.message);
    }
  }

  // スライドのIDを取得
  const slide = await getSlideIdByUserIdAndSlideUrl(
    userId,
    removeQueryParams(slideUrl)
  );
  const slideId = slide?.slideId;

  if (slideUrl) {
    if (!slideId) {
      window.alert("サーバーで問題が発生しました");
    } else {
      // プレゼンテーション画面に遷移する
      const presentationRoomUrl = `${
        window.location.origin
      }/?slideId=${encodeURIComponent(slideId)}`;
      router.push(presentationRoomUrl);
    }
  }
};
