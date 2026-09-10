export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 14, lg: 22, full: 999 };

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  danger: string;
  warning: string;
  meal: string;
  transport: string;
  energy: string;
}

export const lightColors: ThemeColors = {
  primary: '#0F5132',
  primaryLight: '#1E8449',
  secondary: '#52B788',
  accent: '#95D5B2',
  background: '#F4F9F6',
  surface: '#FFFFFF',
  text: '#1B2E23',
  textMuted: '#6B7C72',
  border: '#DCEAE1',
  danger: '#D64545',
  warning: '#E0A82E',
  meal: '#E76F51',
  transport: '#457B9D',
  energy: '#E9C46A',
};

export const darkColors: ThemeColors = {
  primary: '#3DDC84',
  primaryLight: '#2ECC71',
  secondary: '#52B788',
  accent: '#1F3D2C',
  background: '#0B0F0D',
  surface: '#161C19',
  text: '#EAF2ED',
  textMuted: '#8FA398',
  border: '#242E28',
  danger: '#FF6B6B',
  warning: '#F2C94C',
  meal: '#FF8A65',
  transport: '#6FB3EF',
  energy: '#FFD666',
};

// Export estático por compatibilidad con pantallas aún no migradas al ThemeContext.
export const colors = lightColors;
