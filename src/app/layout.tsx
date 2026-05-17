import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "image-service",
  description: "个人 AI 生图网页服务"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
