# Speaker Deck のスライド送りを簡単に複数端末で同期できる君

## アプリについて

名前：Speaker Deck のスライド送りを簡単に複数端末で同期できる君

URL：https://ohmoriyusuke.github.io/deno-websocket-app/

Speaker Deck の URL を入力してスライドを共有、スライド送りも同期できます

## 開発する

index.html の以下のコードをローカルで開発するときは修正する

```diff
// GitHub Pagesのため
- const gitHubRepoName = "deno-websocket-app";
+ const gitHubRepoName = "";
```

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
