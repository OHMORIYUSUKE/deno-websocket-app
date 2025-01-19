import { host, httpHost, port } from "./commonConstants";
import { Slide, User } from "./types";

/**
 * userIdとslideIdからスライド情報を取得する
 * @param userId
 * @param slideId
 * @param hostUserId
 * @returns Promise<string | void>
 */
export const getSlideById = async (
  slideId: string
): Promise<{ user: User; slide: Slide } | void> => {
  try {
    const res = await fetch(`${httpHost}${host}:${port}/slide/${slideId}`, {
      method: "GET",
    });
    if (res.ok) {
      const data = await res.json();
      if (data) {
        console.log(data);
        return data;
      }
    } else {
      console.log("取得エラー");
    }
  } catch (error) {
    console.log("取得エラー:", error);
  }
};
