import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ClickTracker from "@/components/ClickTracker";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProcGen | Enterprise Sourcing",
  description: "Modern Gen-Z Procurement Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <Providers>
          <ClickTracker />{children}</Providers>
      </body>
    </html>
  );
}
