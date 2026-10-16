export const safeLocalStorage = {
  set: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('LocalStorage quota exceeded. Clearing and retrying.');
        localStorage.clear();
        try {
          localStorage.setItem(key, value);
        } catch (retryError) {
          console.error(`Failed to save ${key} even after clearing localStorage:`, retryError);
        }
      } else {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    }
  },
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return null;
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  },
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};
