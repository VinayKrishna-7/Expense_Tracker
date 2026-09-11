export type ThemeMode = 'light' | 'dark' | 'system';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY';
export type WeekStartDay = 'sunday' | 'monday';
export type DateFormatPattern = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export interface UserSettings {
  theme: ThemeMode;
  currency: CurrencyCode;
  weekStartsOn: WeekStartDay;
  dateFormat: DateFormatPattern;
  enableNotifications: boolean;
  soundEnabled: boolean;
}
