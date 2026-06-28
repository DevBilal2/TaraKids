/** Default display currency for Tara Kids (Pakistan). */
export const DISPLAY_CURRENCY = "PKR";

/** Flat shipping in PKR (matches checkout when below free threshold). */
export const FLAT_SHIPPING_PKR = 200;

/** Subtotal at or above this gets free shipping in cart UI. */
export const FREE_SHIPPING_PKR_THRESHOLD = 5000;

/**
 * Format a numeric amount for display (Rs. X,XXX.XX PKR when currency is PKR).
 * @param {string|number} amount - Raw amount (e.g. from Shopify `amount`)
 * @param {string} [currencyCode=PKR]
 */
export function formatMoney(amount, currencyCode = DISPLAY_CURRENCY) {
  const num =
    typeof amount === "number" && !Number.isNaN(amount)
      ? amount
      : parseFloat(String(amount ?? "").replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(num)) return String(amount ?? "");
  const code = currencyCode || DISPLAY_CURRENCY;
  if (code === "PKR") {
    return `Rs.${num.toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} PKR`;
  }
  try {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: code,
    }).format(num);
  } catch {
    return `${code} ${num.toFixed(2)}`;
  }
}

/** Format a product-like object `{ price, currency }` from grids / Shopify mapping. */
export function formatProductPrice(item) {
  if (!item) return "";
  const raw = item.price ?? "";
  const code = item.currency || DISPLAY_CURRENCY;
  const num = parseFloat(String(raw).replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(num)) return String(raw);
  return formatMoney(num, code);
}
