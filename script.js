const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
const host = "localhost";
// GitHub Pagesのため
const gitHubRepoName = "";
const port = 443;
const slideUrlInput = document.getElementById("slideUrlInput");
const startPresentationButton = document.getElementById(
  "startPresentationButton"
);
const startPresentationDiv = document.getElementById("startPresentation");
const presentationRoomDiv = document.getElementById("presentationRoom");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const slideFrame = document.getElementById("slideFrame");
const toTopPageLink = document.getElementById("toTopPage");

let socket;
let currentSlide = 1;

// ルームIDをURLパラメータで取得して、WebSocket接続をセットアップ
const urlParams = new URLSearchParams(window.location.search);
const slideUrlFromUrl = urlParams.get("slideUrl");

if (slideUrlFromUrl) {
  setupWebSocket(slideUrlFromUrl);
  // ローカルストレージにslideUrlがなければスライド操作不可
  if (localStorage.getItem("slide_sync_slideUrl") != slideUrlFromUrl) {
    const speakerClasses = document.getElementsByClassName("speaker");
    for (const speakerClass of speakerClasses) {
      speakerClass.style.display = "none";
    }
    toTopPageLink.textContent = "プレゼンテーション開始する";
  }
  // 視聴者の場合表示する
  if (localStorage.getItem("slide_sync_slideUrl") == slideUrlFromUrl) {
    const audiencesClasses = document.getElementsByClassName("audience");
    for (const audiencesClass of audiencesClasses) {
      audiencesClass.style.display = "none";
    }
  }
  toTopPageLink.href = `/${gitHubRepoName}`;
  slideFrame.src = slideUrlFromUrl; // iflameにURLを設定
  startPresentationDiv.style.display = "none"; // ルーム作成セクションを非表示
  presentationRoomDiv.style.display = "block"; // スライド表示セクションを表示
} else {
  startPresentationDiv.style.display = "block"; // ルーム作成セクションを表示
  presentationRoomDiv.style.display = "none"; // スライド表示セクションを非表示
}

function replacePubWithEmbed(url) {
  // URLオブジェクトを作成
  const urlObj = new URL(url);

  // パスが '/pub' で終わる場合のみ '/embed' に置き換え
  if (urlObj.pathname.endsWith("/pub")) {
    urlObj.pathname = urlObj.pathname.replace("/pub", "/embed");
  }

  // 変更されたURLを文字列として返す
  return urlObj.toString();
}

startPresentationButton.addEventListener("click", () => {
  const slideUrl = replacePubWithEmbed(slideUrlInput.value.trim());
  if (slideUrl) {
    const presentationRoomUrl = `${
      window.location.origin
    }/${gitHubRepoName}?slideUrl=${encodeURIComponent(slideUrl)}`;
    // ローカルストレージにslideUrlを保存
    // slideUrlが保存されている人がホスト
    localStorage.setItem("slide_sync_slideUrl", slideUrl);
    window.location.href = presentationRoomUrl; // URLを更新してリダイレクト
  } else {
    alert("URLを入力してください。");
  }
});

// WebSocketのセットアップ
function setupWebSocket(slideUrl) {
  const socketUrl = `${protocol}${host}:${port}/?slideUrl=${encodeURIComponent(
    slideUrl
  )}`;
  socket = new WebSocket(socketUrl);

  socket.onopen = () => {
    console.log("WebSocket接続中...");
    slideFrame.src = slideUrl; // スライドURLを設定
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // メッセージがスライドの変更情報であることを確認
    if (data.action === "slide") {
      currentSlide = data.slide;
      console.log(`Received slide change: ${currentSlide}`);
      updateSlide();
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocketエラー:", error);
  };

  socket.onclose = () => {
    console.log("WebSocket接続終了");
  };

  // スライド操作ボタン
  prevButton.addEventListener("click", () => {
    if (currentSlide > 1) {
      currentSlide--;
      updateSlide();
      // スライド変更情報をサーバーに送信
      socket.send(JSON.stringify({ action: "slide", slide: currentSlide }));
    }
  });

  nextButton.addEventListener("click", () => {
    currentSlide++;
    updateSlide();
    // スライド変更情報をサーバーに送信
    socket.send(JSON.stringify({ action: "slide", slide: currentSlide }));
  });

  // キーボード操作でスライドを前後に切り替え
  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" && currentSlide > 1) {
      currentSlide--;
      updateSlide();
      // スライド変更情報をサーバーに送信
      socket.send(JSON.stringify({ action: "slide", slide: currentSlide }));
    } else if (event.key === "ArrowRight") {
      currentSlide++;
      updateSlide();
      // スライド変更情報をサーバーに送信
      socket.send(JSON.stringify({ action: "slide", slide: currentSlide }));
    }
  });

  // スライドをフルスクリーンで表示する
  fullscreenBtn.addEventListener("click", () => {
    if (slideFrame.requestFullscreen) {
      slideFrame.requestFullscreen();
    } else if (slideFrame.webkitRequestFullscreen) {
      slideFrame.webkitRequestFullscreen();
    } else if (slideFrame.msRequestFullscreen) {
      slideFrame.msRequestFullscreen();
    }
  });
}

// スライドの更新
function updateSlide() {
  slideFrame.src = `${slideFrame.src.split("?")[0]}?slide=${currentSlide}`;
}

// コピーURL
function copyUrl() {
  const element = document.createElement("input");
  element.value = location.href;
  document.body.appendChild(element);
  element.select();
  document.execCommand("copy");
  document.body.removeChild(element);
  window.alert("コピーしました");
}
