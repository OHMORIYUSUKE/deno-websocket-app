/**
 * google slidesのURLかを確認する
 * @param url
 * @returns boolean
 */
export function isGooglePresentationUrl(url: string): boolean {
  const googlePresentationUrlPrefix = "https://docs.google.com/presentation/";
  return url.startsWith(googlePresentationUrlPrefix);
}
