export function generateId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
