import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xizmatchi — Ishonchli usta va maishiy xizmatlar platformasi",
  description:
    "Xizmatchi — xonadoningiz uchun malakali santexnik, elektrik, maishiy texnika ta'mirlash, klining va boshqa xizmatlarni tez va oson toping. Toshkent va O'zbekiston bo'yicha eng sara mutaxassislar.",
  keywords: [
    "xizmatchi",
    "xizmatlar toshkent",
    "usta topish",
    "santexnik toshkent",
    "elektrik toshkent",
    "maishiy texnika ta'mirlash",
    "konditsioner ustasi",
    "klining toshkent",
    "mebel ustasi",
    "uy tamirlash",
    "usta xizmati",
  ],
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
