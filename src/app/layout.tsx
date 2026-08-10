import type { Metadata } from "next";
import { Google_Sans_Flex } from "next/font/google";
import "./globals.css";

const googleSansFlex = Google_Sans_Flex({
  variable: "--font-sans",
  subsets: ["latin"],
  adjustFontFallback: false,
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "FIKI Transit Driver Portal",
  description:
    "Access schedules, rides, and driver tools through the FIKI Transit driver portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={googleSansFlex.variable}
      suppressHydrationWarning
    >
      <body
        className="min-h-full font-sans antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
