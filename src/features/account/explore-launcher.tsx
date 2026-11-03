"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useT } from "@/features/language/provider";
import { Brand } from "@/components/ui/brand";
import { Icon } from "@/components/ui/icon";
import { ExploreMenu } from "./explore-menu";
import "./explore-launcher.css";

/** Reuses the existing feature cards and dialogs without duplicating their menus. */
export function ExploreLauncher() {
  const t = useT();
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const viewport = window.matchMedia("(max-width: 700px)");
    const handleResize = () => { if(viewport.matches)dialog.current?.close(); };
    viewport.addEventListener("change", handleResize);
    return () => viewport.removeEventListener("change", handleResize);
  }, []);
  function close() { dialog.current?.close(); }
  return <div className="explore-launcher">
    <button ref={trigger} type="button" className="explore-trigger" aria-label={`${t("Explore")} ZUNO`} aria-haspopup="dialog" aria-controls={id} aria-expanded={open} onClick={() => { dialog.current?.showModal(); if(dialog.current)dialog.current.scrollTop=0; setOpen(true); }}><Icon name="grid"/></button>
    <dialog ref={dialog} id={id} className="explore-popover" aria-label={`${t("Explore")} ZUNO`} onClose={event => { if(event.target!==event.currentTarget)return; setOpen(false); trigger.current?.focus(); }} onClick={event => { if(event.target===event.currentTarget)close(); }}>
      {open && <div className="explore-popover-content">
        <div className="explore-popover-brand"><Brand/><button autoFocus type="button" aria-label={t("Close")} onClick={close}><Icon name="close"/></button></div>
        <ExploreMenu/>
      </div>}
    </dialog>
  </div>;
}
