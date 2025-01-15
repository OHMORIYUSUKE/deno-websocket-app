import { httpHost, host, port } from "./commonConstants";

/**
 * 指定されたユーザー ID とスライド URL からスライド情報を取得
 *
 * @param {string} userId - スライド情報を取得したいユーザーの ID。
 * @param {string} slideUrl - 対象スライドの URL。
 * @returns {Promise<{ slideUrl: string; slideId: string } | void>}
 */
export const getSlideIdByUserIdAndSlideUrl = async (
  userId: string,
  slideUrl: string
): Promise<{ slideUrl: string; slideId: string } | void> => {
  try {
    const res = await fetch(
      `${httpHost}${host}:${port}/slide?userId=${userId}&slideUrl=${slideUrl}`,
      {
        method: "GET",
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data as { slideUrl: string; slideId: string };
    } else {
      console.log("取得エラー");
    }
  } catch (error) {
    console.log("取得エラー:", error);
  }
};
