export function env(name: keyof ImportMetaEnv | string): string | undefined {
  const fromImport = (import.meta.env as Record<string, string | undefined>)[name];
  const value = fromImport || process.env[name];
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
