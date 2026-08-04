// Додаємо слово export, щоб функцію можна було імпортувати в інші файли
export function getSafeStorageItem(key) {
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Помилка зчитування ключа ${key}:`, error);
    return [];
  }
}
