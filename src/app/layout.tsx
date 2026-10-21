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
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://telegram.org/js/telegram-web-app.js" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  localStorage.setItem("nl-hud:public:v1", "hidden");
                  localStorage.setItem("nl-hud:owner-private:v1", "hidden");
                } catch(e) {}

                function killNetlify() {
                  try {
                    localStorage.setItem("nl-hud:public:v1", "hidden");
                    localStorage.setItem("nl-hud:owner-private:v1", "hidden");
                  } catch(e) {}

                  var nfScripts = document.querySelectorAll('script[data-nf-variant], script[src*="hud"]');
                  nfScripts.forEach(function(s) {
                    try {
                      delete s.dataset.nfVariant;
                      s.removeAttribute('data-nf-variant');
                      s.remove();
                    } catch(e) {}
                  });

                  var selectors = [
                    '#nl-hud-frame',
                    '#nl-badge-frame',
                    'iframe#nl-hud-frame',
                    'iframe#nl-badge-frame',
                    'iframe[src*="netlify"]',
                    'iframe[title*="Netlify"]',
                    '#netlify-badge',
                    '.netlify-badge',
                    '[data-netlify-badge]',
                    '[data-netlify-deploy-id]',
                    'div[id*="netlify"]',
                    'div[class*="netlify"]',
                    'div[class*="netlify-drawer"]',
                    'div[class*="netlify-badge"]',
                    'netlify-drawer',
                    'netlify-badge',
                    'a[href*="netlify.com"]',
                    'a[href*="netlify.app"]',
                    'a[href*="netlify"]',
                    'img[src*="netlify"]',
                    'img[alt*="Netlify" i]',
                    '[aria-label*="Netlify" i]',
                    '[title*="Netlify" i]'
                  ];

                  selectors.forEach(function(sel) {
                    try {
                      var els = document.querySelectorAll(sel);
                      els.forEach(function(el) {
                        el.style.setProperty('display', 'none', 'important');
                        el.style.setProperty('visibility', 'hidden', 'important');
                        el.style.setProperty('opacity', '0', 'important');
                        el.style.setProperty('pointer-events', 'none', 'important');
                        el.remove();
                      });
                    } catch(e) {}
                  });

                  // Scan any elements whose text content contains "powered by netlify"
                  try {
                    var candidates = document.querySelectorAll('a, div, span, p, footer, button');
                    candidates.forEach(function(el) {
                      var txt = (el.innerText || el.textContent || '').trim().toLowerCase();
                      if (txt.indexOf('powered by netlify') !== -1) {
                        el.style.setProperty('display', 'none', 'important');
                        el.style.setProperty('visibility', 'hidden', 'important');
                        el.remove();
                      }
                    });
                  } catch(e) {}
                }

                killNetlify();
                if (typeof window !== 'undefined') {
                  window.addEventListener('DOMContentLoaded', killNetlify);
                  window.addEventListener('load', killNetlify);
                  setInterval(killNetlify, 150);
                  try {
                    var observer = new MutationObserver(killNetlify);
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
