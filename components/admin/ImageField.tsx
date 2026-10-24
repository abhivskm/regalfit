"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { uploadPhoto } from "@/lib/upload-photo";
import { useUploadTracker } from "./fields";

type ImageFieldProps = {
  /** Current photo URL ("" when there is none yet). */
  src: string;
  /** Called with the uploaded photo's URL. */
  onChange: (src: string) => void;
  /** CSS aspect-ratio of the preview, e.g. "3/4". */
  aspect?: string;
  sizes?: string;
  hint?: string;
};

/** Photo preview with an upload/replace button. Uploading starts as soon as a file is chosen. */
export function ImageField({ src, onChange, aspect = "3/4", sizes = "200px", hint }: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const tracker = useUploadTracker();

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setProgress(0);
    tracker.begin();
    try {
      onChange(await uploadPhoto(file, setProgress));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setProgress(null);
      tracker.end();
    }
  };

  return (
    <div>
      <div className="relative overflow-hidden rounded-md bg-line" style={{ aspectRatio: aspect }}>
        {src ? (
          <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center p-2 text-center text-xs text-muted">
            No photo yet
          </span>
        )}
        {progress !== null && (
          <span className="absolute inset-0 flex items-center justify-center bg-ink/60 text-sm font-semibold text-ivory">
            Uploading… {progress}%
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={progress !== null}
        className="mt-2 w-full rounded-md border border-ink bg-ivory px-3 py-2 text-xs font-semibold transition-colors hover:bg-ink hover:text-ivory disabled:opacity-50"
      >
        {src ? "Change photo" : "Upload photo"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
