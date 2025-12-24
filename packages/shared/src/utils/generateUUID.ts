export function generateUUID() {
  return typeof (globalThis as any).crypto?.randomUUID === "function"
    ? (globalThis as any).crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
