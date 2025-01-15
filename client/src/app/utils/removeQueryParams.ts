/**
 * google slideのURLからクエリパラメータを削除
 * urlが渡されなかった時は""を返す
 * @param url
 * @returns string
 */
export function removeQueryParams(url: string): string {
  if (!url) return "";
  // URL を URL オブジェクトに変換
  const urlObj = new URL(url);
  // 削除したいクエリパラメータをリストとして指定
  const paramsToRemove = ["start", "loop", "delayms"];
  // クエリパラメータを一つずつチェックして削除
  paramsToRemove.forEach((param) => urlObj.searchParams.delete(param));
  // 修正した URL を文字列として返す
  return urlObj.toString();
}
