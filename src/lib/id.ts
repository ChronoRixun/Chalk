/** Short, collision-resistant id for local-only data. No crypto dependency needed. */
export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
