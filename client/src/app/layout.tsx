import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Google スライドのスライド送りを簡単に複数端末で同期できる君",
  description:
    "Google スライドの URL を入力してスライドを共有、スライド送りも同期できます。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      style={{
        margin: 0,
        padding: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden" /* ページ全体でスクロールを無効にする */,
      }}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{
          margin: 0,
          padding: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </body>
    </html>
  );
}
