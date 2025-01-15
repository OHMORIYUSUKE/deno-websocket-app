import { httpHost, host, port } from "./commonConstants";
import { Slide } from "./types";

/**
 * ユーザーに紐づくスライドを取得
 * @param userId
 * @returns Promise<Slide[] | void>
 */
export const getSlides = async (userId: string): Promise<Slide[] | void> => {
  try {
    const res = await fetch(
      `${httpHost}${host}:${port}/user/${userId}/slides`,
      {
        method: "GET",
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data.slides;
    } else {
      console.log("取得エラー");
    }
  } catch (error) {
    console.log("取得エラー:", error);
  }
};
