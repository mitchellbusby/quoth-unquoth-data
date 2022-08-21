export function doAsync<T>(x: () => T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const val = x();
      resolve(val);
    }, 0);
  });
}
