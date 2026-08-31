import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cyber Crime: Find the Intruder",
  description:
    "A three-minute interactive Tishk University cybersecurity investigation game.",
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
