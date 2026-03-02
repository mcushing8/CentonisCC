"use client";
import { useState, useRef, useEffect } from "react";

type EditableCellProps = {
  value: string;
  onChange: (value: string) => void | Promise<void>;
  placeholder?: string;
  className?: string;
  align?: "left" | "center";
  isTitle?: boolean;
  type?: "text" | "date";
};

export function EditableCell({
  value,
  onChange,
  placeholder = "",
  className = "",
  align = "left",
  isTitle = false,
  type = "text",
}: EditableCellProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  async function handleBlur() {
    setIsEditing(false);
    const trimmed = localValue.trim();
    if (trimmed !== value) {
      await onChange(trimmed);
    } else {
      setLocalValue(value);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    }
    if (e.key === "Escape") {
      setLocalValue(value);
      setIsEditing(false);
      inputRef.current?.blur();
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => void handleBlur()}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full min-w-0 bg-transparent outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 ${
          isTitle ? "font-medium" : ""
        } ${className}`}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-text rounded px-1 py-0.5 -mx-1 -my-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 min-h-[1.5em] ${
        align === "center" ? "text-center" : ""
      } ${isTitle ? "font-medium text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"} ${className}`}
    >
      {localValue || (
        <span className="text-zinc-400 dark:text-zinc-500">{placeholder}</span>
      )}
    </div>
  );
}
