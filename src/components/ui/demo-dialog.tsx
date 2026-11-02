"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { BackHomeNav } from "@/components/layout/back-home-nav";
import { Icon } from "./icon";
export function DemoDialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => {
      element?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="demo-dialog"
      aria-labelledby="dialog-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-content">
        <BackHomeNav onBack={onClose} onHome={onClose} autoFocus/>
        <h2 id="dialog-title">{title}</h2>
        {children}
        <button className="button button-primary" onClick={onClose}>
          Back to browsing
          <Icon name="arrow" />
        </button>
      </div>
    </dialog>
  );
}
