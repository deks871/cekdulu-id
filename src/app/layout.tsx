import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "CekDulu.id - Deteksi Penipuan Online",
  description: "Cek apakah sebuah link, chat, atau bukti transfer aman dari penipuan. Solusi anti-scam untuk Indonesia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased flex flex-col min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-50`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Navbar />
          <main className="flex-grow pt-20">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
