import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const slideUrls = new Map(); // WebSocket接続の管理用
const kv = await Deno.openKv(); // Deno KVでスライド管理

async function getMetaTitle(url: string): Promise<string | null> {
  const response = await fetch(url);
  const text = await response.text();

  // DOMParserでHTMLをパース
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");

  // metaタグからタイトルを取得
  const titleMeta = doc.querySelector(
    'meta[name="title"], meta[property="og:title"]'
  );
  if (titleMeta) {
    return titleMeta.getAttribute("content") || null;
  }

  // <title>タグの内容を取得
  const titleTag = doc.querySelector("title");
  return titleTag ? titleTag.textContent : null;
}

// 共通CORS設定
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // すべてのオリジンを許可
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // 許可するメソッド
  "Access-Control-Allow-Headers": "Content-Type, Authorization", // 許可するヘッダー
};

async function createUser(req: Request) {
  // OPTIONSリクエスト対応
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method === "GET") {
    const userId = crypto.randomUUID();

    // Deno KVにユーザーIDを保存
    await kv.set(["users", userId], { createdAt: new Date() });

    return new Response(JSON.stringify({ userId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // メソッドがサポートされていない場合
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

type Slide = {
  title: string;
  url: string;
  createdAt: Date;
};

// /slide/add エンドポイント: ユーザーのスライドを追加
async function addSlide(req: Request) {
  if (req.method === "POST") {
    try {
      const data = await req.json();
      const { userId, slide } = data;

      if (!userId || !slide) {
        return new Response("Missing userId or slide URL", {
          status: 400,
          headers: corsHeaders,
        });
      }

      const slideId = crypto.randomUUID();

      // ユーザーのスライドリストを取得 (string[] として型指定)
      const userSlides =
        ((await kv.get(["users", userId, "slides", slide]))?.value as Slide) ||
        null;

      // TODO
      console.log(userSlides);
      // すでに同じURLのスライドがあるか確認
      if (userSlides) {
        return new Response("Slide already exists", {
          status: 400,
          headers: corsHeaders,
        });
      }

      const slideTitle = await getMetaTitle(slide);
      // Deno KVに更新
      await kv.set(["users", userId, "slides", slideId], {
        url: slide,
        title: slideTitle,
        createdAt: new Date(),
      } as Slide);

      return new Response(JSON.stringify({ userId, slides: userSlides }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (error) {
      return new Response("Invalid request body", {
        status: 400,
        headers: corsHeaders,
      });
    }
  }

  // OPTIONSリクエストに対応するため
  if (req.method === "OPTIONS") {
    return new Response("", { status: 204, headers: corsHeaders });
  }

  return new Response("Not Found", { status: 404 });
}

// /user/{userId}/slides エンドポイント: ユーザーのスライド一覧取得
export async function getUserSlides(req: Request, userId: string) {
  try {
    if (req.method === "GET") {
      // Deno KVからユーザーのスライド一覧を取得
      const iterator = kv.list({ prefix: ["users", userId, "slides"] }); // Deno.KvListIterator<unknown>
      const userSlides: { url: string; title: string; createdAt: string }[] =
        [];

      for await (const entry of iterator) {
        if (
          typeof entry.value === "object" &&
          entry.value !== null &&
          "url" in entry.value &&
          "title" in entry.value &&
          "createdAt" in entry.value
        ) {
          const slide = entry.value as {
            url: string;
            title: string;
            createdAt: string;
          };
          userSlides.push(slide);
        } else {
          console.warn("Unexpected value type:", entry.value);
        }
      }

      return new Response(JSON.stringify({ userId, slides: userSlides }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (req.method === "OPTIONS") {
      return new Response("", { status: 204, headers: corsHeaders });
    }

    return new Response("Not Found", {
      status: 404,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Error fetching user slides:", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}

Deno.serve({
  port: 443,
  handler: async (req) => {
    const url = new URL(req.url);

    // OPTIONSリクエスト対応（全エンドポイント共通）
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // REST APIのエンドポイント処理
    if (url.pathname === "/user/create") {
      return await createUser(req);
    } else if (url.pathname === "/slide/add") {
      return await addSlide(req);
    } else if (
      url.pathname.startsWith("/user/") &&
      url.pathname.endsWith("/slides")
    ) {
      const userId = url.pathname.split("/")[2]; // {userId} を取得
      return await getUserSlides(req, userId);
    }

    const slideUrl = url.searchParams.get("slideUrl");

    if (!slideUrl) {
      return new Response("Missing slideUrl parameter", { status: 400 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);

    if (!slideUrls.has(slideUrl)) {
      slideUrls.set(slideUrl, new Map());
    }

    const clients = slideUrls.get(slideUrl);
    const clientId = crypto.randomUUID();
    clients.set(clientId, socket);

    console.log(`Client ${clientId} joined room ${slideUrl}`);

    // 現在のスライド番号をKVから取得
    let currentSlide = (await kv.get(["slides", slideUrl])).value || 1;

    // 新しく接続したクライアントに現在のスライド番号を通知
    try {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action: "slide", slide: currentSlide }));
      }
    } catch (error) {
      console.error(
        `Error sending initial message to client ${clientId}:`,
        error
      );
    }

    socket.onopen = () => {
      socket.send(JSON.stringify({ action: "slide", slide: currentSlide }));
    };

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.action === "slide") {
        currentSlide = data.slide;

        // KVにスライド番号を更新
        await kv.set(["slides", slideUrl], currentSlide);

        // 全てのクライアントにスライド更新を通知
        for (const [_, clientSocket] of clients) {
          if (clientSocket.readyState === WebSocket.OPEN) {
            try {
              clientSocket.send(
                JSON.stringify({ action: "slide", slide: currentSlide })
              );
            } catch (error) {
              console.error(
                `Error sending message to client ${clientId}:`,
                error
              );
              clients.delete(clientId); // ソケットが閉じられている場合はクライアントを削除
            }
          } else {
            console.log(`Socket not open. Skipping client.`);
            clients.delete(clientId); // 接続が切れたクライアントは削除
          }
        }
      }
    };

    socket.onclose = () => {
      console.log(`Client ${clientId} left slideUrl ${slideUrl}`);
      clients.delete(clientId);
      if (clients.size === 0) {
        slideUrls.delete(slideUrl);
      }
    };

    socket.onerror = (err) => {
      console.error(
        `Error on client ${clientId} in slideUrl ${slideUrl}:`,
        err
      );
      clients.delete(clientId);
    };

    return response; // 正しくアップグレードされたWebSocketのレスポンスを返す
  },
});

console.log("WebSocket server running on ws://localhost:443/");
