import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aer Infinity | Fly Beyond.",
  description: "Aer Infinity is a Japanese low-cost airline development experiment based at Kansai International Airport in Osaka.",
  openGraph: { title: "Aer Infinity | Fly Beyond.", description: "A Kansai-based airline growing from a focused domestic operation toward an international network.", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body><div className="site-shell">{children}</div></body>
    </html>
  );
}
