export class TTLCache {
  constructor() { this.store = new Map(); this.inflight = new Map(); }
  get(key) {
    const item = this.store.get(key);
    if (!item) return undefined;
    if (item.expiresAt <= Date.now()) { this.store.delete(key); return undefined; }
    return item.value;
  }
  set(key, value, ttlMs) { this.store.set(key, { value, expiresAt: Date.now() + ttlMs }); return value; }
  delete(key) { this.store.delete(key); }
  clear() { this.store.clear(); }
  get size() { return this.store.size; }
  async getOrLoad(key, ttlMs, loader) {
    const cached = this.get(key);
    if (cached !== undefined) return { value: cached, cached: true };
    if (this.inflight.has(key)) return { value: await this.inflight.get(key), cached: true };
    const pending = Promise.resolve().then(loader);
    this.inflight.set(key, pending);
    try { const value = await pending; this.set(key, value, ttlMs); return { value, cached: false }; }
    finally { this.inflight.delete(key); }
  }
}
export const dictionaryCache = new TTLCache();
export const aiCache = new TTLCache();
