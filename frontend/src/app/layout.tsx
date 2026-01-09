import "./global.css";
import "../styles/glass.css";
import React from "react";
import { ThemeProvider } from "../components/theme-provider";
import { AnimatedBackground } from "../components/animated-background";
import { Urbanist, Outfit } from "next/font/google";
import ScrollWrapper from "./Scroll-Wrapper";

// Urbanist - Modern geometric sans-serif for body text
const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

// Outfit - Bold, expressive geometric sans-serif for headings
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      suppressHydrationWarning
      className={`${urbanist.variable} ${outfit.variable}`}
    >
      <body className="font-body antialiased">
        <ThemeProvider>
          <AnimatedBackground />
          <ScrollWrapper>
            <div className="min-h-screen w-full relative">
              {/* Crimson Depth */}
              <div
                className="absolute inset-0 z-0"
                style={{
                  background:
                    "radial-gradient(125% 125% at 50% 100%, #000000 40%, #2b0707 100%)",
                }}
              />
              {/* Your Content/Components */}
              <div className="relative z-10">{children}</div>
            </div>
          </ScrollWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
