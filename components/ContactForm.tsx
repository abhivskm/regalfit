"use client";

import Link from "next/link";
import { useRef, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { submitEnquiry } from "@/app/actions";
import {
  validateEnquiry,
  type EnquiryErrors,
  type EnquiryField,
  type EnquiryValues,
} from "@/lib/enquiry-rules";
import { getVisitIds } from "@/lib/tracker-client";
import { buttonClasses } from "./ui/Button";

const EMPTY: EnquiryValues = { name: "", email: "", phone: "", message: "" };

/** Enquiry form. Checks fields in the browser, then saves the message for the admin "Tracking" page. */
export function ContactForm() {
  const [values, setValues] = useState<EnquiryValues>(EMPTY);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [failure, setFailure] = useState("");
  const [sending, startSending] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const focusFirst = (found: EnquiryErrors) => {
    const first = (Object.keys(found) as EnquiryField[])[0];
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [e.target.name]: e.target.value };
    setValues(next);
    // After the first submit, re-validate as the visitor types so errors clear promptly.
    if (attempted) setErrors(validateEnquiry(next));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validateEnquiry(values);
    setErrors(found);
    setAttempted(true);
    setFailure("");
    if (Object.keys(found).length) return focusFirst(found);

    startSending(async () => {
      const { visitor, session, source } = getVisitIds();
      const result = await submitEnquiry(values, { visitor, session, source });
      if (result.ok) {
        setSentTo(values.name.trim().split(" ")[0]);
        setValues(EMPTY);
        setAttempted(false);
      } else if (result.errors) {
        setErrors(result.errors);
        focusFirst(result.errors);
      } else {
        setFailure(result.message ?? "Sorry, something went wrong. Please try again.");
      }
    });
  };

  if (sentTo) {
    return (
      <div role="status" className="flex h-full flex-col justify-center rounded-lg bg-ivory p-6 md:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-deep">Message received</p>
        <p className="mt-3 font-display text-3xl font-bold uppercase leading-tight">Thank you, {sentTo}.</p>
        <p className="mt-4 leading-relaxed text-muted">
          We will reply within one working day. For anything urgent, please call the store.
        </p>
        <button type="button" onClick={() => setSentTo(null)} className={buttonClasses("solid", "mt-10 self-start")}>
          Send another message
        </button>
      </div>
    );
  }

  const fieldClass = (field: EnquiryField) =>
    `mt-2 block w-full rounded-md border bg-ivory px-4 py-3.5 text-base text-ink placeholder:text-muted/70 transition-colors ${
      errors[field] ? "border-red-700" : "border-line hover:border-ink/40"
    }`;
  const describedBy = (field: EnquiryField, hint?: string) =>
    [errors[field] ? `${field}-error` : null, hint].filter(Boolean).join(" ") || undefined;
  const errorText = (field: EnquiryField) =>
    errors[field] && (
      <p id={`${field}-error`} className="mt-2 text-sm text-red-700">
        {errors[field]}
      </p>
    );

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Enquiry form"
      className="rounded-lg bg-ivory p-6 md:p-10"
    >
      <h3 className="font-display text-xl font-bold uppercase md:text-2xl">Send us a note</h3>
      <p className="mt-2 text-sm text-muted">Phone number is optional; everything else is required.</p>

      <div className="mt-8 space-y-6">
        <div>
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={80}
            value={values.name}
            onChange={handleChange}
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("name")}
            className={fieldClass("name")}
          />
          {errorText("name")}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              maxLength={120}
              value={values.email}
              onChange={handleChange}
              aria-invalid={!!errors.email}
              aria-describedby={describedBy("email")}
              className={fieldClass("email")}
            />
            {errorText("email")}
          </div>
          <div>
            <label htmlFor="phone" className="text-sm font-medium">
              Phone <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              maxLength={20}
              value={values.phone}
              onChange={handleChange}
              placeholder="So we can reply on WhatsApp"
              aria-invalid={!!errors.phone}
              aria-describedby={describedBy("phone")}
              className={fieldClass("phone")}
            />
            {errorText("phone")}
          </div>
        </div>

        <div>
          <label htmlFor="message" className="text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            maxLength={2000}
            value={values.message}
            onChange={handleChange}
            placeholder="A size question, a stock check, a bulk order..."
            aria-invalid={!!errors.message}
            aria-describedby={describedBy("message")}
            className={`${fieldClass("message")} resize-y`}
          />
          {errorText("message")}
        </div>
      </div>

      {failure && (
        <p role="alert" className="mt-6 text-sm text-red-700">
          {failure}
        </p>
      )}

      <button type="submit" disabled={sending} className={buttonClasses("solid", "mt-8 w-full sm:w-auto disabled:opacity-60")}>
        {sending ? "Sending…" : "Send message"}
      </button>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        We use your details only to reply to you. See our{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
