import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const slideIds = new Map(); // WebSocket接続の管理用
const kv = await Deno.openKv(); // Deno KVでスライド管理

async function getMetaTitle(url: string): Promise<string | null> {
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

// 共通CORS設定
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

type User = {
  id: string;
  createdAt: Date;
};

async function createUser(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method === "GET") {
    const userId = crypto.randomUUID();

    await kv.set(["users", userId], {
      id: userId,
      createdAt: new Date(),
    } as User);

    return new Response(JSON.stringify({ userId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

type Slide = {
  id: string;
  title: string;
  url: string;
  currentPage: number;
  createdAt: Date;
};

async function addSlide(req: Request) {
  if (req.method === "POST") {
    try {
      const topPageNumber = 1;
      const data = await req.json();
      const { userId, slide } = data;

      if (!userId || !slide) {
        return new Response("Missing userId or slide URL", {
          status: 400,
          headers: corsHeaders,
        });
      }

      const slideId = crypto.randomUUID();
      const iterator = kv.list({ prefix: ["users", userId, "slides"] });
      const userSlides: Slide[] = [];

      for await (const entry of iterator) {
        const slide = entry.value as Slide;
        userSlides.push(slide);
      }

      const existSlides = userSlides.filter(
        (userSlide) => userSlide.url === slide
      );

      if (existSlides.length !== 0) {
        await kv.set(["users", userId, "slides", existSlides[0].id], {
          ...existSlides[0],
          createdAt: new Date(),
        } as Slide);
        return new Response("Slide already exists", {
          status: 409,
          headers: corsHeaders,
        });
      }

      const slideTitle = await getMetaTitle(slide);
      await kv.set(["users", userId, "slides", slideId], {
        id: slideId,
        url: slide,
        title: slideTitle,
        currentPage: topPageNumber,
        createdAt: new Date(),
      } as Slide);

      return new Response(JSON.stringify({ userId, slides: userSlides }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch {
      return new Response("Invalid request body", {
        status: 400,
        headers: corsHeaders,
      });
    }
  }

  if (req.method === "OPTIONS") {
    return new Response("", { status: 204, headers: corsHeaders });
  }

  return new Response("Not Found", { status: 404 });
}

export async function getUserSlides(req: Request, userId: string) {
  if (req.method === "GET") {
    const iterator = kv.list({ prefix: ["users", userId, "slides"] });
    const userSlides: Slide[] = [];

    for await (const entry of iterator) {
      const slide = entry.value as Slide;
      userSlides.push(slide);
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
}

export async function getUserSlide(
  req: Request,
  userId: string,
  slideId: string
) {
  if (req.method === "GET") {
    const slide =
      (await kv.get(["users", userId, "slides", slideId])).value ||
      ({} as Slide);

    return new Response(JSON.stringify(slide), {
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
}

async function getSlideBySlideUrlAndUserId(req: Request) {
  const url = new URL(req.url);
  const slideUrl = url.searchParams.get("slideUrl");
  const userId = url.searchParams.get("userId");

  if (!slideUrl || !userId) {
    return new Response(
      JSON.stringify({ error: "Missing url or userId parameter" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  const iterator = kv.list({ prefix: ["users", userId, "slides"] });

  for await (const entry of iterator) {
    const slide = entry.value as Slide;
    if (slide.url === slideUrl) {
      return new Response(JSON.stringify({ slideId: slide.id, slideUrl }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Slide not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

async function handleWebSocket(
  socket: WebSocket,
  slideId: string,
  userId: string
) {
  if (!slideIds.has(slideId)) {
    slideIds.set(slideId, new Map());
  }

  const clients = slideIds.get(slideId);
  const clientId = crypto.randomUUID();
  clients.set(clientId, socket);

  socket.onopen = async () => {
    // スライド情報を取得
    const currentSlide = (
      await kv.get<Slide>(["users", userId, "slides", slideId])
    ).value;

    socket.send(
      JSON.stringify({ action: "slide", slide: currentSlide?.currentPage })
    );
  };

  socket.onmessage = async (event) => {
    //kvから取得
    // スライド情報を取得
    const slide = (await kv.get<Slide>(["users", userId, "slides", slideId]))
      .value;
    const data = JSON.parse(event.data);
    if (data.action === "slide") {
      const currentSlide = data.slide;
      await kv.set(["users", userId, "slides", slideId], {
        id: slideId,
        url: slide?.url,
        title: slide?.title,
        currentPage: currentSlide,
        createdAt: slide?.createdAt,
      } as Slide);
      for (const client of clients.values()) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ action: "slide", slide: currentSlide }));
        }
      }
    }
  };

  socket.onclose = () => {
    clients.delete(clientId);
    if (clients.size === 0) {
      slideIds.delete(slideId);
    }
  };

  socket.onerror = () => {
    clients.delete(clientId);
  };
}

Deno.serve({
  port: 443,
  handler: async (req) => {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname.startsWith("/ws/")) {
      const slideId = url.searchParams.get("slideId");
      const hostUserId = url.searchParams.get("hostUserId");
      if (!slideId || !hostUserId) {
        return new Response("Missing slideUrl parameter", { status: 400 });
      }

      const { socket, response } = Deno.upgradeWebSocket(req);
      handleWebSocket(socket, slideId, hostUserId);
      return response;
    }

    if (url.pathname === "/user/create") {
      return await createUser(req);
    } else if (url.pathname === "/slide") {
      return await getSlideBySlideUrlAndUserId(req);
    } else if (url.pathname === "/slide/add") {
      return await addSlide(req);
    } else if (
      url.pathname.startsWith("/user/") &&
      url.pathname.endsWith("/slides")
    ) {
      const userId = url.pathname.split("/")[2];
      return await getUserSlides(req, userId);
    } else if (
      url.pathname.startsWith("/user/") &&
      url.pathname.includes("/slide/")
    ) {
      const pathParts = url.pathname.split("/");
      const userId = pathParts[2];
      const slideId = pathParts[4];
      return await getUserSlide(req, userId, slideId);
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log("Server running on http://localhost:443/");
