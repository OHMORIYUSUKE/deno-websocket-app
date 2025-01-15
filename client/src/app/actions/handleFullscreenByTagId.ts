interface HTMLIFrameElementWithFullscreen extends HTMLIFrameElement {
  webkitRequestFullscreen?: () => void;
  msRequestFullscreen?: () => void;
}

/**
 * slideFrameがidに指定されている要素をフルスクーリン
 */
export const handleFullscreenByTagId = (tagIdName: string) => {
  const iframe = document.getElementById(
    tagIdName
  ) as HTMLIFrameElementWithFullscreen;

  if (iframe.requestFullscreen) {
    iframe.requestFullscreen();
  } else if (iframe.webkitRequestFullscreen) {
    iframe.webkitRequestFullscreen();
  } else if (iframe.msRequestFullscreen) {
    iframe.msRequestFullscreen();
  }
};
