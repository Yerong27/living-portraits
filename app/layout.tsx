import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "Living Portraits — Interactive Literary Companions";
const description = "Click or drag an animated Emily Dickinson and receive a line of poetry.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "emily-at-the-window.liyerongvv.chatgpt.site";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol = forwardedProtocol ?? (host.includes("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: "Living Portraits with Emily Dickinson" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
