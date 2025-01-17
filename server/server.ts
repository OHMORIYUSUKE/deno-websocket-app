import { restApiController } from "./controller/restApiController.ts";
import { corsHeaders } from "./controller/utils/corsHeader.ts";
import { websocketController } from "./websocket/websocketController.ts";

Deno.serve({
  port: 443,
  handler: async (req) => {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // WebSocketのエンドポイント
    const websocketResponse = websocketController(url, req);
    if (websocketResponse) {
      return websocketResponse;
    }

    // REST APIのエンドポイント
    const restApiResponse = await restApiController(url, req);
    if (restApiResponse) {
      return restApiResponse;
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log("Server running on https://localhost:443/");
