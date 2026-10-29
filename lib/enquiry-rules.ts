/** Contact-form rules, shared by the browser (instant feedback) and the server (the real check). */
export type EnquiryField = "name" | "email" | "phone" | "message";
export type EnquiryValues = Record<EnquiryField, string>;
export type EnquiryErrors = Partial<Record<EnquiryField, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Indian or international number: digits, spaces, +, -, brackets; 10–15 digits in total. */
const PHONE = /^\+?[\d\s()-]{10,20}$/;

export function validateEnquiry(values: EnquiryValues): EnquiryErrors {
  const errors: EnquiryErrors = {};
  const name = values.name.trim();
  const phone = values.phone.trim();
  const message = values.message.trim();
  if (name.length < 2 || name.length > 80) errors.name = "Please enter your name.";
  if (!EMAIL.test(values.email.trim()) || values.email.length > 120) errors.email = "Please enter a valid email address.";
  if (phone) {
    const digits = phone.replace(/\D/g, "").length;
    if (!PHONE.test(phone) || digits < 10 || digits > 15) errors.phone = "Please enter a valid phone number, or leave it empty.";
  }
  if (message.length < 10) errors.message = "Please write a message of at least 10 characters.";
  else if (message.length > 2000) errors.message = "Please keep your message under 2000 characters.";
  return errors;
}
