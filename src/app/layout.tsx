import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FACEIT Finder",
  description: "Look up FACEIT profiles by Steam ID, Steam username, or FACEIT nickname",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-faceit-dark text-white">
        {children}
      </body>
    </html>
  );
}
