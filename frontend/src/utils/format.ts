/**
 * Deterministic formatting utilities for Indian Currency (INR) and Numbers.
 * Pure algorithmic implementation to guarantee 100% identical outputs
 * between SSR (Node runtime) and Client Hydration (browser).
 */

export function formatCurrency(
  val: number | string | null | undefined,
  showDecimals = true
): string {
  if (val == null || val === "") return showDecimals ? "₹0.00" : "₹0";
  const num = typeof val === "number" ? val : Number(val);
  if (isNaN(num)) return showDecimals ? "₹0.00" : "₹0";

  const isNegative = num < 0;
  const absVal = Math.abs(num);
  const parts = absVal.toFixed(showDecimals ? 2 : 0).split(".");
  const intPart = parts[0];
  const decPart = parts[1];

  let formattedInt = intPart;
  if (intPart.length > 3) {
    const lastThree = intPart.substring(intPart.length - 3);
    const rest = intPart.substring(0, intPart.length - 3);
    formattedInt = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  }

  const res = showDecimals ? `₹${formattedInt}.${decPart}` : `₹${formattedInt}`;
  return isNegative ? `-${res}` : res;
}

export function formatNumber(val: number | string | null | undefined): string {
  if (val == null || val === "") return "0";
  const num = typeof val === "number" ? val : Number(val);
  if (isNaN(num)) return "0";

  const isNegative = num < 0;
  const absVal = Math.abs(num);
  const intPart = Math.floor(absVal).toString();

  let formattedInt = intPart;
  if (intPart.length > 3) {
    const lastThree = intPart.substring(intPart.length - 3);
    const rest = intPart.substring(0, intPart.length - 3);
    formattedInt = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  }

  return isNegative ? `-${formattedInt}` : formattedInt;
}

export function formatCompactCurrency(val: number | string | null | undefined): string {
  if (val == null || val === "") return "₹0";
  const num = typeof val === "number" ? val : Number(val);
  if (isNaN(num)) return "₹0";

  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}k`;
  }
  return `${sign}₹${abs}`;
}

export function formatReferenceTitle(ref: string | null | undefined): string {
  if (!ref) return "";
  return ref.replace(/\b([A-Z]{3,})\b/g, (m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase());
}

export function formatTime(isoString?: string | null): string {
  if (!isoString || isoString === "—") return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoString;
  }
}
