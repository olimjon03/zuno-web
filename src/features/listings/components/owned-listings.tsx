"use client";
import { useState } from "react";
import { Text, useT } from "@/features/language/provider";
import { ManageListing } from "./manage-listing";
import type { OwnedListing, LookupOption } from "../types";
export function OwnedListingsGrid({items,categories,neighborhoods}:{items:OwnedListing[];categories:LookupOption[];neighborhoods:LookupOption[]}) {
 const t=useT();
 const [filter,setFilter]=useState("all");
 const shown=items.filter(item=>filter==="all"||item.status===filter);
 return <><div className="statistics-period" role="group" aria-label={t("Listing status")}>{[["all","All"],["active","Available"],["reserved","Reserved"],["sold","Sold"]].map(([value,label])=><button key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}><Text>{label}</Text></button>)}</div><div className="owned-statistics-grid">{shown.map(item=><ManageListing key={item.id} item={item} categories={categories} neighborhoods={neighborhoods}/>)}</div>{!shown.length&&<p className="empty-state"><Text>No listings with this status.</Text></p>}</>;
}
