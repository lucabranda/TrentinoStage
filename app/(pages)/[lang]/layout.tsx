import type { Metadata } from "next";
import localFont from "next/font/local";
import {siteConfig} from "@/utils/config";
import favicon from "@/public/favicon.ico";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import "./globals.css";

const geistSans = localFont({
  src: "../../../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../../../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="it">
      <head>
        <link rel="icon" href={favicon.src} sizes="" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
