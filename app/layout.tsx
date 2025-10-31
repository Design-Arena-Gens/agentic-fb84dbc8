import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Student Result Generator",
  description: "Automatically generate personalized student result documents from Google Sheets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
