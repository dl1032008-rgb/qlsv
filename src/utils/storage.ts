export const safeLocalStorage = {
  set: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22)) {
        console.warn(`LocalStorage quota exceeded when saving ${key}. Evicting non-essential cache items.`);
        try {
          // Chỉ xóa các khóa cache phụ không thiết yếu (như link drive tạm), KHÔNG BAO GIỜ xóa dữ liệu sinh viên/điểm/người dùng
          const keysToClean: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && (k.startsWith('oto_drive_urls_') || k.startsWith('oto_temp_') || k.startsWith('oto_cache_'))) {
              keysToClean.push(k);
            }
          }
          keysToClean.forEach(k => localStorage.removeItem(k));
          localStorage.setItem(key, value);
        } catch (retryError) {
          console.warn(`Could not save large item ${key} to localStorage (quota full). Continuing with memory/IndexedDB.`, retryError);
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
