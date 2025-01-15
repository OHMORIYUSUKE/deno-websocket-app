export const protocol =
  typeof window !== "undefined" && window.location.protocol === "https:"
    ? "wss://"
    : "ws://";

export const httpHost =
  typeof window !== "undefined" && window.location.protocol === "https:"
    ? "https://"
    : "http://";
export const host =
  process.env.NODE_ENV === "development"
    ? "localhost"
    : process.env.NEXT_PUBLIC_WS_HOST;
export const port = 443;
