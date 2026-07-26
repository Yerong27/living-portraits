import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Emily at the Window — Interactive Poetry Companion",
  description: "Click Emily Dickinson for a line of poetry and a brief Chinese reflection.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
