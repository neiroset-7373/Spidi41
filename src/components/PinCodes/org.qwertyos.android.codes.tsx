/**
 * org.qwertyos.android.codes
 * Центральный модуль управления паролями WintoPhone
 * Единая точка доступа для PIN-кодов и графических ключей
 */

export interface SecurityData {
  type: 'pin' | 'pattern';
  pin?: string;
  pattern?: number[];
  createdAt: number;
}

const STORAGE_KEY = 'org.qwertyos.android.codes';

export const SecurityCodes = {
  /** Сохранить данные безопасности */
  save: (data: SecurityData): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  /** Загрузить данные безопасности */
  load: (): SecurityData | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /** Проверить, установлен ли пароль */
  has: (): boolean => !!localStorage.getItem(STORAGE_KEY),

  /** Удалить все пароли */
  clear: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },

  /** Проверить PIN-код */
  verifyPin: (pin: string): boolean => {
    const data = SecurityCodes.load();
    return data?.type === 'pin' && data.pin === pin;
  },

  /** Проверить графический ключ */
  verifyPattern: (pattern: number[]): boolean => {
    const data = SecurityCodes.load();
    return data?.type === 'pattern' && JSON.stringify(data.pattern) === JSON.stringify(pattern);
  },

  /** Получить тип установленного пароля */
  getType: (): 'pin' | 'pattern' | null => {
    const data = SecurityCodes.load();
    return data?.type || null;
  },

  /** Миграция со старых ключей (wintophone_pin / wintophone_pattern / wintophone_security) */
  migrate: (): void => {
    const oldSecurity = localStorage.getItem('wintophone_security');
    const oldPin = localStorage.getItem('wintophone_pin');
    const oldPattern = localStorage.getItem('wintophone_pattern');

    if (oldSecurity) {
      try {
        const parsed = JSON.parse(oldSecurity);
        SecurityCodes.save(parsed);
      } catch { /* ignore */ }
    } else if (oldPin) {
      SecurityCodes.save({ type: 'pin', pin: oldPin, createdAt: Date.now() });
    } else if (oldPattern) {
      try {
        const parsed = JSON.parse(oldPattern);
        SecurityCodes.save({ type: 'pattern', pattern: parsed, createdAt: Date.now() });
      } catch { /* ignore */ }
    }

    // Очистка старых ключей
    localStorage.removeItem('wintophone_security');
    localStorage.removeItem('wintophone_pin');
    localStorage.removeItem('wintophone_pattern');
  },
};

export default SecurityCodes;
