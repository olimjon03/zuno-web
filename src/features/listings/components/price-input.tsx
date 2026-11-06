"use client";
import { useRef, useState } from "react";
import { useT } from "@/features/language/provider";
import { formatPriceInput, priceDigits } from "../price-input";

export function PriceInput({id, value, onValueChange}: {
  id: string; value?: string; onValueChange?: (value: string) => void;
}) {
  const [local, setLocal] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const t = useT();
  const digits = value ?? local;
  return <>
    <input type="hidden" name="price" value={digits}/>
    <input ref={input} id={id} type="text" inputMode="numeric" required placeholder="0"
      value={formatPriceInput(digits)} autoComplete="off"
      onKeyDown={event => {
        const field = event.currentTarget;
        const start = field.selectionStart ?? 0;
        if (start !== field.selectionEnd) return;
        // Skip separators so deleting at a comma still removes a digit.
        if (event.key === "Backspace" && field.value[start - 1] === ",") field.setSelectionRange(start - 1, start - 1);
        if (event.key === "Delete" && field.value[start] === ",") field.setSelectionRange(start + 1, start + 1);
      }}
      onChange={event => {
        const field = event.currentTarget;
        const raw = priceDigits(field.value);
        if (raw === null) return;
        const before = field.value.slice(0, field.selectionStart ?? field.value.length).replaceAll(",", "").length;
        field.setCustomValidity(Number(raw) > 1000000000000 ? t("Enter a whole price between 0 and 1,000,000,000,000.") : "");
        setLocal(raw); onValueChange?.(raw);
        requestAnimationFrame(() => {
          if (!input.current || document.activeElement !== input.current) return;
          const formatted = formatPriceInput(raw);
          let position = 0, count = 0;
          while (position < formatted.length && count < before) {
            if (formatted[position] !== ",") count++;
            position++;
          }
          input.current.setSelectionRange(position, position);
        });
      }}/>
  </>;
}
