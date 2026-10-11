import * as React from "react";
import { api } from "./api";
import { defaultTheme, validTheme } from "../shared/themes";

const ThemeContext = React.createContext(null);
export const useTheme = () => React.useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [savedTheme, setSavedTheme] = React.useState(() => validTheme(document.documentElement.dataset.theme));
  const [preview, setPreview] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const revision = React.useRef(0);
  const reload = React.useCallback(async () => {
    const current = ++revision.current;
    setLoading(true);
    setError("");
    try {
      const result = await api("/appearance");
      if (current === revision.current) setSavedTheme(validTheme(result.theme));
    } catch (e) {
      if (current === revision.current) setError(e.message);
    } finally {
      if (current === revision.current) setLoading(false);
    }
  }, []);
  React.useEffect(() => { reload(); return () => { revision.current++; }; }, [reload]);
  const activeTheme = preview || savedTheme || defaultTheme;
  React.useLayoutEffect(() => {
    document.documentElement.dataset.theme = activeTheme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
  }, [activeTheme]);
  const clearPreview = React.useCallback(() => setPreview(null), []);
  const saveTheme = async (theme) => {
    const result = await api("/admin/appearance", { method: "PUT", body: { theme } });
    revision.current++;
    setSavedTheme(validTheme(result.theme));
    setPreview(null);
    setError("");
    setLoading(false);
    return result;
  };
  return <ThemeContext.Provider value={{ savedTheme, activeTheme, previewTheme: setPreview, clearPreview, saveTheme, loading, error, reload }}>{children}</ThemeContext.Provider>;
}
