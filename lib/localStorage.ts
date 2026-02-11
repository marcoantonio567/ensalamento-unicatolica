const isBrowser = typeof window !== "undefined";

export function getLocalStorageItem<T>(key: string): T | null {
  if (!isBrowser) {
    return null;
  }

  try {
    const value = window.localStorage.getItem(key);
    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Failed to read localStorage key \"${key}\"`, error);
    return null;
  }
}

export function setLocalStorageItem<T>(key: string, value: T): void {
  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write localStorage key \"${key}\"`, error);
  }
}

export function removeLocalStorageItem(key: string): void {
  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove localStorage key \"${key}\"`, error);
  }
}
