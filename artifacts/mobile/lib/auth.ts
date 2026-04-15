export function normalizePhone(input: string): string {
  return input.replace(/[^\d+]/g, "").trim();
}

export function stripPhoneToDigits(input: string): string {
  return input.replace(/\D/g, "");
}

export function maskDriverSessionPin<T extends { pwa_pin?: string | null }>(
  driver: T,
): T {
  return {
    ...driver,
    pwa_pin: undefined,
  };
}
