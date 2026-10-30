import { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("gdocs_theme") || "system";
  });

  const [resolvedTheme, setResolvedTheme] = useState("light");

  useEffect(() => {
    function applyTheme() {
      let activeTheme = theme;
      if (theme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        activeTheme = prefersDark ? "dark" : "light";
      }

      setResolvedTheme(activeTheme);
      document.documentElement.setAttribute("data-theme", activeTheme);
      document.documentElement.style.colorScheme = activeTheme;
      localStorage.setItem("gdocs_theme", theme);
    }

    applyTheme();

    // Listen to OS system theme changes if set to "system"
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : prev === "dark" ? "system" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
