import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  Snackbar,
  SnackbarCloseReason,
  Alert,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowForward from "@mui/icons-material/ArrowForward";
import ArrowBack from "@mui/icons-material/ArrowBack";

export const ClientComponent = () => {
  const protocol =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "wss://"
      : "ws://";
  const host =
    process.env.NODE_ENV === "development"
      ? "localhost"
      : process.env.NEXT_PUBLIC_WS_HOST;
  const port = 443;

  const [slideUrl, setSlideUrl] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // キーボード操作でスライドを前後に切り替え
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" && currentSlide > 1) {
      handlePrev();
    } else if (event.key === "ArrowRight") {
      handleNext();
    }
  };

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
      }/?slideUrl=${encodeURIComponent(slideUrl)}`;
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
      if (data.action === "slide") {
        const pageNumber = data.slide;
        setCurrentSlide(pageNumber);
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
      socket.send(JSON.stringify({ action: "slide", slide: currentSlide }));
    }
  };

  const handlePrev = () => {
    setCurrentSlide((prevSlide) => {
      const newSlide = Math.max(prevSlide - 1, 1);
      updateSlide(newSlide); // スライド更新を即座に送信
      return newSlide;
    });
  };

  const handleNext = () => {
    setCurrentSlide((prevSlide) => {
      const newSlide = prevSlide + 1;
      updateSlide(newSlide); // スライド更新を即座に送信
      return newSlide;
    });
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

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
    } catch (err) {
      console.error("URLのコピーに失敗しました: ", err);
    }
  };

  const handleCopiedSnackbarClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setCopied(false);
  };

  return (
    <>
      {!slideUrlFromUrl ? (
        <Paper
          sx={{
            padding: 3,
            textAlign: "center",
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <div>
            <TextField
              label="スライドURL"
              variant="outlined"
              fullWidth
              id="slideUrl"
              value={slideUrl}
              onChange={(e) => setSlideUrl(e.target.value)}
              placeholder="https://docs.google.com/presentation/d/e/.../pub?start=false&loop=false&delayms=3000"
              sx={{ marginBottom: 2 }}
            />
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ marginBottom: 2, marginTop: 0 }}
            >
              Google Slides の「ファイル」{">"}「共有」{">"}「ウェブに公開」
              {">"}「リンク」からスライド公開用のURLを取得し入力してください。
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartPresentation}
            >
              プレゼンテーション開始
            </Button>
          </div>
        </Paper>
      ) : (
        <Paper
          {...(isHost && { tabIndex: 0, onKeyDown: handleKeyDown })}
          sx={{
            padding: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: "calc(100vh)",
            overflow: "hidden",
          }}
        >
          <Box sx={{ textAlign: "center", flexShrink: 0 }}>
            <Typography variant="h6" gutterBottom sx={{ marginTop: 0 }}>
              {isHost ? "発表者へ" : "視聴者へ"}
            </Typography>
            {isHost ? (
              <ul style={{ textAlign: "left" }}>
                <li>
                  このページのURLを共有すると表示されているスライドを視聴者に共有、スライド送りを視聴者の画面に同期させることができます。
                </li>
                <li>視聴者にこのページのURLを共有してください。</li>
                <li>スライド内の動画などの再生は同期されません。</li>
                <li>
                  スライド外にカーソルを当てた状態でキーボードの左右の矢印キーでもスライド送りができます。
                </li>
                <li>
                  「プレゼンテーション開始画面に戻る」から別なスライドを共有し直せます。
                </li>
              </ul>
            ) : (
              <ul style={{ textAlign: "left" }}>
                <li>
                  発表者のスライド送りと同期されているため、発表者と同じページが表示されます。
                </li>
              </ul>
            )}
            {isHost && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 3,
                  marginTop: 2,
                }}
              >
                <Button
                  variant="contained"
                  onClick={handlePrev}
                  startIcon={<ArrowBack />}
                  sx={{ width: "15em", height: "3.5em" }} // 横幅を指定
                >
                  前のページ
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                  sx={{ width: "15em" }} // 横幅を指定
                >
                  次のページ
                </Button>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              marginTop: 2,
              marginBottom: 2,
              flexShrink: 0,
            }}
          >
            {!isHost ? (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<FullscreenIcon />}
                onClick={handleFullscreen}
              >
                スライドをフルスクリーンで表示
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyUrl}
                >
                  このページのURLをコピー
                </Button>
                <Snackbar
                  open={copied}
                  autoHideDuration={2000}
                  onClose={handleCopiedSnackbarClose}
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <Alert
                    severity="success"
                    variant="filled"
                    sx={{ width: "100%" }}
                  >
                    コピーしました
                  </Alert>
                </Snackbar>
              </>
            )}
            <Button
              variant="contained"
              color="secondary"
              onClick={() => router.push("/")}
            >
              {isHost
                ? "プレゼンテーション開始画面に戻る"
                : "あなたもプレゼンテーション開始する"}
            </Button>
          </Box>
          <iframe
            id="slideFrame"
            src={`${slideUrlFromUrl}&slide=${currentSlide}`}
            style={{
              width: "100%",
              height: "100%",
              flexGrow: 1,
              border: "none",
            }}
            allowFullScreen
          />
        </Paper>
      )}
    </>
  );
};
