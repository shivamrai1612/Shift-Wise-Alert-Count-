export const SHIFT_NAMES = ['APAC', 'EMEA', 'US East', 'US West'];

export function isValidShiftName(name) {
  return SHIFT_NAMES.includes(String(name).trim());
}
