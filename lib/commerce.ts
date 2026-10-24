import { contact } from "@/data/site";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

/** 1299 → "₹1,299" */
export const formatPrice = (amount: number) => inr.format(amount);

/** Whole-number discount, e.g. price 699 / MRP 1499 → 53. */
export const discountPercent = (price: number, mrp: number) => Math.round(((mrp - price) / mrp) * 100);

/** A wa.me link to the store, optionally with a pre-filled message. */
export function whatsappLink(message?: string) {
  const base = `https://wa.me/${contact.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** WhatsApp link that asks the store about a specific item. */
export function orderLink(itemName: string, price: number) {
  return whatsappLink(
    `Hi Regal Fit! I'd like to order the ${itemName} (${formatPrice(price)}). Is it available in my size?`,
  );
}
