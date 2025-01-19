import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box, Paper } from "@mui/material";
import { getSlides } from "./fetch/getSlides";
import { Slide } from "./fetch/types";
import { updateSlide } from "./websocket/updateSlide";
import { handleNext, handlePrev } from "./actions/handleSlidePage";
import { handleKeyDown } from "./actions/handleKeyDown";
import { getSlideById } from "./fetch/getSlideById";
import { setupWebSocket } from "./websocket/setupWebSocket";
import { SlideForm } from "./components/SlideForm";
import { SlidesTable } from "./components/SlidesTable";
import { GoogleSlide } from "./components/GoogleSlide";
import { PresentationDescription } from "./components/PresentationDescription";
import { SlideControlPanel } from "./components/SlideControlPanel";
import { CopyURLButton } from "./components/CopyURLButton";
import { FullscreenButton } from "./components/FullscreenButton";
import { ToSlideFormButton } from "./components/ToSlideFormButton";

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
  // const hostUserId = searchParams.get("hostUserId") || null;
  const [hostUserId, setHostUserId] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      const userIdFromLocalStorage = localStorage.getItem("slide_sync_userId");
      if (userIdFromLocalStorage) {
        // 発表利用経験あり
        // ユーザー作成済み
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
      if (slideId) {
        const slide = await getSlideById(slideId);
        if (slide) {
          setSlideUrl(slide.slide.url);
          setHostUserId(slide.user.id);
        } else {
          window.alert(
            "スライドを取得できませんでした。再度URLを入力してください。\nまたは、発表者から新しいURLの発行を依頼してください。"
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
          <SlideForm
            slideUrl={slideUrl}
            setSlideUrl={setSlideUrl}
            router={router}
          />
          <SlidesTable slides={slides} setSlideUrl={setSlideUrl} />
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
            <PresentationDescription isHost={isHost} />
            {isHost && (
              <SlideControlPanel
                socket={socket}
                currentSlide={currentSlide}
                setCurrentSlide={setCurrentSlide}
                updateSlide={updateSlide}
              />
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
              <FullscreenButton />
            ) : (
              <CopyURLButton setCopied={setCopied} copied={copied} />
            )}
            <ToSlideFormButton isHost={isHost} router={router} />
          </Box>
          <GoogleSlide slideUrl={slideUrl} currentSlide={currentSlide} />
        </Paper>
      )}
    </>
  );
};
