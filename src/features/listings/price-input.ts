export function priceDigits(value: string): string | null {
  if (!/^[\d,]*$/.test(value)) return null;
  return value.replaceAll(",", "").replace(/^0+(?=\d)/, "");
}
export function formatPriceInput(digits: string) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
