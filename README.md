# Google スライドのスライド送りを簡単に複数端末で同期できる君

## アプリについて

名前：Google スライドのスライド送りを簡単に複数端末で同期できる君

URL：https://ohmoriyusuke.github.io/deno-websocket-app/

Google スライドの URL を入力してスライドを共有、スライド送りも同期できます

## 開発する

`client/src/lib/socket.ts` の以下のコードをローカルで開発するときは修正する

```diff
- const host = "uutan-deno-websocket-app.deno.dev";
+ const host = "localhost";
```

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
