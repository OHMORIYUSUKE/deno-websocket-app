import { isGooglePresentationUrl } from "../utils/isGooglePresentationUrl";
import { removeQueryParams } from "../utils/removeQueryParams";
import { httpHost, host, port } from "./commonConstants";

/**
 * スライドURLを登録する
 * @param userId
 * @param slideUrl
 */
export const handlePostSlideUrl = async (userId: string, slideUrl: string) => {
  if (!isGooglePresentationUrl(slideUrl))
    throw new Error("Google スライドのURLではありません。");
  try {
    const res = await fetch(`${httpHost}${host}:${port}/slide/add`, {
      method: "POST",
      body: JSON.stringify({ userId, slide: removeQueryParams(slideUrl) }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      // 投稿成功時の処理
      console.log("スライドURLが正常に投稿されました");
    } else {
      if (res.status === 409) {
        console.log("スライドURLの投稿に失敗しました。既に登録されています。");
      } else {
        throw new Error("スライドURLの投稿失敗");
      }
    }
  } catch (error) {
    console.log(error);
    throw new Error("ネットワークエラーが発生しました。");
  }
};
