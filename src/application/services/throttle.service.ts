const lastCallMap = new Map<string, number>();

const MIN_INTERVAL_MS = 300;

export function throttleWrite(key: string): boolean {
  const now = Date.now();
  const last = lastCallMap.get(key) ?? 0;
  if (now - last < MIN_INTERVAL_MS) {
    return false;
  }
  lastCallMap.set(key, now);
  return true;
}

export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
