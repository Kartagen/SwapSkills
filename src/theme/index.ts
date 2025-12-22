import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6366f1', // Indigo 500
    onPrimary: '#ffffff',
    secondary: '#ec4899', // Pink 500
    onSecondary: '#ffffff',
    background: '#f8fafc', // Slate 50
    surface: '#ffffff',
    error: '#ef4444',
  },
};
