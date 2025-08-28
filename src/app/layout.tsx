import AmplitudeInitializer from "@/clientBoundary/AmplitudeInitializerClient";
import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "목소리 편지",
  description: "웹 기반 음성 디지털 편지 서비스",
  keywords: ["음성편지", "감성", "목소리 편지", "음성메시지"],
  authors: [{ name: "목소리 편지 팀" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#8b5cf6",
  openGraph: {
    title: "목소리 편지",
    description: "웹 기반 음성 디지털 편지 서비스",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "목소리 편지",
    description: "웹 기반 음성 디지털 편지 서비스",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={notoSansKR.className}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className="antialiased">
        <AmplitudeInitializer />
        {children}
      </body>
    </html>
  );
}
