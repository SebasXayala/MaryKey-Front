import type { Metadata, Viewport } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";

import { Providers } from "@/app/providers";
import "@/app/globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: {
    default: "Mary Kay",
    template: "%s | Mary Kay",
  },
  description:
    "Empoderando a las mujeres a través de la belleza y la oportunidad.",
};

export const viewport: Viewport = {
  themeColor: "#e76aaa",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${playfair.variable} ${montserrat.variable}`}>
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
