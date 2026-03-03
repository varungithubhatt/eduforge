import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./Provider";
import { Toaster } from "@/components/ui/sonner";

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
    <ClerkProvider>
    <html lang="en">
      <body
       className={appfont.className}
      >
       <Provider>
       {children}
       <Toaster position="top-center" richColors/>
       </Provider>
       
      </body>
    </html>
   </ClerkProvider>
  );
}
