import { Slide } from "../types/slide.ts";
import { User } from "../types/user.ts";
import { kv } from "../utils/kv.ts";

// deno-lint-ignore no-explicit-any
function isUser(data: any): data is User {
  // User には url, title, currentPage などのプロパティはない
  return (
    data &&
    typeof data.id === "string" &&
    data.createdAt instanceof Date &&
    !data.url &&
    !data.title &&
    !data.currentPage
  );
}

// deno-lint-ignore no-explicit-any
function isSlide(data: any): data is Slide {
  // Slide には url, title, currentPage などのプロパティが存在
  return (
    data &&
    typeof data.id === "string" &&
    typeof data.url === "string" &&
    typeof data.title === "string" &&
    typeof data.currentPage === "number" &&
    data.createdAt instanceof Date
  );
}

export async function getAllSlides(): Promise<{ user: User; slide: Slide }[]> {
  // 全ユーザーを取得
  const userIterator = kv.list({ prefix: ["users"] });

  const slideAndUsers: { user: User; slide: Slide }[] = [];
  let currentUser: User | null = null;

  for await (const entry of userIterator) {
    const data = entry.value;
    // ユーザーのデータかをチェック
    if (isUser(data)) {
      // 新しいユーザーを見つけたら、そのユーザーを保存
      currentUser = data;
    } else if (isSlide(data)) {
      // スライドが見つかった場合、現在のユーザーがいればスライドを追加
      if (currentUser) {
        slideAndUsers.push({ user: currentUser, slide: data });
      } else {
        // slideを持つユーザーのエンティティが削除されていた時
        console.warn("Slide encountered without a user context:", data);
      }
    } else {
      console.warn("Unexpected data format:", data);
    }
  }
  return slideAndUsers;
}
