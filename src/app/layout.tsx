import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ClickTracker from "@/components/ClickTracker";
import AutoLogout from "@/components/AutoLogout";
import NextTopLoader from "nextjs-toploader";

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
        <NextTopLoader color="#2563eb" initialPosition={0.08} crawlSpeed={200} height={3} crawl={true} showSpinner={true} easing="ease" speed={200} shadow="0 0 10px #2563eb,0 0 5px #2563eb" />
        <Providers>
          <ClickTracker />
          <AutoLogout />{children}</Providers>
      </body>
    </html>
  );
}
