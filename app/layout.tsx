import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NET GAINS Pickleball Club",
  description: "Book the NET GAINS pickleball court online.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}