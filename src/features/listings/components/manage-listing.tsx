"use client";
import { Text, useT } from "@/features/language/provider";

import Link from "next/link";
import "./listing-statistics.css";
import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/icon";
import type { CountryCode } from "@/features/locations/catalog";
import { priceLabel } from "../currency";
import { EditListingPhotos, type PhotoEditorHandle } from "./edit-listing-photos";
import { ListingLocationFields, optionCountry } from "./listing-location-fields";
import { BuyerStatusActions } from "./buyer-status-actions";
import { manageListing } from "../server/actions";
import type { ManageResult,OwnedListing } from "../types";
import { conditions, conditionLabels } from "../constants";
import { formatMoney as formatPrice } from "../currency";
import type { LookupOption } from "../types";
function CoverPhoto({photoId,title}:{photoId?:string;title:string}) {
 const t = useT();
 const [failed,setFailed]=useState(false);
 return <span className="owned-cover">{photoId && !failed ? <Image src={`/listing-photos/${photoId}`} alt={`Cover photo of ${title}`} width={112} height={112} unoptimized onError={()=>setFailed(true)}/> : <span className="owned-cover-placeholder" role="img" aria-label={t("No product photo")}><Icon name="image"/></span>}</span>;
}
export function ManageListing({item,categories,neighborhoods}:{item:OwnedListing;categories:LookupOption[];neighborhoods:LookupOption[]}) {
 const area=neighborhoods.find(n=>n.id===item.neighborhood_id);
 const originalCountry=optionCountry(area);
 const country:CountryCode|""=originalCountry ?? "";
 const [draft,setDraft]=useState({...item,price:String(item.price)});
 const [result,setResult]=useState<ManageResult>({});
 const [pending,setPending]=useState(false);
 const locked=useRef(false);
 const photoEditor=useRef<PhotoEditorHandle>(null);
 const update=(field:keyof OwnedListing,value:string|number)=>setDraft(current=>({...current,[field]:value}));
 const orderedPhotos=[...item.photos].sort((a,b)=>a.sort_order-b.sort_order);
 const statusName=item.status==="sold" ? "Sold" : item.status==="reserved" ? "Reserved" : "Available";
 async function submit(event:FormEvent<HTMLFormElement>) {
  event.preventDefault();if(locked.current)return;
  const form=new FormData(event.currentTarget);
  const submitter=(event.nativeEvent as SubmitEvent).submitter;
  const intent=submitter instanceof HTMLButtonElement ? submitter.value : "edit";
  form.set("id",item.id);form.set("intent",intent);
  const photosForSave=photoEditor.current;
  if(intent==="edit"){
   const issue=photosForSave?.validate();
   if(issue){setResult({error:issue});return;}
   form.set("title",draft.title);form.set("price",draft.price);form.set("condition",draft.condition);
   form.set("categoryId",String(draft.category_id));form.set("neighborhoodId",String(draft.neighborhood_id));
   form.set("description",draft.description);
  }
  locked.current=true;setPending(true);setResult({});
  try {
   const saved=await manageListing({},form);
   if(saved.error){setResult(saved);return;}
   if(intent==="edit"){
    const photoResult=await photosForSave?.save();
    if(photoResult?.error){setResult({error:"Item details saved. Photos could not be saved; check the photo section and retry."});return;}
   }
   setResult(saved);
  }catch{setResult({error:"We couldn’t confirm your changes. Your draft has been kept; please try again."});}
  finally{locked.current=false;setPending(false);}
 }
 return <article className="owned-item owned-soft-card" aria-label={item.title} aria-busy={pending}>
  <div className="owned-product-card">
   <div className="owned-product-copy"><h2><Link href={`/listings/${item.id}`}>{item.title}</Link></h2><p className="owned-price">{formatPrice(Number(item.price),originalCountry)}</p><p className="owned-area"><Icon name="pin"/>{area?.name ?? <Text>{"Nearby"}</Text>}</p><span className={`owned-status owned-status-${item.status}`}><Text>{statusName}</Text></span></div>
   <Link href={`/listings/${item.id}`} className="owned-cover-link" aria-label={`View ${item.title}`}><CoverPhoto key={orderedPhotos[0]?.id ?? "missing"} photoId={orderedPhotos[0]?.id} title={item.title}/></Link>
  </div>
  <Link className="owned-statistics-link" href={`/account/listings/${item.id}/statistics`}><Icon name="chart"/><Text>{"View statistics"}</Text></Link>
  <BuyerStatusActions id={item.id} title={item.title} status={item.status} disabled={pending} />
  {item.status === "reserved" && <form onSubmit={submit}>
    <button type="submit" name="intent" value="active" className="button button-outline" disabled={pending}><Text>{"Mark available"}</Text></button>
  </form>}
  <details className="owned-edit-panel">
   <summary><Icon name="pencil"/><span><Text>{"Edit item details"}</Text></span><Icon name="chevron" className="owned-disclosure-arrow"/></summary>
   <form className="sell-form owned-edit-form" onSubmit={submit}>
    <fieldset disabled={pending}><legend className="sr-only">Edit {item.title}</legend>
     <div className="sell-field"><label htmlFor={`${item.id}-title`}><Text>{"Title"}</Text></label><input id={`${item.id}-title`} name="title" value={draft.title} onChange={e=>update("title",e.target.value)} required minLength={3} maxLength={120}/></div>
     <div className="sell-field"><label htmlFor={`${item.id}-price`}><Text>{"Price ("}</Text>{priceLabel(country)})</label><input id={`${item.id}-price`} name="price" type="number" inputMode="numeric" min={0} max={1000000000000} step={1} required value={draft.price} onChange={e=>update("price",e.target.value)}/></div>
     <EditListingPhotos key={orderedPhotos.map(p=>`${p.id}:${p.sort_order}`).join(",")} ref={photoEditor} listingId={item.id} initial={orderedPhotos} disabled={pending}/>
     <div className="sell-fields">
      <div className="sell-field"><label htmlFor={`${item.id}-condition`}><Text>{"Condition"}</Text></label><select id={`${item.id}-condition`} name="condition" value={draft.condition} onChange={e=>update("condition",e.target.value)}>{conditions.map(c=><option key={c} value={c}><Text>{conditionLabels[c]}</Text></option>)}</select></div>
      <div className="sell-field"><label htmlFor={`${item.id}-category`}><Text>{"Category"}</Text></label><select id={`${item.id}-category`} name="categoryId" value={draft.category_id} onChange={e=>update("category_id",Number(e.target.value))}>{categories.map(c=><option key={c.id} value={c.id}><Text>{c.name}</Text></option>)}</select></div>
     </div>
     <ListingLocationFields id={item.id} country={country} neighborhoodId={draft.neighborhood_id ? String(draft.neighborhood_id) : ""} options={neighborhoods} onNeighborhood={value=>update("neighborhood_id",value ? Number(value) : 0)}/>
     <div className="sell-field"><label htmlFor={`${item.id}-description`}><Text>{"Description"}</Text></label><textarea id={`${item.id}-description`} name="description" required minLength={10} maxLength={5000} rows={4} value={draft.description} onChange={e=>update("description",e.target.value)}/></div>
     <p className="auth-hint"><Text>{"Changing country changes the price currency. Enter the appropriate amount; prices are not converted."}</Text></p>
     <button className="button button-primary owned-save-button" name="intent" value="edit">{pending ? <Text>{"Saving changes…"}</Text> : <Text>{"Save changes"}</Text>}</button>
    </fieldset>
   </form>
  </details>
  <details className="owned-remove-panel"><summary><Icon name="trash"/><span><Text>{"Remove item"}</Text></span><Icon name="chevron" className="owned-disclosure-arrow"/></summary><form onSubmit={submit}><fieldset disabled={pending}><legend className="sr-only"><Text>{"Remove"}</Text>{item.title}</legend><p><Text>{"This hides the item and its photos from the marketplace."}</Text></p><label className="remove-confirm"><input name="confirm" type="checkbox" value="yes" required/><Text>{"Confirm removal of this item"}</Text></label><button className="button button-outline owned-remove-button" name="intent" value="remove"><Icon name="trash"/><Text>{"Remove item"}</Text></button></fieldset></form></details>
  {pending&&<p role="status" className="owned-result"><Text>{"Saving changes…"}</Text></p>}{result.error&&<p className="auth-error owned-result" role="alert"><Text>{result.error}</Text></p>}{result.message&&<p role="status" className="owned-result"><Text>{result.message}</Text></p>}
 </article>;
}
