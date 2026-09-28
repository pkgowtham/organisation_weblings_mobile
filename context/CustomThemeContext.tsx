import React, { createContext, useState, useContext } from 'react';
import { appThemeLight } from '../components/theme/appThemeLight';
import { appThemeDark } from  '../components/theme/appThemeDark';

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);

  const theme = isDark ? appThemeDark : appThemeLight;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
