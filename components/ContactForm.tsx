"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { buttonClasses } from "./ui/Button";

type Field = "name" | "email" | "message";
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

const EMPTY: Values = { name: "", email: "", message: "" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) errors.name = "Please enter your name.";
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Please enter a valid email address.";
  if (values.message.trim().length < 10) errors.message = "Please write a message of at least 10 characters.";
  return errors;
}

/**
 * Enquiry form with front-end validation only.
 * NOTE: submissions are not sent anywhere yet. To receive them, post `values` to a form
 * service (e.g. Formspree, Web3Forms) or your own API inside `handleSubmit`; see the README.
 */
export function ContactForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [e.target.name]: e.target.value };
    setValues(next);
    // After the first submit, re-validate as the visitor types so errors clear promptly.
    if (attempted) setErrors(validate(next));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setAttempted(true);

    const firstInvalid = (Object.keys(found) as Field[])[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setSentTo(values.name.trim().split(" ")[0]);
    setValues(EMPTY);
    setAttempted(false);
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

  const fieldClass = (field: Field) =>
    `mt-2 block w-full rounded-md border bg-ivory px-4 py-3.5 text-base text-ink placeholder:text-muted/70 transition-colors ${
      errors[field] ? "border-red-700" : "border-line hover:border-ink/40"
    }`;

  const describedBy = (field: Field) => (errors[field] ? `${field}-error` : undefined);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Enquiry form"
      className="rounded-lg bg-ivory p-6 md:p-10"
    >
      <h3 className="font-display text-xl font-bold uppercase md:text-2xl">Send us a note</h3>
      <p className="mt-2 text-sm text-muted">All fields are required.</p>

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
            value={values.name}
            onChange={handleChange}
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("name")}
            className={fieldClass("name")}
          />
          {errors.name && (
            <p id="name-error" className="mt-2 text-sm text-red-700">
              {errors.name}
            </p>
          )}
        </div>

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
            value={values.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("email")}
            className={fieldClass("email")}
          />
          {errors.email && (
            <p id="email-error" className="mt-2 text-sm text-red-700">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={values.message}
            onChange={handleChange}
            placeholder="A size question, a stock check, a bulk order..."
            aria-invalid={!!errors.message}
            aria-describedby={describedBy("message")}
            className={`${fieldClass("message")} resize-y`}
          />
          {errors.message && (
            <p id="message-error" className="mt-2 text-sm text-red-700">
              {errors.message}
            </p>
          )}
        </div>
      </div>

      <button type="submit" className={buttonClasses("solid", "mt-8 w-full sm:w-auto")}>
        Send message
      </button>
    </form>
  );
}
