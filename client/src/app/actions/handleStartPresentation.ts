import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { handlePostSlideUrl } from "../fetch/handlePostSlideUrl";
import { getSlideIdByUserIdAndSlideUrl } from "../fetch/getSlideIdByUserIdAndSlideUrl";
import { removeQueryParams } from "../utils/removeQueryParams";
import { createUser } from "../fetch/createUser";

/**
 * プレゼンを開始する
 * @param slideUrl
 * @param userId
 */
export const handleStartPresentation = async (
  slideUrl: string,
  router: AppRouterInstance
) => {
  // すでに発表してユーザー登録されているかどうか
  let userId = "";
  const userIdFromLocalStorage = localStorage.getItem("slide_sync_userId");
  if (!userIdFromLocalStorage) {
    // ユーザーを作成
    const newUser = await createUser();
    if (!newUser) {
      window.alert("問題が発生しました。");
    } else {
      userId = newUser.userId;
      localStorage.setItem("slide_sync_userId", newUser.userId);
    }
  } else {
    // すでにユーザー作成済み
    userId = userIdFromLocalStorage;
  }

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
