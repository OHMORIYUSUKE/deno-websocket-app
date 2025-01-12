"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const IndexPage = () => {
  const protocol =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "wss://"
      : "ws://";
  const host = "localhost";
  const port = 443;
  const gitHubRepoName = "";

  const [slideUrl, setSlideUrl] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isHost, setIsHost] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const slideUrlFromUrl = searchParams.get("slideUrl") || null;

  useEffect(() => {
    if (typeof window !== "undefined" && slideUrlFromUrl) {
      setupWebSocket(slideUrlFromUrl);
      if (localStorage.getItem("slide_sync_slideUrl") !== slideUrlFromUrl) {
        setIsHost(false);
      } else {
        setIsHost(true);
      }
    }
  }, [slideUrlFromUrl]);

  const replacePubWithEmbed = (url: string) => {
    const urlObj = new URL(url);
    if (urlObj.pathname.endsWith("/pub")) {
      urlObj.pathname = urlObj.pathname.replace("/pub", "/embed");
    }
    return urlObj.toString();
  };

  const handleStartPresentation = () => {
    const slideUrlInput = slideUrl.trim();
    if (slideUrlInput) {
      const slideUrl = replacePubWithEmbed(slideUrlInput);
      const presentationRoomUrl = `${
        window.location.origin
      }/${gitHubRepoName}?slideUrl=${encodeURIComponent(slideUrl)}`;
      localStorage.setItem("slide_sync_slideUrl", slideUrl);
      router.push(presentationRoomUrl);
    } else {
      alert("URLを入力してください。");
    }
  };

  const setupWebSocket = (slideUrl: string) => {
    const socketUrl = `${protocol}${host}:${port}/?slideUrl=${encodeURIComponent(
      slideUrl
    )}`;
    const newSocket = new WebSocket(socketUrl);
    setSocket(newSocket);

    newSocket.onopen = () => {
      console.log("WebSocket接続中...");
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket メッセージ受信:", data); // メッセージをログに出力
      if (data.action === "slide") {
        const pageNumber = data.slide;
        console.log("スライド番号更新:", pageNumber); // スライド番号が正しいか確認
        setCurrentSlide(pageNumber); // 修正: 現在のスライド番号を更新
      }
    };

    newSocket.onerror = (error) => {
      console.error("WebSocketエラー:", error);
    };

    newSocket.onclose = () => {
      console.log("WebSocket接続終了");
    };
  };

  const updateSlide = (currentSlide: number) => {
    if (socket) {
      console.log("スライド更新送信:", currentSlide); // 送信するスライド番号をログに出力
      socket.send(JSON.stringify({ action: "slide", slide: currentSlide }));
    }
  };

  const handlePrev = () => {
    setCurrentSlide((currentSlide) => Math.max(currentSlide - 1, 1)); // 最小スライド番号を1に制限
    updateSlide(currentSlide - 1);
  };

  const handleNext = () => {
    setCurrentSlide((currentSlide) => currentSlide + 1);
    updateSlide(currentSlide + 1);
  };

  interface HTMLIFrameElementWithFullscreen extends HTMLIFrameElement {
    webkitRequestFullscreen?: () => void;
    msRequestFullscreen?: () => void;
  }

  const handleFullscreen = () => {
    const iframe = document.getElementById(
      "slideFrame"
    ) as HTMLIFrameElementWithFullscreen;

    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else if (iframe.webkitRequestFullscreen) {
      iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) {
      iframe.msRequestFullscreen();
    }
  };

  const handleCopyUrl = () => {
    const element = document.createElement("input");
    element.value = location.href;
    document.body.appendChild(element);
    element.select();
    document.execCommand("copy");
    document.body.removeChild(element);
    window.alert("コピーしました");
  };

  return (
    <div>
      {!slideUrlFromUrl ? (
        <div id="startPresentation">
          <input
            type="text"
            value={slideUrl}
            id="slideUrl"
            onChange={(e) => setSlideUrl(e.target.value)}
            placeholder="https://docs.google.com/presentation/d/e/.../pub?start=false&loop=false&delayms=3000"
          />
          <p>
            Google Slides の「ファイル」`{">"}`「共有」`{">"}`「ウェブに公開」`
            {">"}`「リンク」からスライド公開用のURLを取得し入力してください。
          </p>
          <button onClick={handleStartPresentation}>
            プレゼンテーション開始
          </button>
        </div>
      ) : (
        <div id="presentationRoom">
          {isHost ? (
            <div className="speaker">
              <p>
                [発表者へ]
                <br />
                ・このページのURLを共有すると表示されているスライドを視聴者に共有、スライド送りを視聴者の画面に同期させることができます。
                <br />
                ・視聴者にこのページのURLを共有してください。
                <br />
                ・スライド内の動画などの再生は同期されません。
                <br />
                ・スライド外にカーソルを当てた状態でキーボードの左右の矢印キーでもスライド送りができます。
                <br />
                ・「プレゼンテーション開始画面に戻る」から別なスライドを共有し直せます。
              </p>
              <button onClick={handlePrev}>←</button>
              <button onClick={handleNext}>→</button>
            </div>
          ) : (
            <div className="audience">
              <p>[視聴者へ]</p>
              <p>
                発表者のスライド送りと同期されているため、発表者と同じページが表示されます。
              </p>
            </div>
          )}
          <button onClick={handleFullscreen}>
            スライドをフルスクリーンで表示
          </button>
          <button onClick={handleCopyUrl}>このページのURLをコピー</button>
          <button onClick={() => router.push("/")}>
            {isHost
              ? "プレゼンテーション開始画面に戻る"
              : "あなたもプレゼンテーション開始する"}
          </button>
          <iframe
            id="slideFrame"
            src={`${slideUrlFromUrl}&slide=${currentSlide}`}
            width="960"
            height="569"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
};

export default IndexPage;
