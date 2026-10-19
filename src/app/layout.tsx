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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function removeNetlifyBadge() {
                  var selectors = [
                    'iframe',
                    '#netlify-badge',
                    '.netlify-badge',
                    '[data-netlify-badge]',
                    '[data-netlify-deploy-id]',
                    'div[id*="netlify"]',
                    'div[class*="netlify-drawer"]',
                    'div[class*="netlify-badge"]',
                    'netlify-drawer',
                    'netlify-badge',
                    'a[href*="netlify.com"]:not(footer a)',
                    'img[src*="netlify"]',
                    'img[alt*="Netlify"]',
                    'script[data-nf-variant]',
                    'script[src*="/.netlify/scripts/hud"]'
                  ];
                  selectors.forEach(function(sel) {
                    var els = document.querySelectorAll(sel);
                    els.forEach(function(el) {
                      try { el.remove(); } catch(e) {}
                    });
                  });
                }
                if (typeof window !== 'undefined') {
                  window.addEventListener('DOMContentLoaded', removeNetlifyBadge);
                  window.addEventListener('load', removeNetlifyBadge);
                  setInterval(removeNetlifyBadge, 200);
                  try {
                    var observer = new MutationObserver(removeNetlifyBadge);
                    observer.observe(document.documentElement, { childList: true, subtree: true });
                  } catch(e) {}
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
