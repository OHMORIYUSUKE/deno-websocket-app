const localUrl = "http://localhost:3000";

// 環境変数をロード
const pubUrl = Deno.env.get("PUB_URL") || localUrl; // .env からローカルURLを取得
const isLocal = Deno.env.get("DENO_ENV") === "development"; // 環境変数でローカル判定

// CORS設定
const corsHeaders = {
  "Access-Control-Allow-Origin": isLocal ? localUrl : pubUrl,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export { corsHeaders };
