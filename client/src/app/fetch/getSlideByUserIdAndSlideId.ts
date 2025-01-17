import { host, httpHost, port } from "./commonConstants";

/**
 * userIdとslideIdからスライド情報を取得する
 * @param userId
 * @param slideId
 * @param hostUserId
 * @returns Promise<string | void>
 */
export const getSlideByUserIdAndSlideId = async (
  hostUserId: string,
  slideId: string
): Promise<string | void> => {
  try {
    const res = await fetch(
      `${httpHost}${host}:${port}/user/${hostUserId}/slide/${slideId}`,
      {
        method: "GET",
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        return data.url;
      }
    } else {
      console.log("取得エラー");
    }
  } catch (error) {
    console.log("取得エラー:", error);
  }
};
