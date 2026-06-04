import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import * as SystemUI from "expo-system-ui";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance } from "react-native";

const lightColors = {
  background: "#ffffff",
  foreground: "#0a0a0a",
  card: "#ffffff",
  cardForeground: "#0a0a0a",
  popover: "#ffffff",
  popoverForeground: "#0a0a0a",
  primary: "#fdc700",
  primaryForeground: "#733e0a",
  secondary: "#f4f4f5",
  secondaryForeground: "#18181b",
  muted: "#f5f5f5",
  mutedForeground: "#737373",
  accent: "#f5f5f5",
  accentForeground: "#171717",
  destructive: "#e7000b",
  destructiveForeground: "#ffffff",
  border: "#e5e5e5",
  input: "#e5e5e5",
  ring: "#a1a1a1",
  chart1: "#ffdf20",
  chart2: "#f0b100",
  chart3: "#d08700",
  chart4: "#a65f00",
  chart5: "#894b00",
  sidebar: "#fafafa",
  sidebarForeground: "#0a0a0a",
  sidebarPrimary: "#d08700",
  sidebarPrimaryForeground: "#fefce8",
  sidebarAccent: "#f5f5f5",
  sidebarAccentForeground: "#171717",
  sidebarBorder: "#e5e5e5",
  sidebarRing: "#a1a1a1",
  code: "#171717",
  codeForeground: "#fafafa",
  codeAccent: "#d08700",
  syntaxComment: "#737373",
  syntaxKeyword: "#f59e0b",
  syntaxString: "#16a34a",
  syntaxNumber: "#2563eb",
  syntaxFunction: "#7c3aed",
  tagBackground: "#fef3c7",
  tagForeground: "#713f12",
};

const darkColors = {
  background: "#0a0a0a",
  foreground: "#fafafa",
  card: "#171717",
  cardForeground: "#fafafa",
  popover: "#171717",
  popoverForeground: "#fafafa",
  primary: "#f0b100",
  primaryForeground: "#733e0a",
  secondary: "#27272a",
  secondaryForeground: "#fafafa",
  muted: "#262626",
  mutedForeground: "#a1a1a1",
  accent: "#262626",
  accentForeground: "#fafafa",
  destructive: "#ff6467",
  destructiveForeground: "#ffffff",
  border: "rgba(255, 255, 255, 0.1)",
  input: "rgba(255, 255, 255, 0.15)",
  ring: "#737373",
  chart1: "#ffdf20",
  chart2: "#f0b100",
  chart3: "#d08700",
  chart4: "#a65f00",
  chart5: "#894b00",
  sidebar: "#171717",
  sidebarForeground: "#fafafa",
  sidebarPrimary: "#f0b100",
  sidebarPrimaryForeground: "#fefce8",
  sidebarAccent: "#262626",
  sidebarAccentForeground: "#fafafa",
  sidebarBorder: "rgba(255, 255, 255, 0.1)",
  sidebarRing: "#737373",
  code: "#000000",
  codeForeground: "#fafafa",
  codeAccent: "#fbbf24",
  syntaxComment: "#a1a1a1",
  syntaxKeyword: "#fbbf24",
  syntaxString: "#86efac",
  syntaxNumber: "#93c5fd",
  syntaxFunction: "#c4b5fd",
  tagBackground: "rgba(240, 177, 0, 0.16)",
  tagForeground: "#fde68a",
};

export const appThemes = {
  light: lightColors,
  dark: darkColors,
};

export type AppTheme = keyof typeof appThemes;
export type ThemeColors = typeof lightColors;

type AppThemeContextValue = {
  colors: ThemeColors;
  colorScheme: AppTheme;
  isDark: boolean;
  setColorScheme: (theme: AppTheme) => void;
  toggleColorScheme: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

function getSystemTheme(): AppTheme {
  return Appearance.getColorScheme() === "dark" ? "dark" : "light";
}

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [colorScheme, setColorSchemeState] = useState<AppTheme>(getSystemTheme);
  const [hasManualTheme, setHasManualTheme] = useState(false);
  const colors = appThemes[colorScheme];

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (!hasManualTheme) {
        setColorSchemeState(colorScheme === "dark" ? "dark" : "light");
      }
    });

    return () => {
      subscription.remove();
    };
  }, [hasManualTheme]);

  const navigationTheme = useMemo(() => {
    const baseNavigationTheme =
      colorScheme === "dark" ? DarkTheme : DefaultTheme;

    return {
      ...baseNavigationTheme,
      colors: {
        ...baseNavigationTheme.colors,
        background: colors.background,
        card: colors.card,
        primary: colors.primary,
        text: colors.foreground,
        border: colors.border,
        notification: colors.primary,
      },
    };
  }, [colorScheme, colors]);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      colors,
      colorScheme,
      isDark: colorScheme === "dark",
      setColorScheme: (theme) => {
        setHasManualTheme(true);
        setColorSchemeState(theme);
      },
      toggleColorScheme: () => {
        setHasManualTheme(true);
        setColorSchemeState((current) =>
          current === "dark" ? "light" : "dark",
        );
      },
    }),
    [colorScheme, colors],
  );

  return (
    <AppThemeContext.Provider value={value}>
      <NavigationThemeProvider value={navigationTheme}>
        {children}
      </NavigationThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const value = useContext(AppThemeContext);

  if (!value) {
    throw new Error("useAppTheme must be used inside AppThemeProvider");
  }

  return value;
}
