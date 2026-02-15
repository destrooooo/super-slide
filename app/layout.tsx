import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Super Slide",
  description:
    "100 puzzles coulissants inspirés du Giiker Super Slide. Mode challenge chronométré, classement en ligne et comparaison entre joueurs.",
  keywords: [
    "super slide",
    "superslide",
    "sliding puzzle",
    "casse-tête",
    "puzzle game",
    "giiker",
    "brain teaser",
  ],
  authors: [{ name: "destrooooo", url: "https://github.com/destrooooo" }],
  openGraph: {
    title: "Super Slide",
    description:
      "100 puzzles coulissants. Mode challenge chronométré avec classement en ligne.",
    type: "website",
    locale: "fr_FR",
    siteName: "Super Slide",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Super Slide",
    description:
      "100 puzzles coulissants. Mode challenge chronométré avec classement en ligne.",
    images: ["/og.png"],
  },
  metadataBase: new URL("https://super-slide.io"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="super-slide" />
        <link rel="manifest" href="/site.webmanifest" />
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')` }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
