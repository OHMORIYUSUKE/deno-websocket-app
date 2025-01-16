import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

/**
 * 対象のサイトのmetaタグからサイトタイトルを取得する
 *
 * @param url
 * @returns Promise<string | null>
 */
export async function getMetaTitle(url: string): Promise<string | null> {
  const response = await fetch(url);
  const text = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");

  const titleMeta = doc.querySelector(
    'meta[name="title"], meta[property="og:title"]'
  );
  if (titleMeta) {
    return titleMeta.getAttribute("content") || null;
  }

  const titleTag = doc.querySelector("title");
  return titleTag ? titleTag.textContent : null;
}
