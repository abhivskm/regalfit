"use client";

import { createContext, useContext, useId, type ReactNode } from "react";

/* Small, consistent form controls for the admin portal. */

const inputClass =
  "mt-1 block w-full rounded-md border border-line bg-ivory px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-ink";

type BaseProps = { label: string; hint?: string; className?: string };

function Field({ label, hint, className = "", children }: BaseProps & { children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </label>
      {children(id)}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  maxLength = 120,
  multiline = false,
  ...field
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
}) {
  return (
    <Field {...field}>
      {(id) =>
        multiline ? (
          <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={2}
            className={`${inputClass} resize-y`}
          />
        ) : (
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className={inputClass}
          />
        )
      }
    </Field>
  );
}

/** Rupee amount; an empty box is stored as 0 (and rejected on save with a clear message). */
export function PriceInput({ value, onChange, ...field }: BaseProps & { value: number; onChange: (value: number) => void }) {
  return (
    <Field {...field}>
      {(id) => (
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-sm text-muted">₹</span>
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={value || ""}
            onChange={(e) => onChange(Math.max(0, Math.round(Number(e.target.value) || 0)))}
            className={`${inputClass} pl-7`}
          />
        </div>
      )}
    </Field>
  );
}

export function SelectInput<T extends string>({
  value,
  onChange,
  options,
  ...field
}: BaseProps & { value: T; onChange: (value: T) => void; options: { value: T; label: string }[] }) {
  return (
    <Field {...field}>
      {(id) => (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className={inputClass}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-ink" />
      {label}
    </label>
  );
}

const smallButton = {
  neutral: "border-line bg-ivory text-ink hover:border-ink",
  danger: "border-red-200 bg-ivory text-red-700 hover:border-red-700 hover:bg-red-50",
};

export function SmallButton({
  children,
  onClick,
  tone = "neutral",
  disabled,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: keyof typeof smallButton;
  disabled?: boolean;
  /** Accessible name when the button shows only an icon or arrow. */
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${smallButton[tone]}`}
    >
      {children}
    </button>
  );
}

/* Tracks photo uploads in progress so Save can wait for them. */
export const UploadTracker = createContext<{ begin: () => void; end: () => void }>({ begin: () => {}, end: () => {} });
export const useUploadTracker = () => useContext(UploadTracker);

/** Panels receive one of these: call it with a function from the current list to the new list. */
export type ListUpdater<T> = (update: (current: T[]) => T[]) => void;

/** Helpers for editing arrays immutably. */
export const removeAt = <T,>(list: T[], index: number) => list.filter((_, i) => i !== index);
export function moveAt<T>(list: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
export const newId = () => crypto.randomUUID();
