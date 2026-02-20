import ClientLayout from "./ClientLayout";
import localFont from "next/font/local";
import "@/styles/index.css";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
  },
};

const moul = localFont({
  src: "./fonts/Moul-Regular.ttf",
  variable: "--font-moul",
  display: "swap",
});

const khmer = localFont({
  src: "./fonts/khmer.ttf",
  variable: "--font-khmer",
  display: "swap",
});

const tacteng = localFont({
  src: "./fonts/tacteng.ttf",
  variable: "--font-tacteng",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km-KH">
      <body
        className={`
        ${moul.className} 
        ${khmer.variable} 
        ${tacteng.variable}
      `}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
