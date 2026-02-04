import ClientLayout from "./ClientLayout";
import localFont from 'next/font/local'
import "@/styles/index.css";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
  },
};

const moul = localFont({
  src: './fonts/Moul-Regular.ttf',
  variable: '--font-moul',
  display: 'swap',
})

const khmer = localFont({
  src: './fonts/khmer.ttf',
  variable: '--font-khmer',
  display: 'swap',
})

const tacteng = localFont({
  src: './fonts/tacteng.ttf',
  variable: '--font-tacteng',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="km">
      <body className={`
        ${moul.className} 
        ${khmer.variable} 
        ${tacteng.variable}
      `}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}