import { httpHost, host, port } from "./commonConstants";

/**
 * ユーザーを作成
 * @returns Promise<{ userId: string } | void>
 */
export const createUser = async (): Promise<{ userId: string } | void> => {
  try {
    const res = await fetch(`${httpHost}${host}:${port}/user/create`, {
      method: "GET",
    });
    if (res.ok) {
      const data = await res.json();
      const newUserId = data.userId;
      return { userId: newUserId };
    } else {
      console.log("ユーザー作成失敗");
    }
  } catch (error) {
    console.log("ユーザー作成エラー:", error);
  }
};
