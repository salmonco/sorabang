import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: '소라방 - 소리 라디오 방',
  description: '웹 기반 음성 디지털 편지와 감성형 라디오 서비스',
  keywords: ['라디오', '음성편지', '감성', '소라방', '음성메시지'],
  authors: [{ name: '소라방 팀' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#8b5cf6',
  openGraph: {
    title: '소라방 - 소리 라디오 방',
    description: '웹 기반 음성 디지털 편지와 감성형 라디오 서비스',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '소라방 - 소리 라디오 방',
    description: '웹 기반 음성 디지털 편지와 감성형 라디오 서비스',
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
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
