import type { Metadata } from "next";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "Wedding Invitation",
  description: "A beautiful digital wedding invitation with maps, gallery and more.",
  keywords: ["wedding", "invitation", "gallery", "khmer wedding"],
  openGraph: {
    title: "Wedding Invitation",
    description: "Join us on our special day.",
    type: "website",
    images: [
      {
        url: "/preview-image.webp",
        width: 1200,
        height: 630,
        alt: "Wedding Invitation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding Invitation",
    description: "Join us on our special day.",
    images: ["/preview-image.webp"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="km">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}