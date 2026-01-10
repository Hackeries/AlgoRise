// API response optimization
export const optimizeApiResponse = <T>(
  data: T,
  options?: { compress?: boolean; minify?: boolean }
): T => {
  // In production, implement actual compression/minification\
  return data;
}

// Request deduplication
class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>();

  async deduplicate<T>(key: string, fn: () => Promise<T>): Promise<T> {
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    const promise = fn().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }
}
export const requestDeduplicator = new RequestDeduplicator();
