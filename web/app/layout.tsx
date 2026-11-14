import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const orbitron = Orbitron({ variable: "--font-orbitron", subsets: ["latin"], weight: ["500", "700", "900"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Studio Navya — R&D Command Center",
  description:
    "Navya Gupta — Bioengineering, AI/Tech Systems, and Operations R&D. A cinema-grade interactive portfolio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col sn-grain bg-[var(--sn-void)]">{children}</body>
    </html>
  );
}
