import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  Snackbar,
  Alert,
  ListItemText,
  ListItem,
  List,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowForward from "@mui/icons-material/ArrowForward";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { removeQueryParams } from "./utils/removeQueryParams";
import { createUser } from "./fetch/createUser";
import { getSlides } from "./fetch/getSlides";
import { Slide } from "./fetch/types";
import { updateSlide } from "./websocket/updateSlide";
import { handleNext, handlePrev } from "./actions/handleSlidePage";
import { handleFullscreenByTagId } from "./actions/handleFullscreenByTagId";
import {
  handleCopiedSnackbarClose,
  handleCopyUrl,
} from "./actions/handleCopyUrl";
import { handleKeyDown } from "./actions/handleKeyDown";
import { getSlideByUserIdAndSlideId } from "./fetch/getSlideByUserIdAndSlideId";
import { handleStartPresentation } from "./actions/handleStartPresentation";
import { setupWebSocket } from "./websocket/setupWebSocket";

export const ClientComponent = () => {
  const [slideUrl, setSlideUrl] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const slideId = searchParams.get("slideId") || null;
  const hostUserId = searchParams.get("hostUserId") || null;

  useEffect(() => {
    const initialize = async () => {
      const userIdFromLocalStorage = localStorage.getItem("slide_sync_userId");
      if (!userIdFromLocalStorage) {
        // ユーザーを作成
        const newUser = await createUser();
        if (!newUser) {
          window.alert("問題が発生しました。");
        } else {
          localStorage.setItem("slide_sync_userId", newUser.userId);
          setUserId(() => newUser.userId);
        }
      } else {
        // 既存のユーザー
        setUserId(() => userIdFromLocalStorage);
        // ユーザーが発表したスライド情報を取得
        const slides = await getSlides(userIdFromLocalStorage);
        if (slides) {
          setSlides(slides);
        } else {
          setSlides([]);
        }
      }

      // スライドの所有者であればsetIsHostをtrue
      // ローカルストレージに保存されているslide_sync_userIdとURLパラメータのhostUserIdが一致していれば所有者
      if (typeof window !== "undefined" && slideId && hostUserId) {
        setupWebSocket(slideId, hostUserId, setCurrentSlide, setSocket);
        if (localStorage.getItem("slide_sync_userId") !== hostUserId) {
          setIsHost(false);
        } else {
          setIsHost(true);
        }
      }
      if (userId && slideId && hostUserId) {
        const slideUrl = await getSlideByUserIdAndSlideId(hostUserId, slideId);
        if (slideUrl) {
          setSlideUrl(slideUrl);
        } else {
          window.alert(
            "スライドを取得できませんでした。再度URLを入力してください。\nまたは、発表者から新しいURLを発行を依頼してください。"
          );
          router.push("/");
        }
      }
    };

    initialize();
  }, [slideId, userId, hostUserId]);

  return (
    <>
      {!slideId ? (
        <Paper
          sx={{
            padding: 3,
            textAlign: "center",
            margin: 0,
            gap: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <div style={{ width: "50%", margin: "0 auto" }}>
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
              onClick={() => handleStartPresentation(slideUrl, userId, router)}
            >
              プレゼンテーション開始
            </Button>
          </div>
          <List sx={{ width: "50%", margin: "0 auto" }}>
            {slides.length > 0 && (
              <ListItem sx={{ display: "flex", justifyContent: "center" }}>
                過去に発表したスライド
              </ListItem>
            )}
            {slides.map((slide, index) => (
              <ListItem
                key={index}
                onClick={() => setSlideUrl(slide.url)}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.1)", // グレーの背景色
                  },
                }}
              >
                <ListItemText
                  primary={
                    <>
                      <span style={{ fontSize: "large", marginRight: "0.8em" }}>
                        {slide.title}
                      </span>
                      <span style={{ fontSize: "small", color: "dimgray" }}>
                        {new Date(slide.createdAt).toLocaleString()}
                      </span>
                    </>
                  }
                  secondary={slide.url}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      ) : (
        <Paper
          {...(isHost && {
            tabIndex: 0,
            onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) =>
              handleKeyDown(
                socket,
                updateSlide,
                currentSlide,
                setCurrentSlide,
                event,
                handlePrev,
                handleNext
              ),
          })}
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
                  onClick={() =>
                    handlePrev(socket, setCurrentSlide, updateSlide)
                  }
                  startIcon={<ArrowBack />}
                  sx={{ width: "15em", height: "3.5em" }} // 横幅を指定
                >
                  前のページ
                </Button>
                <Button
                  variant="contained"
                  onClick={() =>
                    handleNext(socket, setCurrentSlide, updateSlide)
                  }
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
                onClick={() => handleFullscreenByTagId("slideFrame")}
              >
                スライドをフルスクリーンで表示
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<ContentCopyIcon />}
                  onClick={async () => {
                    const result = await handleCopyUrl();
                    if (result) setCopied(result);
                  }}
                >
                  このページのURLをコピー
                </Button>
                <Snackbar
                  open={copied}
                  autoHideDuration={2000}
                  onClose={() => handleCopiedSnackbarClose(setCopied)}
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
            src={`${removeQueryParams(slideUrl).replace(
              "pub",
              "embed"
            )}?start=false&slide=${currentSlide}`}
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
