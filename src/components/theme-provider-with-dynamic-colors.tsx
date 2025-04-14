"use client";

import type React from "react";

import { useQuery } from "convex/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";
import { createContext, useContext } from "react";
import { api } from "../../convex/_generated/api";

// Create a context to provide the primary color to components
type ThemeContextType = {
  primaryColor: string;
};

const ThemeContext = createContext<ThemeContextType>({
  primaryColor: "#3962c0", // Default shadcn primary color
});

export const useDynamicTheme = () => useContext(ThemeContext);

export function ThemeProviderWithDynamicColors({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = useQuery(api.systemSettings.getColor);
  const [primaryColor, setPrimaryColor] = useState("#3962c0");

  useEffect(() => {
    if (settings?.primaryColor) {
      setPrimaryColor(settings.primaryColor);

      // Update CSS variables for the primary color
      const root = document.documentElement;

      // Convert hex to hsl for shadcn compatibility
      const hexToHSL = (hex: string) => {
        // Remove the # if present
        hex = hex.replace(/^#/, "");

        // Parse the hex values
        const r = Number.parseInt(hex.substring(0, 2), 16) / 255;
        const g = Number.parseInt(hex.substring(2, 4), 16) / 255;
        const b = Number.parseInt(hex.substring(4, 6), 16) / 255;

        // Find the min and max values to calculate saturation
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);

        // Calculate HSL values
        let h = 0;
        let s = 0;
        let l = (max + min) / 2;

        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

          switch (max) {
            case r:
              h = (g - b) / d + (g < b ? 6 : 0);
              break;
            case g:
              h = (b - r) / d + 2;
              break;
            case b:
              h = (r - g) / d + 4;
              break;
          }

          h = h / 6;
        }

        // Convert to degrees, percentage, and percentage
        h = Math.round(h * 360);
        s = Math.round(s * 100);
        l = Math.round(l * 100);

        return { h, s, l };
      };

      const hsl = hexToHSL(settings.primaryColor);

      // Set the CSS variables for the primary color
      root.style.setProperty("--primary-h", hsl.h.toString());
      root.style.setProperty("--primary-s", `${hsl.s}%`);
      root.style.setProperty("--primary-l", `${hsl.l}%`);
    }
  }, [settings]);

  return (
    <ThemeContext.Provider value={{ primaryColor }}>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  );
}
