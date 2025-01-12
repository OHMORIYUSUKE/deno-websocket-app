# Google スライドのスライド送りを簡単に複数端末で同期できる君

## アプリについて

名前：Google スライドのスライド送りを簡単に複数端末で同期できる君

URL：https://sync-google-slide.vercel.app/

Google スライドの URL を入力してスライドを共有、スライド送りも同期できます

## 開発する

バックエンドのサーバーを起動

```sh
cd server
deno run --unstable-kv --allow-net server.ts
```

フロントエンドのサーバーを起動

```sh
cd client
npm i
npm run dev
```
