import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const appfont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Eduforge",
  description: "ai video Course Generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
       className={appfont.className}
      >
        {children}
      </body>
    </html>
  );
}
