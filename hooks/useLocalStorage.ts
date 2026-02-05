import { useState, useEffect, useCallback } from "react";

interface UseLocalStorageOptions<T> {
  key: string;
  defaultValue: T;
  enabled?: boolean;
}

export function useLocalStorage<T>({
  key,
  defaultValue,
  enabled = true,
}: UseLocalStorageOptions<T>) {
  // Get initial value from localStorage or use default
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined" || !enabled) {
      return defaultValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  });

  // Save to localStorage when value changes
  useEffect(() => {
    if (typeof window === "undefined" || !enabled) {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, value, enabled]);

  // Clear localStorage
  const clear = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      console.error(`Error clearing ${key} from localStorage:`, error);
    }
  }, [key, defaultValue]);

  return [value, setValue, clear] as const;
}

// Hook for persistence toggle
export function usePersistenceToggle() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return false;

    try {
      const item = window.localStorage.getItem("persistence-enabled");
      return item ? JSON.parse(item) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        "persistence-enabled",
        JSON.stringify(enabled)
      );
    } catch (error) {
      console.error("Error saving persistence setting:", error);
    }
  }, [enabled]);

  return [enabled, setEnabled] as const;
}

// Hook to check if data exists in localStorage
export function useHasStoredData(key: string): boolean {
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const item = window.localStorage.getItem(key);
      setHasData(!!item && item !== "null" && item !== "undefined");
    } catch {
      setHasData(false);
    }
  }, [key]);

  return hasData;
}
