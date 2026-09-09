import type { Metadata } from "next";
import "./globals.css";
import "./extra.css";

export const metadata: Metadata = {
  title: "Pernikahan Jeivan & Charine",
  description: "Undangan pernikahan Jeivan dan Charine",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
