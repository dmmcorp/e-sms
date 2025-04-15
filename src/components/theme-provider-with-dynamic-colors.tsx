"use client";

import type React from "react";

import { useQuery } from "convex/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";
import { createContext, useContext } from "react";
import { api } from "../../convex/_generated/api";
import { DEFAULT_COLOR } from "@/lib/constants";
import { Loader2Icon } from "lucide-react";

// Create a context to provide the primary color to components
type ThemeContextType = {
  primaryColor: string;
};

const ThemeContext = createContext<ThemeContextType>({
  primaryColor: DEFAULT_COLOR,
});

export const useDynamicTheme = () => useContext(ThemeContext);

const setPrimaryColorVariables = (hex: string) => {
  const root = document.documentElement;

  const hexToHSL = (h: string) => {
    h = h.replace(/^#/, "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length !== 6) return { h: 221, s: 44, l: 49 }; // Default HSL

    const r = parseInt(h.substring(0, 2), 16) / 255;
    const g = parseInt(h.substring(2, 4), 16) / 255;
    const b = parseInt(h.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let hue = 0,
      sat = 0,
      light = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          hue = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          hue = (b - r) / d + 2;
          break;
        case b:
          hue = (r - g) / d + 4;
          break;
      }
      hue /= 6;
    }
    hue = Math.round(hue * 360);
    sat = Math.round(sat * 100);
    light = Math.round(light * 100);
    return { h: hue, s: sat, l: light };
  };

  try {
    const hsl = hexToHSL(hex);
    requestAnimationFrame(() => {
      root.style.setProperty("--primary-h", hsl.h.toString());
      root.style.setProperty("--primary-s", `${hsl.s}%`);
      root.style.setProperty("--primary-l", `${hsl.l}%`);
    });
  } catch (error) {
    console.error("Failed to set primary color CSS variables:", error);
    requestAnimationFrame(() => {
      root.style.setProperty("--primary-h", "221");
      root.style.setProperty("--primary-s", "44%");
      root.style.setProperty("--primary-l", "49%");
    });
  }
};

export function ThemeProviderWithDynamicColors({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = useQuery(api.systemSettings.getColor);
  const [currentColor, setCurrentColor] = useState(DEFAULT_COLOR);
  const [hasMounted, setHasMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasMounted(true);
    setPrimaryColorVariables(DEFAULT_COLOR);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      const newColor = settings?.primaryColor || DEFAULT_COLOR;
      setCurrentColor(newColor);
      setPrimaryColorVariables(newColor);

      if (settings !== undefined) {
        setIsLoading(false);
      }
    }
  }, [settings, hasMounted]);

  if (isLoading && hasMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading theme...</span>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ primaryColor: currentColor }}>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  );
}
