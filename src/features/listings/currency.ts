import type { CountryCode } from "../locations/catalog";
export function currencyForCountry(country?: CountryCode | "") { return country === "UZ" ? "UZS" : "KRW"; }
export function priceLabel(country?: CountryCode | "") { return country === "UZ" ? "so‘m" : "KRW"; }
export function formatMoney(price: number, country?: CountryCode | "") {
  return country === "UZ" ? `${new Intl.NumberFormat("en-US", {maximumFractionDigits:0}).format(price)} so‘m` : new Intl.NumberFormat("ko-KR", {style:"currency",currency:"KRW",maximumFractionDigits:0}).format(price);
}
