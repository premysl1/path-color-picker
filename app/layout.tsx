import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Path Color Picker",
  description: "Extract color palettes by drawing a path across an image.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
