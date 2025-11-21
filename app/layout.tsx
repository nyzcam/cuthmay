import ClientLayout from "./ClientLayout";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="km">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}