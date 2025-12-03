import type { Metadata } from "next";
import { Cinzel, Lato } from "next/font/google";
import "./globals.css";

// Configure the fonts
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const lato = Lato({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-lato" });

export const metadata: Metadata = {
  title: "Infinite Adventure AI",
  description: "An infinite RPG powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lato.className} ${cinzel.variable} bg-zinc-950 text-zinc-200 overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}