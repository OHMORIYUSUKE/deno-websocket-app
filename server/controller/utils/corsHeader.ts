import { load } from "https://deno.land/std@0.203.0/dotenv/mod.ts";

const localUrl = "http://localhost:3000";

// 環境変数をロード
const env = await load();
const pubUrl = env.PUB_URL || localUrl; // .env からローカルURLを取得
const isLocal = env.DENO_ENV === "development"; // 環境変数でローカル判定

// CORS設定
const corsHeaders = {
  "Access-Control-Allow-Origin": isLocal ? localUrl : pubUrl,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export { corsHeaders };
